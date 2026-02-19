"use client"

import { ThemeToggle } from "./theme-toggle"
import { Badge } from "./ui/badge"

interface HeaderProps {
  isPaused?: boolean
}

export function Header({ isPaused }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Kleinballenzähler</h1>
          {isPaused !== undefined && (
            <Badge variant={isPaused ? "destructive" : "default"}>{isPaused ? "Pausiert (Strg+L)" : "Aktiv"}</Badge>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
