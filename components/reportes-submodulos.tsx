"use client"
import { FileBarChart, Activity } from "lucide-react"

interface ReportesSubmodulosProps {
  onModuleSelect: (moduleId: string) => void
}

export default function ReportesSubmodulos({ onModuleSelect }: ReportesSubmodulosProps) {
  const categorias = [
    {
      id: "operaciones-reciprocas",
      title: "Operaciones Recíprocas",
      description: "Reportes de conciliación y saldos",
      icon: FileBarChart,
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      reportes: [
        {
          id: "saldos-conciliar",
          nombre: "Saldos por Conciliar",
        },
        {
          id: "saldos-cuentas-reciprocas",
          nombre: "Saldos Cuentas Recíprocas",
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Tarjeta de información */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-md p-8 border border-border animate-fadeIn">
        <h2 className="text-3xl font-bold text-foreground mb-2">Reportes</h2>
        <p className="text-muted-foreground">
          Selecciona una categoría para acceder a los reportes disponibles del sistema.
        </p>
      </div>

      {/* Categorías de reportes */}
      {categorias.map((categoria) => {
        const Icon = categoria.icon
        return (
          <div key={categoria.id} className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <Icon size={24} className="text-primary" />
              <h3 className="text-xl font-semibold text-foreground">{categoria.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoria.reportes.map((reporte) => (
                <button
                  key={reporte.id}
                  onClick={() => onModuleSelect(reporte.id)}
                  className={`group bg-gradient-to-br ${categoria.color} rounded-lg border border-border p-6 hover:shadow-lg transition transform hover:scale-105 cursor-pointer text-left`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Activity size={28} className="text-primary group-hover:scale-110 transition" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{reporte.nombre}</h4>
                  <p className="text-sm text-muted-foreground">Generar reporte de {reporte.nombre.toLowerCase()}</p>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
