"use client"
import { useState } from "react"
import { DialogDescription } from "@/components/ui/dialog"

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
    formulariosCalculados?: { nombre: string; registros: number }[]
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

  const [showSimpleAlert, setShowSimpleAlert] = useState(false)
  const [simpleAlertMessage, setSimpleAlertMessage] = useState("")

  const handleEnviar = async () => {
    console.log("[v0] Botón Enviar clickeado en GestionFormulariosSimple")
    console.log("[v0] Formularios seleccionados:", selectedFormularios)

    if (!canSendSelectedFormularios()) {
      toast({
        title: "Validación de estado",
        description:
          "Solo se pueden enviar formularios en estados: Pendiente en validar (P), Error de validación (E) o Excepción de validación (X)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setValidationPhase(1)

    // Fase 1: Contenido de variables
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const selectedNames = selectedFormularios
      .map((id) => formulariosState.find((f) => f.id === id)?.nombre)
      .filter(Boolean) as string[]

    // If there are errors in the selected forms (Phase 1 and 2)
    if (
      selectedNames.includes("Notas a los Estados Financieros") ||
      selectedNames.includes("Estado de Cambios en el Patrimonio")
    ) {
      setIsSubmitting(false)
      setValidationPhase(0)

      const errores: Array<{ formulario: string; concepto: string; mensaje: string }> = []

      // Data errors for Notas a los Estados Financieros
      if (selectedNames.includes("Notas a los Estados Financieros")) {
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
      if (selectedNames.includes("Estado de Cambios en el Patrimonio")) {
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
        formularios: selectedNames,
        detalles: errores,
      })

      setShowErrorAlert(true)
      return
    }

    // Fase 2: Completitud (if no errors in Phase 1)
    setValidationPhase(2)
    await new Promise((resolve) => setTimeout(resolve, 800))

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
          "• Las actividades de financiación requieren documentación adicional",
      )
      setShowSimpleAlert(true)
      return
    }

    // Fase 4: Expresiones de validación locales
    setValidationPhase(4)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (selectedNames.includes("Estado de Resultados")) {
      setIsSubmitting(false)
      setValidationPhase(0)
      setErrorData({
        formularios: ["Estado de Resultados"],
        detalles: [
          {
            formulario: "Estado de Resultados",
            concepto: "",
            mensaje: "Expresión de validación: Los ingresos operacionales deben ser mayores que los gastos",
            codigo: "ERR_001",
            permisible: "SI",
            necesitaComentario: "SI",
          },
          {
            formulario: "Estado de Resultados",
            concepto: "",
            mensaje: "Expresión de validación: El costo de ventas no puede exceder los ingresos brutos",
            codigo: "ERR_002",
            permisible: "NO",
            necesitaComentario: "NO",
          },
        ],
        tipoError: "completo",
      })
      setShowErrorAlert(true)
      return
    }

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
    tipoError?: "simple" | "completo"
  } | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [errorComments, setErrorComments] = useState<{ [key: number]: string }>({})

  const handleCommentChange = (index: number, value: string) => {
    if (value.length <= 250) {
      setErrorComments((prev) => ({ ...prev, [index]: value }))
    }
  }

  const handleBackFromErrors = () => {
    setShowErrorsView(false)
    setErrorData(null)
    setErrorComments({}) // Limpiar comentarios al volver
  }

  const handleExportErrors = (format: "csv" | "excel" | "pdf" | "txt") => {
    if (!errorData) return

    let dataToExport

    if (errorData.tipoError === "completo") {
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
      if (errorData.tipoError === "completo") {
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
        txtContent = `Reporte de Errores de Validación\n${"=".repeat(50)}\n\nEntidad: ${entidad}\nCategoría: ${categoria}\nPeríodo: ${periodo}\nAño: ${ano}\n\n${"=".repeat(50)}\n\nErrores Detectados:\n\n`
        txtContent += dataToExport
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
        errorData.tipoError === "completo"
          ? ["Formulario", "Concepto", "Mensaje", "Código", "Permisible", "NecesitaComentario", "Comentario"]
          : ["Formulario", "Concepto", "Mensaje"]
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const key = header.toLowerCase().replace(/\s+/g, "") as keyof typeof row
              const cellValue = (row[key] as string) || ""
              return `"${cellValue.replace(/"/g, '""')}"`
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
    }

    toast({
      title: "Exportación exitosa",
      description: `Los errores se han exportado en formato ${format.toUpperCase()}`,
    })
  }

  return (
    <div className="p-6">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="mb-6 bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      )}
      <h1 className="text-2xl font-semibold mb-4">Gestión de Formularios Simples</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="entidad" className="text-sm font-medium text-gray-700">
              Entidad
            </label>
            <Input id="entidad" value={entidad} disabled className="w-64" />
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="categoria" className="text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => handleFilterChange(setCategoria, e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-64"
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="ano" className="text-sm font-medium text-gray-700">
              Año
            </label>
            <select
              id="ano"
              value={ano}
              onChange={(e) => handleFilterChange(setAno, e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-32"
            >
              <option value="">Seleccionar Año</option>
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="periodo" className="text-sm font-medium text-gray-700">
              Período
            </label>
            <select
              id="periodo"
              value={periodo}
              onChange={(e) => handleFilterChange(setPeriodo, e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-48"
            >
              <option value="">Seleccionar Período</option>
              {getPeriodos().map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAplicarFiltros}
                  disabled={!categoria || !ano || !periodo}
                  className="flex items-center"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aplica los filtros seleccionados para mostrar los formularios.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" onClick={() => {}} disabled={!mostrarTabla}>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Archivo
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Permite subir un archivo para la validación de formularios.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0 bg-transparent">
                <span className="sr-only">Abrir menú</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {}}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Exportar a Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <FileDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Descargar Plantilla</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Ayuda</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mostrarTabla && (
        <>
          <div className="flex items-center justify-between py-4">
            <Input
              placeholder="Buscar formularios por nombre o ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => {}}
                      disabled={selectedFormularios.length === 0 || !canSendSelectedFormularios()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Selección
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Envía los formularios seleccionados para su validación.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {isSubmitting && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-500" />
              <span className="text-lg text-blue-500">Procesando ({validationPhase}/4)...</span>
            </div>
          )}

          {!isSubmitting && (
            <DataTable
              columns={[
                {
                  id: "select",
                  header: ({ table }) => (
                    <Checkbox
                      checked={
                        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
                      }
                      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                      aria-label="Seleccionar todo"
                    />
                  ),
                  cell: ({ row }) => (
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label={`Seleccionar fila ${row.original.id}`}
                    />
                  ),
                  enableSorting: false,
                  enableHiding: false,
                },
                {
                  accessorKey: "nombre",
                  header: "Nombre del Formulario",
                },
                {
                  accessorKey: "estado",
                  header: "Estado",
                  cell: ({ row }) => {
                    const estado = row.getValue("estado") as string
                    const color = getColorForEstado(estado)
                    return (
                      <span className={`px-2 py-1 rounded-md border text-xs font-medium ${getEstadoBadgeClass(color)}`}>
                        {estado}
                      </span>
                    )
                  },
                },
                {
                  accessorKey: "fecha",
                  header: "Fecha",
                },
                {
                  id: "actions",
                  header: "Acciones",
                  cell: ({ row }) => {
                    const formulario = row.original
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onEditForm?.(formulario.id, formulario.nombre)}>
                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateFormularioEstado(formulario.nombre)}>
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                            <span>Marcar como error</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>
                            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Ver Detalle</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  },
                },
              ]}
              data={filteredFormularios}
              onRowSelectionChange={setSelectedFormularios}
              selectedRowIds={selectedFormularios}
            />
          )}

          {/* Dialog for successful submission */}
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>¡Envío Exitoso!</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
                    <p className="text-gray-700">
                      Los siguientes formularios fueron enviados y validados exitosamente:
                    </p>
                  </div>
                  <ul className="list-disc list-inside">
                    {validationResult?.formularios.map((f) => (
                      <li key={f.nombre} className="text-sm text-gray-600">
                        {f.nombre} ({f.registros} registros)
                      </li>
                    ))}
                  </ul>
                  {validationResult?.formulariosCalculados && (
                    <>
                      <p className="text-gray-700">Se generaron automáticamente los siguientes formularios:</p>
                      <ul className="list-disc list-inside">
                        {validationResult.formulariosCalculados.map((fc) => (
                          <li key={fc.nombre} className="text-sm text-gray-600">
                            {fc.nombre} ({fc.registros} registros)
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </DialogDescription>
              <DialogFooter>
                <Button onClick={() => setShowSuccessDialog(false)}>Cerrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog for simple alerts */}
          <Dialog open={showSimpleAlert} onOpenChange={setShowSimpleAlert}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Advertencia de Validación</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <div className="whitespace-pre-wrap text-gray-700">{simpleAlertMessage}</div>
              </DialogDescription>
              <DialogFooter>
                <Button onClick={() => setShowSimpleAlert(false)}>Entendido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog for showing error alerts */}
          <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Errores de Validación Detectados</AlertDialogTitle>
                <AlertDialogDescription>
                  Los siguientes formularios presentan errores que deben ser corregidos:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowErrorAlert(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => setShowErrorDetails(true)}>Ver Detalles</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog for showing detailed error view */}
          {showErrorDetails && errorData && (
            <Dialog open={showErrorDetails} onOpenChange={() => setShowErrorDetails(false)}>
              <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalles de Errores de Validación</DialogTitle>
                  <DialogDescription>
                    A continuación se presentan los errores encontrados en los formularios.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {errorData.tipoError === "completo" ? (
                    <>
                      <div className="flex justify-end space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Exportar Errores
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportErrors("csv")}>CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportErrors("excel")}>Excel</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportErrors("pdf")}>PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportErrors("txt")}>TXT</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {errorData.detalles.map((detalle, index) => (
                          <div key={index} className="border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold">{detalle.formulario}</h3>
                              <span className="text-sm font-medium text-red-600">{detalle.codigo}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Concepto:</strong> {detalle.concepto || "N/A"}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">{detalle.mensaje}</p>
                            {detalle.permisible && (
                              <p className="text-sm text-gray-700">
                                <strong>Permisible:</strong> {detalle.permisible}
                              </p>
                            )}
                            {detalle.necesitaComentario && (
                              <>
                                <p className="text-sm text-gray-700 mt-2">
                                  <strong>Comentario:</strong>
                                </p>
                                <textarea
                                  className="w-full p-2 border rounded-md mt-1"
                                  rows={3}
                                  value={errorComments[index] || ""}
                                  onChange={(e) => handleCommentChange(index, e.target.value)}
                                  maxLength={250}
                                  placeholder="Ingrese su comentario (máx. 250 caracteres)"
                                />
                                <div className="text-right text-xs text-gray-500">
                                  {(250 - (errorComments[index]?.length || 0)).toString() /* Remaining characters */}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-end space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Exportar Errores
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportErrors("csv")}>CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportErrors("excel")}>Excel</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportErrors("pdf")}>PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportErrors("txt")}>TXT</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {errorData.detalles.map((detalle, index) => (
                        <div key={index} className="border rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{detalle.formulario}</h3>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Concepto:</strong> {detalle.concepto || "N/A"}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">{detalle.mensaje}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowErrorDetails(false)}>Volver</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  )
}
