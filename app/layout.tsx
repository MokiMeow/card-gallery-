import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mohith | Card Galaxy',
  description: 'An interactive 3D archive of Mohith’s hackathon milestones and visual explorations.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
