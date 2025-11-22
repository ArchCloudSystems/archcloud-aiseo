import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Feature not configured", missingKey: "STRIPE_SECRET_KEY" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.customer && session.subscription) {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const userId = session.metadata?.userId;

          if (!userId) {
            console.error("No userId in session metadata");
            break;
          }

          const stripeSubResponse = await stripe.subscriptions.retrieve(subscriptionId);
          const sub = stripeSubResponse as unknown as Stripe.Subscription;
          const priceId = sub.items.data[0]?.price.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : "FREE";

          const existingSub = await db.subscription.findFirst({
            where: { userId },
          });

          if (existingSub) {
            await db.subscription.update({
              where: { id: existingSub.id },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId,
                plan,
                status: sub.status,
                currentPeriodStart: new Date((sub as any).current_period_start * 1000),
                currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
                cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
              },
            });
          } else {
            await db.subscription.create({
              data: {
                userId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId,
                plan,
                status: sub.status,
                currentPeriodStart: new Date((sub as any).current_period_start * 1000),
                currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
                cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
              },
            });
          }

          await db.project.updateMany({
            where: { ownerId: userId },
            data: { plan },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : "FREE";

        const existingSubscription = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (existingSubscription) {
          await db.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              plan,
              status: subscription.status,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            },
          });

          await db.project.updateMany({
            where: { ownerId: existingSubscription.userId },
            data: { plan },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingSubscription = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (existingSubscription) {
          await db.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              plan: "FREE",
              status: "canceled",
              cancelAtPeriodEnd: false,
            },
          });

          await db.project.updateMany({
            where: { ownerId: existingSubscription.userId },
            data: { plan: "FREE" },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
