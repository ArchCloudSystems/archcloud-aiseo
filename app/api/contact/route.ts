import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    console.log("[Contact Form Submission]", {
      name: validatedData.name,
      email: validatedData.email,
      company: validatedData.company || "Not provided",
      message: validatedData.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: "Message received" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid form data", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("[Contact Form Error]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
