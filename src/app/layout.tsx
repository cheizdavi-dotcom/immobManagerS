import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ImmobManager OS",
  description: "High-End Real Estate CRM",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#05080b] text-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
