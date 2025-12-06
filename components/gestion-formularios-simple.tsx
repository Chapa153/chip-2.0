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
  Download,
  ChevronLeft,
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
import { toast } from "@/components/ui/use-toast" // Corregido import de toast desde use-toast en lugar de toast
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

interface Formulario {
  id: string
  nombre: string
  tipo: string
  estado: string
  fecha: string
  estadoColor: string
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
    formulariosCalculados?: { nombre: string; registros: number }[]
  } | null>(null)
  const [formulariosState, setFormulariosState] = useState<Formulario[]>([
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
      estado: "Pendiente en validar",
      fecha: "8/11/2024",
      estadoColor: "yellow",
    },
    {
      id: "CGN-2025-03",
      nombre: "Flujo de Efectivo",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "7/11/2024",
      estadoColor: "yellow",
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
    {
      id: "CGN-2025-06",
      nombre: "Información Complementaria",
      tipo: "Formulario",
      estado: "Rechazado por Deficiencia",
      fecha: "4/11/2024",
      estadoColor: "red",
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
    if (selectedFormularios.length === 0) {
      setSelectedFormularios(formulariosState.map((f) => f.id))
    } else {
      setSelectedFormularios([])
    }
  }

  const canSendSelectedFormularios = (): boolean => {
    if (selectedFormularios.length === 0) return false

    // Obtener los formularios seleccionados
    const formularios = formulariosState.filter((f) => selectedFormularios.includes(f.id))

    // Verificar que todos los formularios seleccionados tengan estados válidos
    return formularios.every((f) => {
      const estado = f.estado
      // No permitir formularios en estado Aceptado
      if (estado === "Aceptado") return false

      // Solo permitir estados que empiecen con P, D, X, o V
      return (
        estado.startsWith("P") || // Pendiente en validar
        estado.startsWith("D") || // Rechazado por deficiencia
        estado.startsWith("X") || // Excepción de validación
        estado.startsWith("V") // En validación
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

  const [showSimpleAlert, setShowSimpleAlert] = useState(false)
  const [simpleAlertMessage, setSimpleAlertMessage] = useState("")

  const [errorsSeen, setErrorsSeen] = useState(false)

  const handleEnviar = async () => {
    console.log("[v0] Botón Enviar clickeado en GestionFormulariosSimple")
    console.log("[v0] Formularios seleccionados:", selectedFormularios)

    if (selectedFormularios.length === 0) {
      toast({
        title: "Sin selección",
        description: "Por favor selecciona al menos un formulario para enviar.",
        variant: "destructive",
      })
      return
    }

    setErrorsSeen(false)
    setIsSubmitting(true)
    setValidationPhase(1)

    const selectedNames = selectedFormularios
      .map((id) => formulariosState.find((f) => f.id === id)?.nombre)
      .filter(Boolean) as string[]

    const allErrors: Array<{
      formulario: string
      concepto: string
      mensaje: string
      codigo?: string
      permisible?: string
      necesitaComentario?: string
    }> = []

    let tipoErrorDetectado: "contenido" | "completitud" | "expresiones" | null = null

    // Fase 1: Contenido de variables
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (selectedNames.includes("Notas a los Estados Financieros")) {
      allErrors.push(
        {
          formulario: "Notas a los Estados Financieros",
          concepto: "5110 - Inversiones en subsidiarias",
          mensaje: "var-3: Tipo de dato incorrecto - esperado numérico",
        },
        {
          formulario: "Notas a los Estados Financieros",
          concepto: "5305 - Gestión de riesgos financieros",
          mensaje: "var-5: Valor fuera del rango permitido",
        },
      )
      if (!tipoErrorDetectado) tipoErrorDetectado = "contenido"
    }

    // Fase 2: Completitud
    setValidationPhase(2)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (selectedNames.includes("Estado de Cambios en el Patrimonio")) {
      allErrors.push(
        {
          formulario: "Estado de Cambios en el Patrimonio",
          concepto: "3105 - Capital suscrito y pagado",
          mensaje: "var-1: Campo requerido sin completar",
        },
        {
          formulario: "Estado de Cambios en el Patrimonio",
          concepto: "3205 - Reservas",
          mensaje: "var-4: Campo requerido sin completar",
        },
      )
      if (!tipoErrorDetectado) tipoErrorDetectado = "completitud"
    }

    // Fase 3: Validaciones generales
    setValidationPhase(3)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (selectedNames.includes("Flujo de Efectivo")) {
      setIsSubmitting(false)
      setValidationPhase(0)

      setSimpleAlertMessage(
        "El formulario Flujo de Efectivo presenta las siguientes validaciones generales:\n\n" +
          "• Las actividades de operación deben cuadrar con el estado de resultados\n" +
          "• Las actividades de inversión deben estar correctamente clasificadas\n" +
          "• Las actividades de financiación deben estar correctamente clasificadas",
      )
      setShowSimpleAlert(true)
      return
    }

    // Fase 4: Expresiones de validación locales
    setValidationPhase(4)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (selectedNames.includes("Estado de Resultados")) {
      allErrors.push(
        {
          formulario: "Estado de Resultados",
          concepto: "",
          mensaje: "Mensaje",
          codigo: "codigo_mensaje",
          permisible: "SI",
          necesitaComentario: "SI",
        },
        {
          formulario: "Estado de Resultados",
          concepto: "",
          mensaje: "Mensaje",
          codigo: "codigo_mensaje",
          permisible: "NO",
          necesitaComentario: "NO",
        },
      )
      if (!tipoErrorDetectado) tipoErrorDetectado = "expresiones"
    }

    if (allErrors.length > 0 && tipoErrorDetectado) {
      setErrorData({
        formularios: selectedNames,
        detalles: allErrors,
        tipoError: tipoErrorDetectado,
      })
      setShowErrorAlert(true)
      setIsSubmitting(false)
      setValidationPhase(0)
      return
    }

    // Si no hay errores en ninguna fase, continuar con el éxito

    // If it's Información Contable Convergencia category, show specific message
    if (categoria === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      // Renombrado selectedForms a selectedFormularios para consistencia
      const selectedFormulariosData = formulariosState.filter((f) => selectedFormularios.includes(f.id))
      const formulariosEnviados = selectedFormulariosData.map((f) => ({
        nombre: f.nombre,
        registros: Math.floor(Math.random() * 200) + 50,
      }))

      const balanceGeneralEnviado = selectedFormulariosData.some((f) => f.nombre === "Balance General")
      let formulariosCalculados: { nombre: string; registros: number }[] = []

      if (balanceGeneralEnviado) {
        // Generar formularios calculados automáticamente
        formulariosCalculados = [
          { nombre: "Indicadores Financieros", registros: 24 },
          { nombre: "Análisis Horizontal", registros: 134 },
          { nombre: "Análisis Vertical", registros: 134 },
        ]
      }

      setFormulariosState((prev) => {
        // Actualizar estado de formularios seleccionados
        const updatedFormularios = prev.map((f) =>
          selectedFormularios.includes(f.id) ? { ...f, estado: "Validado", estadoColor: "green" } : f,
        )

        // Agregar formularios calculados si existen
        if (formulariosCalculados.length > 0) {
          const nuevosFormulariosCalculados = formulariosCalculados.map((fc, index) => ({
            id: `CALC-${Date.now()}-${index}`,
            nombre: fc.nombre,
            tipo: "Formulario",
            estado: "Pendiente en validar",
            fecha: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
            estadoColor: "yellow",
          }))

          return [...updatedFormularios, ...nuevosFormulariosCalculados]
        }

        return updatedFormularios
      })

      setValidationResult({
        formularios: formulariosEnviados,
        formulariosCalculados: formulariosCalculados.length > 0 ? formulariosCalculados : undefined,
      })
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

  // Cambiado el nombre de la función y su lógica
  const handleViewErrors = () => {
    setShowErrorAlert(false)
    setShowErrorsView(true)
    setErrorsSeen(true)

    if (errorData) {
      const updatedForms = formulariosState.map((form) => {
        if (errorData.formularios.includes(form.nombre)) {
          return {
            ...form,
            estado: "Rechazado por Deficiencia",
            estadoColor: "red",
            fecha: new Date().toLocaleDateString("es-ES"),
          }
        }
        return form
      })
      setFormulariosState(updatedForms)
    }
  }

  const handleBackFromErrors = () => {
    setShowErrorsView(false)
    setErrorData(null)
    setErrorComments({}) // Limpiar comentarios al volver
    setSelectedFormularios([])
    // Los formularios mantienen su estado original para poder ser reenviados
  }

  const handleExportErrors = (format: "csv" | "excel" | "pdf" | "txt") => {
    if (!errorData) return

    let dataToExport

    // Ajuste para el nuevo tipoError
    if (errorData.tipoError === "expresiones") {
      dataToExport = errorData.detalles.map((d, index) => ({
        Formulario: d.formulario,
        Concepto: d.concepto || "-",
        Mensaje: d.mensaje || "Mensaje",
        Codigo: d.codigo,
        Permisible: d.permisible,
        NecesitaComentario: d.necesitaComentario,
        Comentario: errorComments[index] || "",
      }))
    } else {
      // Para tipoError "contenido" y "completitud"
      dataToExport = errorData.detalles.map((d) => ({
        Formulario: d.formulario,
        Concepto: d.concepto,
        Mensaje: d.mensaje,
      }))
    }

    console.log(`[v0] Exportando errores en formato ${format}`, dataToExport)

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `errores-validacion-${timestamp}.${format}`

    if (format === "txt") {
      let txtContent = ""
      if (errorData.tipoError === "expresiones") {
        txtContent = `Reporte Detallado de Errores de Validación\n${"=".repeat(60)}\n\n`
        dataToExport.forEach((row, idx) => {
          txtContent += `Error ${idx + 1}:\n`
          txtContent += `  Formulario: ${row.Formulario}\n`
          txtContent += `  Concepto: ${row.Concepto || "-"}\n`
          txtContent += `  Mensaje: ${row.Mensaje}\n`
          txtContent += `  Código: ${row.Codigo}\n`
          txtContent += `  Permisible: ${row.Permisible}\n`
          txtContent += `  Necesita Comentario: ${row.NecesitaComentario}\n`
          if (row.Comentario) {
            txtContent += `  Comentario: ${row.Comentario}\n`
          }
          txtContent += "\n"
        })
      } else {
        // Para tipoError "contenido" y "completitud"
        txtContent = `Reporte de Errores de Validación\n${"=".repeat(50)}\n\nEntidad: ${entidad}\nCategoría: ${categoria}\nPeríodo: ${periodo}\nAño: ${ano}\n\n${"=".repeat(50)}\n\nErrores Detectados:\n\n`
        dataToExport
          .map(
            (row, idx) =>
              `${idx + 1}. Formulario: ${row.Formulario}\n   Concepto: ${row.Concepto}\n   ${row.Mensaje}\n`,
          )
          .join("\n")
      }
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === "csv") {
      const headers =
        errorData.tipoError === "expresiones"
          ? ["Formulario", "Concepto", "Mensaje", "Codigo", "Permisible", "NecesitaComentario", "Comentario"]
          : ["Formulario", "Concepto", "Mensaje"]
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const cellValue = row[header.toLowerCase() as keyof typeof row] as string
              return `"${cellValue.replace(/"/g, '""')}"` // Escape double quotes
            })
            .join(","),
        ),
      ].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === "excel") {
      // Placeholder for Excel export
      toast({
        title: "Exportación no implementada",
        description: "La exportación a Excel aún no está disponible.",
        variant: "warning",
      })
    } else if (format === "pdf") {
      // Placeholder for PDF export
      toast({
        title: "Exportación no implementada",
        description: "La exportación a PDF aún no está disponible.",
        variant: "warning",
      })
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
    detalles: Array<{
      formulario: string
      concepto: string
      mensaje: string
      codigo?: string
      permisible?: string
      necesitaComentario?: string
    }>
    tipoError?: "contenido" | "completitud" | "expresiones"
  } | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [currentView, setCurrentView] = useState("dataTable")
  const [selectedFormulario, setSelectedFormulario] = useState<{ nombre: string } | null>(null)
  const [errorComments, setErrorComments] = useState<{ [key: number]: string }>({})

  const handleCommentChange = (index: number, value: string) => {
    if (value.length <= 250) {
      setErrorComments((prev) => ({ ...prev, [index]: value }))
    }
  }

  // Nueva vista para mostrar errores, con condicionales p
  if (showErrorsView && errorData) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with back button */}
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBackFromErrors}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExportErrors("csv")}>
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportErrors("excel")}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportErrors("pdf")}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportErrors("txt")}>
                    <FileText className="w-4 h-4 mr-2" />
                    TXT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Error details container */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header Information */}
              <div className="bg-gray-50 border-b border-gray-200 p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Entidad</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{entidad}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categoría</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Año</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{ano}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Período</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{periodo}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {errorData.tipoError === "contenido" && "Errores de Contenido de Variables"}
                    {errorData.tipoError === "completitud" && "Errores de Completitud"}
                    {errorData.tipoError === "expresiones" && "Errores de Expresiones de Validación Locales"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {errorData.tipoError === "contenido" &&
                      "Se detectaron problemas en la estructura y formato de los datos enviados"}
                    {errorData.tipoError === "completitud" && "Se encontraron campos requeridos sin completar"}
                    {errorData.tipoError === "expresiones" &&
                      "Se identificaron inconsistencias en las operaciones aritméticas configuradas"}
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  {errorData.tipoError === "expresiones" ? (
                    /*Tabla para expresiones de validación locales */
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Formulario
                          </th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Código del Error
                          </th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Mensaje
                          </th>
                          <th className="p-3 text-center text-sm font-semibold text-gray-700 border border-gray-300">
                            Permisible
                          </th>
                          <th className="p-3 text-center text-sm font-semibold text-gray-700 border border-gray-300">
                            Necesita comentario
                          </th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Comentario (Máximo 250 caracteres)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorData.detalles.map((detalle, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 text-sm border border-gray-300">{detalle.formulario}</td>
                            <td className="p-3 text-sm border border-gray-300">{detalle.codigo}</td>
                            <td className="p-3 text-sm border border-gray-300">{detalle.mensaje || "Mensaje"}</td>
                            <td className="p-3 text-sm text-center border border-gray-300">{detalle.permisible}</td>
                            <td className="p-3 text-sm text-center border border-gray-300">
                              {detalle.necesitaComentario}
                            </td>
                            <td className="p-3 border border-gray-300">
                              <input
                                type="text"
                                value={errorComments[index] || ""}
                                onChange={(e) => handleCommentChange(index, e.target.value)}
                                placeholder="Caja de texto"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={250}
                              />
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {errorComments[index]?.length || 0}/250
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    /* Tabla para contenido de variables y completitud */
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Formulario
                          </th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Código y Nombre del Concepto
                          </th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                            Descripción (Variable y Error)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorData.detalles.map((detalle, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 text-sm border border-gray-300">{detalle.formulario}</td>
                            <td className="p-3 text-sm font-mono border border-gray-300">{detalle.concepto}</td>
                            <td className="p-3 text-sm text-red-600 border border-gray-300">{detalle.mensaje}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Define handleBackToList here if it's not imported or globally available
  const handleBackToList = () => {
    // Implement your logic to go back to the list view
    // For example, you might set a state variable or call a prop function
    console.log("Navigating back to list...")
    // If you have an onBack prop, you can call it:
    // onBack?.();
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
                            CSV - Valores separados por comas
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

      <AlertDialog open={showSimpleAlert} onOpenChange={setShowSimpleAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validaciones generales</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">{simpleAlertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSimpleAlert(false)}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alerta con opción de ver errores para otros formularios */}
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
            <AlertDialogAction
              onClick={() => {
                setShowErrorAlert(false)
                handleViewErrors() // Llamar a la función actualizada
              }}
            >
              Sí, ver errores
            </AlertDialogAction>
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

              {validationResult?.formulariosCalculados && validationResult.formulariosCalculados.length > 0 && (
                <>
                  <div className="text-gray-700 font-medium mt-4 pt-3 border-t">
                    Se generaron automáticamente los siguientes formularios calculados:
                  </div>
                  {validationResult.formulariosCalculados.map((form, index) => (
                    <div key={`calc-${index}`} className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="text-sm">
                        <span className="font-semibold">{form.nombre}:</span> {form.registros} registros
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Estado: <span className="text-yellow-600 font-medium">Pendiente en validar</span> | Tipo:{" "}
                        <span className="font-medium">Formulario</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
