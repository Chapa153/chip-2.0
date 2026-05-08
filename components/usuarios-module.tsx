"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Check, Filter, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import DirectorioEntidadesModal from "./directorio-entidades-modal"

interface Usuario {
  id: string
  usuario: string
  nombre: string
  correo: string
  rol: string
  estado: "activo" | "inactivo"
  entidad?: string
  documento?: string
  tipoUsuario?: string
}

interface Entidad {
  id: string
  codigo: string
  nit: string
  razonSocial: string
  departamento: string
  municipio: string
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
  const [showFilters, setShowFilters] = useState(true)
  const [showEntidadModal, setShowEntidadModal] = useState(false)
  const [selectedEntidad, setSelectedEntidad] = useState<Entidad | null>(null)
  
  // Filters matching the design: Entidad, Categoría, Año, Periodo
  const [filters, setFilters] = useState({
    categoria: "",
    año: "",
    periodo: "",
  })

  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    correo: "",
    rol: "Usuario",
    estado: "activo" as const,
  })

  const filteredUsuarios = usuarios.filter((u) => {
    const matchEntidad =
      !selectedEntidad ||
      u.entidad === selectedEntidad.razonSocial

    return matchEntidad
  })

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

  const handleClearFilters = () => {
    setFilters({
      categoria: "",
      año: "",
      periodo: "",
    })
    setSelectedEntidad(null)
  }

  const handleEntidadSelect = (entidad: Entidad | null) => {
    setSelectedEntidad(entidad)
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
              {/* Collapsible Filters Panel - Matching Design */}
              <div className="border border-border rounded-lg mb-6 bg-card shadow-sm">
                {/* Filter Header - Collapsible */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter size={16} />
                    Filtros de Busqueda
                  </div>
                  {showFilters ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </button>

                {/* Filter Content - Single Row Layout */}
                {showFilters && (
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-end gap-4">
                      {/* Entidad */}
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-primary mb-1">
                          Entidad
                        </label>
                        <input
                          type="text"
                          readOnly
                          onClick={() => setShowEntidadModal(true)}
                          value={selectedEntidad ? selectedEntidad.razonSocial : ""}
                          placeholder="Seleccione entidad"
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground cursor-pointer hover:bg-muted/30 transition focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Categoria */}
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Categoria <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={filters.categoria}
                          onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Seleccione categoria</option>
                          <option value="categoria1">Categoria 1</option>
                          <option value="categoria2">Categoria 2</option>
                          <option value="categoria3">Categoria 3</option>
                        </select>
                      </div>

                      {/* Ano */}
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Ano <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={filters.año}
                          onChange={(e) => setFilters({ ...filters, año: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Seleccione ano</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="2021">2021</option>
                        </select>
                      </div>

                      {/* Periodo */}
                      <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Periodo <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={filters.periodo}
                          onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Seleccione periodo</option>
                          <option value="trimestre1">Trimestre 1</option>
                          <option value="trimestre2">Trimestre 2</option>
                          <option value="trimestre3">Trimestre 3</option>
                          <option value="trimestre4">Trimestre 4</option>
                        </select>
                      </div>

                      {/* Apply Filters Button */}
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => {}}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                        >
                          Aplicar Filtros
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add User Button */}
              <div className="flex justify-end mb-4">
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

      {/* Entity Selection Modal */}
      <DirectorioEntidadesModal
        open={showEntidadModal}
        onOpenChange={setShowEntidadModal}
        onSelect={handleEntidadSelect}
        selectedEntidad={selectedEntidad}
      />
    </div>
  )
}
