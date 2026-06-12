# Aethel

A production-grade Next.js 15 foundation for Aethel, an AI-powered personal memory operating system.

This repository currently contains only the application foundation. Product features, authentication, database integration, and AI features are intentionally not implemented yet.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui configuration
- Framer Motion
- ESLint
- Prettier

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run format:check
```

## Structure

```text
app/          Next.js App Router routes and layouts
components/   Shared application components and shadcn/ui components
constants/    Application constants
features/     Future feature modules
hooks/        Shared React hooks
lib/          Utilities and low-level shared helpers
providers/    Root provider composition
public/       Static assets
services/     Service adapters and API clients
stores/       Client state stores
styles/       Global styles
types/        Shared TypeScript types
```
