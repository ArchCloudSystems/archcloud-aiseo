# Git Branching Strategy for ArchCloud AI SEO

## Branch Structure

### Main Branch
- `main` - Production-ready code only
- Never commit directly to main
- All changes come through feature branches via merge

### Feature Branches

1. **feature/aiseo-auth-layout**
   - Authentication system refinements
   - Layout improvements
   - User profile management
   - Session handling

2. **feature/aiseo-projects-dashboard**
   - Project creation and management
   - Dashboard metrics and analytics
   - Project settings
   - Multi-project support

3. **feature/aiseo-keywords-content-briefs**
   - Keyword research tools
   - Content brief generation
   - AI-powered content suggestions
   - Keyword tracking

4. **feature/aiseo-seo-audits**
   - On-page SEO analysis
   - Technical SEO checks
   - Performance scoring
   - Audit reports and history

5. **feature/aiseo-integrations**
   - Google Search Console
   - Google Analytics
   - Social media integrations
   - Third-party API connections

6. **feature/aiseo-stripe-billing**
   - Subscription management
   - Payment processing
   - Plan upgrades/downgrades
   - Billing history

## Workflow

### Starting Work on a Feature

```bash
# Make sure main is up to date
git checkout main
git pull origin main

# Switch to your feature branch
git checkout feature/aiseo-auth-layout

# Rebase on main to get latest changes
git rebase main

# Start working on your feature
```

### Committing Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add user profile avatar upload"

# Push to remote
git push origin feature/aiseo-auth-layout
```

### Merging Back to Main

```bash
# First, make sure your feature branch is up to date with main
git checkout feature/aiseo-auth-layout
git rebase main

# Run tests and build
npm run build

# If everything passes, merge to main
git checkout main
git merge feature/aiseo-auth-layout

# Push to remote
git push origin main
```

## Commit Message Convention

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add keyword volume tracking
fix: resolve session timeout issue
docs: update API documentation
refactor: optimize database queries
```

## Rules

1. **Never push directly to main** - Always use feature branches
2. **Test before merging** - Always run `npm run build` before merging to main
3. **Keep branches focused** - Each branch should handle one feature area
4. **Rebase regularly** - Keep your feature branch up to date with main
5. **Clean commits** - Write clear, descriptive commit messages
6. **Delete merged branches** - Clean up feature branches after merging (optional)

## Current Branch Status

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production code | ✅ Stable |
| `feature/aiseo-auth-layout` | Auth & layout | 🔨 Ready for work |
| `feature/aiseo-projects-dashboard` | Project management | 🔨 Ready for work |
| `feature/aiseo-keywords-content-briefs` | Keywords & content | 🔨 Ready for work |
| `feature/aiseo-seo-audits` | SEO auditing | 🔨 Ready for work |
| `feature/aiseo-integrations` | Third-party APIs | 🔨 Ready for work |
| `feature/aiseo-stripe-billing` | Payments & billing | 🔨 Ready for work |

## Quick Reference

```bash
# View all branches
git branch -a

# Switch to a feature branch
git checkout feature/aiseo-auth-layout

# Create and switch to a new branch
git checkout -b feature/new-feature

# See what branch you're on
git branch

# Delete a local branch (after merging)
git branch -d feature/aiseo-auth-layout

# Force delete a branch
git branch -D feature/aiseo-auth-layout
```
