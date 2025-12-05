"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Filter,
  Upload,
  Send,
  FileDown,
  MoreVertical,
  Search,
  Edit,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import DataTable from "@/components/data-table" // Assuming DataTable is imported here
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox

interface GestionFormulariosSimpleProps {
  onEditForm?: (formId: string, formName: string) => void
  filtrosPrevios?: {
    entidad?: string
    categoria?: string
    ano?: string
    periodo?: string
  }
  onFiltrosChange?: (filtros: { categoria?: string; ano?: string; periodo?: string }) => void
  onBack?: () => void
}

export default function GestionFormulariosSimple({
  onEditForm,
  filtrosPrevios,
  onFiltrosChange,
  onBack,
}: GestionFormulariosSimpleProps) {
  const [entidad] = useState(filtrosPrevios?.entidad || "Contaduría General de la Nación")
  const [categoria, setCategoria] = useState(filtrosPrevios?.categoria || "")
  const [ano, setAno] = useState(filtrosPrevios?.ano || "")
  const [periodo, setPeriodo] = useState(filtrosPrevios?.periodo || "")
  const [mostrarTabla, setMostrarTabla] = useState(
    !!filtrosPrevios?.categoria && !!filtrosPrevios?.ano && !!filtrosPrevios?.periodo,
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [filtrosModificados, setFiltrosModificados] = useState(false)
  const [selectedFormularios, setSelectedFormularios] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [validationPhase, setValidationPhase] = useState(0)
  const [validationResult, setValidationResult] = useState<{
    formularios: { nombre: string; registros: number }[]
  } | null>(null)
  const [formulariosState, setFormulariosState] = useState([
    // Renombrado a setFormulariosState para evitar conflicto
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
      estado: "Pendiente en validar",
      fecha: "6/11/2024",
      estadoColor: "yellow",
    },
    {
      id: "CGN-2025-05",
      nombre: "Notas a los Estados Financieros",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "5/11/2024",
      estadoColor: "yellow",
    },
  ])

  const categorias = ["INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA", "INFORMACIÓN PRESUPUESTAL", "INFORMACIÓN FINANCIERA"]

  const anos = ["2024", "2025", "2026"]

  const getPeriodos = () => {
    if (categoria === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      return ["Enero - Marzo", "Abril - Junio", "Julio - Septiembre", "Octubre - Diciembre"]
    }
    return ["Enero - Diciembre"]
  }

  const handleAplicarFiltros = () => {
    if (categoria && ano && periodo) {
      setMostrarTabla(true)
      setFiltrosModificados(false)
      onFiltrosChange?.({ categoria, ano, periodo })
    }
  }

  const handleFilterChange = (setter: Function, value: string) => {
    setter(value)
    if (mostrarTabla) {
      setFiltrosModificados(true)
    }
  }

  const handleToggleSelectFormulario = (formId: string) => {
    setSelectedFormularios((prev) => (prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]))
  }

  const toggleSelectAll = () => {
    if (selectedFormularios.length === formulariosState.length) {
      setSelectedFormularios([])
    } else {
      setSelectedFormularios(formulariosState.map((f) => f.id))
    }
  }

  const canSendSelectedFormularios = (): boolean => {
    if (selectedFormularios.length === 0) return false

    // Obtener los formularios seleccionados
    const formularios = formulariosState.filter((f) => selectedFormularios.includes(f.id))

    // Verificar que todos los formularios seleccionados tengan estados válidos
    return formularios.every((f) => {
      const estado = f.estado
      // Solo permitir estados que empiecen con P, E, o X (error y excepción)
      return (
        estado.startsWith("P") || // Pendiente en validar
        estado.startsWith("E") || // Error de validación
        estado.startsWith("X") // Excepción de validación
      )
    })
  }

  const getEstadoBadgeClass = (color: string) => {
    switch (color) {
      case "green": // Exitosos: Aceptado, Validado
        return "bg-green-100 text-green-800 border-green-200"
      case "blue": // En proceso: En Validación
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "yellow": // En proceso: Pendiente en validar
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "red": // Errores: Rechazado por Deficiencia, Rechazado por Formato
        return "bg-red-100 text-red-800 border-red-200"
      case "orange": // Errores: Excepción en Validación
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredFormularios = formulariosState.filter(
    (f) =>
      f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEnviar = async () => {
    console.log("[v0] Botón Enviar clickeado en GestionFormulariosSimple")
    console.log("[v0] Formularios seleccionados:", selectedFormularios)

    setIsSubmitting(true)
    setValidationPhase(0)

    // Fase 1: Contenido de variables
    setValidationPhase(1)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const formulariosSeleccionados = formulariosState.filter((f) => selectedFormularios.includes(f.id))
    const tieneNotasEstadosFinancieros = formulariosSeleccionados.some(
      (f) => f.nombre === "Notas a los Estados Financieros",
    )
    const tieneEstadoCambios = formulariosSeleccionados.some((f) => f.nombre === "Estado de Cambios en el Patrimonio")

    // If there are errors in the selected forms
    if (tieneNotasEstadosFinancieros || tieneEstadoCambios) {
      setIsSubmitting(false)
      setValidationPhase(0)

      const errores: Array<{ formulario: string; concepto: string; mensaje: string }> = []

      // Data errors for Notas a los Estados Financieros
      if (tieneNotasEstadosFinancieros) {
        errores.push(
          {
            formulario: "Notas a los Estados Financieros",
            concepto: "1105 - Efectivo y equivalentes al efectivo",
            mensaje: "var-3: Contenido malicioso detectado",
          },
          {
            formulario: "Notas a los Estados Financieros",
            concepto: "2105 - Cuentas por pagar",
            mensaje: "var-5: Formato numérico inválido",
          },
          {
            formulario: "Notas a los Estados Financieros",
            concepto: "3605 - Resultado del ejercicio",
            mensaje: "var-2: Dato fuera del rango permitido",
          },
        )
      }

      // Fase 2: Completitud
      setValidationPhase(2)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Completeness errors for Estado de Cambios en el Patrimonio
      if (tieneEstadoCambios) {
        errores.push(
          {
            formulario: "Estado de Cambios en el Patrimonio",
            concepto: "3105 - Capital social",
            mensaje: "var-1: Campo requerido sin completar",
          },
          {
            formulario: "Estado de Cambios en el Patrimonio",
            concepto: "3205 - Reservas",
            mensaje: "var-4: Campo requerido sin completar",
          },
          {
            formulario: "Estado de Cambios en el Patrimonio",
            concepto: "3305 - Resultados acumulados",
            mensaje: "var-2: Campo requerido sin completar",
          },
        )
      }

      setErrorData({
        formularios: formulariosSeleccionados.map((f) => f.nombre),
        detalles: errores,
      })

      setShowErrorAlert(true)
      return
    }

    // Fase 2: Completitud (if no errors)
    setValidationPhase(2)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Fase 3: Validaciones generales
    setValidationPhase(3)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Fase 4: Expresiones de validación locales
    setValidationPhase(4)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // If it's Información Contable Convergencia category, show specific message
    if (categoria === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      const formulariosEnviados = formulariosState
        .filter((f) => selectedFormularios.includes(f.id))
        .map((f) => ({
          nombre: f.nombre,
          registros: Math.floor(Math.random() * 200) + 50,
        }))

      setFormulariosState((prev) =>
        prev.map((f) => (selectedFormularios.includes(f.id) ? { ...f, estado: "Validado" } : f)),
      )

      setValidationResult({ formularios: formulariosEnviados })
      setShowSuccessDialog(true)
    }

    setIsSubmitting(false)
    setValidationPhase(0)
    setSelectedFormularios([])
  }

  const getColorForEstado = (estado: string): string => {
    // Exitosos en validación
    if (estado === "Aceptado" || estado === "Validado") {
      return "green"
    }
    // En proceso
    if (estado === "En Validación") {
      return "blue"
    }
    if (estado === "Pendiente en validar") {
      return "yellow"
    }
    // Errores
    if (estado === "Rechazado por Deficiencia" || estado === "Rechazado por Formato") {
      return "red"
    }
    if (estado === "Excepción en Validación") {
      return "orange"
    }
    return "gray"
  }

  const handleViewErrorDetails = () => {
    // Renombrado de handleViewErrors a handleViewErrorDetails
    setShowErrorAlert(false)
    setShowErrorsView(true)

    // Actualizar estados de formularios con errores
    setFormulariosState((prev) =>
      prev.map((f) => {
        if (errorData?.formularios.includes(f.nombre)) {
          return {
            ...f,
            estado: "Rechazado por Deficiencia",
            estadoColor: getColorForEstado("Rechazado por Deficiencia"),
          } // Usar función para obtener color
        }
        return f
      }),
    )
  }

  const handleBackFromErrors = () => {
    setShowErrorsView(false)
    setErrorData(null)
  }

  const handleExportErrors = (format: "csv" | "excel" | "pdf" | "txt") => {
    if (!errorData) return

    const data = errorData.detalles.map((d) => ({
      Formulario: d.formulario,
      Concepto: d.concepto,
      Mensaje: d.mensaje,
    }))

    console.log(`[v0] Exportando errores en formato ${format}`, data)

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `errores-validacion-${timestamp}.${format}`

    if (format === "txt") {
      const txtContent = `Reporte de Errores de Validación\n${"=".repeat(50)}\n\nEntidad: ${entidad}\nCategoría: ${categoria}\nPeríodo: ${periodo}\nAño: ${ano}\n\n${"=".repeat(50)}\n\nErrores Detectados:\n\n${data.map((row, idx) => `${idx + 1}. Formulario: ${row.Formulario}\n   Concepto: ${row.Concepto}\n   ${row.Mensaje}\n`).join("\n")}`
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === "csv") {
      const headers = ["Formulario", "Concepto", "Mensaje"]
      const csvContent = [
        headers.join(","),
        ...data.map((row) => [row.Formulario, row.Concepto, row.Mensaje].map((cell) => `"${cell}"`).join(",")),
      ].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }

    toast({
      title: "Exportación exitosa",
      description: `Los errores se han exportado en formato ${format.toUpperCase()}`,
    })
  }

  const handleUpdateFormularioEstado = (nombreFormulario: string) => {
    setFormulariosState(
      (
        prev, // Usando setFormulariosState
      ) =>
        prev.map((f) => {
          if (f.nombre === nombreFormulario) {
            return {
              ...f,
              estado: "Rechazado por Deficiencia",
              tipo: "Formulario",
              estadoColor: getColorForEstado("Rechazado por Deficiencia"),
            } // Usar función para obtener color
          }
          return f
        }),
    )
  }

  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showErrorsView, setShowErrorsView] = useState(false)
  const [errorData, setErrorData] = useState<{
    formularios: string[]
    detalles: Array<{ formulario: string; concepto: string; mensaje: string }>
  } | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [currentView, setCurrentView] = useState("dataTable")
  const [selectedFormulario, setSelectedFormulario] = useState<{ nombre: string } | null>(null)

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedFormulario(null)
  }

  if (showErrorsView && errorData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackFromErrors} className="mb-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Errores de Validación</h2>

            <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Entidad</div>
                <div className="font-semibold">{entidad}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Categoría</div>
                <div className="font-semibold">{categoria}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Período</div>
                <div className="font-semibold">{periodo}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Año</div>
                <div className="font-semibold">{ano}</div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportErrors("csv")}>
                    <FileText className="w-4 h-4 mr-2" />
                    CSV - Valores separados por comas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportErrors("excel")}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel - Hoja de cálculo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportErrors("pdf")}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF - Documento portable
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportErrors("txt")}>
                    <FileText className="w-4 h-4 mr-2" />
                    TXT - Texto plano
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2">
                    <th className="p-3 text-left font-semibold text-gray-700">Formulario</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Concepto</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Mensaje</th>
                  </tr>
                </thead>
                <tbody>
                  {errorData.detalles.map((detalle, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-3">{detalle.formulario}</td>
                      <td className="p-3 font-mono text-xs">{detalle.concepto}</td>
                      <td className="p-3 text-red-600">{detalle.mensaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Filtros de Búsqueda */}
      <div className="p-6 space-y-6">
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
              <input
                value={entidad}
                disabled
                className="w-full px-3 py-2 border border-input rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                value={categoria}
                onChange={(e) => handleFilterChange(setCategoria, e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Seleccione categoría</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Año <span className="text-red-500">*</span>
              </label>
              <select
                value={ano}
                onChange={(e) => handleFilterChange(setAno, e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Seleccione año</option>
                {anos.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Periodo <span className="text-red-500">*</span>
              </label>
              <select
                value={periodo}
                onChange={(e) => handleFilterChange(setPeriodo, e.target.value)}
                disabled={!categoria}
                className="w-full px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50"
              >
                <option value="">Seleccione periodo</option>
                {getPeriodos().map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAplicarFiltros}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!categoria || !ano || !periodo}
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
              Para visualizar los formularios disponibles, debe seleccionar Categoría, Año y Periodo
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
                  disabled={!canSendSelectedFormularios() || isSubmitting}
                  onClick={handleEnviar}
                  className={!canSendSelectedFormularios() && !isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedFormularios.length === 0}
                      className={selectedFormularios.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("csv")}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            CSV
                            <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">CSV - Sin límite de filas</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              <li>Encoding UTF-8</li>
                              <li>Encabezados incluidos</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("excel")}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Excel (XLSX)
                            <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">Excel (XLSX)</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              <li>Máximo 50 MB por archivo</li>
                              <li>Hasta 1.048.576 filas por hoja</li>
                              <li>Múltiples hojas permitidas</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("pdf")}>
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                            <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">PDF</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              <li>Máximo 10.000 líneas por archivo</li>
                              <li>División automática si excede límite</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("txt")}>
                            <FileText className="w-4 h-4 mr-2" />
                            TXT
                            <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">TXT - Sin límite de filas</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              <li>Encoding UTF-8</li>
                              <li>Formato de texto plano</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <input
                        type="checkbox"
                        className="rounded"
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
                          onCheckedChange={() => {
                            handleToggleSelectFormulario(form.id)
                            // </CHANGE> Eliminada la lógica que mostraba DataTable al seleccionar checkbox
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{form.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{form.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{form.tipo}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getEstadoBadgeClass(form.estadoColor)}`}
                        >
                          {form.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{form.fecha}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditForm?.(form.id, form.nombre)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Registro manual
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileSpreadsheet className="w-4 h-4 mr-2" />
                              Generar protocolo importación
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                <select className="px-2 py-1 border border-input rounded-md text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
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

        {!showErrorsView && currentView === "dataTable" && selectedFormulario && (
          <DataTable
            title={selectedFormulario.nombre}
            onBack={handleBackToList}
            filtrosPrevios={{ categoria, periodo, ano }}
            onUpdateEstado={handleUpdateFormularioEstado}
          />
        )}
      </div>

      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Errores en el envío a validar</AlertDialogTitle>
            <AlertDialogDescription>
              Hubo errores en el envío a validar. ¿Desea ver el listado de errores?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowErrorAlert(false)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleViewErrorDetails}>Sí, ver errores</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showErrorDetails} onOpenChange={setShowErrorDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Detalles de errores de validación
            </DialogTitle>
          </DialogHeader>

          {/* Encabezado con información del contexto */}
          <div className="bg-gray-50 p-4 rounded-md border space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Entidad:</span> {entidad}
              </div>
              <div>
                <span className="font-semibold">Categoría:</span> {categoria}
              </div>
              <div>
                <span className="font-semibold">Periodo:</span> {periodo}
              </div>
              <div>
                <span className="font-semibold">Año:</span> {ano}
              </div>
            </div>
          </div>

          {/* Tabla de errores */}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 font-semibold">Formulario</th>
                  <th className="text-left p-3 font-semibold">Concepto</th>
                  <th className="text-left p-3 font-semibold">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {errorData?.detalles.map((detalle, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-3">{detalle.formulario}</td>
                    <td className="p-3 font-mono text-xs">{detalle.concepto}</td>
                    <td className="p-3">
                      <span className="font-semibold text-gray-700">{detalle.concepto}:</span>{" "}
                      <span className="text-red-600">{detalle.mensaje}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botones de exportación */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">Exportar errores:</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("csv")}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CSV
                        <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">CSV - Sin límite de filas</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Encoding UTF-8</li>
                          <li>Encabezados incluidos</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("excel")}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel (XLSX)
                        <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">Excel (XLSX)</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Máximo 50 MB por archivo</li>
                          <li>Hasta 1.048.576 filas por hoja</li>
                          <li>Múltiples hojas permitidas</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("pdf")}>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                        <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">PDF</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Máximo 10.000 líneas por archivo</li>
                          <li>División automática si excede límite</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportErrors("txt")}>
                        <FileText className="w-4 h-4 mr-2" />
                        TXT
                        <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">TXT - Sin límite de filas</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Encoding UTF-8</li>
                          <li>Formato de texto plano</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowErrorDetails(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false)
                setSelectedFormularios([])
              }}
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Capa de carga */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-6 max-w-md">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="text-center space-y-4 w-full">
              <h3 className="text-lg font-semibold text-gray-900">Validando formulario</h3>
              <div className="space-y-3 text-left">
                <div className={`flex items-center gap-3 ${validationPhase >= 1 ? "text-gray-900" : "text-gray-400"}`}>
                  {validationPhase > 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : validationPhase === 1 ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm">1. Contenido de variables</span>
                </div>
                <div className={`flex items-center gap-3 ${validationPhase >= 2 ? "text-gray-900" : "text-gray-400"}`}>
                  {validationPhase > 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : validationPhase === 2 ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm">2. Completitud</span>
                </div>
                <div className={`flex items-center gap-3 ${validationPhase >= 3 ? "text-gray-900" : "text-gray-400"}`}>
                  {validationPhase > 3 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : validationPhase === 3 ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm">3. Validaciones generales</span>
                </div>
                <div className={`flex items-center gap-3 ${validationPhase >= 4 ? "text-gray-900" : "text-gray-400"}`}>
                  {validationPhase > 4 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : validationPhase === 4 ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm">4. Expresiones de validación locales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
