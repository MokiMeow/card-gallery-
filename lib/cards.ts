/**
 * The gallery's deck. Titles, years and writing are carried over unchanged from
 * the previous gallery view; `aspect` is each image's real width / height so no
 * photograph is cropped to fit a card.
 */

export type CardInfo = {
  id: string
  src: string
  title: string
  kind: string
  year: number
  description: string
  note: string
  aspect: number
  /** False for the "Untitled Universe" cards: space kept for what has not happened yet. */
  written: boolean
}

const MILESTONES: Omit<CardInfo, "id" | "written">[] = [
  {
    src: "/hackathon/nexovate-2025-stage.webp",
    title: "Nexovate 2025",
    kind: "Hackathon",
    year: 2025,
    aspect: 0.562,
    description:
      "The Nexovate 2025 stage at Presidency University, marking the start of a day built around fast decisions, teamwork and practical experimentation.",
    note: "A reminder of where the project began before the first line of the final build was ready.",
  },
  {
    src: "/hackathon/nexovate-team-at-work.webp",
    title: "Nexovate Build Session",
    kind: "Hackathon",
    year: 2025,
    aspect: 1.333,
    description:
      "A focused build session at Nexovate 2025, where the team shaped the idea, divided the work and turned it into a working prototype.",
    note: "The strongest part of the day was not the pitch. It was the quiet stretch where everyone solved a different part of the same problem.",
  },
  {
    src: "/hackathon/central-India-hackathon-team.webp",
    title: "Central India Team",
    kind: "Hackathon",
    year: 2025,
    aspect: 1.501,
    description:
      "The Central India Hackathon team together between build sessions, with the project moving from a rough direction toward a clear demonstration.",
    note: "A team portrait from the middle of the process, before the final outcome was certain.",
  },
  {
    src: "/hackathon/central-India-hackathon-pitch.webp",
    title: "Central India Pitch",
    kind: "Hackathon",
    year: 2025,
    aspect: 1.501,
    description:
      "Mohith presenting the project at the Central India Hackathon, translating the technical work into a clear problem, approach and product story.",
    note: "Good engineering mattered, but so did making the value understandable in a few focused minutes.",
  },
  {
    src: "/hackathon/central-India-2025-winners.webp",
    title: "Central India Winners",
    kind: "Achievement",
    year: 2025,
    aspect: 1.501,
    description: "My team after being recognised at the Central India Hackathon 2025 for the strength of our idea and execution.",
    note: "The award captures the finish, but the real result came from the decisions, revisions and teamwork behind it.",
  },
  {
    src: "/hackathon/central-India-hackathon-certificate.webp",
    title: "Central India Certificate",
    kind: "Achievement",
    year: 2025,
    aspect: 1.333,
    description:
      "Mohith's certificate from the Central India Hackathon, recognising the team's participation and completed project presentation.",
    note: "One document from a much longer process of building, testing and explaining the work.",
  },
  {
    src: "/hackathon/nagarjuna-hackathon-first-place-award.webp",
    title: "Nagarjuna First Place",
    kind: "Achievement",
    year: 2025,
    aspect: 1.333,
    description:
      "My team receiving first place at the Nagarjuna hackathon after presenting a complete working solution to the judging panel.",
    note: "The result recognised both the final build and the discipline required to make it convincing under time pressure.",
  },
  {
    src: "/hackathon/nagarjuna-hackathon-first-place-certificate.webp",
    title: "Nagarjuna Certificate",
    kind: "Achievement",
    year: 2025,
    aspect: 1.333,
    description:
      "The first-place certificate awarded to Mohith at Nagarjuna College of Engineering and Technology's technical event.",
    note: "A formal record of a project that moved from an idea to a winning demonstration.",
  },
  {
    src: "/hackathon/github-profile-badge.webp",
    title: "GitHub Identity",
    kind: "Milestone",
    year: 2026,
    aspect: 0.73,
    description:
      "A physical badge connecting Mohith's developer identity with the open-source work and experiments shared through GitHub.",
    note: "A small object that represents a much larger habit: building in public and leaving useful work behind.",
  },
  {
    src: "/hackathon/openai-outskill-hackathon-winner.webp",
    title: "OpenAI x Outskill Winner",
    kind: "Achievement",
    year: 2026,
    aspect: 1,
    description:
      "PatchPilot won the OpenAI x Outskill AI Builders Hackathon. The project uses AI to identify vulnerabilities, analyse codebases and help produce verified fixes.",
    note: "It stood out through the strength of its technical implementation and its focus on making security engineering more actionable.",
  },
  {
    src: "/hackathon/central-innovation-hackathon-second-runner-up.webp",
    title: "CIH 2026 Runner-Up",
    kind: "Achievement",
    year: 2026,
    aspect: 1.333,
    description:
      "My team secured 2nd Runner-Up at CIH 2026, earning recognition for a project developed and presented under hackathon constraints.",
    note: "The result reflects a complete team effort, from the earliest idea to the final demonstration.",
  },
  {
    src: "/hackathon/central-innovation-hackathon-award-ceremony.webp",
    title: "CIH 2026 Award Ceremony",
    kind: "Achievement",
    year: 2026,
    aspect: 1.776,
    description: "The CIH 2026 award ceremony, where my team received the 2nd Runner-Up prize for our completed project.",
    note: "A closing moment that records the people behind the work as clearly as the result itself.",
  },
  {
    src: "/hackathon/agents-that-act-polaris-hall.webp",
    title: "Agents That Act",
    kind: "Hackathon",
    year: 2026,
    aspect: 1.333,
    description: "Two laptops open in the hall at Polaris, Bengaluru, at the start of the Agents That Act hackathon.",
    note: "We took part and did not place this time. It was a good one to be at.",
  },
  {
    src: "/hackathon/agents-that-act-mid-build.webp",
    title: "Agents That Act, Mid-Build",
    kind: "Hackathon",
    year: 2026,
    aspect: 0.75,
    description: "Partway through the build at Agents That Act, with the agent working through its run on screen.",
    note: "No prize from this one. The building was the fun part.",
  },
  {
    src: "/hackathon/agents-that-act-late-night.webp",
    title: "Agents That Act, Late Night",
    kind: "Hackathon",
    year: 2026,
    aspect: 1.333,
    description: "Late at night at Agents That Act: both projectors in the hall playing Rick Astley while the laptops kept working.",
    note: "Not every memory from a hackathon is the build.",
  },
]

