import type { Metadata, Viewport } from "next"
import { Geist, Oswald } from "next/font/google"
import "./globals.css"

const body = Geist({ subsets: ["latin"], variable: "--font-body" })
const display = Oswald({ subsets: ["latin"], weight: "700", variable: "--font-display" })

export const metadata: Metadata = {
  title: "Mohith | Gallery",
  description: "A room of Mohith's hackathon milestones, with space kept for the ones not written yet.",
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>{children}</body>
    </html>
  )
}
