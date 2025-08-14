import type React from "react"
import "../src/index.css"

export const metadata = {
  title: "Draad Tokens Editor - Design System Token Manager",
  description: "A powerful tool for managing and exporting design tokens from Figma Token Studio",
  keywords: "figma, tokens, design system, css variables, token studio",
  authors: [{ name: "Draad Tokens Editor" }],
    generator: 'v0.app'
}

export const viewport = { width: "device-width", initialScale: 1 }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  )
}
