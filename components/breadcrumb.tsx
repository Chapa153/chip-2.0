"use client"

import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  onClick?: () => void
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="max-w-7xl mx-auto px-4 py-3 bg-background border-b border-border flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={16} className="text-muted-foreground" />}
          <button
            onClick={item.onClick}
            disabled={!item.onClick}
            className={`transition ${
              item.isActive
                ? "text-foreground font-semibold cursor-default"
                : item.onClick
                  ? "text-primary hover:underline cursor-pointer"
                  : "text-muted-foreground cursor-default"
            }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  )
}
