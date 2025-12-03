"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Filter, Upload, MoreVertical, FileDown, Loader2, Send, ChevronDown, Search } from "lucide-react"

interface GestionFormulariosSimpleProps {
  categoria?: string
  onBack?: () => void
  onSelectFormulario?: (formId: string) => void
}

export default function GestionFormulariosSimple({
  categoria,
  onBack,
  onSelectFormulario,
}: GestionFormulariosSimpleProps) {
  const [categoriaState, setCategoria] = useState(categoria || "")
  const [ano, setAno] = useState("")
  const [periodo, setPeriodo] = useState("")
  const [entidad, setEntidad] = useState("Entidad 1")
  const [mostrarTabla, setMostrarTabla] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtrosModificados, setFiltrosModificados] = useState(false)
  const [selectedFormularios, setSelectedFormularios] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [completedPhases, setCompletedPhases] = useState<number[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    formularios: { nombre: string; registros: number }[]
  } | null>(null)
  const [formulariosState, setFormularios] = useState([
    {
      id: "CGN-2025-01",
      nombre: "Balance General",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "9/11/2024",
      estadoColor: "yellow",
    },
    {
      id: "CGN-2025-02",
      nombre: "Estado de Resultados",
      tipo: "Formulario",
      estado: "Aceptado",
      fecha: "8/11/2024",
      estadoColor: "green",
    },
    {
      id: "CGN-2025-03",
      nombre: "Flujo de Efectivo",
      tipo: "Formulario",
      estado: "En Validación",
      fecha: "7/11/2024",
      estadoColor: "blue",
    },
    {
      id: "CGN-2025-04",
      nombre: "Estado de Cambios en el Patrimonio",
      tipo: "Formulario",
      estado: "Rechazado por Formato",
      fecha: "6/11/2024",
      estadoColor: "red",
    },
    {
      id: "CGN-2025-05",
      nombre: "Notas a los Estados Financieros",
      tipo: "Reporte",
      estado: "Rechazado por Deficiencia",
      fecha: "5/11/2024",
      estadoColor: "red",
    },
  ])

  const categorias = ["INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA", "INFORMACIÓN PRESUPUESTAL", "INFORMACIÓN FINANCIERA"]

  const anos = ["2024", "2025", "2026"]

  const getPeriodos = () => {
    if (categoriaState === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      return ["Enero - Marzo", "Abril - Junio", "Julio - Septiembre", "Octubre - Diciembre"]
    }
    return ["Enero - Diciembre"]
  }

  const handleAplicarFiltros = () => {
    if (categoriaState && ano && periodo && entidad) {
      setMostrarTabla(true)
      setFiltrosModificados(false)
    }
  }

  const handleFilterChange = (setter: Function, value: string) => {
    setter(value)
    if (mostrarTabla) {
      setFiltrosModificados(true)
    }
  }

  const toggleFormularioSelection = (formId: string) => {
    setSelectedFormularios((prev) => (prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]))
  }

  const toggleSelectAll = () => {
    if (selectedFormularios.length === formulariosState.length) {
      setSelectedFormularios([])
    } else {
      setSelectedFormularios(formulariosState.map((f) => f.id))
    }
  }

  const getEstadoColor = (estado: string): string => {
    const estadoLower = estado.toLowerCase()
    if (estadoLower.includes("pendiente")) return "yellow" // P - Pendiente en validar
    if (estadoLower.includes("error")) return "orange" // E - Error de validación
    if (estadoLower.includes("excepción")) return "purple" // X - Excepción de validación
    if (estadoLower.includes("aceptado") || estadoLower.includes("validado")) return "green"
    if (estadoLower.includes("validación") && estadoLower.includes("en")) return "blue" // En validación
    if (estadoLower.includes("rechazado")) return "red"
    return "gray"
  }

  const getEstadoBadgeClass = (color: string): string => {
    switch (color) {
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "orange":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "green":
        return "bg-green-100 text-green-800 border-green-200"
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "red":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredFormularios = formulariosState.filter(
    (f) =>
      f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canSendFormulario = (estado: string): boolean => {
    const estadoLower = estado.toLowerCase()
    return (
      estadoLower.includes("pendiente") || // P
      (estadoLower.includes("error") && !estadoLower.includes("validación")) || // E
      estadoLower.includes("excepción") // X
    )
  }

  const handleEnviar = async () => {
    console.log("[v0] Botón Enviar clickeado en GestionFormulariosSimple")
    console.log("[v0] Formularios seleccionados:", selectedFormularios)

    // Verificar que todos los formularios seleccionados pueden ser enviados
    const formulariosSeleccionados = formulariosState.filter((f) => selectedFormularios.includes(f.id))
    const formulariosNoValidos = formulariosSeleccionados.filter((f) => !canSendFormulario(f.estado))

    if (formulariosNoValidos.length > 0) {
      alert(`No se pueden enviar formularios en estado: ${formulariosNoValidos.map((f) => f.estado).join(", ")}`)
      return
    }

    setIsSubmitting(true)
    setCurrentPhase(0)
    setCompletedPhases([])

    // Simular proceso de validación en fases
    const validationPhases = [
      "Validando contenido de variables",
      "Validando completitud",
      "Ejecutando validaciones generales",
      "Verificando expresiones de validación locales",
    ]

    for (let i = 0; i < validationPhases.length; i++) {
      setCurrentPhase(i)
      console.log(`[v0] Fase ${i + 1}: ${validationPhases[i]}`)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 1.5 segundos por fase
      setCompletedPhases((prev) => [...prev, i])
      console.log(`[v0] Fase ${i + 1} completada`)
    }

    // Si es categoría de Información Contable Convergencia, mostrar mensaje específico
    if (categoriaState === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      const formulariosEnviados = formulariosState
        .filter((f) => selectedFormularios.includes(f.id))
        .map((f) => ({
          nombre: f.nombre,
          registros: Math.floor(Math.random() * 200) + 50,
        }))

      setFormularios((prev) => prev.map((f) => (selectedFormularios.includes(f.id) ? { ...f, estado: "Validado" } : f)))

      setValidationResult({ formularios: formulariosEnviados })
      setShowSuccessDialog(true)
      console.log("[v0] Mostrando diálogo de validación exitosa")
    }

    setIsSubmitting(false)
    setCurrentPhase(0)
    setCompletedPhases([])
    console.log("[v0] Proceso de envío finalizado")
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Búsqueda */}
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Filtros de Búsqueda</h3>
        </div>

        {filtrosModificados && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            Los filtros han sido modificados. Haga clic en "Aplicar Filtros" para actualizar los resultados.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entidad</label>
            <Select value={entidad} onValueChange={(value) => handleFilterChange(setEntidad, value)} disabled>
              <SelectTrigger className="w-full px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50">
                <SelectValue placeholder="Seleccione entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entidad 1">Entidad 1</SelectItem>
                <SelectItem value="Entidad 2">Entidad 2</SelectItem>
                <SelectItem value="Entidad 3">Entidad 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <Select value={categoriaState} onValueChange={(value) => handleFilterChange(setCategoria, value)}>
              <SelectTrigger className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <SelectValue placeholder="Seleccione categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Seleccione categoría</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Año</label>
            <Select value={ano} onValueChange={(value) => handleFilterChange(setAno, value)}>
              <SelectTrigger className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <SelectValue placeholder="Seleccione año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Seleccione año</SelectItem>
                {anos.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Periodo</label>
            <Select
              value={periodo}
              onValueChange={(value) => handleFilterChange(setPeriodo, value)}
              disabled={!categoriaState}
            >
              <SelectTrigger className="w-full px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50">
                <SelectValue placeholder="Seleccione periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Seleccione periodo</SelectItem>
                {getPeriodos().map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleAplicarFiltros}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!categoriaState || !ano || !periodo || !entidad}
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>

      {/* Estado Vacío */}
      {!mostrarTabla && (
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Seleccione los filtros de búsqueda</h3>
          <p className="text-gray-500">
            Para visualizar los formularios disponibles, debe seleccionar Categoría, Año, Periodo y Entidad
          </p>
        </div>
      )}

      {/* Tabla de Formularios */}
      {mostrarTabla && (
        <div className="bg-white rounded-lg border border-border shadow-sm">
          {/* Barra de Acciones */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Envíos
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  selectedFormularios.length === 0 ||
                  isSubmitting ||
                  !formulariosState
                    .filter((f) => selectedFormularios.includes(f.id))
                    .every((f) => canSendFormulario(f.estado))
                }
                onClick={handleEnviar}
                className={
                  selectedFormularios.length === 0 ||
                  !formulariosState
                    .filter((f) => selectedFormularios.includes(f.id))
                    .every((f) => canSendFormulario(f.estado))
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ChevronDown className="w-4 h-4 mr-2" />
                Atrás
              </Button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <Checkbox
                      checked={selectedFormularios.length === formulariosState.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CÓDIGO ↕
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NOMBRE DEL FORMULARIO ↕
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TIPO ↕
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ESTADO DE VALIDACIÓN ↕
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ÚLTIMA MODIFICACIÓN ↕
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredFormularios.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedFormularios.includes(form.id)}
                        onChange={() => toggleFormularioSelection(form.id)}
                        onClick={() => onSelectFormulario?.(form.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{form.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{form.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{form.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md border ${getEstadoBadgeClass(
                          getEstadoColor(form.estado),
                        )}`}
                      >
                        {form.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{form.fecha}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => onSelectFormulario?.(form.id)}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Registros por página:</span>
              <Select>
                <SelectTrigger className="px-2 py-1 border border-input rounded-md text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600 ml-4">Mostrando 1 a 5 de 5 resultados</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Primera
              </Button>
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="default" size="sm">
                Página 1 de 1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
              <Button variant="outline" size="sm" disabled>
                Última
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de validación exitosa */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">Validación exitosa</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-gray-700 font-medium">Los formularios validados son:</div>
              {validationResult?.formularios.map((form, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm">
                    <span className="font-semibold">{form.nombre}:</span> {form.registros} registros
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Estado: <span className="text-green-600 font-medium">Validado</span> | Tipo:{" "}
                    <span className="font-medium">Formulario</span>
                  </div>
                </div>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                setSelectedFormularios([])
              }}
            >
              Aceptar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-6 max-w-lg w-full mx-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="text-center space-y-2 w-full">
              <h3 className="text-lg font-semibold text-gray-900">Validando formulario</h3>
              <p className="text-sm text-gray-600">Procesando información en múltiples fases...</p>
            </div>

            {/* Fases de validación */}
            <div className="w-full space-y-3">
              {[
                "Validando contenido de variables",
                "Validando completitud",
                "Ejecutando validaciones generales",
                "Verificando expresiones de validación locales",
              ].map((phase, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {completedPhases.includes(index) ? (
                      <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center">
                        ✓
                      </div>
                    ) : currentPhase === index ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        completedPhases.includes(index)
                          ? "text-green-700 font-medium"
                          : currentPhase === index
                            ? "text-primary font-medium"
                            : "text-gray-500"
                      }`}
                    >
                      {phase}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
