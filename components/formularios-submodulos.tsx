"use client"
import { FileText, History, FolderOpen } from 'lucide-react'

interface FormulariosSubmodulosProps {
  onModuleSelect: (moduleId: string) => void
  selectedSection?: string | null
}

export default function FormulariosSubmodulos({ onModuleSelect, selectedSection }: FormulariosSubmodulosProps) {
  // Si no hay sección seleccionada, mostrar las dos secciones principales
  if (!selectedSection) {
    const secciones = [
      {
        id: "formulario-section",
        title: "Formulario",
        description: "Gestión y carga de formularios de reportes",
        icon: FolderOpen,
        color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      },
      {
        id: "consultas-section",
        title: "Consultas",
        description: "Consulta de información y reportes históricos",
        icon: FolderOpen,
        color: "from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
      },
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secciones.map((seccion) => {
            const Icon = seccion.icon
            return (
              <button
                key={seccion.id}
                onClick={() => onModuleSelect(seccion.id)}
                className={`bg-gradient-to-br ${seccion.color} rounded-lg border border-border p-6 hover:shadow-lg transition text-left w-full`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={28} className="text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{seccion.title}</h3>
                    <p className="text-sm text-muted-foreground">{seccion.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Si hay sección seleccionada, mostrar los items de esa sección
  if (selectedSection === "formulario-section") {
    const items = [
      { id: "gestion-formularios", label: "Gestión de Formularios", icon: FileText, description: "Crear y gestionar formularios de reportes" }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onModuleSelect(item.id)}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-border p-6 hover:shadow-lg transition text-left w-full"
              >
                <div className="flex items-start gap-3">
                  <Icon size={28} className="text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (selectedSection === "consultas-section") {
    const items = [
      { id: "historico-envios", label: "Histórico de Envíos", icon: History, description: "Consultar histórico de envíos y reportes" }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onModuleSelect(item.id)}
                className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 rounded-lg border border-border p-6 hover:shadow-lg transition text-left w-full"
              >
                <div className="flex items-start gap-3">
                  <Icon size={28} className="text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
