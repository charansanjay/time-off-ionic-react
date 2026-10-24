# Time Off: Ionic + React

A mobile-first app where employees request time off and supervisors approve or reject the requests.

Built with Ionic React, TypeScript and Capacitor, around a small reusable component library.

> 🚧 Work in progress.

## Contents

- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Assumptions](#assumptions)
- [Tech stack](#tech-stack)

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and npm.

```bash
npm install
npm run dev
```

Open the URL Vite prints. For the mobile view, use your browser's device mode, and reload after switching device to see the iOS or Material style.

## Scripts

| Script               | What it does                        |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the development server        |
| `npm run build`      | Type-check and build for production |
| `npm run preview`    | Serve the production build locally  |
| `npm test`           | Run the tests once                  |
| `npm run test:watch` | Run the tests in watch mode         |
| `npm run lint`       | Lint the code                       |
| `npm run type-check` | Check TypeScript types              |
| `npm run format`     | Format the code with Prettier       |

## Assumptions

Where the brief is silent:

- Request length is counted in **working days** (Monday–Friday); public holidays are not considered.
- Start and end dates are **inclusive**; a request for one day has the same start and end date.
- **Sick leave** may start in the past (it's often reported afterwards); other types can't.
- There is **one supervisor**, who sees everyone's requests (no teams).
- There are **no leave balances**: any number of days can be requested.
- **Decisions are final**, and requests can't be edited, cancelled or deleted.

## Tech stack

Ionic React · React 19 · TypeScript · Vite · Capacitor · Vitest + React Testing Library
