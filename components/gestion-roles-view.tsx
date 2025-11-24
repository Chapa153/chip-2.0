"use client"

import { useState } from "react"
import { Search, Plus, Edit2, ChevronDown, ChevronUp, ChevronRight, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      { id: "op-nuevo", nombre: "Ingresar opción nuevo" },
      { id: "op-modificar", nombre: "Ingresar opción modificar" },
      { id: "op-eliminar", nombre: "Ingresar opción eliminar" },
      { id: "op-guardar", nombre: "Ingresar opción guardar" },
    ],
  },
  {
    id: "seguridad",
    nombre: "Ingresar opción Seguridad",
  },
  {
    id: "formularios",
    nombre: "Ingresar opción Formularios",
  },
  {
    id: "entidades",
    nombre: "Ingresar opción Entidades",
    children: [{ id: "ent-categorias", nombre: "Ingresar opción Categorías" }],
  },
  {
    id: "consolidacion",
    nombre: "Ingresar opción Consolidación",
  },
  {
    id: "mensajes",
    nombre: "Ingresar opción Mensajes",
  },
]

function PermisoTreeNode({
  node,
  level = 0,
  selectedIds,
  onToggle,
}: {
  node: PermisoNode
  level?: number
  selectedIds: Set<string>
  onToggle: (id: string, checked: boolean) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isChecked = selectedIds.has(node.id)

  const handleCheckChange = (checked: boolean) => {
    onToggle(node.id, checked)
    // Si tiene hijos, marcar/desmarcar todos
    if (hasChildren) {
      node.children?.forEach((child) => {
        onToggle(child.id, checked)
      })
    }
  }

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div className="flex items-center gap-2 py-1">
        {hasChildren && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-accent/20 rounded">
            <ChevronRight size={16} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleCheckChange(e.target.checked)}
            className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
          />
          <span className="text-sm text-foreground">{node.nombre}</span>
        </label>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <PermisoTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

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
    codigoRol: "",
    nombreRol: "",
    descripcionRol: "",
    intentosFallidos: "",
    periodoVigencia: "",
    permisos: {} as Record<string, string[]>,
  })

  const [activeTab, setActiveTab] = useState("datos")
  const [datosRolGuardados, setDatosRolGuardados] = useState(false)
  const [selectedPermisos, setSelectedPermisos] = useState<Set<string>>(new Set())

  const handleSearch = () => {
    setShowResults(true)
  }

  const handleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch)
  }

  const handleEdit = (rol: Rol) => {
    setEditingId(rol.id)
    setFormData({
      codigoRol: rol.codigo,
      nombreRol: rol.nombre,
      descripcionRol: "",
      intentosFallidos: "3",
      periodoVigencia: "90",
      permisos: {},
    })
    setShowForm(true)
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setFormData({
      codigoRol: "",
      nombreRol: "",
      descripcionRol: "",
      intentosFallidos: "",
      periodoVigencia: "",
      permisos: {},
    })
    setShowForm(true)
  }

  const handleGuardarDatosRol = () => {
    if (!formData.codigoRol || !formData.nombreRol) {
      alert("Por favor completa los campos obligatorios")
      return
    }
    setDatosRolGuardados(true)
    alert("Datos del rol guardados exitosamente")
  }

  const handleTogglePermiso = (id: string, checked: boolean) => {
    setSelectedPermisos((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleGuardarPermisosRol = () => {
    if (selectedPermisos.size === 0) {
      alert("Por favor selecciona al menos un permiso")
      return
    }
    alert("Permisos del rol guardados exitosamente")
    setShowForm(false)
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
      <div className="bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {editingId ? "Modificar Rol" : "Crear Nuevo Rol"}
            </h2>
            <p className="text-muted-foreground">
              Complete la información del rol y seleccione los permisos correspondientes
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send size={18} className="mr-2" />
            Enviar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datos">Datos del Rol</TabsTrigger>
            <TabsTrigger value="permisos" disabled={!datosRolGuardados && !editingId}>
              Selección de Permisos
              {!datosRolGuardados && !editingId && " 🔒"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datos">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Datos del Rol</h3>

              {editingId && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Fecha de última modificación:</span>{" "}
                    {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Código Rol <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigoRol}
                    onChange={(e) => setFormData({ ...formData, codigoRol: e.target.value.toUpperCase() })}
                    placeholder="Ej: ADM_SYSTEM"
                    disabled={!!editingId}
                    className={`w-full px-3 py-2 border border-input rounded-md text-foreground ${
                      editingId ? "bg-gray-100 cursor-not-allowed" : "bg-background"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre del Rol <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombreRol}
                    onChange={(e) => setFormData({ ...formData, nombreRol: e.target.value })}
                    placeholder="Ej: Administrador del sistema"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Descripción del Rol</label>
                  <textarea
                    value={formData.descripcionRol}
                    onChange={(e) => setFormData({ ...formData, descripcionRol: e.target.value })}
                    placeholder="Describe las responsabilidades y alcance de este rol..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Número de Intentos Fallidos</label>
                  <input
                    type="number"
                    value={formData.intentosFallidos}
                    onChange={(e) => setFormData({ ...formData, intentosFallidos: e.target.value })}
                    placeholder="3"
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Periodo de Vigencia (días)</label>
                  <input
                    type="number"
                    value={formData.periodoVigencia}
                    onChange={(e) => setFormData({ ...formData, periodoVigencia: e.target.value })}
                    placeholder="90"
                    min="1"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardarDatosRol} className="bg-primary hover:bg-primary/90">
                  Guardar Datos del Rol
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permisos">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Selección de Permisos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seleccione los permisos que tendrá este rol. Los permisos marcados se aplicarán en cascada a las
                opciones hijas.
              </p>

              <div className="border border-border rounded-lg p-4 bg-background max-h-96 overflow-y-auto">
                {permisosJerarquicos.map((nodo) => (
                  <PermisoTreeNode
                    key={nodo.id}
                    node={nodo}
                    selectedIds={selectedPermisos}
                    onToggle={handleTogglePermiso}
                  />
                ))}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button variant="outline" onClick={() => setActiveTab("datos")}>
                  Volver a Datos
                </Button>
                <Button onClick={handleGuardarPermisosRol} className="bg-primary hover:bg-primary/90">
                  Guardar Permisos Rol
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
                        <Edit2 size={16} />
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
