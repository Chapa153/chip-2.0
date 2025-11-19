"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, X, Check, Search, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Rol {
  id: string
  nombre: string
  descripcion: string
  permisos: string[]
  usuariosAsignados: number
}

interface RolesModuleProps {
  onClose: () => void
}

const permisosDisponibles = [
  "Ver Usuarios",
  "Crear Usuarios",
  "Editar Usuarios",
  "Eliminar Usuarios",
  "Ver Roles",
  "Crear Roles",
  "Editar Roles",
  "Eliminar Roles",
  "Ver Entidades",
  "Crear Entidades",
  "Editar Entidades",
  "Eliminar Entidades",
  "Ver Auditoría",
  "Exportar Reportes",
]

export default function RolesModule({ onClose }: RolesModuleProps) {
  const [roles, setRoles] = useState<Rol[]>([
    {
      id: "1",
      nombre: "Administrador",
      descripcion: "Acceso completo al sistema",
      permisos: permisosDisponibles,
      usuariosAsignados: 1,
    },
    {
      id: "2",
      nombre: "Usuario",
      descripcion: "Acceso limitado al sistema",
      permisos: ["Ver Usuarios", "Ver Roles", "Ver Entidades"],
      usuariosAsignados: 2,
    },
    {
      id: "3",
      nombre: "Auditor",
      descripcion: "Solo lectura para auditoría",
      permisos: ["Ver Auditoría", "Exportar Reportes", "Ver Usuarios"],
      usuariosAsignados: 0,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permisos: [] as string[],
  })

  const filteredRoles = roles.filter(
    (r) =>
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    setEditingId(null)
    setFormData({ nombre: "", descripcion: "", permisos: [] })
    setShowForm(true)
  }

  const handleEdit = (rol: Rol) => {
    setEditingId(rol.id)
    setFormData({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: [...rol.permisos],
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa el nombre del rol")
      return
    }

    if (formData.permisos.length === 0) {
      alert("Por favor selecciona al menos un permiso")
      return
    }

    if (editingId) {
      setRoles(roles.map((r) => (r.id === editingId ? { ...r, ...formData } : r)))
    } else {
      setRoles([...roles, { id: Date.now().toString(), ...formData, usuariosAsignados: 0 }])
    }

    setShowForm(false)
    setFormData({ nombre: "", descripcion: "", permisos: [] })
  }

  const handleDelete = (id: string) => {
    const rol = roles.find((r) => r.id === id)
    if (rol && rol.usuariosAsignados > 0) {
      alert("No se puede eliminar este rol porque tiene usuarios asignados")
      return
    }
    if (window.confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      setRoles(roles.filter((r) => r.id !== id))
    }
  }

  const togglePermiso = (permiso: string) => {
    setFormData((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter((p) => p !== permiso)
        : [...prev.permisos, permiso],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-2xl border border-border w-full max-w-4xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Roles</h2>
            <p className="text-sm text-primary-foreground/80">Administra los roles y sus permisos</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary/80 rounded-md transition">
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!showForm ? (
            <>
              {/* Búsqueda y botón agregar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nuevo Rol
                </Button>
              </div>

              {/* Grid de tarjetas de roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRoles.map((rol) => (
                  <div
                    key={rol.id}
                    className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Lock size={24} className="text-primary" />
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{rol.nombre}</h3>
                          <p className="text-xs text-muted-foreground">
                            {rol.usuariosAsignados} usuario{rol.usuariosAsignados !== 1 ? "s" : ""} asignado
                            {rol.usuariosAsignados !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(rol)}
                          className="p-2 hover:bg-accent/20 rounded-md transition text-accent"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(rol.id)}
                          className="p-2 hover:bg-destructive/20 rounded-md transition text-destructive"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{rol.descripcion}</p>

                    <div className="border-t border-border pt-4">
                      <p className="text-xs font-semibold text-foreground mb-3">Permisos ({rol.permisos.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {rol.permisos.slice(0, 3).map((permiso, idx) => (
                          <span key={idx} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                            {permiso}
                          </span>
                        ))}
                        {rol.permisos.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                            +{rol.permisos.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRoles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron roles con los criterios de búsqueda.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Formulario */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground">{editingId ? "Editar Rol" : "Nuevo Rol"}</h3>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nombre del Rol</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Supervisor"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe el propósito de este rol..."
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                {/* Selección de permisos */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-4">Permisos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permisosDisponibles.map((permiso) => (
                      <button
                        key={permiso}
                        onClick={() => togglePermiso(permiso)}
                        className={`p-3 rounded-md border-2 transition text-left font-medium ${
                          formData.permisos.includes(permiso)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {permiso}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-end mt-8">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-border rounded-md hover:bg-muted transition text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition flex items-center gap-2"
                  >
                    <Check size={18} />
                    Guardar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
