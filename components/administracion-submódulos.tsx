"use client"
import { Users, Shield, Building2, BarChart3, UserCog } from "lucide-react"
import Breadcrumb from "@/components/breadcrumb"

interface AdministracionSubmodulosProps {
  username: string
  onBack: () => void
  onModuleSelect: (moduleId: string) => void
}

export default function AdministracionSubmodulos({ username, onBack, onModuleSelect }: AdministracionSubmodulosProps) {
  const submodulos = [
    {
      id: "usuarios",
      title: "Gestión de Usuarios",
      description: "Administra usuarios del sistema",
      icon: Users,
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    },
    {
      id: "roles",
      title: "Gestión de Roles",
      description: "Configura roles y permisos",
      icon: Shield,
      color: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
    },
    {
      id: "entidades",
      title: "Gestión de Entidades",
      description: "Administra las entidades del sistema",
      icon: Building2,
      color: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    },
    {
      id: "analistas",
      title: "Gestión de Analistas",
      description: "Asignar y reasignar analistas de apoyo",
      icon: UserCog,
      color: "from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
    },
    {
      id: "auditoria",
      title: "Auditoría",
      description: "Revisa registros de auditoría",
      icon: BarChart3,
      color: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
    },
  ]

  return (
    <div>
      {/* Barra superior */}
      <Breadcrumb
        items={[
          { label: "Inicio", onClick: onBack },
          { label: "Administración", isActive: true },
        ]}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Tarjeta de información */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-md p-8 border border-border mb-8 animate-fadeIn">
          <h2 className="text-3xl font-bold text-foreground mb-2">Administración</h2>
          <p className="text-muted-foreground">
            Selecciona un submódulo para acceder a las funcionalidades de administración del sistema.
          </p>
        </div>

        {/* Grid de submódulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {submodulos.map((submodulo) => {
            const Icon = submodulo.icon
            return (
              <button
                key={submodulo.id}
                onClick={() => onModuleSelect(submodulo.id)}
                className={`group bg-gradient-to-br ${submodulo.color} rounded-lg border border-border p-6 hover:shadow-lg transition transform hover:scale-105 cursor-pointer text-left`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon size={28} className="text-primary group-hover:scale-110 transition" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{submodulo.title}</h3>
                <p className="text-sm text-muted-foreground">{submodulo.description}</p>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
