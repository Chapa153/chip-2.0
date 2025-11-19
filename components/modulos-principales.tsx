"use client"
import { Shield, Cog, Zap, BarChart3, FileText } from "lucide-react"

interface ModulosPrincipalesProps {
  onModuleSelect: (moduleId: string) => void
}

export default function ModulosPrincipales({ onModuleSelect }: ModulosPrincipalesProps) {
  const modulosPrincipales = [
    {
      id: "administracion",
      title: "Administración",
      description: "Gestión de usuarios, roles, entidades y auditoría",
      icon: Shield,
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    },
    {
      id: "formularios",
      title: "Formularios",
      description: "Gestión y carga de formularios de reportes",
      icon: FileText,
      color: "from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900",
    },
    {
      id: "parametrizacion",
      title: "Parametrización",
      description: "Configuración general del sistema",
      icon: Cog,
      color: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
    },
    {
      id: "operaciones",
      title: "Operaciones",
      description: "Gestión de procesos operacionales",
      icon: Zap,
      color: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    },
    {
      id: "reportes",
      title: "Reportes",
      description: "Generación de reportes y análisis",
      icon: BarChart3,
      color: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {modulosPrincipales.map((modulo) => {
        const Icon = modulo.icon
        return (
          <button
            key={modulo.id}
            onClick={() => onModuleSelect(modulo.id)}
            className={`group bg-gradient-to-br ${modulo.color} rounded-lg border border-border p-6 hover:shadow-lg transition transform hover:scale-105 cursor-pointer text-left`}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon size={28} className="text-primary group-hover:scale-110 transition" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{modulo.title}</h3>
            <p className="text-sm text-muted-foreground">{modulo.description}</p>
          </button>
        )
      })}
    </div>
  )
}
