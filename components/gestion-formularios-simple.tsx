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
  FileUp,
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
  codigo?: string // Agregado para el nuevo tipo de error
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
  const [errorData, setErrorData] = useState<ErrorData | null>(null)
  const [errorComments, setErrorComments] = useState<{ [key: number]: string }>({})
  const [showErrorsView, setShowErrorsView] = useState(false) // Declared showErrorsView
  const [showEmailFormatDialog, setShowEmailFormatDialog] = useState(false)
  const [showErrorEmailFormatDialog, setShowErrorEmailFormatDialog] = useState(false)
  const [showSuccessEmailFormatDialog, setShowSuccessEmailFormatDialog] = useState(false)
  // </CHANGE>
  const [showEnviarAdjuntoDialog, setShowEnviarAdjuntoDialog] = useState(false)
  const [adjuntoEnviarPDF, setAdjuntoEnviarPDF] = useState<File | null>(null)
  const [nombreAdjuntoEnviar, setNombreAdjuntoEnviar] = useState("")
  const [archivoSubidoEnviar, setArchivoSubidoEnviar] = useState(false)
  // </CHANGE>

  const [validationPhase, setValidationPhase] = useState(0)
  const [showCertificationDialog, setShowCertificationDialog] = useState(false)
  const [adjuntoPDF, setAdjuntoPDF] = useState<File | null>(null)
  const [nombreAdjunto, setNombreAdjunto] = useState("")
  const [errorAdjunto, setErrorAdjunto] = useState("")
  // </CHANGE>
  const [showCentralErrorDialog, setShowCentralErrorDialog] = useState(false)
  const [isValidatingCentral, setIsValidatingCentral] = useState(false)
  // </CHANGE>

  // Define currentView and selectedFormulario here
  const [currentView, setCurrentView] = useState("list") // Added currentView
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null) // Added selectedFormulario

  const [showBalanceSuccessDialog, setShowBalanceSuccessDialog] = useState(false)
  const [showCentralSuccessDialog, setShowCentralSuccessDialog] = useState(false)
  const [balanceValidatedFormularios, setBalanceValidatedFormularios] = useState<string[]>([])
  const [archivoSubido, setArchivoSubido] = useState(false)
  // </CHANGE>

  const [showReenvioDialog, setShowReenvioDialog] = useState(false)
  const [reenvioMotivo, setReenvioMotivo] = useState("")
  const [reenvioJustificacion, setReenvioJustificacion] = useState("")
  const [reenvioAction, setReenvioAction] = useState<"importar" | "registro" | null>(null)
  const [reenvioFormId, setReenvioFormId] = useState<string | null>(null)
  // </CHANGE>

  // </CHANGE>

  // const [archivoSubido, setArchivoSubido] = useState(false) // Duplicated, removed

  const [formulariosState, setFormulariosState] = useState<Formulario[]>([
    // Renombrado a setFormulariosState para evitar conflicto
    {
      id: "CGN-2025-01",
      nombre: "Balance General",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "9/11/2024",
      estadoColor: "yellow",
      codigo: "CGN-2025-01", // Added for filtering logic
    },
    {
      id: "CGN-2025-02",
      nombre: "Estado de Resultados",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "8/11/2024",
      estadoColor: "yellow",
      codigo: "CGN-2025-02", // Added for filtering logic
    },
    {
      id: "CGN-2025-03",
      nombre: "Flujo de Efectivo",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "7/11/2024",
      estadoColor: "yellow",
      codigo: "CGN-2025-03", // Added for filtering logic
    },
    {
      id: "CGN-2025-04",
      nombre: "Estado de Cambios en el Patrimonio",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "6/11/2024",
      estadoColor: "yellow",
      codigo: "CGN-2025-04", // Added for filtering logic
    },
    {
      id: "CGN-2025-05",
      nombre: "Notas a los Estados Financieros",
      tipo: "Formulario",
      estado: "Pendiente en validar",
      fecha: "5/11/2024",
      estadoColor: "yellow",
      codigo: "CGN-2025-05", // Added for filtering logic
    },
    {
      id: "CGN-2025-06",
      nombre: "Información Complementaria",
      tipo: "Formulario",
      estado: "Rechazado por Deficiencia",
      fecha: "4/11/2024",
      estadoColor: "red",
      codigo: "CGN-2025-06", // Added for filtering logic
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

  const canValidateSelectedFormularios = () => {
    if (selectedFormularios.length === 0) return false

    const formulariosSeleccionados = formulariosState.filter((f) => selectedFormularios.includes(f.id))

    // Habilitar si hay al menos un formulario con estado diferente a Validado o Aceptado
    return formulariosSeleccionados.some((f) => f.estado !== "Validado" && f.estado !== "Aceptado")
  }

  const canSendSelectedFormularios = (): boolean => {
    if (filteredFormularios.length === 0) return false

    // Regla 1: Todos los formularios filtrados están en estado Validado
    const todosValidados = filteredFormularios.every((f) => f.estado === "Validado")

    // Regla 2: Los registros de tipo Categoría están en cualquier estado excepto Aceptado
    const categorias = filteredFormularios.filter((f) => f.tipo === "Categoría")
    const categoriasValidas = categorias.length > 0 && categorias.every((f) => f.estado !== "Aceptado")

    // Se habilita si se cumple al menos una de las dos reglas
    return todosValidados || categoriasValidas
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

  const handleEnviar = () => {
    console.log("[v0] Botón Enviar - Mostrando diálogo de certificación para categoría:", categoria)
    setShowCertificationDialog(true)
    // </CHANGE>
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
    console.log("[v0] handleEnviarAdjunto ejecutado")
    console.log("[v0] showEnviarAdjuntoDialog actual:", showEnviarAdjuntoDialog)
    // Abrir diálogo con funcionalidad de adjuntar
    setShowEnviarAdjuntoDialog(true)
    console.log("[v0] setShowEnviarAdjuntoDialog(true) llamado")
  }
  // </CHANGE>

  const handleFileSelectEnviar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log("[v0] No se seleccionó ningún archivo")
      return
    }

    console.log("[v0] Archivo seleccionado:", file.name, "Tamaño:", file.size)

    // Validar tamaño máximo (20MB)
    const maxSize = 20 * 1024 * 1024 // 20MB en bytes
    if (file.size > maxSize) {
      alert("El archivo excede el tamaño máximo permitido de 20MB.")
      e.target.value = ""
      return
    }

    // Validar extensión PDF
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Solo se permiten archivos PDF.")
      e.target.value = ""
      return
    }

    const fileName = file.name.toLowerCase()
    console.log("[v0] Iniciando validaciones para:", fileName)

    // Escenario 1: Resolución2021.pdf - Simular PDF no válido
    if (fileName.includes("2021")) {
      console.log("[v0] Detectado archivo 2021 - Simulando PDF inválido")
      alert("El archivo no es un PDF válido. Por favor, seleccione un archivo PDF correcto.")
      e.target.value = ""
      setAdjuntoEnviarPDF(null)
      setNombreAdjuntoEnviar("")
      setArchivoSubidoEnviar(false)
      return
    }

    // Escenario 2: Resolución2022.pdf - Simular contenido ejecutable
    if (fileName.includes("2022")) {
      console.log("[v0] Detectado archivo 2022 - Simulando contenido ejecutable")
      alert("El PDF contiene contenido ejecutable o archivos embebidos peligrosos. No se permite su carga.")
      e.target.value = ""
      setAdjuntoEnviarPDF(null)
      setNombreAdjuntoEnviar("")
      setArchivoSubidoEnviar(false)
      return
    }

    // Escenario 3: Resolución2023.pdf - Simular PDF encriptado
    if (fileName.includes("2023")) {
      console.log("[v0] Detectado archivo 2023 - Simulando PDF encriptado")
      alert("El PDF está encriptado o protegido con contraseña. No se permite su carga.")
      e.target.value = ""
      setAdjuntoEnviarPDF(null)
      setNombreAdjuntoEnviar("")
      setArchivoSubidoEnviar(false)
      return
    }

    // Escenario 4: Resolución2024.pdf - Simular conflicto de concurrencia
    if (fileName.includes("2024")) {
      console.log("[v0] Detectado archivo 2024 - Simulando conflicto de concurrencia")
      alert(
        "No se puede cargar el archivo. Otro usuario actualizó el mismo contexto. Por favor, recargue la página e intente nuevamente.",
      )
      e.target.value = ""
      setAdjuntoEnviarPDF(null)
      setNombreAdjuntoEnviar("")
      setArchivoSubidoEnviar(false)
      return
    }

    // Si pasa todas las validaciones
    console.log("[v0] Archivo válido. Listo para subir.")
    setAdjuntoEnviarPDF(file)
    setNombreAdjuntoEnviar(file.name)
    setArchivoSubidoEnviar(false)
  }

  const handleUploadFileEnviar = () => {
    if (adjuntoEnviarPDF) {
      setArchivoSubidoEnviar(true)

      const nuevoFormulario = {
        id: `ADJ-${Date.now()}`,
        nombre: "Documentación Adicional",
        tipo: "Categoría",
        estado: "Validado",
        fecha: new Date().toLocaleDateString("es-CO"),
        estadoColor: "green" as const,
      }

      console.log("[v0] Creando formulario desde Enviar adjunto:", nuevoFormulario)
      setFormulariosState((prev) => [...prev, nuevoFormulario])
    }
  }

  const handleCancelFileEnviar = () => {
    console.log("[v0] Cancelando archivo")
    setAdjuntoEnviarPDF(null)
    setNombreAdjuntoEnviar("")
    setArchivoSubidoEnviar(false)
    const fileInput = document.getElementById("file-input-enviar") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }
  // </CHANGE>

  // Function to handle 'Validar' button click
  const handleValidarSeleccionados = async () => {
    const formulariosSeleccionados = formulariosState.filter((f) => selectedFormularios.includes(f.id))
    const formulariosAValidar = formulariosSeleccionados.filter(
      (f) => f.estado !== "Validado" && f.estado !== "Aceptado",
    )

    if (formulariosAValidar.length === 0) {
      setSimpleAlertMessage("No hay formularios seleccionados disponibles para validar.")
      setShowSimpleAlert(true)
      return
    }

    // Iniciar loading y mostrar capas de carga con fases
    setIsSubmitting(true)

    // Determinar qué tipo de evento ejecutar según los formularios seleccionados
    const nombresFormularios = formulariosAValidar.map((f) => f.nombre)
    const todosLosFormularios = selectedFormularios.length === filteredFormularios.length

    if (selectedFormularios.length === filteredFormularios.length) {
      console.log("[v0] Todos los formularios seleccionados: Validación exitosa completa")
      setValidationPhase(1)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(2)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(3)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(4)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(0)

      // Obtener nombres de los formularios validados (solo los normales, no calculados)
      const formulariosValidados = formulariosAValidar
        .filter((f) => !f.nombre.includes("Calculado"))
        .map((f) => f.nombre)

      // Actualizar estado solo de formularios NO calculados
      const updatedFormularios = formulariosState.map((form) => {
        const esFormularioSeleccionado = formulariosAValidar.some((f) => f.id === form.id)
        const esCalculado = form.nombre.includes("Calculado")

        if (esFormularioSeleccionado && !esCalculado) {
          return {
            ...form,
            estado: "Validado",
            tipo: "Formulario",
            fecha: new Date().toLocaleDateString("es-CO"),
            estadoColor: "green" as const,
          }
        }
        return form
      })

      // Generar formularios calculados si Balance General está incluido
      const tieneBalanceGeneral = formulariosAValidar.some((f) => f.nombre === "Balance General")
      if (tieneBalanceGeneral) {
        const nuevosCalculados = [
          {
            id: `CALC-${Date.now()}-1`,
            codigo: `CALC-17653753363416-1`,
            nombre: "Estado de Resultados Calculado",
            tipo: "Formulario" as const,
            estado: "Pendiente en validar",
            estadoColor: "yellow" as const,
            fecha: new Date().toLocaleDateString("es-CO"),
          },
          {
            id: `CALC-${Date.now()}-2`,
            codigo: `CALC-17653753363430-2`,
            nombre: "Flujo de Efectivo Calculado",
            tipo: "Formulario" as const,
            estado: "Pendiente en validar",
            estadoColor: "yellow" as const,
            fecha: new Date().toLocaleDateString("es-CO"),
          },
        ]
        setFormulariosState([...updatedFormularios, ...nuevosCalculados])
      } else {
        setFormulariosState(updatedFormularios)
      }

      // Mostrar mensaje con lista de formularios validados
      setBalanceValidatedFormularios(formulariosValidados)
      setIsSubmitting(false)
      setShowBalanceSuccessDialog(true)
      return
    }

    // 2. Balance General: validación exitosa y generación de formularios calculados (un solo formulario)
    if (nombresFormularios.includes("Balance General") && formulariosAValidar.length === 1) {
      console.log("[v0] Evento Balance General: Validación exitosa (un formulario)")

      // Mostrar fases de validación
      setValidationPhase(1)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(2)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(3)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(4)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationPhase(0)

      // Actualizar solo el formulario Balance General seleccionado
      const updatedFormularios = formulariosState.map((form) => {
        if (formulariosAValidar.some((f) => f.id === form.id)) {
          return {
            ...form,
            estado: "Validado",
            tipo: "Formulario",
            fecha: new Date().toLocaleDateString("es-CO"),
            estadoColor: "green" as const,
          }
        }
        return form
      })

      // Generar formularios calculados con estado "Pendiente en validar"
      const formulariosCalculados: Formulario[] = [
        {
          id: "CALC-17653753363416-1",
          nombre: "Estado de Resultados Calculado",
          tipo: "Formulario",
          estado: "Pendiente en validar",
          fecha: new Date().toLocaleDateString("es-CO"),
          estadoColor: "yellow" as const,
        },
        {
          id: "CALC-17653753363430-2",
          nombre: "Flujo de Efectivo Calculado",
          tipo: "Formulario",
          estado: "Pendiente en validar",
          fecha: new Date().toLocaleDateString("es-CO"),
          estadoColor: "yellow" as const,
        },
      ]

      setFormulariosState([...updatedFormularios, ...formulariosCalculados])
      setIsSubmitting(false)
      setShowBalanceSuccessDialog(true)
      return
    }

    // 3. Estado de Resultados: validaciones generales (NO cambia estado)
    if (nombresFormularios.includes("Estado de Resultados")) {
      console.log("[v0] Evento Estado de Resultados: Validaciones generales")
      setValidationPhase(3) // Solo fase 3: Validaciones generales
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setValidationPhase(0)
      setIsSubmitting(false)

      // NO cambiar estado del formulario, solo mostrar mensaje
      setSimpleAlertMessage(
        `Validaciones generales completadas exitosamente para ${formulariosAValidar.length} formulario(s).`,
      )
      setShowSimpleAlert(true)
      return
    }

    // 4. Flujo de Efectivo: errores de datos
    if (nombresFormularios.includes("Flujo de Efectivo")) {
      console.log("[v0] Evento Flujo de Efectivo: Errores de datos")
      setValidationPhase(1) // Fase 1: Validación de contenido/datos
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setValidationPhase(0)

      const contenidoErrors: ErrorDetails[] = [
        {
          formulario: "CGN-2025-03",
          concepto: "Flujo de efectivo por actividades operativas",
          mensaje: "Variable 3101: El valor debe ser numérico positivo",
        },
        {
          formulario: "CGN-2025-03",
          concepto: "Efectivo recibido de clientes",
          mensaje: "Variable 3102: Formato incorrecto, se esperaba formato numérico",
        },
      ]

      setErrorData({
        formularios: formulariosAValidar.map((f) => f.id),
        contenido: contenidoErrors,
        completitud: [],
        expresiones: [],
      })

      const updatedFormulariosConErrores = formulariosState.map((form) => {
        if (formulariosAValidar.some((f) => f.id === form.id)) {
          return {
            ...form,
            estado: "Rechazado por Deficiencia",
            tipo: "Categoría",
            fecha: new Date().toLocaleDateString("es-CO"),
            estadoColor: "red" as const,
          }
        }
        return form
      })
      setFormulariosState(updatedFormulariosConErrores)

      setIsSubmitting(false)
      // Mostrar primero la alerta, luego la interfaz de errores al hacer clic en "Ver Errores"
      setShowErrorAlert(true)
      return
    }

    // 5. Estado de Cambios en el Patrimonio: errores de completitud
    if (nombresFormularios.includes("Estado de Cambios en el Patrimonio")) {
      console.log("[v0] Evento Estado de Cambios: Errores de completitud")
      setValidationPhase(2) // Fase 2: Validación de completitud
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setValidationPhase(0)

      const completitudErrors: ErrorDetails[] = [
        {
          formulario: "CGN-2025-04",
          concepto: "Capital social",
          mensaje: "Falta diligenciar el campo 'Saldo Inicial'",
        },
        {
          formulario: "CGN-2025-04",
          concepto: "Reservas",
          mensaje: "El campo 'Movimientos del período' está incompleto",
        },
      ]

      setErrorData({
        formularios: formulariosAValidar.map((f) => f.id),
        contenido: [],
        completitud: completitudErrors,
        expresiones: [],
      })

      const updatedFormulariosConErrores = formulariosState.map((form) => {
        if (formulariosAValidar.some((f) => f.id === form.id)) {
          return {
            ...form,
            estado: "Rechazado por Deficiencia",
            tipo: "Categoría",
            fecha: new Date().toLocaleDateString("es-CO"),
            estadoColor: "red" as const,
          }
        }
        return form
      })
      setFormulariosState(updatedFormulariosConErrores)

      setIsSubmitting(false)
      // Mostrar primero la alerta, luego la interfaz de errores al hacer clic en "Ver Errores"
      setShowErrorAlert(true)
      return
    }

    if (nombresFormularios.includes("Notas a los Estados Financieros")) {
      console.log("[v0] Evento Notas: Errores de validación local")
      setValidationPhase(4) // Fase 4: Expresiones de validación local
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setValidationPhase(0)

      const expresionesErrors: ErrorDetails[] = [
        {
          formulario: "CGN-2025-05",
          concepto: "Nota 1 - Políticas contables",
          mensaje: "Expresión E001: Total activos debe ser mayor que cero",
          codigo: "E001",
          permisible: "NO",
          necesitaComentario: "NO",
        },
        {
          formulario: "CGN-2025-05",
          concepto: "Nota 3 - Inventarios",
          mensaje: "Expresión E003: La suma de inventarios no coincide con el total declarado",
          codigo: "E003",
          permisible: "NO",
          necesitaComentario: "SI",
        },
      ]

      setErrorData({
        formularios: formulariosAValidar.map((f) => f.id),
        contenido: [],
        completitud: [],
        expresiones: expresionesErrors,
      })

      const updatedFormulariosConErrores = formulariosState.map((form) => {
        if (formulariosAValidar.some((f) => f.id === form.id)) {
          return {
            ...form,
            estado: "Rechazado por Deficiencia",
            tipo: "Categoría",
            fecha: new Date().toLocaleDateString("es-CO"),
            estadoColor: "red" as const,
          }
        }
        return form
      })
      setFormulariosState(updatedFormulariosConErrores)

      setIsSubmitting(false)
      // Mostrar primero la alerta, luego la interfaz de errores al hacer clic en "Ver Errores"
      setShowErrorAlert(true)
      return
    }

    // Caso por defecto: validación exitosa simple
    setValidationPhase(0)
    const updatedFormularios = formulariosState.map((form) => {
      if (formulariosAValidar.some((f) => f.id === form.id)) {
        return {
          ...form,
          estado: "Validado",
          tipo: "Formulario",
          fecha: new Date().toLocaleDateString("es-CO"),
          estadoColor: "green" as const,
        }
      }
      return form
    })

    setFormulariosState(updatedFormularios)
    setIsSubmitting(false)
    setSimpleAlertMessage(`${formulariosAValidar.length} formulario(s) validado(s) exitosamente.`)
    setShowSimpleAlert(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Filtros de Búsqueda */}
      <div className="p-6 space-6">
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
                  // </CHANGE> Eliminando condición disabled del botón Enviar adjunto para que esté siempre habilitado
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
                  // Usar la nueva función canValidateSelectedFormularios para habilitar el botón
                  disabled={!canValidateSelectedFormularios() || isSubmitting}
                  // </CHANGE>
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Validar
                    </>
                  )}
                  {/* </CHANGE> */}
                </Button>
                <Button
                  onClick={handleEnviar}
                  disabled={!canSendSelectedFormularios() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
                {/* </CHANGE> */}
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
                        checked={
                          selectedFormularios.length === 0
                            ? false
                            : selectedFormularios.length === filteredFormularios.length
                        }
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

        {/* </CHANGE> Aplicando estilo PrimeNG al diálogo de certificación */}
        <Dialog open={showCertificationDialog} onOpenChange={setShowCertificationDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <DialogTitle className="text-lg font-semibold text-gray-900">CHIP - Mensaje del Sistema</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">CAPTURA047</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Con el envío de la información, usted certifica que:
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-2">
                  <span className="text-blue-600 font-semibold">1.</span>
                  <p>Los datos básicos y los responsables de la entidad están actualizados.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 font-semibold">2.</span>
                  <p>La información que acaba de reportar está completa y es expedida en cada categoría.</p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                <p className="text-sm text-amber-800 font-medium">
                  Nota: La información Contable Pública debe reportarse en pesos.
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-base font-semibold text-gray-900 mb-2">Adjuntar Documento</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Permite adjuntar documento PDF con información adicional o soporte.{" "}
                  <span className="font-medium text-gray-700">Tamaño máximo: 20MB</span>
                </p>

                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium">Seleccionar</span>
                      </div>
                    </label>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          console.log("[v0] Archivo seleccionado:", file.name, "Tamaño:", file.size)

                          const maxSize = 20 * 1024 * 1024
                          if (file.size > maxSize) {
                            console.log("[v0] Rechazo: archivo excede 20MB")
                            alert(
                              "El archivo excede el tamaño máximo permitido de 20MB. Por favor seleccione un archivo más pequeño.",
                            )
                            e.target.value = ""
                            return
                          }

                          const fileName = file.name.toLowerCase()

                          if (fileName.includes("2021")) {
                            console.log("[v0] Validando PDF header para archivo 2021...")
                            console.log("[v0] Rechazo: no es un PDF válido (header inválido detectado)")
                            alert("El archivo seleccionado no corresponde a un PDF válido.")
                            e.target.value = ""
                            setAdjuntoPDF(null)
                            setNombreAdjunto("")
                            setArchivoSubido(false)
                            return
                          }

                          if (fileName.includes("2022")) {
                            console.log("[v0] Validando contenido ejecutable para archivo 2022...")
                            console.log("[v0] Rechazo: contenido ejecutable detectado")
                            alert(
                              "El archivo no es permitido por políticas de seguridad. El PDF contiene acciones automáticas, contenido ejecutable o archivos adjuntos embebidos.",
                            )
                            e.target.value = ""
                            setAdjuntoPDF(null)
                            setNombreAdjunto("")
                            setArchivoSubido(false)
                            return
                          }

                          if (fileName.includes("2023")) {
                            console.log("[v0] Validando encriptación para archivo 2023...")
                            console.log("[v0] Rechazo: PDF encriptado detectado")
                            alert(
                              "No se permiten PDFs protegidos o encriptados por políticas de importación. Por favor, seleccione un archivo sin protección.",
                            )
                            e.target.value = ""
                            setAdjuntoPDF(null)
                            setNombreAdjunto("")
                            setArchivoSubido(false)
                            return
                          }

                          if (fileName.includes("2024")) {
                            console.log("[v0] Validando concurrencia para archivo 2024...")
                            console.log("[v0] Rechazo: registro actualizado por otro usuario")
                            alert(
                              "El adjunto fue actualizado por otro usuario. Recargue la información e intente nuevamente.",
                            )
                            e.target.value = ""
                            setAdjuntoPDF(null)
                            setNombreAdjunto("")
                            setArchivoSubido(false)
                            return
                          }

                          console.log("[v0] Archivo listo para subir:", file.name)
                          setAdjuntoPDF(file)
                          setNombreAdjunto(file.name)
                          setArchivoSubido(false)
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={!adjuntoPDF || archivoSubido}
                      onClick={() => {
                        if (adjuntoPDF) {
                          setArchivoSubido(true)
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        Subir
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjuntoPDF(null)
                        setNombreAdjunto("")
                        setArchivoSubido(false)
                        const input = document.getElementById("pdf-upload") as HTMLInputElement
                        if (input) input.value = ""
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </span>
                    </button>
                  </div>

                  <div className="text-center py-4">
                    {archivoSubido ? (
                      <div className="border-2 border-green-500 bg-green-50 rounded-md p-3">
                        <p className="text-sm text-green-700 font-medium">
                          Archivo cargado exitosamente: {nombreAdjunto}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-orange-700">
                        {adjuntoPDF
                          ? `Archivo seleccionado: ${nombreAdjunto}`
                          : "Arrastra y suelta archivos aquí para cargar."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Formularios seleccionados validados:</strong>
                </p>
                <ul className="mt-2 space-y-1">
                  {selectedFormularios
                    .filter((id) => {
                      const form = formulariosState.find((f) => f.id === id)
                      return form?.estado === "Validado"
                    })
                    .map((id) => {
                      const form = formulariosState.find((f) => f.id === id)
                      return (
                        <li key={id} className="text-sm text-blue-700">
                          • {form?.id} - {form?.nombre}
                        </li>
                      )
                    })}
                </ul>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 mt-6">
              {archivoSubidoEnviar ? (
                <Button
                  onClick={() => {
                    setShowEnviarAdjuntoDialog(false)
                    handleCancelFileEnviar()
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Cerrar
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEnviarAdjuntoDialog(false)
                      handleCancelFileEnviar()
                    }}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {/* </CHANGE> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* </CHANGE> */}

        <Dialog open={isSubmitting && validationPhase > 0} onOpenChange={(open) => !open && setIsSubmitting(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                Procesando validaciones
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                {validationPhase === 1 && "Validando contenido de variables..."}
                {validationPhase === 2 && "Verificando completitud de datos..."}
                {validationPhase === 3 && "Ejecutando validaciones generales..."}
                {validationPhase === 4 && "Aplicando expresiones de validación local..."}
                {validationPhase === 5 && "Validando expresiones centrales..."}
              </p>
              <div className="flex gap-2 justify-center">
                <div className={`w-3 h-3 rounded-full ${validationPhase >= 1 ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className={`w-3 h-3 rounded-full ${validationPhase >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className={`w-3 h-3 rounded-full ${validationPhase >= 3 ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className={`w-3 h-3 rounded-full ${validationPhase >= 4 ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className={`w-3 h-3 rounded-full ${validationPhase >= 5 ? "bg-blue-600" : "bg-gray-300"}`} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
