"use client"

import { useState, useEffect } from "react"
import { Search, FileDown, Upload, FileText, Send, Filter, Edit, FileSpreadsheet, MoreVertical, Info } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FormularioData {
  id: string
  codigo: string
  nombre: string
  estado: string
  ultimaModificacion: string
}

interface GestionFormulariosProps {
  onEnviosClick?: (filters: any) => void
  savedFilters?: {
    entidad: string
    categoria: string
    ano: string
    periodo: string
  }
}

export default function GestionFormularios({ onEnviosClick, savedFilters }: GestionFormulariosProps) {
  console.log("[v0] GestionFormularios renderizado, savedFilters:", savedFilters)
  
  const [filtersApplied, setFiltersApplied] = useState(savedFilters?.categoria && savedFilters?.ano && savedFilters?.periodo ? true : false)
  const [filters, setFilters] = useState({
    entidad: savedFilters?.entidad || "Contaduría",
    categoria: savedFilters?.categoria || "",
    ano: savedFilters?.ano || "",
    periodo: savedFilters?.periodo || "",
  })

  useEffect(() => {
    if (savedFilters && savedFilters.categoria && savedFilters.ano && savedFilters.periodo) {
      setFilters(savedFilters)
      setFiltersApplied(true)
    }
  }, [savedFilters])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedFormularios, setSelectedFormularios] = useState<string[]>([])
  const [showExportMenu, setShowExportMenu] = useState(false)

  const formularios: FormularioData[] = [
    {
      id: "1",
      codigo: "CGN-2025-01",
      nombre: "Balance General",
      estado: "Pendiente en validar",
      ultimaModificacion: "9/11/2024",
    },
    {
      id: "2",
      codigo: "CGN-2025-02",
      nombre: "Estado de Resultados",
      estado: "Aceptado",
      ultimaModificacion: "8/11/2024",
    },
    {
      id: "3",
      codigo: "CGN-2025-03",
      nombre: "Flujo de Efectivo",
      estado: "En Validación",
      ultimaModificacion: "7/11/2024",
    },
    {
      id: "4",
      codigo: "CGN-2025-04",
      nombre: "Estado de Cambios en el Patrimonio",
      estado: "Rechazado por Formato",
      ultimaModificacion: "6/11/2024",
    },
    {
      id: "5",
      codigo: "CGN-2025-05",
      nombre: "Notas a los Estados Financieros",
      estado: "Rechazado por Deficiencia",
      ultimaModificacion: "5/11/2024",
    },
  ]

  const handleAplicarFiltros = () => {
    if (filters.categoria && filters.ano && filters.periodo) {
      setFiltersApplied(true)
      setCurrentPage(1)
    }
  }

  const filteredFormularios = filtersApplied
    ? formularios.filter(
        (f) =>
          f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const paginatedFormularios = filteredFormularios.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredFormularios.length / rowsPerPage)

  const getEstadoBadge = (estado: string) => {
    const badgeStyles: Record<string, string> = {
      Aceptado: "bg-blue-600 text-white",
      "Pendiente en validar": "bg-yellow-100 text-yellow-800",
      "En Validación": "bg-blue-600 text-white",
      "Rechazado por Formato": "bg-red-600 text-white",
      "Rechazado por Deficiencia": "bg-red-600 text-white",
      "Excepción en validación": "bg-orange-500 text-white",
    }

    return (
      <span
        className={`inline-block px-3 py-1 rounded text-xs font-medium ${badgeStyles[estado] || "bg-gray-100 text-gray-800"}`}
      >
        {estado}
      </span>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFormularios(paginatedFormularios.map((f) => f.id))
    } else {
      setSelectedFormularios([])
    }
  }

  const handleSelectFormulario = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFormularios([...selectedFormularios, id])
    } else {
      setSelectedFormularios(selectedFormularios.filter((fid) => fid !== id))
    }
  }

  const handleExport = (format: "csv" | "excel" | "pdf" | "txt") => {
    console.log(`Exportando ${selectedFormularios.length} formularios a ${format}...`)
    setShowExportMenu(false)
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {console.log("[v0] GestionFormularios rendering content, filtersApplied:", filtersApplied)}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="text-gray-700" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h2>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Entidad</label>
                <select
                  value={filters.entidad}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
                >
                  <option>Contaduría</option>
                  <option>Contraloría General de la Nación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.categoria}
                  onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione categoría</option>
                  <option>Información Contable</option>
                  <option>BDME</option>
                  <option>Operaciones Recíprocas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Año <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.ano}
                  onChange={(e) => setFilters({ ...filters, ano: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione año</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Periodo <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.periodo}
                  onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione periodo</option>
                  <option>Enero – Marzo</option>
                  <option>Abril – Junio</option>
                  <option>Julio – Septiembre</option>
                  <option>Octubre – Diciembre</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAplicarFiltros}
                disabled={!filters.categoria || !filters.ano || !filters.periodo}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {filtersApplied ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload size={16} />
                    Importar
                  </button>
                  <button
                    onClick={() => onEnviosClick?.(filters)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Envíos
                  </button>
                  <button
                    disabled={selectedFormularios.length === 0}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    Enviar
                  </button>
                  <div className="relative flex items-center gap-2">
                    <TooltipProvider>
                      <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={selectedFormularios.length === 0}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileDown size={16} />
                            Exportar
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
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
                              <p className="text-xs">• Límite de 50MB por archivo</p>
                              <p className="text-xs">• Máximo 1,048,576 filas por hoja</p>
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
                              <p className="text-xs">• Máximo 10,000 líneas por archivo</p>
                              <p className="text-xs">• Múltiples archivos automáticamente</p>
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

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          paginatedFormularios.length > 0 &&
                          paginatedFormularios.every((f) => selectedFormularios.includes(f.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Código ↕
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nombre del Formulario ↕
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado de Validación ↕
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Última Modificación ↕
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedFormularios.map((formulario) => (
                    <tr key={formulario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFormularios.includes(formulario.id)}
                          onChange={(e) => handleSelectFormulario(formulario.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formulario.codigo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formulario.nombre}</td>
                      <td className="px-6 py-4">{getEstadoBadge(formulario.estado)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formulario.ultimaModificacion}</td>
                      <td className="px-6 py-4 text-center">
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Registro manual</span>
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ingresar datos manualmente al formulario</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    <span>Generar protocolo de importación</span>
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Descargar plantilla para importación masiva</p>
                                </TooltipContent>
                              </Tooltip>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Registros por página:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600 ml-4">
                  Mostrando {(currentPage - 1) * rowsPerPage + 1} a{" "}
                  {Math.min(currentPage * rowsPerPage, filteredFormularios.length)} de {filteredFormularios.length}{" "}
                  resultados
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Primera
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seleccione los filtros de búsqueda</h3>
            <p className="text-sm text-gray-500">
              Para visualizar los formularios disponibles, debe seleccionar Categoría, Año y Período
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
