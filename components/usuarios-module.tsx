"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Check, Search, Filter, ChevronUp, ChevronDown, User, FileText } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  const [showEntidadModal, setShowEntidadModal] = useState(false)
  const [selectedEntidad, setSelectedEntidad] = useState<Entidad | null>(null)
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    codigoUsuario: "",
    documentoUsuario: "",
    nombreUsuario: "",
    tipoUsuario: "",
    rol: "",
    estado: "activo",
  })

  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    correo: "",
    rol: "Usuario",
    estado: "activo" as const,
  })

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch =
      u.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchCodigo =
      advancedFilters.codigoUsuario === "" ||
      u.usuario.toLowerCase().includes(advancedFilters.codigoUsuario.toLowerCase())
    
    const matchDocumento =
      advancedFilters.documentoUsuario === "" ||
      (u.documento && u.documento.toLowerCase().includes(advancedFilters.documentoUsuario.toLowerCase()))
    
    const matchNombre =
      advancedFilters.nombreUsuario === "" ||
      u.nombre.toLowerCase().includes(advancedFilters.nombreUsuario.toLowerCase())
    
    const matchTipo =
      advancedFilters.tipoUsuario === "" ||
      advancedFilters.tipoUsuario === "Todos" ||
      u.tipoUsuario === advancedFilters.tipoUsuario
    
    const matchRol =
      advancedFilters.rol === "" ||
      advancedFilters.rol === "Todos" ||
      u.rol === advancedFilters.rol
    
    const matchEstado =
      advancedFilters.estado === "" ||
      u.estado === advancedFilters.estado
    
    const matchEntidad =
      !selectedEntidad ||
      u.entidad === selectedEntidad.razonSocial

    return matchSearch && matchCodigo && matchDocumento && matchNombre && matchTipo && matchRol && matchEstado && matchEntidad
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
    setAdvancedFilters({
      codigoUsuario: "",
      documentoUsuario: "",
      nombreUsuario: "",
      tipoUsuario: "",
      rol: "",
      estado: "activo",
    })
    setSelectedEntidad(null)
    setSearchTerm("")
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
              {/* Collapsible Filters Panel */}
              <div className="border border-border rounded-lg mb-6 bg-card">
                {/* Filter Header - Collapsible */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition rounded-t-lg"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Filtros
                  </div>
                </button>

                {/* Filter Content */}
                {showFilters && (
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    {/* Row 1: Codigo Usuario, Documento Usuario, Nombre Usuario */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Codigo Usuario
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={advancedFilters.codigoUsuario}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, codigoUsuario: e.target.value })}
                            placeholder="Buscar por codigo..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Documento de Usuario
                        </label>
                        <div className="relative">
                          <FileText size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={advancedFilters.documentoUsuario}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, documentoUsuario: e.target.value })}
                            placeholder="Buscar por documento..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Nombre de Usuario
                        </label>
                        <input
                          type="text"
                          value={advancedFilters.nombreUsuario}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, nombreUsuario: e.target.value })}
                          placeholder="Buscar por nombre..."
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Row 2: Entidad, Tipo de Usuario, Rol */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Entidad
                        </label>
                        <input
                          type="text"
                          readOnly
                          onClick={() => setShowEntidadModal(true)}
                          value={selectedEntidad ? selectedEntidad.razonSocial : "Todas"}
                          placeholder="Todas"
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground cursor-pointer hover:bg-muted/30 transition focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Tipo de Usuario
                        </label>
                        <select
                          value={advancedFilters.tipoUsuario}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, tipoUsuario: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Todos</option>
                          <option value="Interno">Interno</option>
                          <option value="Externo">Externo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Rol
                        </label>
                        <select
                          value={advancedFilters.rol}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, rol: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Todos</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Usuario">Usuario</option>
                          <option value="Auditor">Auditor</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Estado + Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Estado
                        </label>
                        <select
                          value={advancedFilters.estado}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, estado: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                          <option value="">Todos</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex items-end justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={handleClearFilters}
                          className="text-sm border-border hover:bg-muted"
                        >
                          <Filter size={16} className="mr-1" />
                          Limpiar
                        </Button>
                        <Button
                          onClick={() => {}}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                        >
                          <Search size={16} className="mr-1" />
                          Buscar
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
