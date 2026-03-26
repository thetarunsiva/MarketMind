# V2.5 Auth and Admin Plan

## Purpose
Add a simple V2.5 identity layer for the hackathon without overcomplicating the product.

This pass adds:
- company signup
- Google auth
- simple company onboarding fields
- domain/category selection
- admin login
- admin user/company overview

This is intentionally lightweight and hackathon-scoped.

---

## V2.5 Goals

### 1. Company Signup
Allow a user to create an account for a company.

### 2. Google Auth
Allow quick sign-in with Google for ease of demo and reduced friction.

### 3. Company Setup Inputs
During signup or onboarding, collect:
- company name
- company domain/category from a dropdown

For hackathon simplicity, the dropdown should focus on supported demo clusters such as:
- Productivity / Collaboration
- Project Management
- Knowledge Base
- Workflow Automation
- Team Docs
- CRM
- Design Collaboration
- Dev Tools

### 4. Admin Login
Add a separate admin login path.

### 5. Admin Overview
Admin should be able to view:
- list of signed-up companies/users
- total users
- total companies
- simple visual stats
- no advanced admin actions needed

---

## Scope Rules

### Included
- signup page
- login page
- Google auth
- company onboarding form
- domain/category dropdown
- admin login page
- admin dashboard stats
- simple protected routing if needed

### Excluded
- multi-role enterprise permissions
- billing
- password reset flows
- invitations
- complex user management
- editing company hierarchies
- audit logs

---

## Implementation Guidance

### Auth Provider
Use the easiest stable approach supported by the current stack and deployment target.
If Supabase auth is already available, prefer it.

### User Model
Minimum fields:
- id
- email
- full_name if available
- company_name
- company_domain_category
- role (user or admin)
- created_at

### Admin Model
Admin can be implemented as:
- a seeded admin account
- or a role flag on a user record

Keep it simple.

---

## UX Requirements

### Signup Page
Fields:
- company name
- domain/category dropdown
- continue with Google
- optional email flow only if already easy

### Login Page
- Google sign in
- optional email/password only if trivial
- clean and simple layout

### Admin Login
- separate route
- clean, minimal form
- no heavy security complexity for hackathon use

### Admin Dashboard
Show:
- total companies
- total active users
- category breakdown
- company list
- simple card-based visual stats

---

## Design Requirements
The auth pages should feel:
- clean
- premium
- minimal
- aligned with the main product style

---

## Safety / Simplicity Rule
This must not destabilize the main product.
If necessary, protect the core MarketMind experience first and keep auth/admin lightweight.

---

## Success Criteria
V2.5 is successful if:
- a company user can sign up/sign in
- domain/category can be selected
- admin can log in
- admin can view a simple user/company overview
- the main product still works