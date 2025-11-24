"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PermisoNode {
  id: string
  label: string
  children?: PermisoNode[]
}

const permisosArbol: PermisoNode[] = [
  {
    id: "operaciones-generales",
    label: "Ingresar opción operaciones generales",
    children: [
      { id: "nuevo", label: "Ingresar opción nuevo" },
      { id: "modificar", label: "Ingresar opción modificar" },
      { id: "eliminar", label: "Ingresar opción eliminar" },
      { id: "guardar", label: "Ingresar opción guardar" },
    ],
  },
  { id: "seguridad", label: "Ingresar opción Seguridad" },
  { id: "formularios", label: "Ingresar opción Formularios" },
  {
    id: "entidades",
    label: "Ingresar opción Entidades",
    children: [{ id: "categorias", label: "Ingresar opción Categorías" }],
  },
  { id: "consolidacion", label: "Ingresar opción Consolidación" },
  { id: "mensajes", label: "Ingresar opción Mensajes" },
]

interface ModificarRolViewProps {
  onBack: () => void
  rolData?: {
    codigoRol: string
    nombreRol: string
    descripcionRol: string
    intentosFallidos: string
    periodoVigencia: string
    fechaModificacion: Date
    permisosSeleccionados: string[]
  }
}

export default function ModificarRolView({ onBack, rolData }: ModificarRolViewProps) {
  const [activeTab, setActiveTab] = useState("datos")
  const [datosGuardados, setDatosGuardados] = useState(true) // Ya está guardado al modificar
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedPermisos, setSelectedPermisos] = useState<Set<string>>(
    new Set(rolData?.permisosSeleccionados || ["operaciones-generales", "nuevo", "seguridad"]),
  )

  const [formData, setFormData] = useState({
    codigoRol: rolData?.codigoRol || "ADM_SYSTEM",
    nombreRol: rolData?.nombreRol || "Administrador del Sistema",
    descripcionRol: rolData?.descripcionRol || "Rol con permisos completos de administración",
    intentosFallidos: rolData?.intentosFallidos || "3",
    periodoVigencia: rolData?.periodoVigencia || "90",
    fechaModificacion: rolData?.fechaModificacion || new Date(),
  })

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const togglePermiso = (nodeId: string, node: PermisoNode) => {
    const newSelected = new Set(selectedPermisos)

    if (node.children) {
      const allChildIds = getAllChildIds(node)
      if (newSelected.has(nodeId)) {
        newSelected.delete(nodeId)
        allChildIds.forEach((id) => newSelected.delete(id))
      } else {
        newSelected.add(nodeId)
        allChildIds.forEach((id) => newSelected.add(id))
      }
    } else {
      if (newSelected.has(nodeId)) {
        newSelected.delete(nodeId)
      } else {
        newSelected.add(nodeId)
      }
    }

    setSelectedPermisos(newSelected)
  }

  const getAllChildIds = (node: PermisoNode): string[] => {
    if (!node.children) return []
    const ids: string[] = []
    node.children.forEach((child) => {
      ids.push(child.id)
      if (child.children) {
        ids.push(...getAllChildIds(child))
      }
    })
    return ids
  }

  const renderTreeNode = (node: PermisoNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedPermisos.has(node.id)
    const isIndeterminate = hasChildren && !isSelected && node.children!.some((child) => selectedPermisos.has(child.id))

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleNode(node.id)} className="p-0.5 hover:bg-accent/20 rounded transition">
              <ChevronRight
                size={16}
                className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          ) : (
            <div className="w-5" />
          )}

          <input
            type="checkbox"
            checked={isSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={() => togglePermiso(node.id, node)}
            className="w-4 h-4 text-primary border-input rounded focus:ring-primary cursor-pointer"
          />

          <span className="text-sm text-foreground cursor-pointer" onClick={() => togglePermiso(node.id, node)}>
            {node.label}
          </span>
        </div>

        {hasChildren && isExpanded && <div>{node.children!.map((child) => renderTreeNode(child, level + 1))}</div>}
      </div>
    )
  }

  const handleGuardarDatos = () => {
    if (!formData.nombreRol) {
      alert("Por favor completa el campo Nombre del Rol")
      return
    }
    setDatosGuardados(true)
    setFormData({ ...formData, fechaModificacion: new Date() })
    alert("Datos del rol actualizados correctamente")
  }

  const handleGuardarPermisos = () => {
    if (selectedPermisos.size === 0) {
      alert("Por favor selecciona al menos un permiso")
      return
    }
    setFormData({ ...formData, fechaModificacion: new Date() })
    alert("Permisos del rol actualizados correctamente")
  }

  return (
    <div className="bg-background min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-3 transition"
          >
            <ChevronLeft size={20} />
            Volver
          </button>
          <h2 className="text-2xl font-bold text-foreground">Modificar Rol</h2>
          <p className="text-muted-foreground">Actualiza la información del rol y ajusta los permisos asignados</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[600px]">
          <TabsTrigger value="datos">Datos del Rol</TabsTrigger>
          <TabsTrigger value="permisos" disabled={!datosGuardados}>
            Selección de Permisos
            {!datosGuardados && <span className="ml-2 text-xs">(Bloqueado)</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Básica del Rol</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Código Rol</label>
                <input
                  type="text"
                  value={formData.codigoRol}
                  disabled
                  className="w-full px-3 py-2 border border-input rounded-md bg-gray-100 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">El código del rol no puede ser modificado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del Rol <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombreRol}
                  onChange={(e) => setFormData({ ...formData, nombreRol: e.target.value })}
                  placeholder="Ej: Administrador del Sistema"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Descripción del Rol</label>
                <textarea
                  value={formData.descripcionRol}
                  onChange={(e) => setFormData({ ...formData, descripcionRol: e.target.value })}
                  placeholder="Describe las responsabilidades y alcance de este rol..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de Última Modificación</label>
                <input
                  type="text"
                  value={formData.fechaModificacion.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  disabled
                  className="w-full px-3 py-2 border border-input rounded-md bg-gray-100 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleGuardarDatos} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Save size={18} />
                Guardar Datos del Rol
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permisos" className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Árbol de Permisos</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ajuste los permisos que tendrá este rol en el sistema. Los permisos con subniveles seleccionarán
              automáticamente todos sus hijos.
            </p>

            <div className="border border-border rounded-lg p-4 bg-background max-h-[500px] overflow-y-auto">
              {permisosArbol.map((node) => renderTreeNode(node))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                {selectedPermisos.size} permiso{selectedPermisos.size !== 1 ? "s" : ""} seleccionado
                {selectedPermisos.size !== 1 ? "s" : ""}
              </p>
              <Button
                onClick={handleGuardarPermisos}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Save size={18} />
                Guardar Permisos Rol
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
