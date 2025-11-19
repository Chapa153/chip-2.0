"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight, FileDown, ChevronDown, Filter, Info, MoreVertical } from 'lucide-react'
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

const ESTADOS_SISTEMA = [
  "Pendiente en validar",
  "Rechazado por Formato",
  "En validación",
  "Rechazado por deficiencia",
  "Aceptado",
  "Excepción en validación",
] as const

const getEstadoBadgeColor = (estado: string): string => {
  switch (estado) {
    case "Aceptado":
      return "bg-green-100 text-green-800 border-green-300"
    case "Rechazado por Formato":
    case "Rechazado por deficiencia":
      return "bg-red-100 text-red-800 border-red-300"
    case "Pendiente en validar":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "En validación":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "Excepción en validación":
      return "bg-orange-100 text-orange-800 border-orange-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

const getEstadoIcon = (estado: string): string => {
  switch (estado) {
    case "Aceptado":
      return "✓"
    case "Rechazado por Formato":
    case "Rechazado por deficiencia":
      return "✕"
    case "Pendiente en validar":
      return "⏳"
    case "En validación":
      return "◷"
    case "Excepción en validación":
      return "⚠"
    default:
      return "•"
  }
}

interface Transmision {
  id: number
  idEntrada: string
  periodo: string
  ano: string
  estado: string
  categoria: string
  formulario: string
  fechaEnvio: string
  fechaRecepcion: string
  entidad?: string
  tipoVisualizacion?: "pdf" | "detalle"
}

interface TransmitidosPageProps {
  initialFilters?: {
    entidad: string
    categoria: string
    ano: string
    periodo: string
  }
  onVerDetalle: (data: {
    id_entrada: string
    entidad: string
    categoria: string
    periodo: string
    ano: string
    formulario: string
  }) => void
  onVerPdf?: (data: {
    id_entrada: string
    entidad: string
    categoria: string
    periodo: string
    ano: string
    formulario: string
  }) => void
  onBack: () => void
}

export default function TransmitidosPage({ initialFilters, onVerDetalle, onVerPdf, onBack }: TransmitidosPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [pendingExportFormat, setPendingExportFormat] = useState<"csv" | "excel" | "pdf" | "txt" | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  const entidad = initialFilters?.entidad || "Contraloría General de la Nación"
  const categoria = initialFilters?.categoria || "Categoría Financiera"
  const ano = initialFilters?.ano || "2024"
  const periodo = initialFilters?.periodo || "Enero - Marzo"

  const mockData: Transmision[] = Array.from({ length: 72 }, (_, i) => {
    let estado = ESTADOS_SISTEMA[i % 6]
    let tipoVisualizacion: "pdf" | "detalle" | undefined = undefined
    
    if (i % 10 === 0) {
      estado = "Aceptado"
      tipoVisualizacion = "pdf"
    } else if (i % 10 === 1) {
      estado = "Aceptado"
      tipoVisualizacion = "detalle"
    } else if (i % 10 === 2 || i % 10 === 3) {
      estado = "Aceptado"
      tipoVisualizacion = i % 2 === 0 ? "pdf" : "detalle"
    }

    return {
      id: i + 1,
      idEntrada: `ENT-${1000 + i}`,
      periodo: periodo,
      ano: ano,
      estado: estado,
      categoria: categoria,
      formulario: `Formulario ${(i % 5) + 1}`,
      fechaEnvio: `2024-${String(Math.floor(i / 6) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")} 10:30`,
      fechaRecepcion: `2024-${String(Math.floor(i / 6) + 1).padStart(2, "0")}-${String((i % 28) + 2).padStart(2, "0")} 14:45`,
      entidad: entidad,
      tipoVisualizacion: tipoVisualizacion,
    }
  })

  const filteredData = mockData.filter((item) => {
    const matchSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const matchEstado = filtroEstado === "todos" || item.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const contadorEstados = mockData.reduce(
    (acc, item) => {
      acc[item.estado] = (acc[item.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(currentData.map((item) => item.id))
    }
  }

  const handleExport = (format: "csv" | "excel" | "pdf" | "txt") => {
    setPendingExportFormat(format)
    setShowExportDialog(true)
    setShowExportMenu(false)
  }

  const handleConfirmExport = (scope: "all" | "current") => {
    if (!pendingExportFormat) return
    
    const dataToExport = scope === "all" ? filteredData : currentData
    console.log(`Exportando ${scope === "all" ? 'todos los registros' : 'página actual'} a ${pendingExportFormat}...`, dataToExport.length, 'registros')
    
    setShowExportDialog(false)
    setPendingExportFormat(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Envíos</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Entidad</label>
              <input
                type="text"
                value={entidad}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={categoria}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Año</label>
              <input
                type="text"
                value={ano}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Período</label>
              <input
                type="text"
                value={periodo}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="todos">Todos los estados</option>
                  {ESTADOS_SISTEMA.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Registros por página:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="relative flex items-center gap-2">
                <TooltipProvider>
                  <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                        <FileDown className="w-4 h-4" />
                        EXPORTAR
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExport("csv")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>CSV</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">CSV</p>
                          <p className="text-xs">• Sin límite de filas</p>
                          <p className="text-xs">• Encoding UTF-8</p>
                          <p className="text-xs">• Headers incluidos</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExport("excel")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>Excel (XLSX)</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">Excel (XLSX)</p>
                          <p className="text-xs">• Múltiples hojas por archivo</p>
                          <p className="text-xs">• Límite de 50MB</p>
                          <p className="text-xs">• Máximo 1M filas por hoja</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExport("pdf")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>PDF</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">PDF</p>
                          <p className="text-xs">• Máximo 10,000 líneas</p>
                          <p className="text-xs">• Múltiples archivos auto</p>
                          <p className="text-xs">• Texto seleccionable</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExport("txt")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>TXT</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">TXT</p>
                          <p className="text-xs">• Sin límite de filas</p>
                          <p className="text-xs">• Encoding UTF-8</p>
                          <p className="text-xs">• Delimitadores consistentes</p>
                        </TooltipContent>
                      </Tooltip>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === currentData.length && currentData.length > 0}
                      onChange={toggleAllRows}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID Entrada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Año</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Formulario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Envío</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Recepción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 ${selectedRows.includes(item.id) ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => toggleRowSelection(item.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{item.idEntrada}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.periodo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.ano}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getEstadoBadgeColor(item.estado)}`}
                      >
                        <span>{getEstadoIcon(item.estado)}</span>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.categoria}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.formulario}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.fechaEnvio}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.fechaRecepcion}</td>
                    <td className="px-4 py-3">
                      {item.estado === "Aceptado" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {item.tipoVisualizacion === "pdf" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  onVerPdf?.({
                                    id_entrada: item.idEntrada,
                                    entidad: item.entidad || entidad,
                                    categoria: item.categoria,
                                    periodo: item.periodo,
                                    ano: item.ano,
                                    formulario: item.formulario,
                                  })
                                }
                                className="cursor-pointer"
                              >
                                Ver PDF
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  onVerDetalle({
                                    id_entrada: item.idEntrada,
                                    entidad: item.entidad || entidad,
                                    categoria: item.categoria,
                                    periodo: item.periodo,
                                    ano: item.ano,
                                    formulario: item.formulario,
                                  })
                                }
                                className="cursor-pointer"
                              >
                                Ver Detalle
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <button disabled className="p-1 text-gray-400 cursor-not-allowed">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
              {filtroEstado !== "todos" && ` (filtrado por: ${filtroEstado})`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onBack} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Volver
          </button>
        </div>
      </div>

      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exportación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea exportar todos los registros filtrados o solo la página actual?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-4 border border-gray-300 rounded-md">
              <p className="font-semibold text-sm">Página actual</p>
              <p className="text-2xl font-bold text-blue-600">{currentData.length}</p>
              <p className="text-xs text-gray-500">registros</p>
            </div>
            <div className="p-4 border border-gray-300 rounded-md">
              <p className="font-semibold text-sm">Todos los registros</p>
              <p className="text-2xl font-bold text-blue-600">{filteredData.length}</p>
              <p className="text-xs text-gray-500">registros</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmExport("current")}>
              Página actual
            </AlertDialogAction>
            <AlertDialogAction onClick={() => handleConfirmExport("all")} className="bg-blue-600">
              Todos los registros
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
