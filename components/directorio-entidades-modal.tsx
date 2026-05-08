"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Check, ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
      className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown size={14} className={`text-muted-foreground ${sortField === field ? "text-primary" : ""}`} />
      </div>
    </th>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            Directorio de Entidades
          </DialogTitle>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-muted rounded-md transition text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Filters Section */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground uppercase">
              <Filter size={16} />
              Filtros de Busqueda
            </div>

            {/* Row 1: Codigo, NIT, Razon Social */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Codigo
                </label>
                <input
                  type="text"
                  value={filters.codigo}
                  onChange={(e) => setFilters({ ...filters, codigo: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  NIT
                </label>
                <input
                  type="text"
                  value={filters.nit}
                  onChange={(e) => setFilters({ ...filters, nit: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Razon Social
                </label>
                <input
                  type="text"
                  value={filters.razonSocial}
                  onChange={(e) => setFilters({ ...filters, razonSocial: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Row 2: Departamento, Municipio */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
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
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  {departamentos.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Municipio
                </label>
                <select
                  value={filters.municipio}
                  onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
                  disabled={!filters.departamento}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                >
                  <option value="">Todos</option>
                  {municipios.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="text-sm border-border hover:bg-muted"
                >
                  <Filter size={16} className="mr-1" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                >
                  <Search size={16} className="mr-1" />
                  Consultar
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-muted/30 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">RESULTADOS</span>
                {hasSearched && (
                  <span className="text-xs">
                    ({filteredEntidades.length} entidad{filteredEntidades.length !== 1 ? "es" : ""} encontrada{filteredEntidades.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[280px] overflow-auto">
              <table className="w-full">
                <thead className="bg-muted/20 sticky top-0">
                  <tr className="border-b border-border">
                    <th className="w-12 py-3 px-4"></th>
                    <SortableHeader field="codigo">Codigo</SortableHeader>
                    <SortableHeader field="nit">NIT</SortableHeader>
                    <SortableHeader field="razonSocial">Razon Social</SortableHeader>
                    <SortableHeader field="departamento">Departamento</SortableHeader>
                    <SortableHeader field="municipio">Municipio</SortableHeader>
                  </tr>
                </thead>
                <tbody>
                  {hasSearched ? (
                    filteredEntidades.length > 0 ? (
                      filteredEntidades.map((entidad) => (
                        <tr
                          key={entidad.id}
                          onClick={() => setSelectedEntity(entidad)}
                          className={`border-b border-border cursor-pointer transition ${
                            selectedEntity?.id === entidad.id
                              ? "bg-primary/10"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedEntity?.id === entidad.id
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {selectedEntity?.id === entidad.id && (
                                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground font-medium text-sm">
                            {entidad.codigo}
                          </td>
                          <td className="py-3 px-4 text-foreground text-sm">{entidad.nit}</td>
                          <td className="py-3 px-4 text-foreground text-sm">{entidad.razonSocial}</td>
                          <td className="py-3 px-4 text-primary text-sm">{entidad.departamento}</td>
                          <td className="py-3 px-4 text-foreground text-sm">{entidad.municipio}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No se encontraron entidades con los criterios de busqueda.
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
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
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check size={18} />
              <span>
                <span className="font-semibold">Seleccionado:</span> {selectedEntity.codigo} - {selectedEntity.razonSocial}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4 mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-border hover:bg-muted"
          >
            <X size={16} className="mr-1" />
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!selectedEntity}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Check size={16} className="mr-1" />
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
