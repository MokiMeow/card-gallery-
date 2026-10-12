# Mohith | Gallery

An interactive gallery of Mohith's hackathon milestones, set in open space. The
milestones ring the visitor at eye level; the "Untitled Universe" cards around
them hold space for what has not happened yet.

The same deck can be hung four ways: **Room**, **Spiral** (in the order things
happened), **Wall** (all at once) and **Tunnel** (fly through it). Select a card
to bring it forward with its story.

## Stack

- Next.js and React
- Three.js for the scene, Anime.js for every transition
- TypeScript
- Vercel

## Development

Node.js 24 and pnpm 10.33 are required.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

## Adding a milestone

1. Put the image in `public/hackathon/` (WebP, longest side 1600px or less).
2. Add an entry to `MILESTONES` in `lib/cards.ts`, with `aspect` set to the
   image's width divided by its height. The layouts adapt to the count.

## Verification

```bash
pnpm check
pnpm audit --audit-level moderate
```

The GitHub Actions workflow runs install, lint, type-check, dependency audit, and
the production build for pull requests and pushes to `main`.
