# Card Galaxy

Card Galaxy is an interactive 3D archive of Mohith's hackathon milestones and
visual design work. Visitors can orbit and zoom through the scene, open each card
in an accessible modal, or enter the alternate gallery experience.

## Stack

- Next.js and React
- React Three Fiber, Drei, and Three.js
- Tailwind CSS
- TypeScript
- Vercel

## Development

Node.js 24 and pnpm 10.33 are required.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

## Verification

```bash
pnpm check
pnpm audit --audit-level moderate
```

The GitHub Actions workflow runs install, lint, type-check, dependency audit, and
the production build for pull requests and pushes to `main`.
