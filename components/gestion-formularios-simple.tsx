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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GestionFormulariosSimpleProps {
  onEditForm?: (formId: string, formName: string) => void
  filtrosPrevios?: {
    entidad?: string
    categoria?: string
    ano?: string
    periodo?: string
  }
  onFiltrosChange?: (filtros: { categoria?: string; ano?: string; periodo?: string }) => void
}

export default function GestionFormulariosSimple({
  onEditForm,
  filtrosPrevios,
  onFiltrosChange,
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
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
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

  const handleEnviar = async () => {
    console.log("[v0] Botón Enviar clickeado en GestionFormulariosSimple")
    console.log("[v0] Formularios seleccionados:", selectedFormularios)
    console.log("[v0] Categoría actual:", categoria)

    setIsSubmitting(true)

    // Simular proceso de validación (2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Si es categoría de Información Contable Convergencia, mostrar mensaje específico
    if (categoria === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      const formulariosEnviados = formulariosState
        .filter((f) => selectedFormularios.includes(f.id))
        .map((f) => ({
          nombre: f.nombre,
          registros: Math.floor(Math.random() * 200) + 50, // Simular cantidad de registros
        }))

      setFormularios((prev) => prev.map((f) => (selectedFormularios.includes(f.id) ? { ...f, estado: "Validado" } : f)))

      setValidationResult({ formularios: formulariosEnviados })
      setShowSuccessDialog(true)
      console.log("[v0] Mostrando diálogo de validación exitosa")
    }

    setIsSubmitting(false)
    console.log("[v0] Proceso de envío finalizado")
  }

  return (
    <div className="p-6 space-y-6">
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
                        <DropdownMenuItem className="cursor-pointer">
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
                        <DropdownMenuItem className="cursor-pointer">
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
                        <DropdownMenuItem className="cursor-pointer">
                          <FileDown className="w-4 h-4 mr-2" />
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
                        <DropdownMenuItem className="cursor-pointer">
                          <FileDown className="w-4 h-4 mr-2" />
                          TXT
                          <HelpCircle className="w-3 h-3 ml-auto text-gray-400" />
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">TXT - Sin límite de filas</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            <li>Encoding UTF-8</li>
                            <li>Delimitador: punto y coma (;)</li>
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
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedFormularios.includes(form.id)}
                        onChange={() => handleToggleSelectFormulario(form.id)}
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

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Enviando a validación</h3>
              <p className="text-sm text-gray-600">
                Por favor espere mientras se procesa la información del formulario...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
