"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

export interface Card {
  id: string
  imageUrl: string
  alt: string
  title: string
  isPlaceholder?: boolean
}

interface CardContextType {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  cards: Card[]
}

const HACKATHON_CARDS: Card[] = [
  {
    id: "github-badge",
    imageUrl: "/hackathon/github-profile-badge.webp",
    alt: "Mohith's GitHub profile badge",
    title: "GitHub Profile Badge",
  },
  {
    id: "nexovate-team",
    imageUrl: "/hackathon/nexovate-team-at-work.webp",
    alt: "My team working together at Nexovate 2025",
    title: "Nexovate 2025, Team at Work",
  },
  {
    id: "nexovate-stage",
    imageUrl: "/hackathon/nexovate-2025-stage.webp",
    alt: "The Nexovate 2025 event stage",
    title: "Nexovate 2025",
  },
  {
    id: "nexovate-winners",
    imageUrl: "/hackathon/central-India-2025-winners.webp",
    alt: "My Central India Hackathon 2025 winning team",
    title: "Central India Hackathon 2025 Winners",
  },
  {
    id: "central-innovation-team",
    imageUrl: "/hackathon/central-India-hackathon-team.webp",
    alt: "My Central India Hackathon team",
    title: "Central India Hackathon Team",
  },
  {
    id: "central-innovation-pitch",
    imageUrl: "/hackathon/central-India-hackathon-pitch.webp",
    alt: "Mohith presenting at the Central India Hackathon",
    title: "Central India Hackathon Pitch",
  },
  {
    id: "nagarjuna-first-place",
    imageUrl: "/hackathon/nagarjuna-hackathon-first-place-award.webp",
    alt: "My team receiving first place at the Nagarjuna hackathon",
    title: "Nagarjuna Hackathon, First Place",
  },
  {
    id: "nagarjuna-certificate",
    imageUrl: "/hackathon/nagarjuna-hackathon-first-place-certificate.webp",
    alt: "Mohith's Nagarjuna hackathon first-place certificate",
    title: "Nagarjuna First-Place Certificate",
  },
  {
    id: "central-innovation-certificate",
    imageUrl: "/hackathon/central-India-hackathon-certificate.webp",
    alt: "Mohith's Central India Hackathon certificate",
    title: "Central India Hackathon Certificate",
  },
  {
    id: "openai-outskill-winner",
    imageUrl: "/hackathon/openai-outskill-hackathon-winner.webp",
    alt: "OpenAI x Outskill AI Builders Hackathon winner announcement for Mohith",
    title: "OpenAI x Outskill Hackathon Winner",
  },
  {
    id: "central-innovation-runner-up",
    imageUrl: "/hackathon/central-innovation-hackathon-second-runner-up.webp",
    alt: "My team celebrating second runner-up at the Central Innovation Hackathon",
    title: "Central Innovation Hackathon, 2nd Runner-Up",
  },
  {
    id: "central-innovation-award",
    imageUrl: "/hackathon/central-innovation-hackathon-award-ceremony.webp",
    alt: "My team receiving the Central Innovation Hackathon award",
    title: "Central Innovation Hackathon Award",
  },
]

const DESIGN_CARDS: Card[] = [
  { id: "design-01", imageUrl: "/designs/elegant-invitation.webp", alt: "Elegant invitation design", title: "Elegant Invitation", isPlaceholder: true },
  { id: "design-02", imageUrl: "/designs/modern-design.webp", alt: "Modern graphic design", title: "Modern Design", isPlaceholder: true },
  { id: "design-03", imageUrl: "/designs/vintage-style.webp", alt: "Vintage-style design", title: "Vintage Style", isPlaceholder: true },
  { id: "design-04", imageUrl: "/designs/minimalist-design.webp", alt: "Minimalist design", title: "Minimalist", isPlaceholder: true },
  { id: "design-05", imageUrl: "/designs/floral-design.webp", alt: "Floral design", title: "Floral Design", isPlaceholder: true },
  { id: "design-06", imageUrl: "/designs/geometric-design.webp", alt: "Geometric design", title: "Geometric", isPlaceholder: true },
  { id: "design-07", imageUrl: "/designs/luxury-gold.webp", alt: "Luxury gold design", title: "Luxury Gold", isPlaceholder: true },
  { id: "design-08", imageUrl: "/designs/rustic-style.webp", alt: "Rustic-style design", title: "Rustic Style", isPlaceholder: true },
  { id: "design-09", imageUrl: "/designs/dark-modern.webp", alt: "Dark modern design", title: "Dark Modern", isPlaceholder: true },
  { id: "design-10", imageUrl: "/designs/colorful-party.webp", alt: "Colorful party design", title: "Colorful Party", isPlaceholder: true },
  { id: "design-11", imageUrl: "/designs/geometric-grid.webp", alt: "Geometric grid design", title: "Geometric Grid", isPlaceholder: true },
  { id: "design-12", imageUrl: "/designs/luxury-gold-script.webp", alt: "Luxury gold script design", title: "Luxury Gold Script", isPlaceholder: true },
  { id: "design-13", imageUrl: "/designs/rustic-invitation.webp", alt: "Rustic invitation design", title: "Rustic Invitation", isPlaceholder: true },
  { id: "design-14", imageUrl: "/designs/dark-modern-invitation.webp", alt: "Dark modern invitation", title: "Dark Modern Invitation", isPlaceholder: true },
  { id: "design-15", imageUrl: "/designs/colorful-party-invitation.webp", alt: "Colorful party invitation", title: "Colorful Party Invitation", isPlaceholder: true },
  { id: "design-16", imageUrl: "/designs/elegant-script.webp", alt: "Elegant script design", title: "Elegant Script", isPlaceholder: true },
  { id: "design-17", imageUrl: "/designs/watercolor-art.webp", alt: "Watercolor artwork", title: "Watercolor Art", isPlaceholder: true },
  { id: "design-18", imageUrl: "/designs/botanical-design.webp", alt: "Botanical design", title: "Botanical", isPlaceholder: true },
  { id: "design-19", imageUrl: "/designs/art-deco.webp", alt: "Art deco design", title: "Art Deco", isPlaceholder: true },
  { id: "design-20", imageUrl: "/designs/marble-luxury.webp", alt: "Marble luxury design", title: "Marble Luxury", isPlaceholder: true },
]

const ALL_CARDS = [...HACKATHON_CARDS, ...DESIGN_CARDS]
const CardContext = createContext<CardContextType | undefined>(undefined)

export function CardProvider({ children }: { children: ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const value = useMemo(() => ({ selectedCard, setSelectedCard, cards: ALL_CARDS }), [selectedCard])

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}

export function useCard() {
  const context = useContext(CardContext)
  if (!context) throw new Error("useCard must be used within a CardProvider")
  return context
}
