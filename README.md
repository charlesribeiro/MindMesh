MindMesh

MindMesh is an open-source reference implementation for intelligent intake, professional matching, and referral workflows.

The initial use case focuses on mental-health service networks, but the architecture is designed around generic concepts such as clients, professionals, organizations, intake, matching, and referrals.

The project also serves as a practical showcase of modern frontend engineering with React, TypeScript, GraphQL, internationalization, accessibility, testing, and trustworthy AI-assisted interfaces.

Project status

MindMesh is currently under active development.

The first MVP is focused on a frontend-first workflow using fictional data and mocked services.

Current and planned capabilities include:

* Responsive public landing page
* English and Brazilian Portuguese localization
* Multi-step administrative intake
* Structured intake review
* Deterministic professional matching with explainable scores
* Mocked GraphQL intake submission with runtime response validation
* Coordinator referral workflow
* GraphQL integration
* AI-assisted structured extraction
* Local LLM integration
* Real-time streaming interfaces
* Automated testing
* Accessibility validation

MindMesh is not currently intended for production use.

Core user journey

The initial workflow is designed around the following flow:

1. A prospective client visits the public application.
2. The client completes an administrative intake.
3. Free-text information may be converted into structured data.
4. The client reviews and corrects the extracted information.
5. The intake is submitted through a GraphQL boundary.
6. A coordinator reviews suggested professionals.
7. The coordinator approves or overrides a referral.
8. The referral status is tracked.

Technical goals

MindMesh is intended to demonstrate:

* Senior-level React and TypeScript architecture
* Explicit handling of asynchronous UI states
* GraphQL queries, mutations, caching, and error handling
* AI output validation and human review
* Real-time interfaces using SSE and WebSockets
* Deterministic UI behavior around non-deterministic model outputs
* Accessible forms and keyboard navigation
* Internationalization from the beginning
* Testable domain logic
* Graceful degradation when AI services are unavailable
* Clean separation between domain, transport, and presentation layers

Technology stack

Frontend

* React
* TypeScript
* Vite
* React Router
* React Hook Form
* Zod
* i18next
* react-i18next
* Zustand
* graphql-request
* Lucide React

Testing

* Vitest
* React Testing Library
* Testing Library User Event
* jsdom

Planned backend and AI infrastructure

* GraphQL Yoga
* Node.js
* Ollama
* Local language models
* Server-Sent Events
* WebSockets
* Docker
* bubbles-server local AI environment

Internationalization

MindMesh supports:

* English
* Brazilian Portuguese

All user-facing text should be added through the internationalization system rather than hardcoded inside React components.

Internal domain identifiers remain language-independent.

For example:

type ServiceModality =
  | 'online'
  | 'in-person'
  | 'no-preference'

Only the visible labels are translated.

Healthcare and AI safety boundaries

MindMesh is an administrative and educational prototype.

It must not:

* diagnose users;
* replace professional clinical evaluation;
* make autonomous clinical decisions;
* present matching suggestions as clinical recommendations;
* process real sensitive health information during development;
* send personally identifiable health data to external AI providers;
* treat crisis-related text as a routine matching request.

AI-generated or AI-extracted information must remain:

* validated;
* explainable;
* editable;
* reviewable by a human;
* safely rejectable when malformed.

All development data must be fictional.

Getting started

Requirements

* Node.js 22 or newer
* npm 10 or newer

Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/MindMesh.git
cd MindMesh

Install dependencies:

npm install

Start the development server:

npm run dev

Open the local URL displayed by Vite, usually:

http://localhost:5173

Available scripts

Start the development server:

npm run dev

Run the linter:

npm run lint

Create a production build:

npm run build

Run the test suite:

npm run test

Preview the production build locally:

npm run preview

Project structure

The application is organized primarily by feature.

src/
├── app/
├── components/
├── domain/
├── features/
│   ├── intake/
│   ├── landing/
│   ├── matching/
│   └── referrals/
├── graphql/
├── i18n/
├── layouts/
├── mocks/
├── pages/
├── schemas/
└── test/

The exact structure may evolve as the project grows.

General principles:

* Feature-specific code should remain inside its feature.
* Domain logic should not depend on React.
* Network logic should remain outside presentational components.
* External and AI-generated data must be validated.
* Local component state should not be promoted to global state without a clear need.

Matching architecture

MindMesh ranking is a pure, deterministic function (`matchProfessionals`) that compares a validated intake payload with a fictional professional directory.

