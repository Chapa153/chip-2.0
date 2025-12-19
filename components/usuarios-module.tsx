"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Usuario {
  id: string
  usuario: string
  nombre: string
  correo: string
  rol: string
  estado: "activo" | "inactivo"
}

interface UsuariosModuleProps {
  onClose: () => void
}

export default function UsuariosModule({ onClose }: UsuariosModuleProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: "1",
      usuario: "JLMUNOZ",
      nombre: "Juan Luis Muñoz",
      correo: "jlmunoz@empresa.com",
      rol: "Administrador",
      estado: "activo",
    },
    {
      id: "2",
      usuario: "MPEREZ",
      nombre: "María Pérez",
      correo: "mperez@empresa.com",
      rol: "Usuario",
      estado: "activo",
    },
    {
      id: "3",
      usuario: "AGARCIA",
      nombre: "Antonio García",
      correo: "agarcia@empresa.com",
      rol: "Usuario",
      estado: "inactivo",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    correo: "",
    rol: "Usuario",
    estado: "activo" as const,
  })

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    setEditingId(null)
    setFormData({ usuario: "", nombre: "", correo: "", rol: "Usuario", estado: "activo" })
    setShowForm(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id)
    setFormData({
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.usuario || !formData.nombre || !formData.correo) {
      alert("Por favor completa todos los campos")
      return
    }

    if (editingId) {
      setUsuarios(usuarios.map((u) => (u.id === editingId ? { ...u, ...formData } : u)))
    } else {
      setUsuarios([...usuarios, { id: Date.now().toString(), ...formData }])
    }

    setShowForm(false)
    setFormData({ usuario: "", nombre: "", correo: "", rol: "Usuario", estado: "activo" })
  }

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id))
    }
  }

  return (
    <div className="w-full">
      <div className="bg-card rounded-lg shadow-lg border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            <p className="text-sm text-primary-foreground/80">Administra los usuarios del sistema</p>
          </div>
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
                    placeholder="Buscar por usuario, nombre o correo..."
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
                  Nuevo Usuario
                </Button>
              </div>

              {/* Tabla de usuarios */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Correo</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Estado</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="py-3 px-4 text-foreground font-semibold">{usuario.usuario}</td>
                        <td className="py-3 px-4 text-foreground">{usuario.nombre}</td>
                        <td className="py-3 px-4 text-foreground text-sm">{usuario.correo}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              usuario.estado === "activo"
                                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200"
                            }`}
                          >
                            {usuario.estado === "activo" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 hover:bg-accent/20 rounded-md transition text-accent"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.id)}
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

              {filteredUsuarios.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios con los criterios de búsqueda.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Formulario */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground mb-6">
                  {editingId ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Usuario</label>
                    <input
                      type="text"
                      value={formData.usuario}
                      onChange={(e) => setFormData({ ...formData, usuario: e.target.value.toUpperCase() })}
                      placeholder="USUARIO"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      placeholder="correo@empresa.com"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Rol</label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Administrador</option>
                      <option>Usuario</option>
                      <option>Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as "activo" | "inactivo" })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
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