const UNIVERSE_FILES = [
  "elegant-invitation",
  "modern-design",
  "vintage-style",
  "minimalist-design",
  "floral-design",
  "geometric-design",
  "luxury-gold",
  "rustic-style",
  "dark-modern",
  "colorful-party",
  "geometric-grid",
  "luxury-gold-script",
  "rustic-invitation",
  "dark-modern-invitation",
  "colorful-party-invitation",
  "elegant-script",
  "watercolor-art",
  "botanical-design",
  "art-deco",
  "marble-luxury",
]

/** Milestones in the order they happened. */
export const WRITTEN: CardInfo[] = MILESTONES.map((card, index) => ({ ...card, id: `milestone-${index + 1}`, written: true }))

export const UNWRITTEN: CardInfo[] = UNIVERSE_FILES.map((file, index) => ({
  id: `universe-${index + 1}`,
  src: `/designs/${file}.webp`,
  title: `Untitled Universe ${String(index + 1).padStart(2, "0")}`,
  kind: "In progress",
  year: 2026,
  aspect: 0.75,
  written: false,
  description:
    "This universe is still being explored. Each untitled card holds space for the next hackathon, achievement, experiment or dream waiting beyond the current horizon.",
  note: "There is no final edge here. The universe is infinite, and these placeholders represent milestones not reached yet and possibilities still waiting to be discovered.",
}))

export const FORMATIONS = [
  { id: "room", label: "Room", hint: "Stand inside it" },
  { id: "spiral", label: "Spiral", hint: "Walk it in order" },
  { id: "wall", label: "Wall", hint: "See it at once" },
  { id: "tunnel", label: "Tunnel", hint: "Fly through it" },
] as const

export type FormationId = (typeof FORMATIONS)[number]["id"]