* Matching is weighted and explainable: each suggestion includes matched and unmatched criteria with awarded points.
* Matching does not use AI, randomness, or fuzzy text. Future AI extraction feeds structured intake fields that humans can edit before matching runs.
* Scores are administrative only. Gender preference is an optional bonus (base max 100; perfect match with gender may reach 105). UI labels use “strong / possible / limited administrative match,” never clinical certainty.
* A human coordinator must review suggestions before any referral.
* After GraphQL submission, ranked matches travel with intake in React Router location state. Refreshing or opening `/matches` directly shows an empty state until a new intake is submitted. The React matching page does not re-run the matching engine.

Mocked GraphQL boundary

MindMesh introduces GraphQL before a real backend so the frontend can practice operations, typed variables, runtime validation, and explicit transport error handling.

* The browser talks to `/graphql` through `graphql-request`.
* Mock Service Worker intercepts that endpoint in development and in Vitest.
* The MSW handler reuses the pure `matchProfessionals` engine and returns fictional, deterministic payloads.
* Every mutation response is validated with Zod before mapping into domain types.
* Network failures, GraphQL errors, and malformed payloads are distinguished in the API layer and shown as non-technical user messages.
* Development-only failure scenarios can be triggered with the `x-mindmesh-msw-scenario` header or `?mswScenario=` query parameter.
* A later phase will replace MSW with a GraphQL Yoga API without changing the React feature shape.

Development workflow

MindMesh uses a lightweight GitHub Flow.

The main branch should remain stable and buildable.

New work should be developed in focused branches such as:

feature/intake-form
feature/graphql-boundary
feature/matching-engine
feature/ai-intake-extraction
feature/coordinator-dashboard

Recommended workflow:

1. Create a feature branch.
2. Plan the change.
3. Implement the smallest coherent feature.
4. Run tests, linting, and the production build.
5. Review the changes.
6. Open a pull request.
7. Merge into main.

Conventional Commit messages are encouraged.

Examples:

feat(intake): add multi-step intake workflow
feat(i18n): add Brazilian Portuguese localization
test(intake): cover validation and navigation
fix(layout): improve mobile menu accessibility
docs: update project architecture

AI-assisted development

MindMesh is intentionally being developed with AI-assisted tools.

AI-generated changes must still be:

* reviewed by a human;
* tested;
* type-checked;
* linted;
* evaluated for accessibility;
* evaluated for security and privacy;
* checked against the project domain rules.

The AI assistant should be treated as a pair programmer, not as an autonomous decision-maker.

Project-specific instructions for coding agents are available in:

AGENTS.md

Roadmap

Phase 1 — Frontend foundation

* React and TypeScript setup
* Responsive application layout
* Routing
* English and Brazilian Portuguese localization
* Multi-step intake
* Intake review
* Fictional professional directory
* Deterministic matching engine (administrative suggestions)

Phase 2 — Domain workflow

* Mocked GraphQL boundary (graphql-request + MSW + Zod)
* Coordinator dashboard
* Referral approval
* Referral status tracking

Phase 3 — GraphQL backend

* GraphQL Yoga API (replace MSW)
* Typed queries and mutations
* Response validation
* Partial-error handling
* Optimistic updates
* Request cancellation

Phase 4 — AI integration

* Free-text structured extraction
* Local Ollama integration
* Schema-constrained output
* Malformed-output recovery
* Human review and correction
* Graceful fallback to manual intake

Phase 5 — Real-time and reliability

* Server-Sent Events
* Streaming UI
* WebSocket workflows
* Timeout and retry handling
* Race-condition tests
* End-to-end tests

Open-source strategy

The public repository is intended to remain generic and reusable.

If MindMesh is adapted for a specific organization or professional network, that implementation may be maintained as a separate private fork containing:

* private branding;
* organization-specific workflows;
* proprietary methodologies;
* production infrastructure;
* sensitive configuration;
* real integrations.

The public repository should not contain client secrets, real patient data, private business logic, or proprietary clinical protocols.

Contributing

Contributions, issue reports, architecture suggestions, and accessibility improvements are welcome.

Before submitting a pull request:

npm run test
npm run lint
npm run build

Please keep pull requests focused and explain:

* the problem being solved;
* the proposed approach;
* relevant trade-offs;
* tests added or updated;
* accessibility implications;
* remaining risks.

License

This project is distributed under the terms defined in the repository’s LICENSE file.

Disclaimer

MindMesh is a fictional, open-source demonstration project for administrative intake, professional matching, and referral workflows.

It is not a medical device, diagnostic tool, emergency service, or substitute for care from a qualified professional.
