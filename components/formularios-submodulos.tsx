"use client"
import { FileText, History } from 'lucide-react'

interface FormulariosSubmodulosProps {
  onModuleSelect: (moduleId: string) => void
}

export default function FormulariosSubmodulos({ onModuleSelect }: FormulariosSubmodulosProps) {
  const submodulos = [
    {
      id: "gestion-formularios",
      title: "Gestión de Formularios",
      description: "Carga y validación de formularios de reportes",
      icon: FileText,
      color: "from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900",
    },
    {
      id: "historico-envios",
      title: "Histórico de Envíos",
      description: "Consulte el historial de formularios transmitidos",
      icon: History,
      color: "from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submodulos.map((modulo) => {
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
    </div>
  )
}
