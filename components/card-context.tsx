"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Card {
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

const CardContext = createContext<CardContextType | undefined>(undefined)

export function CardProvider({ children }: { children: ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  // Real photos (front): files from /public/hackathon
  const hackathonCards: Card[] = [
    { id: "1", imageUrl: "/hackathon/git.png", alt: "Hackathon 1", title: "Hackathon 1" },
    { id: "2", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.09.33 (1).jpeg", alt: "Hackathon 2", title: "Hackathon 2" },
    { id: "3", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.09.33 (2).jpeg", alt: "Hackathon 3", title: "Hackathon 3" },
    { id: "4", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.09.33.jpeg", alt: "Hackathon 4", title: "Hackathon 4" },
    { id: "5", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.09.35 (1).jpeg", alt: "Hackathon 5", title: "Hackathon 5" },
    { id: "6", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.09.35.jpeg", alt: "Hackathon 6", title: "Hackathon 6" },
    { id: "7", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.09.36.jpeg", alt: "Hackathon 7", title: "Hackathon 7" },
    { id: "8", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.52.58 (1).jpeg", alt: "Hackathon 8", title: "Hackathon 8" },
    { id: "9", imageUrl: "/hackathon/WhatsApp Image 2025-11-05 at 19.52.58.jpeg", alt: "Hackathon 9", title: "Hackathon 9" },
  ]

  // Back filler: the 20 design images you shared earlier
  const designCards: Card[] = [
    { id: "101", imageUrl: "https://i.ibb.co/4ZWcP129/1.png", alt: "Elegant Invitation", title: "Elegant Invitation" },
    { id: "102", imageUrl: "https://i.ibb.co/TMbhBRcL/2.png", alt: "Modern Design", title: "Modern Design" },
    { id: "103", imageUrl: "https://i.ibb.co/spXBFdSm/3.png", alt: "Vintage Style", title: "Vintage Style" },
    { id: "104", imageUrl: "https://i.ibb.co/N2TCN0bC/4.png", alt: "Minimalist", title: "Minimalist" },
    { id: "105", imageUrl: "https://i.ibb.co/jZkh6q1M/5.png", alt: "Floral Design", title: "Floral Design" },
    { id: "106", imageUrl: "https://i.ibb.co/6cc7mksr/6.png", alt: "Geometric", title: "Geometric" },
    { id: "107", imageUrl: "https://i.ibb.co/bjV35jNQ/7.png", alt: "Luxury Gold", title: "Luxury Gold" },
    { id: "108", imageUrl: "https://i.ibb.co/PZ7WLs7g/8.png", alt: "Rustic Style", title: "Rustic Style" },
    { id: "109", imageUrl: "https://i.ibb.co/qLR5bQRM/9.png", alt: "Dark Modern", title: "Dark Modern" },
    { id: "110", imageUrl: "https://i.ibb.co/PdNhw3K/10.png", alt: "Colorful Party", title: "Colorful Party" },
    { id: "111", imageUrl: "https://i.ibb.co/zWpN1nqJ/11.png", alt: "Geometric", title: "Geometric" },
    { id: "112", imageUrl: "https://i.ibb.co/fVYnCXgR/12.png", alt: "Luxury Gold", title: "Luxury Gold" },
    { id: "113", imageUrl: "https://i.ibb.co/1G6jZWcZ/13.png", alt: "Rustic Style", title: "Rustic Style" },
    { id: "114", imageUrl: "https://i.ibb.co/xKG7m905/14.png", alt: "Dark Modern", title: "Dark Modern" },
    { id: "115", imageUrl: "https://i.ibb.co/7dJzR3xK/15.png", alt: "Colorful Party", title: "Colorful Party" },
    { id: "116", imageUrl: "https://i.ibb.co/NdJ1csXB/16.png", alt: "Elegant Script", title: "Elegant Script" },
    { id: "117", imageUrl: "https://i.ibb.co/8L2Sdt5Q/17.png", alt: "Watercolor Art", title: "Watercolor Art" },
    { id: "118", imageUrl: "https://i.ibb.co/mC1zxJYq/18.png", alt: "Botanical", title: "Botanical" },
    { id: "119", imageUrl: "https://i.ibb.co/wryzsKs4/20.png", alt: "Art Deco", title: "Art Deco" },
    { id: "120", imageUrl: "https://i.ibb.co/1fvnxL3L/19.png", alt: "Marble Luxury", title: "Marble Luxury" },
  ]

  const cards: Card[] = [...hackathonCards, ...designCards]

  return <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>{children}</CardContext.Provider>
}

export function useCard() {
  const context = useContext(CardContext)
  if (context === undefined) {
    throw new Error("useCard must be used within a CardProvider")
  }
  return context
}
