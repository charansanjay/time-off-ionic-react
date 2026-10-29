# Time Off: Ionic + React

A mobile-first app where employees request time off and supervisors approve or reject the requests.

**Live demo:** <https://time-off-ionic-react.netlify.app>

Built in small steps, like a team project: **GitHub issues** (epics and stories with acceptance criteria), **feature branches and pull requests**, **conventional commits**, **CI with GitHub Actions** and **automatic deploys to Netlify**.

**Brief coverage:**

- All required features ✅
- **Bonus:**
  - form validation ✅
  - tests ✅ (unit and integration: 128, 96% line coverage)
  - Storybook: **not included** (the reusable components live in `src/shared/components`, used by the `auth` and `requests` features)

## Contents

- [Try the live demo](#try-the-live-demo)
- [How to run the app](#how-to-run-the-app)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Testing](#testing)
- [Quality checks](#quality-checks)
- [Assumptions](#assumptions)
- [Not built and next steps](#not-built-and-next-steps)
- [Use of AI](#use-of-ai)

## Try the live demo

**Live demo:** <https://time-off-ionic-react.netlify.app>

- **Best on a real phone:** open the live demo on your phone to see the native date pickers, action sheets and iOS / Android styling.
- **On a computer:** use the browser's device mode. Ionic picks the iOS or Material style from the device (reload after switching, or add `?ionic:mode=ios` / `?ionic:mode=md` to the URL).

**No password:** tap a demo user on the login screen.

| User          | Role       | Try                                             |
| ------------- | ---------- | ----------------------------------------------- |
| Charan Sanjay | employee   | See your requests, open one, request time off   |
| Jana Nováková | employee   | A second employee, to check who sees what       |
| Petr Dvořák   | supervisor | See everyone's requests, approve or reject them |

- **A two-minute tour:** log in as **Charan** and request a few days off → log out, log in as **Petr** and approve it → log back in as **Charan** and see the decision.
- **Check the access rules:** as **Charan**, open `/requests/req-5` (one of Jana's requests) in the address bar → **Request not found**.
- **Demo data** (under the user list): **Reset sample data** brings the sample requests back; **Start empty** removes all requests so you can start from scratch. Data lives in your browser's localStorage.
- Every call to the mock server waits **500 ms**, so the loading states are visible.

## How to run the app

**Requirements:** Node.js 24 (see `.nvmrc`) and npm.

```bash
npm install
npm run dev
```

Open the URL Vite prints, and switch the browser to device mode for the mobile view.

| Script          | What it does                                |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start the development server                |
| `npm run build` | Type-check and build for production         |
| `npm test`      | Run the tests                               |
| `npm run check` | Format, lint, type-check and test in one go |

All scripts are in `package.json`. **CI (GitHub Actions)** runs lint, format check, type-check, tests and build on every push and pull request. Husky runs lint-staged and commitlint (conventional commits) before each commit.

## Features

**Employees:**

- See their requests, split into **Upcoming** and **Past**, with status, dates, working days and type.
- Open a request to see its details and, once decided, who decided, when, and their note.
- Request time off: type, dates (native date pickers), optional note; live working-day count; clear validation messages; overlapping requests are refused.

**Supervisors:**

- See everyone's requests, with names.
- Approve or reject a pending request with an optional note; both ask for confirmation.
- If someone else decided first, a clear message and the real decision are shown.

**Everyone:**

- **Role-based access control (RBAC):** **routes are protected by role**, each screen shows only what the role may do, and the mock server enforces the same rules (an employee can't open another employee's request).
- **Light and dark mode**, following the device setting, with custom theme colours for both.
- **Responsive:** phone, tablet and desktop (a centred column on wide screens).
- Loading, empty and error states on every screen.

## Assumptions

- Request length is counted in **working days** (Monday–Friday); public holidays are not considered.
- Start and end dates are **inclusive**; a one-day request has the same start and end date.
- **Sick leave** may start in the past (it's often reported afterwards); other types can't.
- There is **one supervisor**, who sees everyone's requests (no teams).
- There are **no leave balances**: any number of days can be requested.
- A new request can't overlap the employee's pending or approved requests; rejected ones don't count.
- **Decisions are final**, and requests can't be edited, cancelled or deleted.

## Tech stack

| Tool                       | Why                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Ionic React 9 + React 19   | Native-feeling mobile UI (iOS and Material) from one codebase; page stack with transitions |
| TypeScript                 | Types shared by the UI, the schema and the mock server                                     |
| Vite                       | Fast dev server and build                                                                  |
| TanStack Query             | Server state: caching, loading and error states, invalidation after writes                 |
| Zod                        | One validation schema for the form **and** the server                                      |
| date-fns                   | Working days and date formatting without time-zone surprises                               |
| React Router 6 (via Ionic) | Routes and guards inside Ionic's router outlet                                             |
| Vitest + Testing Library   | Unit and component tests                                                                   |
| Capacitor                  | Configured, ready to wrap the app as an Android / iOS app                                  |

## Architecture

```text
Screen → TanStack Query hook → service/api.ts → mock server → localStorage
```

- **Feature-based folders** (`auth`, `requests`), shared building blocks in `shared/`, and a **mock server** that behaves like a backend: it identifies the caller from the session, checks permissions and business rules, validates with the same Zod schema as the form, and returns typed errors.
- **One permissions config** drives the route guards, what each screen shows, and what the mock server allows. The front end hides; the server enforces.
- Swapping in a real API means replacing the mock server calls in each feature's `service/api.ts`; nothing else changes.

Folder structure, routes, data-flow diagrams and the mock server rules: **[docs/architecture.md](docs/architecture.md)**.

## Testing

```bash
npm test
```

Each layer is tested at its own level:

- **Pure rules:** working days, date formatting, grouping into upcoming and past, the validation schema.
- **Mock server:** who sees what, "not found" for someone else's request, decisions (final, supervisor only, not your own), overlap checks, storage and session.
- **Pages** (React Testing Library, mocked API): loading, empty, error and not-found states; what each role sees; the Upcoming / Past switch; deciding with confirmation and the conflict case; the form's validation, success and overlap.
- **Route guards** with stand-in pages.

**Next:** end-to-end tests with Playwright for the main flows (an employee requests time off, a supervisor approves it).

Ionic's form controls and overlays don't fire their events in jsdom, so a few tests swap just those parts for small fakes with the same contract; the app's logic is still tested for real.

## Quality checks

| Area                   | What's in place                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Security**           | The mock server identifies the caller from the session, never from client data; **role-based access** checked on every call; Zod validation on every write; someone else's request answers "not found".                  |
| **Performance**        | Lighthouse, live site, mobile (Moto G Power, slow 4G): **Performance 89**, FCP 2.8 s, LCP 2.8 s, TBT 160 ms, CLS 0.006. Main bundle 336 kB gzipped, mostly Ionic's components. Cached data makes back navigation instant |
| **Accessibility**      | **Lighthouse Accessibility 100**; axe (WCAG 2.1 AA)                                                                                                                                                                      |
| **Reliability**        | Loading, empty and error states with retry on every screen; double submits prevented; concurrent decisions handled (`CONFLICT`, then the real decision is shown)                                                         |
| **Testing**            | 128 tests; coverage **96% of lines, 91% of branches** (Vitest, v8)                                                                                                                                                       |
| **Best practices**     | **Lighthouse Best Practices 100**; TypeScript strict mode, no `any` (enforced by ESLint), ESLint with accessibility rules, Prettier                                                                                      |
| **Build & deployment** | CI on every push and pull request (lint, format, type-check, tests, build); Netlify deploys `main` to production and builds a preview for every pull request                                                             |

Measured on the production build. Lazy-loading the routes was tried, saved only about 3%, and was reverted because it conflicts with Ionic's page transitions.

## Not built and next steps

- **Real backend and authentication** (the mock server marks the boundary: only `service/api.ts` changes).
- **Push notifications** for new requests and decisions; details are already a page, so a notification can deep-link to one request.
- **Editing or cancelling** a pending request; **half days**; **leave balances**; **public holidays**.
- **Undo instead of confirmation** after approve / reject (an "Undo" toast that delays sending the decision).
- **An idempotency key** on submit, so a network retry can't create a request twice (today the disabled button prevents double taps).
- **Session edge cases:** a global handler that logs the user out when any call returns "not logged in", and syncing logout across browser tabs.
- **End-to-end tests** with Playwright, and **Storybook** for the shared components.
- **Security headers** on Netlify (Content Security Policy, clickjacking protection).
- **Smaller bundle:** analyse which Ionic components end up in the main bundle (Lighthouse: about 220 kB unused JavaScript on the list page).
- **Native Android / iOS apps:** Capacitor is configured; the native projects aren't added yet.

## Use of AI

I used Claude (Anthropic) as a coding assistant: to understand Ionic and the libraries that were new to me (how the components behave, how to style them, which approach fits), as a second pair of eyes in code review, and to draft code, especially the tests. I planned the epics and stories, made the decisions (they're in the commit history and pull requests), designed the test cases, wrote a good part of the code myself, and reviewed and ran everything before committing.
