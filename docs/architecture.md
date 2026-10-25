# Architecture Overview

This document describes how the app is organised and why.

## Contents

- [Approach](#approach)
- [Folder structure](#folder-structure)
- [Routes and access](#routes-and-access)
- [Data flow](#data-flow)
- [Mock server](#mock-server)
- [Screens](#screens)
- [Cross-cutting concerns](#cross-cutting-concerns)
- [Key decisions and trade-offs](#key-decisions-and-trade-offs)

## Approach

- **Feature-based folders:** each feature owns its API calls, queries, types, rules, components and pages.
- **One direction of imports:** `app` → `features` → `shared`. Features never import from each other or from `app`.
- **One set of screens for both roles:** the request list and details are shared; permissions decide what each role sees and can do.

## Folder structure

```text
src/
├── main.tsx            entry point
├── app/                shell: providers, router, route table, not-found page
├── features/
│   ├── auth/           login, session, logout                     (planned)
│   └── requests/       list, details, new request                 (planned)
├── shared/
│   └── components/     AppPage layout; reusable UI components
├── mock-server/        the pretend backend, kept apart from the app (planned)
└── theme/              global stylesheet and Ionic colour variables
```

## Routes and access

| Route           | Screen                    | Access                                                               |
| --------------- | ------------------------- | -------------------------------------------------------------------- |
| `/login`        | Log in (pick a demo user) | Public                                                               |
| `/requests`     | Request list              | Logged in                                                            |
| `/requests/new` | New request               | Logged in + permission to create _(planned)_                         |
| `/requests/:id` | Request details           | Logged in; the mock server checks access to that request _(planned)_ |
| `/`             | → `/login`                |                                                                      |
| anything else   | Page not found            |                                                                      |

- Routes live in `IonRouterOutlet` (Ionic's page stack: native transitions, swipe back, previous pages stay mounted).
- Every page renders the shared `AppPage` (header, optional back button, content), because each page in Ionic's stack needs its own header.
- **Access is checked in three places from one permissions config** _(planned)_: route guards, components (show or hide actions), and the mock server (refuses anyway). The front end hides; the server enforces.

## Data flow

```text
Screen → TanStack Query hook → feature api.ts → mock server → localStorage
```

- **TanStack Query** owns server data: caching, loading and error states, invalidation after writes.
- **Defaults:** data stays fresh for 5 minutes (instant back navigation); it refetches whenever the user returns to the app; reads retry once, writes never retry automatically.
- **React Context** holds only the session (who's logged in) _(planned)_.
- After every write, the affected queries are invalidated, so lists and details refresh.

## Mock server

_(planned, built epic by epic)_

- Plays the backend: async functions with a short delay, data in localStorage, seeded on first run.
- Validates input, checks permissions and ownership, and returns typed errors (unauthenticated, forbidden, not found, conflict, validation).
- Submitting a request carries an idempotency key, so a double tap can't create two requests.
- With a real backend, it's deleted and each feature's `api.ts` calls `fetch` instead.

## Screens

- **Login:** demo users to tap (employee, supervisor).
- **Request list:** employee: own requests, Upcoming / Past; supervisor: everyone's, Pending / Decided.
- **Request details:** dates, working days, type, notes, status; Approve / Reject for the supervisor on pending requests.
- **New request:** dates, type, optional note, validation, working-day count.

## Cross-cutting concerns

Where each concern is handled in the structure:

| Concern                             | Where it's handled                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Loading, empty and error states** | Query hooks expose them; every list and action shows them. "Saved" appears only after the mock server confirms |
| **Access control**                  | One permissions config, used by route guards, components and the mock server _(planned)_                       |
| **Double submits**                  | Buttons disabled while saving; the mock server ignores a repeated idempotency key _(planned)_                  |
| **Validation**                      | One Zod schema per form, shared by the form and the mock server _(planned)_                                    |
| **Accessibility**                   | Ionic components and native elements, labelled inputs, status shown as text, announced results                 |
| **Responsive layout**               | Mobile-first Ionic layout; on wide screens a centred, max-width column                                         |
| **Theming**                         | Ionic CSS variables in `theme/`; light and dark follow the system                                              |
| **Testing**                         | Pure rules and the mock server with unit tests; components and flows with React Testing Library                |

## Key decisions and trade-offs

- **Features by capability, not by role:** one set of screens; permissions decide the differences. _Trade-off:_ components check permissions instead of being role-specific.
- **TanStack Query for a mocked API:** caching, states and invalidation without hand-written code; swapping in a real API changes only `api.ts`. _Trade-off:_ one more dependency.
- **Context only for the session:** it rarely changes, so no state library. _Would change if_ frequently changing shared client state appeared.
- **A header per page (`AppPage`), not a layout route:** Ionic's stack animates each page's own header. _Trade-off:_ every page renders the wrapper.
- **The mock server enforces rules:** permissions, ownership, final decisions, idempotency, as a real backend would. _Trade-off:_ more code than a JSON file, but the UI is tested against realistic behaviour.
- **No delete:** requests are records; decisions are history.
