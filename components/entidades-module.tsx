"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, X, Check, Search, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Entidad {
  id: string
  nombre: string
  nit: string
  correo: string
  ciudad: string
  telefono: string
  estado: "activa" | "inactiva"
}

interface EntidadesModuleProps {
  onClose: () => void
}

export default function EntidadesModule({ onClose }: EntidadesModuleProps) {
  const [entidades, setEntidades] = useState<Entidad[]>([
    {
      id: "1",
      nombre: "Empresa Principal SA",
      nit: "1234567890",
      correo: "contacto@empresa.com",
      ciudad: "Bogotá",
      telefono: "+57 1 2345678",
      estado: "activa",
    },
    {
      id: "2",
      nombre: "Sucursal Regional",
      nit: "0987654321",
      correo: "sucursal@empresa.com",
      ciudad: "Medellín",
      telefono: "+57 4 9876543",
      estado: "activa",
    },
    {
      id: "3",
      nombre: "Oficina Comercial",
      nit: "5555555555",
      correo: "comercial@empresa.com",
      ciudad: "Cali",
      telefono: "+57 2 5555555",
      estado: "inactiva",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    correo: "",
    ciudad: "",
    telefono: "",
    estado: "activa" as const,
  })

  const filteredEntidades = entidades.filter(
    (e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nit.includes(searchTerm) ||
      e.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    setEditingId(null)
    setFormData({ nombre: "", nit: "", correo: "", ciudad: "", telefono: "", estado: "activa" })
    setShowForm(true)
  }

  const handleEdit = (entidad: Entidad) => {
    setEditingId(entidad.id)
    setFormData(entidad)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.nombre.trim() || !formData.nit.trim() || !formData.ciudad.trim()) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (editingId) {
      setEntidades(entidades.map((e) => (e.id === editingId ? { ...e, ...formData } : e)))
    } else {
      setEntidades([...entidades, { id: Date.now().toString(), ...formData }])
    }

    setShowForm(false)
    setFormData({ nombre: "", nit: "", correo: "", ciudad: "", telefono: "", estado: "activa" })
  }

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta entidad?")) {
      setEntidades(entidades.filter((e) => e.id !== id))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-2xl border border-border w-full max-w-5xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Entidades</h2>
            <p className="text-sm text-primary-foreground/80">Administra las entidades del sistema</p>
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
                    placeholder="Buscar por nombre, NIT o ciudad..."
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
                  Nueva Entidad
                </Button>
              </div>

              {/* Tabla de entidades */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">NIT</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Correo</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Ciudad</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Teléfono</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Estado</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntidades.map((entidad) => (
                      <tr key={entidad.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Building2 size={18} className="text-primary" />
                            <span className="font-semibold text-foreground">{entidad.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{entidad.nit}</td>
                        <td className="py-3 px-4 text-foreground text-sm">{entidad.correo}</td>
                        <td className="py-3 px-4 text-foreground">{entidad.ciudad}</td>
                        <td className="py-3 px-4 text-foreground text-sm">{entidad.telefono}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              entidad.estado === "activa"
                                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200"
                            }`}
                          >
                            {entidad.estado === "activa" ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(entidad)}
                            className="p-2 hover:bg-accent/20 rounded-md transition text-accent"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(entidad.id)}
                            className="p-2 hover:bg-destructive/20 rounded-md transition text-destructive"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEntidades.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron entidades con los criterios de búsqueda.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Formulario */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground mb-6">
                  {editingId ? "Editar Entidad" : "Nueva Entidad"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Nombre de la Entidad *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">NIT *</label>
                    <input
                      type="text"
                      value={formData.nit}
                      onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      placeholder="correo@entidad.com"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Ciudad *</label>
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      placeholder="Bogotá"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+57 1 2345678"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as "activa" | "inactiva" })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                    </select>
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
