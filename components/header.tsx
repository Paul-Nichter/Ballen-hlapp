import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Moon } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Strohballen Manager</h1>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Aktiv</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Rückgängig</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Moon className="h-5 w-5" />
              <span className="sr-only">Dark Mode</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Inventar & Bestellverwaltung</p>
      </div>
    </header>
  )
}
