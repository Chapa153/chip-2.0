"use client"

import { useState } from "react"
import { ArrowLeft, Check, ChevronDown, ChevronRight, Edit, Plus, Search, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Rol {
  id: string
  codigo: string
  nombre: string
  estado: "Activo" | "Inactivo"
  funcionalidades: string[]
  fechaModificacion: Date
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
      codigo: "ADM_CATEGORIZACION",
      nombre: "Administrador de categorías",
      estado: "Activo",
      funcionalidades: ["Funcionalidad 1", "Funcionalidad 2"],
      fechaModificacion: new Date("2024-11-15"),
    },
    {
      id: "2",
      codigo: "SUPER_ADMIN",
      nombre: "Super Administrador",
      estado: "Activo",
      funcionalidades: ["Funcionalidad 1", "Funcionalidad 2", "Funcionalidad 3"],
      fechaModificacion: new Date("2024-10-20"),
    },
    {
      id: "3",
      codigo: "CONSULTOR",
      nombre: "Consultor",
      estado: "Inactivo",
      funcionalidades: ["Funcionalidad 1"],
      fechaModificacion: new Date("2024-09-05"),
    },
  ])

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchNombre, setSearchNombre] = useState("")
  const [searchEstado, setSearchEstado] = useState("")
  const [searchFuncionalidad, setSearchFuncionalidad] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    estado: "Activo",
  })

  const [activeTab, setActiveTab] = useState<"datos" | "permisos">("datos")
  const [datosRolGuardados, setDatosRolGuardados] = useState(false)
  const [selectedPermisos, setSelectedPermisos] = useState<Set<string>>(new Set())
  const [expandedPermisos, setExpandedPermisos] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedPermisos)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedPermisos(newExpanded)
  }

  const handleTogglePermiso = (node: PermisoNode) => {
    const newSelected = new Set(selectedPermisos)
    const isSelected = newSelected.has(node.id)

    const getAllDescendantIds = (n: PermisoNode): string[] => {
      const ids: string[] = [n.id]
      if (n.children) {
        n.children.forEach((child) => {
          ids.push(...getAllDescendantIds(child))
        })
      }
      return ids
    }

    const allIds = getAllDescendantIds(node)

    if (isSelected) {
      allIds.forEach((id) => newSelected.delete(id))
    } else {
      allIds.forEach((id) => newSelected.add(id))
    }

    setSelectedPermisos(newSelected)
  }

  const isPartiallySelected = (node: PermisoNode): boolean => {
    if (!node.children || node.children.length === 0) return false
    const childIds = node.children.map((c) => c.id)
    const selectedCount = childIds.filter((id) => selectedPermisos.has(id)).length
    return selectedCount > 0 && selectedCount < childIds.length
  }

  const renderPermisoNode = (node: PermisoNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedPermisos.has(node.id)
    const isSelected = selectedPermisos.has(node.id)
    const isPartial = isPartiallySelected(node)

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpanded(node.id)} className="p-1 hover:bg-muted rounded transition-colors">
              {isExpanded ? (
                <ChevronDown size={16} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={16} className="text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}

          <input
            type="checkbox"
            checked={isSelected}
            ref={(el) => {
              if (el) el.indeterminate = isPartial
            }}
            onChange={() => handleTogglePermiso(node)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />

          <span className="text-sm text-foreground">{node.nombre}</span>
        </div>

        {hasChildren && isExpanded && <div>{node.children!.map((child) => renderPermisoNode(child, level + 1))}</div>}
      </div>
    )
  }

  const handleSearch = () => {
    setShowResults(true)
  }

  const handleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch)
  }

  const handleEdit = (rol: Rol) => {
    setEditingId(rol.id)
    setFormData({
      codigo: rol.codigo,
      nombre: rol.nombre,
      descripcion: "",
      estado: rol.estado,
    })
    setShowForm(true)
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      estado: "Activo",
    })
    setShowForm(true)
  }

  const handleGuardarDatosRol = () => {
    if (!formData.codigo || !formData.nombre) {
      alert("Por favor complete los campos obligatorios")
      return
    }
    setDatosRolGuardados(true)
    alert("Datos del rol guardados correctamente")
  }

  const handleGuardarPermisosRol = () => {
    if (selectedPermisos.size === 0) {
      alert("Debe seleccionar al menos un permiso")
      return
    }
    alert(`Permisos guardados: ${selectedPermisos.size} permisos seleccionados`)
    setShowForm(false)
    setEditingId(null)
    setFormData({ codigo: "", nombre: "", descripcion: "", estado: "Activo" })
    setActiveTab("datos")
    setDatosRolGuardados(false)
    setSelectedPermisos(new Set())
  }

  const filteredRoles = roles.filter((rol) => {
    const matchesNombre = searchNombre === "" || rol.nombre.toLowerCase().includes(searchNombre.toLowerCase())
    const matchesEstado = searchEstado === "" || rol.estado === searchEstado
    const matchesFuncionalidad = searchFuncionalidad === "" || rol.funcionalidades.includes(searchFuncionalidad)
    return matchesNombre && matchesEstado && matchesFuncionalidad
  })

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({ codigo: "", nombre: "", descripcion: "", estado: "Activo" })
                setActiveTab("datos")
                setDatosRolGuardados(false)
              }}
              className="border-border"
            >
              <ArrowLeft size={18} className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{editingId ? "Modificar Rol" : "Crear Nuevo Rol"}</h1>
              <p className="text-muted-foreground text-sm">
                {editingId
                  ? "Modifique los datos del rol y sus permisos"
                  : "Complete el formulario para crear un nuevo rol"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("datos")}
              className={`py-3 px-4 font-medium transition-all border-b-2 ${
                activeTab === "datos"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              1. Datos del Rol
            </button>
            <button
              onClick={() => {
                if (datosRolGuardados || editingId) {
                  setActiveTab("permisos")
                } else {
                  alert("Debe guardar los datos del rol primero")
                }
              }}
              className={`py-3 px-4 font-medium transition-all border-b-2 ${
                activeTab === "permisos"
                  ? "border-primary text-primary"
                  : `border-transparent ${
                      datosRolGuardados || editingId
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-muted-foreground opacity-50"
                    }`
              }`}
            >
              2. Selección de Permisos
              {datosRolGuardados && <Check size={16} className="inline ml-2" />}
              {!datosRolGuardados && !editingId && " 🔒"}
            </button>
          </div>
        </div>

        {activeTab === "datos" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Código Rol *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  disabled={!!editingId}
                  placeholder="Ej: ROL001"
                  className={`w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    editingId ? "bg-muted text-muted-foreground" : ""
                  }`}
                />
                {editingId && <p className="text-xs text-muted-foreground mt-1">El código no es modificable</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nombre Rol *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Administrador del Sistema"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada del rol y sus responsabilidades"
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Estado *</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              {editingId && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Fecha Última Modificación</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    disabled
                    className="w-full px-4 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({ codigo: "", nombre: "", descripcion: "", estado: "Activo" })
                  setActiveTab("datos")
                  setDatosRolGuardados(false)
                }}
                className="border-border hover:bg-muted"
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
            <div className="bg-muted rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Código Rol</p>
                  <p className="text-lg font-semibold text-foreground">{formData.codigo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nombre Rol</p>
                  <p className="text-lg font-semibold text-foreground">{formData.nombre}</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-4">Árbol de Permisos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione los permisos que tendrá este rol. Al seleccionar un permiso padre, se seleccionarán
              automáticamente todos sus permisos hijos.
            </p>

            <div className="border border-border rounded-lg p-4 bg-background max-h-96 overflow-y-auto mb-6">
              {permisosJerarquicos.map((nodo) => renderPermisoNode(nodo, 0))}
            </div>

            {selectedPermisos.size > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm font-medium">{selectedPermisos.size} permiso(s) seleccionado(s)</p>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setActiveTab("datos")} className="border-border hover:bg-muted">
                Volver a Datos
              </Button>
              <Button onClick={handleGuardarPermisosRol} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Permisos Rol
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Search size={20} />
            {showAdvancedSearch ? "Búsqueda Avanzada" : "Búsqueda por Nombre de Rol"}
          </h3>
          <Button variant="link" onClick={handleAdvancedSearch} className="text-primary">
            {showAdvancedSearch ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Búsqueda simple
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Búsqueda avanzada
              </>
            )}
          </Button>
        </div>

        {!showAdvancedSearch ? (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre del rol..."
              value={searchNombre}
              onChange={(e) => setSearchNombre(e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
            <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
              Buscar
            </Button>
            <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-1" />
              Nuevo Rol
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                <select
                  value={searchEstado}
                  onChange={(e) => setSearchEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre de Rol</label>
                <input
                  type="text"
                  placeholder="Nombre del rol..."
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Funcionalidad</label>
                <select
                  value={searchFuncionalidad}
                  onChange={(e) => setSearchFuncionalidad(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Seleccione una funcionalidad</option>
                  {funcionalidadesDisponibles.map((func) => (
                    <option key={func} value={func}>
                      {func}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                Buscar
              </Button>
              <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus size={18} className="mr-1" />
                Nuevo Rol
              </Button>
            </div>
          </div>
        )}
      </div>

      {showResults && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Acción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Código Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Nombre del Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Fecha Última Modificación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRoles.map((rol) => (
                  <tr key={rol.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(rol)}
                        className="p-2 hover:bg-accent/20 rounded-md transition text-accent"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rol.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rol.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{rol.codigo}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{rol.nombre}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {rol.fechaModificacion.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron roles con los criterios de búsqueda.
            </div>
          )}
        </div>
      )}

      {!showResults && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Seleccione los criterios de búsqueda</h3>
          <p className="text-muted-foreground">
            Para visualizar los roles disponibles, debe realizar una búsqueda utilizando los filtros anteriores
          </p>
        </div>
      )}
    </div>
  )
}
