# MindMesh

## Purpose

MindMesh is an open-source reference implementation for intelligent intake,
professional matching, and referral workflows.

The initial use case is mental-health professional matching, but the domain
architecture should remain adaptable to other professional service networks.

The project demonstrates:

- React and TypeScript architecture
- GraphQL integration
- AI-assisted structured extraction
- asynchronous and non-deterministic UI handling
- accessible and trustworthy user experiences
- frontend testing and debugging

## Initial user journey

1. A prospective client visits the landing page.
2. The client completes an administrative intake.
3. Free-text information is converted into structured data.
4. The client reviews and corrects the extracted information.
5. The intake is submitted through a GraphQL boundary.
6. A coordinator reviews suggested professionals.
7. The coordinator approves or overrides the referral.

## Current scope

The first version is frontend-first and uses fictional data and mocked APIs.

Do not implement yet:

- authentication
- payments
- real patient records
- diagnosis
- automated clinical decisions
- real AI providers
- database persistence
- calendar integrations

## Stack

- React
- TypeScript
- Vite
- React Router
- React Hook Form
- Zod
- GraphQL
- graphql-request
- Zustand only for genuinely shared client state
- Vitest
- React Testing Library

## Engineering rules

- Use strict TypeScript.
- Do not use `any`.
- Prefer small, focused components.
- Keep business logic separate from rendering.
- Keep network logic outside presentational components.
- Validate external data using Zod.
- Treat AI output as untrusted input.
- Explicitly represent idle, loading, success, empty, cancelled and error states.
- Keep form state local unless it must span routes.
- Use pure functions for matching and scoring.
- Add focused tests for important behavior.
- Preserve accessibility and keyboard navigation.
- Avoid unnecessary abstractions and dependencies.
- Use only fictional development data.

## Safety boundaries

- MindMesh must not diagnose users.
- Matching results are administrative suggestions, not clinical recommendations.
- AI-extracted information must be editable and reviewable.
- Do not send real sensitive information to external AI providers.
- Human review must remain part of referral decisions.

## Agent workflow

Before substantial implementation:

1. Inspect existing code.
2. Explain the proposed approach.
3. Identify assumptions and edge cases.
4. Implement the smallest coherent change.
5. Run linting, tests and TypeScript checks.
6. Report changed files and remaining risks.