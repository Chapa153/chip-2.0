"use client"

import { useState, useMemo } from "react"
import { Search, Filter, ArrowUpDown, X, Check } from "lucide-react"
import { getDepartamentos, getMunicipios } from "@/lib/colombia-data"

interface Entidad {
  id: string
  codigo: string
  nit: string
  razonSocial: string
  departamento: string
  municipio: string
}

interface DirectorioEntidadesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (entidad: Entidad | null) => void
  selectedEntidad?: Entidad | null
}

// Mock data for entities
const mockEntidades: Entidad[] = [
  {
    id: "1",
    codigo: "210173001",
    nit: "801.012.345-0",
    razonSocial: "Gobernación del Tolima",
    departamento: "Tolima",
    municipio: "Ibagué",
  },
  {
    id: "2",
    codigo: "210105001",
    nit: "890.905.211-0",
    razonSocial: "Alcaldía de Medellín",
    departamento: "Antioquia",
    municipio: "Medellín",
  },
  {
    id: "3",
    codigo: "210111001",
    nit: "899.999.061-9",
    razonSocial: "Alcaldía Mayor de Bogotá",
    departamento: "Cundinamarca",
    municipio: "Bogotá",
  },
  {
    id: "4",
    codigo: "210176001",
    nit: "890.399.011-3",
    razonSocial: "Gobernación del Valle del Cauca",
    departamento: "Valle del Cauca",
    municipio: "Cali",
  },
  {
    id: "5",
    codigo: "210108001",
    nit: "890.102.006-1",
    razonSocial: "Gobernación del Atlántico",
    departamento: "Atlántico",
    municipio: "Barranquilla",
  },
]

type SortField = "codigo" | "nit" | "razonSocial" | "departamento" | "municipio"
type SortDirection = "asc" | "desc"

export default function DirectorioEntidadesModal({
  open,
  onOpenChange,
  onSelect,
  selectedEntidad,
}: DirectorioEntidadesModalProps) {
  const [filters, setFilters] = useState({
    codigo: "",
    nit: "",
    razonSocial: "",
    departamento: "",
    municipio: "",
  })

  const [hasSearched, setHasSearched] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(selectedEntidad || null)
  const [sortField, setSortField] = useState<SortField>("codigo")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const departamentos = getDepartamentos()
  const municipios = filters.departamento ? getMunicipios(filters.departamento) : []

  const filteredEntidades = useMemo(() => {
    if (!hasSearched) return []

    return mockEntidades
      .filter((entidad) => {
        const matchCodigo = filters.codigo === "" || entidad.codigo.toLowerCase().includes(filters.codigo.toLowerCase())
        const matchNit = filters.nit === "" || entidad.nit.toLowerCase().includes(filters.nit.toLowerCase())
        const matchRazonSocial = filters.razonSocial === "" || entidad.razonSocial.toLowerCase().includes(filters.razonSocial.toLowerCase())
        const matchDepartamento = filters.departamento === "" || entidad.departamento === filters.departamento
        const matchMunicipio = filters.municipio === "" || entidad.municipio === filters.municipio

        return matchCodigo && matchNit && matchRazonSocial && matchDepartamento && matchMunicipio
      })
      .sort((a, b) => {
        const aValue = a[sortField].toLowerCase()
        const bValue = b[sortField].toLowerCase()
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue)
        }
        return bValue.localeCompare(aValue)
      })
  }, [filters, hasSearched, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSearch = () => {
    setHasSearched(true)
  }

  const handleClear = () => {
    setFilters({
      codigo: "",
      nit: "",
      razonSocial: "",
      departamento: "",
      municipio: "",
    })
    setHasSearched(false)
    setSelectedEntity(null)
  }

  const handleAccept = () => {
    onSelect(selectedEntity)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedEntity(selectedEntidad || null)
    onOpenChange(false)
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left py-3 px-3 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown size={12} className={`${sortField === field ? "text-blue-600" : "text-gray-400"}`} />
      </div>
    </th>
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Directorio de Entidades
          </h2>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-gray-100 rounded-md transition text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Filters Section */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Filter size={14} />
              Filtros de Busqueda
            </div>

            {/* Row 1: Codigo, NIT, Razon Social */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Codigo
                </label>
                <input
                  type="text"
                  value={filters.codigo}
                  onChange={(e) => setFilters({ ...filters, codigo: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  NIT
                </label>
                <input
                  type="text"
                  value={filters.nit}
                  onChange={(e) => setFilters({ ...filters, nit: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Razon Social
                </label>
                <input
                  type="text"
                  value={filters.razonSocial}
                  onChange={(e) => setFilters({ ...filters, razonSocial: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 2: Departamento, Municipio, Buttons */}
            <div className="flex items-end gap-3">
              <div className="w-40">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Departamento
                </label>
                <select
                  value={filters.departamento}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      departamento: e.target.value,
                      municipio: "",
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {departamentos.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Municipio
                </label>
                <select
                  value={filters.municipio}
                  onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
                  disabled={!filters.departamento}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Todos</option>
                  {municipios.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
              >
                <Filter size={14} />
                Limpiar
              </button>
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium"
              >
                <Search size={14} />
                Consultar
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700">RESULTADOS</span>
                {hasSearched && (
                  <span className="text-gray-500 text-xs">
                    ({filteredEntidades.length} entidad{filteredEntidades.length !== 1 ? "es" : ""} encontrada{filteredEntidades.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[240px] overflow-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="w-10 py-3 px-3"></th>
                    <SortableHeader field="codigo">Codigo</SortableHeader>
                    <SortableHeader field="nit">NIT</SortableHeader>
                    <SortableHeader field="razonSocial">Razon Social</SortableHeader>
                    <SortableHeader field="departamento">Departamento</SortableHeader>
                    <SortableHeader field="municipio">Municipio</SortableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hasSearched ? (
                    filteredEntidades.length > 0 ? (
                      filteredEntidades.map((entidad) => (
                        <tr
                          key={entidad.id}
                          onClick={() => setSelectedEntity(entidad)}
                          className={`cursor-pointer transition ${
                            selectedEntity?.id === entidad.id
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedEntity?.id === entidad.id
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedEntity?.id === entidad.id && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-900 text-sm">
                            {entidad.codigo}
                          </td>
                          <td className="py-3 px-3 text-gray-700 text-sm">{entidad.nit}</td>
                          <td className="py-3 px-3 text-gray-700 text-sm">{entidad.razonSocial}</td>
                          <td className="py-3 px-3 text-blue-600 text-sm">{entidad.departamento}</td>
                          <td className="py-3 px-3 text-gray-700 text-sm">{entidad.municipio}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                          No se encontraron entidades con los criterios de busqueda.
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                        Utilice los filtros para buscar entidades.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Entity Indicator */}
          {selectedEntity && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check size={16} className="text-green-500" />
              <span>
                <span className="font-medium">Seleccionado:</span> {selectedEntity.codigo} - {selectedEntity.razonSocial}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
          >
            <X size={14} />
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!selectedEntity}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition font-medium"
          >
            <Check size={14} />
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
