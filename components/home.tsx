"use client"

import { useState } from "react"
import { ChevronDown, LogOut, Menu, X, Shield, Users, Building2, BarChart3, ClipboardList, Cog, Zap, FileText, History, FolderOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface HomeProps {
  username: string
  onLogout: () => void
  onModuleSelect?: (moduleId: string) => void
}

export default function Home({ username, onLogout, onModuleSelect }: HomeProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      label: "Administración",
      icon: Shield,
      submenu: [
        { label: "Gestión de Entidades", id: "entidades", icon: Building2 },
        { label: "Gestión de Usuarios", id: "usuarios", icon: Users },
        { label: "Gestión de Roles", id: "roles", icon: Shield },
        { label: "Auditoría", id: "auditoria", icon: ClipboardList },
      ],
    },
    {
      label: "Formularios",
      icon: FileText,
      submenu: [
        { 
          label: "Formulario", 
          id: "formulario-group", 
          icon: FolderOpen,
          children: [
            { label: "Gestión de Formularios", id: "gestion-formularios", icon: FileText }
          ]
        },
        { 
          label: "Consultas", 
          id: "consultas-group", 
          icon: FolderOpen,
          children: [
            { label: "Histórico de Envíos", id: "historico-envios", icon: History }
          ]
        },
      ],
    },
    {
      label: "Parametrización",
      icon: Cog,
      submenu: [{ label: "Configuración General", id: "config", icon: Cog }],
    },
    {
      label: "Operaciones",
      icon: Zap,
      submenu: [{ label: "Procesos", id: "procesos", icon: Zap }],
    },
    {
      label: "Reportes",
      icon: BarChart3,
      submenu: [{ label: "Reportes Generales", id: "reportes-gen", icon: BarChart3 }],
    },
  ]

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const handleModuleClick = (moduleId: string) => {
    setMobileMenuOpen(false)
    if (onModuleSelect) {
      onModuleSelect(moduleId)
    }
  }

  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">CHIP</h1>
            <p className="text-xs text-primary-foreground/80">Sistema de Gestión</p>
          </div>
        </div>

        {/* Menú desktop */}
        <nav className="hidden md:flex gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="relative group">
                <button
                  className="px-4 py-2 rounded-md hover:bg-primary/80 transition flex items-center gap-2 text-sm font-medium"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Icon size={16} />
                  {item.label}
                  <ChevronDown size={14} className="group-hover:rotate-180 transition" />
                </button>

                {openMenu === item.label && (
                  <div className="absolute top-full left-0 mt-0 bg-card text-foreground rounded-md shadow-xl min-w-max border border-border z-50 animate-fadeIn">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon
                      // Si tiene children, es un grupo
                      if ('children' in sub && sub.children) {
                        return (
                          <div key={sub.id} className="relative group/submenu">
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition text-sm font-medium text-muted-foreground">
                              <SubIcon size={16} className="text-primary" />
                              {sub.label}
                              <ChevronDown size={14} className="-rotate-90 ml-auto" />
                            </div>
                            {/* Submenu anidado */}
                            <div className="absolute left-full top-0 ml-1 hidden group-hover/submenu:block bg-card rounded-md shadow-xl min-w-max border border-border">
                              {sub.children.map((child) => {
                                const ChildIcon = child.icon
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleModuleClick(child.id)}
                                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-accent/10 transition first:rounded-t-md last:rounded-b-md text-sm"
                                  >
                                    <ChildIcon size={16} className="text-primary" />
                                    {child.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      }
                      // Si no tiene children, es un item normal
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleModuleClick(sub.id)}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-accent/10 transition first:rounded-t-md last:rounded-b-md text-sm"
                        >
                          <SubIcon size={16} className="text-primary" />
                          {sub.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Información del usuario y logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">{username}</p>
            <p className="text-xs text-primary-foreground/80">Administrador</p>
          </div>
          <Button
            onClick={onLogout}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md transition flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </Button>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary-foreground hover:text-primary-foreground/80 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil mejorado */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-primary/95 border-t border-primary-foreground/20 p-4 space-y-2 animate-fadeIn">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full text-left px-4 py-2 rounded-md hover:bg-primary/80 transition flex items-center justify-between text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    {item.label}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transform transition ${openMenu === item.label ? "rotate-180" : ""}`}
                  />
                </button>

                {openMenu === item.label && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon
                      // Si tiene children, es un grupo
                      if ('children' in sub && sub.children) {
                        return (
                          <div key={sub.id} className="relative group/submenu">
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition text-sm font-medium text-muted-foreground">
                              <SubIcon size={16} className="text-primary" />
                              {sub.label}
                              <ChevronDown size={14} className="-rotate-90 ml-auto" />
                            </div>
                            {/* Submenu anidado */}
                            <div className="absolute left-full top-0 ml-1 hidden group-hover/submenu:block bg-card rounded-md shadow-xl min-w-max border border-border">
                              {sub.children.map((child) => {
                                const ChildIcon = child.icon
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleModuleClick(child.id)}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-md bg-primary/50 hover:bg-primary/70 transition text-sm"
                                  >
                                    <ChildIcon size={14} />
                                    {child.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      }
                      // Si no tiene children, es un item normal
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleModuleClick(sub.id)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-md bg-primary/50 hover:bg-primary/70 transition text-sm"
                        >
                          <SubIcon size={14} />
                          {sub.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      )}
    </header>
  )
}
