"use client"
import { useState } from "react"
import type React from "react"

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
  FileText,
  Download,
  ChevronLeft,
  Info,
  AlertCircle,
  Mail,
  FileUp,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
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
import { toast } from "@/components/ui/use-toast" // Corregido import de toast desde use-toast en lugar de toast
import DataTable from "@/components/data-table" // Assuming DataTable is imported here
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Import Dialog components
import { Label } from "@/components/ui/label" // Import Label

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

// Define Error Types
interface ErrorDetails {
  formulario: string
  concepto: string
  mensaje: string
  codigo?: string
  permisible?: string
  necesitaComentario?: string
}

interface ErrorData {
  formularios: string[]
  contenido: ErrorDetails[]
  completitud: ErrorDetails[]
  expresiones: ErrorDetails[]
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

  // State variables for error handling and alerts
  const [showSimpleAlert, setShowSimpleAlert] = useState(false)
  const [simpleAlertMessage, setSimpleAlertMessage] = useState("")
  const [errorsSeen, setErrorsSeen] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showErrorsView, setShowErrorsView] = useState(false)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)
  const [errorComments, setErrorComments] = useState<{ [key: number]: string }>({})

  const [validationPhase, setValidationPhase] = useState(0)
  const [showCertificationDialog, setShowCertificationDialog] = useState(false)
  const [adjuntoPDF, setAdjuntoPDF] = useState<File | null>(null)
  const [nombreAdjunto, setNombreAdjunto] = useState("")
  const [errorAdjunto, setErrorAdjunto] = useState("")
  // </CHANGE>
  const [showCentralErrorDialog, setShowCentralErrorDialog] = useState(false)
  const [showEmailFormatDialog, setShowEmailFormatDialog] = useState(false)
  const [isValidatingCentral, setIsValidatingCentral] = useState(false)
  // </CHANGE>

  // Define currentView and selectedFormulario here
  const [currentView, setCurrentView] = useState("list") // Added currentView
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null) // Added selectedFormulario

  const [showBalanceSuccessDialog, setShowBalanceSuccessDialog] = useState(false)
  const [showCentralSuccessDialog, setShowCentralSuccessDialog] = useState(false)
  const [showSuccessEmailFormatDialog, setShowSuccessEmailFormatDialog] = useState(false)

  const [showReenvioDialog, setShowReenvioDialog] = useState(false)
  const [reenvioMotivo, setReenvioMotivo] = useState("")
  const [reenvioJustificacion, setReenvioJustificacion] = useState("")
  const [reenvioAction, setReenvioAction] = useState<"importar" | "registro" | null>(null)
  const [reenvioFormId, setReenvioFormId] = useState<string | null>(null)
  // </CHANGE>
  const [showEnviarAdjuntoDialog, setShowEnviarAdjuntoDialog] = useState(false)

  const [showAllFormsSuccessDialog, setShowAllFormsSuccessDialog] = useState(false)
  // </CHANGE>

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

  const getEstadosPermitidos = () => {
    return ["Pendiente en validar", "Rechazado por Deficiencia", "Excepción de validación", "En validación", "Validado"]
  }

  const canSendSelectedFormularios = (): boolean => {
    if (selectedFormularios.length === 0) return false

    // Obtener los formularios seleccionados
    const formularios = formulariosState.filter((f) => selectedFormularios.includes(f.id))

    // Verificar que todos los formularios seleccionados tengan estados válidos
    const result = formularios.every((f) => {
      const estado = f.estado
      const estadosPermitidos = getEstadosPermitidos()

      // No permitir formularios en estado Aceptado
      if (estado === "Aceptado") {
        return false
      }

      // Solo permitir estados de la lista `estadosPermitidos`
      const isValid = estadosPermitidos.some((e) => estado.startsWith(e))

      return isValid
    })

    return result
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

  // Reemplazo de `selectedForms` con `selectedFormularios` y ajuste en `handleEnviar` para usar `id` en lugar de `codigo`
  const handleEnviar = async () => {
    console.log("[v0] handleEnviar - Iniciando envío")
    const allowedStates = getEstadosPermitidos()
    console.log("[v0] Estados permitidos:", allowedStates)

    const formulariosSeleccionados = formulariosState.filter((f) => selectedFormularios.includes(f.id))
    console.log("[v0] Formularios seleccionados:", formulariosSeleccionados)

    const todosSeleccionados = formulariosSeleccionados.length === formulariosState.length
    console.log("[v0] ¿Todos los formularios seleccionados?:", todosSeleccionados)

    const todosValidados = formulariosSeleccionados.every((f) => f.estado === "Validado")
    console.log("[v0] ¿Todos los formularios validados?:", todosValidados)
    // </CHANGE>

    if (todosSeleccionados) {
      if (todosValidados) {
        console.log("[v0] Todos los formularios están validados - iniciando validación central (Fase 5)")
        setShowCertificationDialog(true)
        return
      }
      // </CHANGE>

      console.log("[v0] Todos los formularios seleccionados - iniciando validación completa con fases 1-4")
      setIsSubmitting(true)

      // Fase 1: Contenido de variables
      setValidationPhase(1)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Fase 2: Completitud
      setValidationPhase(2)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Fase 3: Validaciones generales
      setValidationPhase(3)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Fase 4: Expresiones de validación locales
      setValidationPhase(4)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSubmitting(false)
      setValidationPhase(0)

      // Actualizar todos los formularios a estado Validado
      setFormulariosState((prev) =>
        prev.map((f) => ({
          ...f,
          estado: "Validado",
          estadoColor: "green",
        })),
      )

      // Mostrar diálogo de validación exitosa
      setShowAllFormsSuccessDialog(true)
      setSelectedFormularios([])
      return
      // </CHANGE>
    }

    // Implementación de la lógica de validación con separación de errores por tipo
    setErrorsSeen(false)
    setIsSubmitting(true)
    setValidationPhase(1)

    const allErrors: Array<{
      formulario: string
      concepto: string
      mensaje: string
      codigo?: string
      permisible?: string
      necesitaComentario?: string
    }> = []

    const errorsByType: {
      contenido: typeof allErrors
      completitud: typeof allErrors
      expresiones: typeof allErrors
    } = {
      contenido: [],
      completitud: [],
      expresiones: [],
    }

    let hasInformativeAlert = false

    // Fase 1: Contenido de variables
    setValidationPhase(1) // Manteniendo la fase 1 para el flujo normal
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Fase 2: Completitud
    setValidationPhase(2)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (selectedFormularios.includes("CGN-2025-05")) {
      // Notas a los Estados Financieros
      errorsByType.contenido.push(
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
    }

    // Fase 3: Validaciones generales
    setValidationPhase(3)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (selectedFormularios.includes("CGN-2025-04")) {
      // Estado de Cambios en el Patrimonio
      errorsByType.completitud.push(
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
    }

    if (selectedFormularios.includes("CGN-2025-03")) {
      // Flujo de Efectivo
      hasInformativeAlert = true
      setSimpleAlertMessage(
        "El formulario Flujo de Efectivo presenta las siguientes validaciones generales:\n\n" +
          "• Las actividades de operación deben cuadrar con el estado de resultados\n" +
          "• Las actividades de inversión deben estar correctamente clasificadas\n" +
          "• Las actividades de financiación deben estar correctamente clasificadas",
      )
      setShowSimpleAlert(true)
    }

    // Fase 4: Expresiones de validación locales
    setValidationPhase(4)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (selectedFormularios.includes("CGN-2025-02")) {
      // Estado de Resultados
      errorsByType.expresiones.push(
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
    }

    const totalErrors =
      errorsByType.contenido.length + errorsByType.completitud.length + errorsByType.expresiones.length

    // Si hay errores en fases 1-4, mostrar errores y detener
    if (totalErrors > 0) {
      setErrorData({
        formularios: selectedFormularios
          .map((id) => {
            const form = formulariosState.find((f) => f.id === id)
            return form?.nombre || ""
          })
          .filter(Boolean),
        contenido: errorsByType.contenido,
        completitud: errorsByType.completitud,
        expresiones: errorsByType.expresiones,
      })
      setShowErrorAlert(true)
      setIsSubmitting(false)
      setValidationPhase(0)
      return
    }

    // Si hay alertas informativas y no hay errores críticos
    if (hasInformativeAlert) {
      setIsSubmitting(false)
      setValidationPhase(0)
      return
    }

    // Si no todos están seleccionados y no hay errores, marcar como enviado
    formulariosSeleccionados.forEach((form) => {
      if (form.id === "CGN-2025-01") {
        // Balance General genera formularios calculados
        const formulasCalculadas = [
          {
            id: `CALC-${Date.now()}-1`,
            nombre: "Estado de Resultados Calculado",
            tipo: "Formulario",
            estado: "Pendiente en validar",
            fecha: new Date().toLocaleDateString("es-ES"),
            estadoColor: "yellow" as const,
          },
          {
            id: `CALC-${Date.now()}-2`,
            nombre: "Flujo de Efectivo Calculado",
            tipo: "Formulario",
            estado: "Pendiente en validar",
            fecha: new Date().toLocaleDateString("es-ES"),
            estadoColor: "yellow" as const,
          },
        ]

        setFormulariosState((prev) => [...prev, ...formulasCalculadas])
        setShowBalanceSuccessDialog(true)
      }
    })

    setIsSubmitting(false)
    setValidationPhase(0)
    setSelectedFormularios([])
  }
  // </CHANGE>

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

  const hayFormulariosAceptadosCategoria = () => {
    return formulariosState.some((f) => f.estado === "Aceptado" && f.tipo === "Categoría")
  }

  // Función para manejar click en Importar
  const handleImportarClick = () => {
    if (hayFormulariosAceptadosCategoria()) {
      setReenvioAction("importar")
      setShowReenvioDialog(true)
    } else {
      // Lógica normal de importación
      alert("Funcionalidad de importación en desarrollo")
    }
  }

  // Función para manejar click en Registro Manual
  const handleRegistroManualClick = (formId: string, formName: string) => {
    const form = formulariosState.find((f) => f.id === formId)
    if (form && form.estado === "Aceptado" && form.tipo === "Categoría") {
      setReenvioFormId(formId)
      setReenvioAction("registro")
      setShowReenvioDialog(true)
    } else {
      // Lógica normal de registro manual
      onEditForm?.(formId, formName)
    }
  }

  // Función para procesar el reenvío
  const handleContinuarReenvio = () => {
    if (!reenvioMotivo || !reenvioJustificacion) {
      alert("Debe completar tanto el motivo como la justificación")
      return
    }

    if (reenvioAction === "importar") {
      // Todos los formularios quedan en "Pendiente Validar"
      setFormulariosState((prev) =>
        prev.map((f) => ({
          ...f,
          tipo: "Formulario",
          estado: "Pendiente en validar",
          estadoColor: "yellow",
          fecha: new Date().toLocaleDateString("es-ES"),
        })),
      )
      alert("Importación realizada. Todos los formularios quedaron en estado Pendiente Validar.")
    } else if (reenvioAction === "registro" && reenvioFormId) {
      // Solo el formulario seleccionado queda en "Pendiente en Validar"
      // Los demás quedan sin estado de validación
      setFormulariosState((prev) =>
        prev.map((f) => {
          if (f.id === reenvioFormId) {
            return {
              ...f,
              tipo: "Formulario",
              estado: "Pendiente en validar",
              estadoColor: "yellow",
              fecha: new Date().toLocaleDateString("es-ES"),
            }
          } else if (f.estado === "Aceptado" && f.tipo === "Categoría") {
            return {
              ...f,
              tipo: "Formulario",
              estado: "",
              estadoColor: "gray",
              fecha: "",
            }
          }
          return f
        }),
      )
      // Abrir el formulario para edición
      const form = formulariosState.find((f) => f.id === reenvioFormId)
      if (form) {
        onEditForm?.(form.id, form.nombre)
      }
    }

    // Limpiar y cerrar el diálogo
    setShowReenvioDialog(false)
    setReenvioMotivo("")
    setReenvioJustificacion("")
    setReenvioAction(null)
    setReenvioFormId(null)
  }

  const handleCancelarReenvio = () => {
    setShowReenvioDialog(false)
    setReenvioMotivo("")
    setReenvioJustificacion("")
    setReenvioAction(null)
    setReenvioFormId(null)
  }
  // </CHANGE>

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
    setErrorComments({})
    setSelectedFormularios([])
    // Los formularios mantienen su estado original para poder ser reenviados
  }

  const handleExportErrors = (format: "csv" | "excel" | "pdf" | "txt") => {
    if (!errorData) return

    let dataToExport

    // Ajuste para el nuevo tipoError
    if (errorData.expresiones && errorData.expresiones.length > 0) {
      dataToExport = errorData.expresiones.map((d, index) => ({
        Formulario: d.formulario,
        Concepto: d.concepto || "-",
        Mensaje: d.mensaje || "Mensaje",
        Codigo: d.codigo,
        Permisible: d.permisible,
        NecesitaComentario: d.necesitaComentario,
        Comentario: errorComments[index] || "",
      }))
    } else if (errorData.contenido && errorData.contenido.length > 0) {
      dataToExport = errorData.contenido.map((d) => ({
        Formulario: d.formulario,
        Concepto: d.concepto,
        Mensaje: d.mensaje,
      }))
    } else if (errorData.completitud && errorData.completitud.length > 0) {
      dataToExport = errorData.completitud.map((d) => ({
        Formulario: d.formulario,
        Concepto: d.concepto,
        Mensaje: d.mensaje,
      }))
    } else {
      return // No hay datos para exportar
    }

    console.log(`[v0] Exportando errores en formato ${format}`, dataToExport)

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `errores-validacion-${timestamp}.${format}`

    if (format === "txt") {
      let txtContent = ""
      if (errorData.expresiones && errorData.expresiones.length > 0) {
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
      } else if (errorData.contenido || errorData.completitud) {
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
        errorData.expresiones && errorData.expresiones.length > 0
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

  const handleCommentChange = (index: number, value: string) => {
    if (value.length <= 250) {
      setErrorComments((prev) => ({ ...prev, [index]: value }))
    }
  }

  // Vista de errores
  if (showErrorsView && errorData) {
    const hasContenido = errorData.contenido && errorData.contenido.length > 0
    const hasCompletitud = errorData.completitud && errorData.completitud.length > 0
    const hasExpresiones = errorData.expresiones && errorData.expresiones.length > 0

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

            {/* Header Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
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
            </div>

            {hasContenido && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Errores de Contenido de Variables</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Se detectaron problemas en la estructura y formato de los datos enviados
                    </p>
                  </div>

                  <div className="overflow-x-auto">
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
                        {errorData.contenido.map((detalle, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 text-sm border border-gray-300">{detalle.formulario}</td>
                            <td className="p-3 text-sm font-mono border border-gray-300">{detalle.concepto}</td>
                            <td className="p-3 text-sm text-red-600 border border-gray-300">{detalle.mensaje}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {hasCompletitud && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Errores de Completitud</h2>
                    <p className="text-sm text-gray-600 mt-1">Se encontraron campos requeridos sin completar</p>
                  </div>

                  <div className="overflow-x-auto">
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
                        {errorData.completitud.map((detalle, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 text-sm border border-gray-300">{detalle.formulario}</td>
                            <td className="p-3 text-sm font-mono border border-gray-300">{detalle.concepto}</td>
                            <td className="p-3 text-sm text-red-600 border border-gray-300">{detalle.mensaje}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {hasExpresiones && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Errores de Expresiones de Validación Locales</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Se identificaron inconsistencias en las operaciones aritméticas configuradas
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Formulario
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Código del Error
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Permisible
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Necesita comentario
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Comentario (Máximo 250 caracteres)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorData.expresiones.map((detalle, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 text-sm border border-gray-300">{detalle.formulario}</td>
                            <td className="p-3 text-sm border border-gray-300">{detalle.codigo}</td>
                            <td className="p-3 text-sm border border-gray-300">{detalle.mensaje}</td>
                            <td className="p-3 text-center border border-gray-300">{detalle.permisible}</td>
                            <td className="p-3 text-center border border-gray-300">{detalle.necesitaComentario}</td>
                            <td className="p-3 border border-gray-300">
                              <input
                                type="text"
                                value={errorComments[index] || ""}
                                onChange={(e) => handleCommentChange(index, e.target.value)}
                                placeholder="Caja de texto"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                maxLength={250}
                                disabled={detalle.necesitaComentario === "NO"}
                              />
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {errorComments[index]?.length || 0}/250
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setErrorAdjunto("El archivo excede el tamaño máximo permitido (10MB).")
        setAdjuntoPDF(null)
        setNombreAdjunto("")
      } else if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrorAdjunto("Solo se permiten archivos PDF.")
        setAdjuntoPDF(null)
        setNombreAdjunto("")
      } else {
        setAdjuntoPDF(file)
        setNombreAdjunto(file.name) // Set initial name
        setErrorAdjunto("")
      }
    }
  }

  const handleEnviarAdjunto = () => {
    if (adjuntoPDF && nombreAdjunto) {
      console.log("[v0] Enviando adjunto:", nombreAdjunto, adjuntoPDF.name)
      // Add attachment to form details
      setShowEnviarAdjuntoDialog(true)
    } else {
      alert("Por favor, adjunte un archivo PDF y asigne un nombre.")
    }
  }

  // Function to handle 'Validar' button click
  const handleValidarSeleccionados = () => {
    if (selectedFormularios.length === 0) {
      toast({ title: "Selección vacía", description: "Por favor, seleccione al menos un formulario para validar." })
      return
    }

    setIsSubmitting(true)
    setValidationPhase(1)

    // Simulate validation process
    setTimeout(() => {
      const formulariosSeleccionados = formulariosState.filter((f) => selectedFormularios.includes(f.id))

      // Check if Balance General is selected
      const balanceGeneralSelected = formulariosSeleccionados.some((f) => f.id === "CGN-2025-01")

      if (balanceGeneralSelected) {
        // Execute Balance General scenario: generate calculated forms
        const formulasCalculadas = [
          {
            id: `CALC-${Date.now()}-1`,
            nombre: "Estado de Resultados Calculado",
            tipo: "Formulario",
            estado: "Validado",
            fecha: new Date().toLocaleDateString("es-ES"),
            estadoColor: "green" as const,
          },
          {
            id: `CALC-${Date.now()}-2`,
            nombre: "Flujo de Efectivo Calculado",
            tipo: "Formulario",
            estado: "Validado",
            fecha: new Date().toLocaleDateString("es-ES"),
            estadoColor: "green" as const,
          },
        ]

        // Update selected forms to Validado and Formulario, and add calculated forms
        setFormulariosState((prev) => [
          ...prev.map((f) =>
            selectedFormularios.includes(f.id)
              ? { ...f, estado: "Validado", tipo: "Formulario", estadoColor: "green" as const }
              : f,
          ),
          ...formulasCalculadas,
        ])

        toast({
          title: "Validación Completa - Balance General",
          description: "Se generaron los formularios calculados y todos los formularios fueron validados exitosamente.",
        })
      } else {
        // Regular validation: update all selected forms to Validado and Formulario
        setFormulariosState((prev) =>
          prev.map((f) =>
            selectedFormularios.includes(f.id)
              ? { ...f, estado: "Validado", tipo: "Formulario", estadoColor: "green" as const }
              : f,
          ),
        )

        toast({
          title: "Validación Completa",
          description: "Los formularios seleccionados han sido validados exitosamente.",
        })
      }

      setIsSubmitting(false)
      setValidationPhase(0)
      setSelectedFormularios([])
    }, 1500)
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
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleImportarClick}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleEnviarAdjunto}
                  disabled={!adjuntoPDF || !nombreAdjunto}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Enviar Adjunto
                </Button>
                <Button variant="outline" size="sm">
                  <FileDown className="w-4 h-4 mr-2" />
                  Consultar Envíos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidarSeleccionados}
                  disabled={!canSendSelectedFormularios() || isSubmitting}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Validar
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
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
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
                            <DropdownMenuItem onClick={() => handleRegistroManualClick(form.id, form.nombre)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Registro manual
                            </DropdownMenuItem>
                            {/* </CHANGE> */}
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
                  handleViewErrors()
                }}
              >
                Sí, ver errores
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-6 max-w-md">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="text-center space-y-4 w-full">
                <h3 className="text-lg font-semibold text-gray-900">Validando formularios</h3>
                <div className="space-y-3 text-left">
                  <div
                    className={`flex items-center gap-3 ${validationPhase >= 1 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {validationPhase > 1 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : validationPhase === 1 ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-sm">1. Validaciones generales</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${validationPhase >= 2 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {validationPhase > 2 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : validationPhase === 2 ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-sm">2. Contenido de variables</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${validationPhase >= 3 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {validationPhase > 3 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : validationPhase === 3 ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-sm">3. Completitud</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${validationPhase >= 4 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {validationPhase > 4 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : validationPhase === 4 ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-sm">4. Expresiones de validación locales</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${validationPhase >= 5 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {validationPhase > 5 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : validationPhase === 5 ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-sm">5. Expresiones de validación centrales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Dialog open={showCertificationDialog} onOpenChange={setShowCertificationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Info className="w-7 h-7 text-blue-600" />
                </div>
                <DialogTitle className="text-xl font-semibold">CHIP - Mensaje del Sistema</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="font-semibold text-blue-900 text-lg mb-2">CAPTURA047</p>
                <p className="text-sm text-blue-800">Con el envío de la información, usted certifica que:</p>
              </div>

              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 ml-2">
                <li className="pl-2">Los datos básicos y los responsables de la entidad están actualizados.</li>
                <li className="pl-2">
                  La información remitida está acorde con la normatividad expedida para cada categoría.
                </li>
              </ol>

              <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-4">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="font-semibold text-amber-700">Nota:</span>
                  <span>La información Contable Pública debe reportarse en pesos.</span>
                </p>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pdf-adjunto" className="text-base font-semibold text-gray-900">
                    Adjuntar Documento de Soporte (Opcional)
                  </Label>
                  {adjuntoPDF && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAdjuntoPDF(null)
                        setNombreAdjunto("")
                        setErrorAdjunto("")
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <Label
                        htmlFor="pdf-adjunto"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Seleccionar archivo PDF
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">o arrastra y suelta aquí</p>
                    </div>
                    <Input id="pdf-adjunto" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </div>
                </div>

                {errorAdjunto && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errorAdjunto}</p>
                  </div>
                )}

                {adjuntoPDF && !errorAdjunto && (
                  <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900 truncate">{adjuntoPDF.name}</p>
                        <p className="text-xs text-green-700">{(adjuntoPDF.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-green-200">
                      <Label htmlFor="nombre-adjunto" className="text-sm font-medium text-gray-700">
                        Nombre del documento en el sistema
                      </Label>
                      <Input
                        id="nombre-adjunto"
                        value={nombreAdjunto}
                        onChange={(e) => setNombreAdjunto(e.target.value)}
                        placeholder="Ej: Certificación_Contable_2024"
                        className="bg-white border-green-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500">
                        Este nombre se usará para identificar el documento en el detalle de formularios
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Tamaño máximo: 10MB. Solo archivos en formato PDF.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCertificationDialog(false)
                  setAdjuntoPDF(null)
                  setNombreAdjunto("")
                  setErrorAdjunto("")
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (adjuntoPDF && nombreAdjunto) {
                    console.log("[v0] PDF adjunto:", nombreAdjunto, adjuntoPDF.name, "Tamaño:", adjuntoPDF.size)
                    // Save attachment info to form details
                    // This would typically be saved to the database with the form submission
                  }

                  setShowCertificationDialog(false)
                  setIsSubmitting(true)
                  setValidationPhase(5)

                  setTimeout(() => {
                    setIsSubmitting(false)
                    setValidationPhase(0)

                    // Verificar categoría para determinar éxito o error
                    if (categoria === "INFORMACIÓN PRESUPUESTAL") {
                      setShowCentralSuccessDialog(true)
                      // Actualizar todos los formularios a Categoría y Aceptado
                      setFormulariosState((prev) =>
                        prev.map((f) => ({
                          ...f,
                          tipo: "Categoría",
                          estado: "Aceptado",
                          estadoColor: "green",
                          fecha: new Date().toLocaleDateString("es-ES"),
                        })),
                      )
                    } else {
                      setShowCentralErrorDialog(true)
                      // Actualizar todos los formularios a Categoría y Rechazado por Deficiencia
                      setFormulariosState((prev) =>
                        prev.map((f) => ({
                          ...f,
                          tipo: "Categoría",
                          estado: "Rechazado por Deficiencia",
                          estadoColor: "red",
                          fecha: new Date().toLocaleDateString("es-ES"),
                        })),
                      )
                    }
                  }, 2000)
                }}
              >
                Aceptar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showBalanceSuccessDialog} onOpenChange={setShowBalanceSuccessDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Validación Exitosa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <p className="font-semibold text-green-900">
                      El formulario Balance General fue aceptado exitosamente.
                    </p>
                    <p className="text-sm text-green-800">
                      Se han generado automáticamente los siguientes formularios calculados:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-800 ml-2">
                      <li>Estado de Resultados Calculado</li>
                      <li>Flujo de Efectivo Calculado</li>
                    </ul>
                    <div className="bg-white border border-green-300 rounded p-3 mt-3">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-900">Estado:</strong> Los formularios calculados han sido
                        agregados al detalle de formularios con estado{" "}
                        <span className="font-semibold">'Pendiente en validar'</span> y tipo{" "}
                        <span className="font-semibold">'Formulario'</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowBalanceSuccessDialog(false)}>Aceptar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCentralSuccessDialog} onOpenChange={setShowCentralSuccessDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Validación Central Exitosa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <p className="font-semibold text-green-900">
                      La categoría {categoria} ha sido procesada exitosamente.
                    </p>
                    <p className="text-sm text-green-800">
                      Todos los formularios han pasado las validaciones centrales (Fase 5) correctamente.
                    </p>
                    <p className="text-sm text-gray-700 mt-3">
                      Se ha enviado un correo electrónico automático confirmando la aceptación del envío a la dirección
                      registrada de la entidad.
                    </p>
                    <div className="bg-white border border-green-300 rounded p-3 mt-3">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-900">Estado:</strong> Todos los formularios han sido actualizados
                        a tipo <span className="font-semibold">'Categoría'</span> con estado{" "}
                        <span className="font-semibold text-green-700">'Aceptado'</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCentralSuccessDialog(false)
                  setShowSuccessEmailFormatDialog(true)
                }}
              >
                Ver formato del correo
              </Button>
              <Button onClick={() => setShowCentralSuccessDialog(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCentralErrorDialog} onOpenChange={setShowCentralErrorDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Error en Validación Central
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  El envío de información fue rechazado debido a errores detectados en las{" "}
                  <span className="font-semibold">expresiones de validación centrales (Fase 5)</span>.
                </p>
                <p className="text-sm text-gray-700 mt-3">
                  Se ha enviado un correo electrónico automático con el detalle de todas las inconsistencias encontradas
                  a la dirección registrada de la entidad.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Correo enviado desde: chip@contaduria.gov.co</span>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCentralErrorDialog(false)
                  setShowEmailFormatDialog(true)
                }}
              >
                Ver formato del correo
              </Button>
              <Button onClick={() => setShowCentralErrorDialog(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEmailFormatDialog} onOpenChange={setShowEmailFormatDialog}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-500" />
                Formato del Correo - Envío Aceptado
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Header del correo */}
              <div className="border-b pb-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 w-20">De:</span>
                  <span className="text-gray-600">chip@contaduria.gov.co</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 w-20">Date:</span>
                  <span className="text-gray-600">mar, 12 ago 2025 a las 8:45</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 w-20">Subject:</span>
                  <span className="text-gray-600">
                    Envío en Estado Aceptado categoría INFORMACIÓN CONTABLE PÚBLICA - CONVERGENCIA
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 w-20">To:</span>
                  <span className="text-gray-600"></span>
                </div>
              </div>

              {/* Banner CHIP */}
              <div className="bg-[#008b8b] text-white p-6 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h2 className="text-3xl font-bold">Sistema CHIP</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm italic">Cuentas Claras, Estado Transparente</p>
                </div>
              </div>

              {/* Contenido del correo */}
              <div className="bg-white border rounded-b-lg p-6 space-y-4 text-sm">
                <p className="font-semibold">Doctor(a)</p>
                <p className="font-semibold">GABRIELA MORENO ALBA</p>
                <p>Contador</p>
                <p>Jenesano</p>
                <p className="mb-4">JENESANO - DEPARTAMENTO DE BOYACA</p>

                <p className="italic text-gray-600">Este es un correo automático que genera el sistema CHIP</p>

                <p className="mt-4">Cordial saludo,</p>

                <p className="mt-4">Respetado(a) Doctor(a):</p>

                <p className="mt-4 font-semibold">
                  La Contaduría General de la Nación se permite informarle que su envío fue Aceptado.
                </p>

                <div className="mt-4 space-y-1">
                  <p>
                    <strong>Categoría:</strong> INFORMACIÓN CONTABLE PÚBLICA - CONVERGENCIA
                  </p>
                  <p>
                    <strong>Formularios y</strong> REPORTE DE ESTADOS FINANCIEROS
                  </p>
                  <p>
                    <strong>Periodo:</strong> Oct-Dic
                  </p>
                  <p>
                    <strong>Año:</strong> 2024
                  </p>
                  <p>
                    <strong>Recepción:</strong> 2025-08-12
                  </p>
                  <p>
                    <strong>Radicado (Id) de Envío:</strong> 4589500
                  </p>
                </div>

                <p className="mt-6">Atentamente,</p>

                <div className="mt-4 pt-4 border-t space-y-1 text-xs text-gray-600">
                  <p className="font-semibold">Contaduría General de la Nación</p>
                  <p className="text-blue-600 underline">chip@contaduria.gov.co</p>
                  <p>Calle 26 No 69 - 76, Edificio Elemento</p>
                  <p>Torre 1 (Aire) - Piso 15, Bogotá D.C. Colombia</p>
                  <p>Código Postal: 111071</p>
                  <p>PBX: +57 (601) 492 6400</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSuccessEmailFormatDialog(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEnviarAdjuntoDialog} onOpenChange={setShowEnviarAdjuntoDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <DialogTitle className="text-lg">Adjunto Enviado</DialogTitle>
              </div>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-700">
                El archivo <span className="font-semibold">{nombreAdjunto}</span> ha sido enviado exitosamente y se ha
                agregado al detalle de los formularios.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowEnviarAdjuntoDialog(false)}>Aceptar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
