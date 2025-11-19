"use client"
import { FileText, History, FolderOpen } from 'lucide-react'

interface FormulariosSubmodulosProps {
  onModuleSelect: (moduleId: string) => void
}

export default function FormulariosSubmodulos({ onModuleSelect }: FormulariosSubmodulosProps) {
  const subsecciones = [
    {
      id: "formulario-section",
      title: "Formulario",
      description: "Gestión y carga de formularios de reportes",
      icon: FolderOpen,
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      submenu: [
        { id: "gestion-formularios", label: "Gestión de Formularios", icon: FileText }
      ]
    },
    {
      id: "consultas-section",
      title: "Consultas",
      description: "Consulta de información y reportes históricos",
      icon: FolderOpen,
      color: "from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
      submenu: [
        { id: "historico-envios", label: "Histórico de Envíos", icon: History }
      ]
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsecciones.map((seccion) => {
          const Icon = seccion.icon
          return (
            <div
              key={seccion.id}
              className={`bg-gradient-to-br ${seccion.color} rounded-lg border border-border p-6 hover:shadow-lg transition`}
            >
              <div className="flex items-start gap-3 mb-4">
                <Icon size={28} className="text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{seccion.title}</h3>
                  <p className="text-sm text-muted-foreground">{seccion.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                {seccion.submenu.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => onModuleSelect(item.id)}
                      className="w-full flex items-center gap-3 bg-background/60 hover:bg-background rounded-md p-3 transition text-left border border-border/50"
                    >
                      <ItemIcon size={20} className="text-primary" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
