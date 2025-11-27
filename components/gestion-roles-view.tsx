"use client"

import { useState } from "react"
import { ArrowLeft, Check, ChevronDown, ChevronRight, Edit, Plus, Search, ChevronUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import React from "react"

interface Rol {
  id: string
  codigo: string
  nombre: string
  estado: "Activo" | "Inactivo"
  funcionalidades: string[]
  fechaModificacion: Date
  intentosFallidos: number
  periodoVigencia: number
}

interface GestionRolesViewProps {
  onBack: () => void
}

const funcionalidadesDisponibles = [
  "Funcionalidad 1",
  "Funcionalidad 2",
  "Funcionalidad 3",
  "Funcionalidad 4",
  "Funcionalidad 5",
]

const modulosPermisos = [
  {
    modulo: "Administración",
    permisos: [
      "Ver entidades",
      "Crear entidades",
      "Editar entidades",
      "Eliminar entidades",
      "Ver usuarios",
      "Crear usuarios",
      "Editar usuarios",
      "Eliminar usuarios",
      "Ver roles",
      "Crear roles",
      "Editar roles",
    ],
  },
  {
    modulo: "Categorías",
    permisos: ["Ver categorías", "Crear categorías", "Editar categorías", "Eliminar categorías", "Asignar categorías"],
  },
  {
    modulo: "Formularios",
    permisos: [
      "Ver formularios",
      "Crear formularios",
      "Editar formularios",
      "Validar formularios",
      "Exportar formularios",
      "Histórico de envíos",
    ],
  },
]

interface PermisoNode {
  id: string
  nombre: string
  children?: PermisoNode[]
}

const permisosJerarquicos: PermisoNode[] = [
  {
    id: "operaciones",
    nombre: "Ingresar opción operaciones generales",
    children: [
      { id: "operaciones-nuevo", nombre: "Ingresar opción nuevo" },
      { id: "operaciones-modificar", nombre: "Ingresar opción modificar" },
      { id: "operaciones-eliminar", nombre: "Ingresar opción eliminar" },
      { id: "operaciones-guardar", nombre: "Ingresar opción guardar" },
    ],
  },
  {
    id: "seguridad",
    nombre: "Ingresar opción Seguridad",
    children: [],
  },
  {
    id: "formularios",
    nombre: "Ingresar opción Formularios",
    children: [],
  },
  {
    id: "entidades",
    nombre: "Ingresar opción Entidades",
    children: [{ id: "entidades-categorias", nombre: "Ingresar opción Categorías" }],
  },
  {
    id: "consolidacion",
    nombre: "Ingresar opción Consolidación",
    children: [],
  },
  {
    id: "mensajes",
    nombre: "Ingresar opción Mensajes",
    children: [],
  },
]

export default function GestionRolesView({ onBack }: GestionRolesViewProps) {
  const [roles, setRoles] = useState<Rol[]>([
    {
      id: "1",
      codigo: "ROL001",
      nombre: "Administrador",
      estado: "Activo",
      funcionalidades: ["Funcionalidad 1", "Funcionalidad 2"],
      fechaModificacion: new Date("2024-01-15"),
      intentosFallidos: 3,
      periodoVigencia: 90,
    },
    {
      id: "2",
      codigo: "ROL002",
      nombre: "Usuario Estándar",
      estado: "Activo",
      funcionalidades: ["Funcionalidad 1"],
      fechaModificacion: new Date("2024-02-20"),
      intentosFallidos: 5,
      periodoVigencia: 60,
    },
    {
      id: "3",
      codigo: "ROL003",
      nombre: "Auditor",
      estado: "Inactivo",
      funcionalidades: ["Funcionalidad 3", "Funcionalidad 4"],
      fechaModificacion: new Date("2024-03-10"),
      intentosFallidos: 3,
      periodoVigencia: 30,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRol, setExpandedRol] = useState<string | null>(null)
  const itemsPerPage = 10

  const [showResults, setShowResults] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    codigo: "",
    nombre: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  })

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    intentosFallidos: "",
    periodoVigencia: "",
  })

  const [activeTab, setActiveTab] = useState<"datos" | "permisos">("datos")
  const [datosRolGuardados, setDatosRolGuardados] = useState(false)
  const [selectedPermisos, setSelectedPermisos] = useState<Set<string>>(new Set())
  const [expandedPermisos, setExpandedPermisos] = useState<Set<string>>(new Set())

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")

  const [fechaUltimaModificacion, setFechaUltimaModificacion] = useState<Date | null>(null)

  const filteredRoles = roles.filter((rol) => {
    if (!showResults) return false

    const matchBasic =
      searchTerm === "" ||
      rol.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    const matchCodigo =
      advancedFilters.codigo === "" || rol.codigo.toLowerCase().includes(advancedFilters.codigo.toLowerCase())

    const matchNombre =
      advancedFilters.nombre === "" || rol.nombre.toLowerCase().includes(advancedFilters.nombre.toLowerCase())

    const matchEstado = advancedFilters.estado === "" || rol.estado === advancedFilters.estado

    const matchFechaDesde =
      advancedFilters.fechaDesde === "" || rol.fechaModificacion >= new Date(advancedFilters.fechaDesde)

    const matchFechaHasta =
      advancedFilters.fechaHasta === "" || rol.fechaModificacion <= new Date(advancedFilters.fechaHasta)

    return matchBasic && matchCodigo && matchNombre && matchEstado && matchFechaDesde && matchFechaHasta
  })

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage)
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCrearRol = () => {
    setEditingId(null)
    setFormData({ codigo: "", nombre: "", descripcion: "", intentosFallidos: "", periodoVigencia: "" })
    setSelectedPermisos(new Set())
    setExpandedPermisos(new Set())
    setDatosRolGuardados(false)
    setActiveTab("datos")
    setFieldErrors({})
    setFechaUltimaModificacion(null)
    setShowForm(true)
  }

  const handleEditarRol = (rol: Rol) => {
    setEditingId(rol.id)
    setFormData({
      codigo: rol.codigo,
      nombre: rol.nombre,
      descripcion: "",
      intentosFallidos: rol.intentosFallidos.toString(),
      periodoVigencia: rol.periodoVigencia.toString(),
    })
    setSelectedPermisos(new Set())
    setExpandedPermisos(new Set())
    setDatosRolGuardados(true)
    setActiveTab("datos")
    setFieldErrors({})
    setFechaUltimaModificacion(rol.fechaModificacion)
    setShowForm(true)
  }

  const handleGuardarDatosRol = () => {
    const errors: Record<string, boolean> = {}

    if (!formData.codigo.trim()) {
      errors.codigo = true
    }
    if (!formData.nombre.trim()) {
      errors.nombre = true
    }
    if (
      !formData.intentosFallidos.trim() ||
      isNaN(Number(formData.intentosFallidos)) ||
      Number(formData.intentosFallidos) < 1
    ) {
      errors.intentosFallidos = true
    }
    if (
      !formData.periodoVigencia.trim() ||
      isNaN(Number(formData.periodoVigencia)) ||
      Number(formData.periodoVigencia) < 1
    ) {
      errors.periodoVigencia = true
    }

    if (Object.keys(errors).length > 0) {
      setValidationMessage("Por favor complete los campos obligatorios")
      setShowValidationModal(true)
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setDatosRolGuardados(true)
    alert("Datos del rol guardados correctamente")
  }

  const handleGuardarPermisosRol = () => {
    if (selectedPermisos.size === 0) {
      setValidationMessage("Debe seleccionar al menos un permiso")
      setShowValidationModal(true)
      return
    }
    alert(`Permisos guardados: ${selectedPermisos.size} permisos seleccionados`)
    setShowForm(false)
    setEditingId(null)
    setFormData({ codigo: "", nombre: "", descripcion: "", intentosFallidos: "", periodoVigencia: "" })
    setSelectedPermisos(new Set())
    setDatosRolGuardados(false)
    setFieldErrors({})
  }

  const handleValidationModalClose = () => {
    setShowValidationModal(false)
  }

  const togglePermiso = (permisoId: string) => {
    const newSelected = new Set(selectedPermisos)
    if (newSelected.has(permisoId)) {
      newSelected.delete(permisoId)
    } else {
      newSelected.add(permisoId)
    }
    setSelectedPermisos(newSelected)
  }

  const toggleExpandPermiso = (permisoId: string) => {
    const newExpanded = new Set(expandedPermisos)
    if (newExpanded.has(permisoId)) {
      newExpanded.delete(permisoId)
    } else {
      newExpanded.add(permisoId)
    }
    setExpandedPermisos(newExpanded)
  }

  const togglePermisoConHijos = (permiso: PermisoNode) => {
    const newSelected = new Set(selectedPermisos)
    const isCurrentlySelected = newSelected.has(permiso.id)

    if (isCurrentlySelected) {
      newSelected.delete(permiso.id)
      permiso.children?.forEach((child) => newSelected.delete(child.id))
    } else {
      newSelected.add(permiso.id)
      permiso.children?.forEach((child) => newSelected.add(child.id))
    }

    setSelectedPermisos(newSelected)
  }

  const renderPermisoNode = (permiso: PermisoNode, level = 0) => {
    const hasChildren = permiso.children && permiso.children.length > 0
    const isExpanded = expandedPermisos.has(permiso.id)
    const isSelected = selectedPermisos.has(permiso.id)
    const someChildrenSelected = hasChildren && permiso.children!.some((child) => selectedPermisos.has(child.id))
    const allChildrenSelected = hasChildren && permiso.children!.every((child) => selectedPermisos.has(child.id))

    return (
      <div key={permiso.id} className="select-none">
        <div
          className={`flex items-center py-2 px-2 hover:bg-muted/50 rounded-md ${level > 0 ? "ml-6" : ""}`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpandPermiso(permiso.id)} className="p-1 hover:bg-muted rounded mr-2">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-7" />
          )}
          <input
            type="checkbox"
            checked={isSelected || (hasChildren && allChildrenSelected)}
            ref={(el) => {
              if (el) {
                el.indeterminate = !isSelected && someChildrenSelected && !allChildrenSelected
              }
            }}
            onChange={() => (hasChildren ? togglePermisoConHijos(permiso) : togglePermiso(permiso.id))}
            className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">{permiso.nombre}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l border-border ml-4">
            {permiso.children!.map((child) => renderPermisoNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleBuscar = () => {
    setCurrentPage(1)
    setShowResults(true)
  }

  const handleLimpiarFiltros = () => {
    setSearchTerm("")
    setAdvancedFilters({
      codigo: "",
      nombre: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
    })
    setShowResults(false)
  }

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowForm(false)
              setEditingId(null)
              setFieldErrors({})
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{editingId ? "Modificar Rol" : "Crear Rol"}</h2>
        </div>

        {/* Pestañas estilo entidades */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("datos")}
              className={`py-3 px-6 font-medium transition-all border-b-2 ${
                activeTab === "datos"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              1. Datos del Rol
              {datosRolGuardados && <Check size={16} className="inline ml-2 text-green-600" />}
            </button>
            <button
              onClick={() => {
                if (datosRolGuardados || editingId) {
                  setActiveTab("permisos")
                } else {
                  setValidationMessage("Debe guardar los datos del rol primero")
                  setShowValidationModal(true)
                }
              }}
              className={`py-3 px-6 font-medium transition-all border-b-2 ${
                activeTab === "permisos"
                  ? "border-primary text-primary"
                  : `border-transparent ${
                      datosRolGuardados || editingId
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-muted-foreground opacity-50 cursor-not-allowed"
                    }`
              }`}
            >
              2. Selección de Permisos
              {!datosRolGuardados && !editingId && " 🔒"}
            </button>
          </div>
        </div>

        {activeTab === "datos" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Código Rol */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Código Rol *</label>
                <input
                  type="text"
                  value={formData.codigo || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, codigo: e.target.value })
                    if (fieldErrors.codigo) {
                      setFieldErrors({ ...fieldErrors, codigo: false })
                    }
                  }}
                  disabled={!!editingId}
                  placeholder="Ingrese código del rol"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    editingId ? "bg-muted cursor-not-allowed" : ""
                  } ${fieldErrors.codigo ? "border-red-500 ring-2 ring-red-200" : "border-input"}`}
                />
                {fieldErrors.codigo && <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>}
              </div>

              {/* Nombre Rol */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nombre Rol *</label>
                <input
                  type="text"
                  value={formData.nombre || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value })
                    if (fieldErrors.nombre) {
                      setFieldErrors({ ...fieldErrors, nombre: false })
                    }
                  }}
                  placeholder="Ingrese nombre del rol"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.nombre ? "border-red-500 ring-2 ring-red-200" : "border-input"
                  }`}
                />
                {fieldErrors.nombre && <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Número de Intentos Fallidos *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.intentosFallidos || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, intentosFallidos: e.target.value })
                    if (fieldErrors.intentosFallidos) {
                      setFieldErrors({ ...fieldErrors, intentosFallidos: false })
                    }
                  }}
                  placeholder="Ej: 3"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.intentosFallidos ? "border-red-500 ring-2 ring-red-200" : "border-input"
                  }`}
                />
                {fieldErrors.intentosFallidos && (
                  <p className="text-xs text-red-500 mt-1">Ingrese un número válido mayor a 0</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Periodo de Vigencia (días) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.periodoVigencia || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, periodoVigencia: e.target.value })
                    if (fieldErrors.periodoVigencia) {
                      setFieldErrors({ ...fieldErrors, periodoVigencia: false })
                    }
                  }}
                  placeholder="Ej: 90"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.periodoVigencia ? "border-red-500 ring-2 ring-red-200" : "border-input"
                  }`}
                />
                {fieldErrors.periodoVigencia && (
                  <p className="text-xs text-red-500 mt-1">Ingrese un número válido mayor a 0</p>
                )}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion || ""}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Ingrese descripción del rol"
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {editingId && fechaUltimaModificacion && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Fecha Última Modificación</label>
                  <input
                    type="text"
                    value={fechaUltimaModificacion.toLocaleDateString("es-CO")}
                    disabled
                    className="w-full px-4 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFieldErrors({})
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarDatosRol} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Datos del Rol
              </Button>
            </div>
          </div>
        )}

        {activeTab === "permisos" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Árbol de Permisos</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Seleccione los permisos que desea asignar al rol. Al seleccionar un elemento padre, se seleccionarán
              automáticamente todos sus hijos.
            </p>

            <div className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto bg-background">
              {permisosJerarquicos.map((permiso) => renderPermisoNode(permiso))}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Permisos seleccionados: <span className="font-semibold text-foreground">{selectedPermisos.size}</span>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFieldErrors({})
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarPermisosRol} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Permisos Rol
              </Button>
            </div>
          </div>
        )}

        <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Validación
              </DialogTitle>
              <DialogDescription>{validationMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleValidationModalClose}>Ok</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={20} />
          Volver
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Roles</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        {/* Header con título y enlace de búsqueda avanzada */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-muted-foreground" />
            <span className="font-medium text-foreground">Búsqueda por Nombre de Rol</span>
          </div>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
          >
            {showAdvancedSearch ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Búsqueda avanzada
          </button>
        </div>

        {/* Input de búsqueda y botones */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nombre del rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
          <Button onClick={handleBuscar} className="bg-primary hover:bg-primary/90">
            Buscar
          </Button>
          <Button
            onClick={handleCrearRol}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Rol
          </Button>
        </div>

        {/* Búsqueda avanzada expandible */}
        {showAdvancedSearch && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Código</label>
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={advancedFilters.codigo}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={advancedFilters.nombre}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
                <select
                  value={advancedFilters.estado}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha Desde</label>
                <input
                  type="date"
                  value={advancedFilters.fechaDesde}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, fechaDesde: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  value={advancedFilters.fechaHasta}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, fechaHasta: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
            </div>
            {/* Botón Limpiar Filtros */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleLimpiarFiltros}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Fin de la sección de búsqueda */}

      {showResults ? (
        <>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Última Modificación</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoles.length > 0 ? (
                  paginatedRoles.map((rol) => (
                    <React.Fragment key={rol.id}>
                      <tr className="border-t border-border hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-foreground">
                          <button
                            onClick={() => setExpandedRol(expandedRol === rol.id ? null : rol.id)}
                            className="flex items-center gap-2"
                          >
                            {expandedRol === rol.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {rol.codigo}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{rol.nombre}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rol.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {rol.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {rol.fechaModificacion.toLocaleDateString("es-CO")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarRol(rol)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit size={16} className="mr-1" />
                            Editar
                          </Button>
                        </td>
                      </tr>
                      {expandedRol === rol.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={5} className="px-8 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-semibold">Intentos Fallidos:</span> {rol.intentosFallidos}
                              </div>
                              <div>
                                <span className="font-semibold">Periodo de Vigencia:</span> {rol.periodoVigencia} días
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron roles con los criterios de búsqueda especificados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(currentPage * itemsPerPage, filteredRoles.length)} de {filteredRoles.length} roles
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Buscar Roles</h3>
          <p className="text-muted-foreground">
            Utilice los filtros de búsqueda y haga clic en "Buscar" para ver los resultados.
          </p>
        </div>
      )}
    </div>
  )
}
