"use client"

import { useState, useMemo } from "react"
import { Search, ChevronLeft, UserCog, FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Entidad {
  id: string
  nombre: string
  departamento: string
  ciudad: string
  sector: string
  marcoNormativo: string
  naturaleza: string
  deptoGobierno: string
  ciudadGobierno: string
  analistaActual: string
}

interface GestionAnalistasProps {
  onBack: () => void
}

export default function GestionAnalistas({ onBack }: GestionAnalistasProps) {
  const [showResults, setShowResults] = useState(false)
  const [filtros, setFiltros] = useState({
    entidad: "",
    departamento: "",
    ciudad: "",
    sector: "",
    marcoNormativo: "",
    naturaleza: "",
    deptoGobierno: "",
    ciudadGobierno: "",
    analistaActual: "",
  })

  // Datos de ejemplo
  const [entidades] = useState<Entidad[]>([
    {
      id: "1",
      nombre: "Contaduría General de la Nación",
      departamento: "Cundinamarca",
      ciudad: "Bogotá",
      sector: "Sector Público",
      marcoNormativo: "Resolución 533",
      naturaleza: "Entidad Central",
      deptoGobierno: "Cundinamarca",
      ciudadGobierno: "Bogotá",
      analistaActual: "Juan Pérez",
    },
    {
      id: "2",
      nombre: "Ministerio de Hacienda",
      departamento: "Cundinamarca",
      ciudad: "Bogotá",
      sector: "Sector Central",
      marcoNormativo: "Resolución 484",
      naturaleza: "Ministerio",
      deptoGobierno: "Cundinamarca",
      ciudadGobierno: "Bogotá",
      analistaActual: "María García",
    },
    {
      id: "3",
      nombre: "Gobernación de Antioquia",
      departamento: "Antioquia",
      ciudad: "Medellín",
      sector: "Sector Descentralizado",
      marcoNormativo: "Resolución 533",
      naturaleza: "Territorial",
      deptoGobierno: "Antioquia",
      ciudadGobierno: "Medellín",
      analistaActual: "Carlos Rodríguez",
    },
  ])

  // Opciones para los selects
  const departamentos = ["Cundinamarca", "Antioquia", "Valle del Cauca", "Atlántico", "Santander"]
  const ciudades = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
  const sectores = ["Sector Público", "Sector Central", "Sector Descentralizado", "Sector Privado"]
  const marcosNormativos = ["Resolución 533", "Resolución 484", "Resolución 414", "Resolución 139"]
  const naturalezas = ["Entidad Central", "Ministerio", "Territorial", "Descentralizada", "Autónoma"]
  const analistas = ["Juan Pérez", "María García", "Carlos Rodríguez", "Ana Martínez", "Sin asignar"]

  // Filtrado con búsqueda por coincidencia
  const entidadesFiltradas = useMemo(() => {
    return entidades.filter((entidad) => {
      return (
        (filtros.entidad === "" || entidad.nombre.toLowerCase().includes(filtros.entidad.toLowerCase())) &&
        (filtros.departamento === "" || entidad.departamento === filtros.departamento) &&
        (filtros.ciudad === "" || entidad.ciudad === filtros.ciudad) &&
        (filtros.sector === "" || entidad.sector === filtros.sector) &&
        (filtros.marcoNormativo === "" || entidad.marcoNormativo === filtros.marcoNormativo) &&
        (filtros.naturaleza === "" || entidad.naturaleza === filtros.naturaleza) &&
        (filtros.deptoGobierno === "" || entidad.deptoGobierno === filtros.deptoGobierno) &&
        (filtros.ciudadGobierno === "" || entidad.ciudadGobierno === filtros.ciudadGobierno) &&
        (filtros.analistaActual === "" || entidad.analistaActual === filtros.analistaActual)
      )
    })
  }, [entidades, filtros])

  const handleBuscar = () => {
    setShowResults(true)
  }

  const handleLimpiarFiltros = () => {
    setFiltros({
      entidad: "",
      departamento: "",
      ciudad: "",
      sector: "",
      marcoNormativo: "",
      naturaleza: "",
      deptoGobierno: "",
      ciudadGobierno: "",
      analistaActual: "",
    })
    setShowResults(false)
  }

  // Componente de Select con búsqueda
  const SelectConBusqueda = ({
    label,
    value,
    onChange,
    options,
    placeholder,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: string[]
    placeholder: string
  }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const opcionesFiltradas = options.filter((opcion) => opcion.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
        <div className="relative">
          <input
            type="text"
            value={value || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {isOpen && opcionesFiltradas.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
              {opcionesFiltradas.map((opcion) => (
                <div
                  key={opcion}
                  onClick={() => {
                    onChange(opcion)
                    setSearchTerm("")
                    setIsOpen(false)
                  }}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                >
                  {opcion}
                </div>
              ))}
            </div>
          )}
        </div>
        {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-950 rounded-lg">
              <UserCog className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Analistas</h1>
              <p className="text-sm text-muted-foreground">Administrar asignación de analistas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <FilterIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Filtros de Búsqueda</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Entidad - Input de texto libre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Entidad</label>
            <Input
              type="text"
              value={filtros.entidad}
              onChange={(e) => setFiltros({ ...filtros, entidad: e.target.value })}
              placeholder="Buscar por nombre de entidad"
              className="w-full"
            />
          </div>

          {/* Departamento - Select con búsqueda */}
          <SelectConBusqueda
            label="Departamento"
            value={filtros.departamento}
            onChange={(value) => setFiltros({ ...filtros, departamento: value })}
            options={departamentos}
            placeholder="Seleccione departamento"
          />

          {/* Ciudad - Select con búsqueda */}
          <SelectConBusqueda
            label="Ciudad"
            value={filtros.ciudad}
            onChange={(value) => setFiltros({ ...filtros, ciudad: value })}
            options={ciudades}
            placeholder="Seleccione ciudad"
          />

          {/* Sector - Select con búsqueda */}
          <SelectConBusqueda
            label="Sector"
            value={filtros.sector}
            onChange={(value) => setFiltros({ ...filtros, sector: value })}
            options={sectores}
            placeholder="Seleccione sector"
          />

          {/* Marco Normativo - Select con búsqueda */}
          <SelectConBusqueda
            label="Marco Normativo"
            value={filtros.marcoNormativo}
            onChange={(value) => setFiltros({ ...filtros, marcoNormativo: value })}
            options={marcosNormativos}
            placeholder="Seleccione marco normativo"
          />

          {/* Naturaleza - Select con búsqueda */}
          <SelectConBusqueda
            label="Naturaleza"
            value={filtros.naturaleza}
            onChange={(value) => setFiltros({ ...filtros, naturaleza: value })}
            options={naturalezas}
            placeholder="Seleccione naturaleza"
          />

          {/* Depto. Gobierno - Select con búsqueda */}
          <SelectConBusqueda
            label="Depto. Gobierno"
            value={filtros.deptoGobierno}
            onChange={(value) => setFiltros({ ...filtros, deptoGobierno: value })}
            options={departamentos}
            placeholder="Seleccione departamento gobierno"
          />

          {/* Ciudad Gobierno - Select con búsqueda */}
          <SelectConBusqueda
            label="Ciudad Gobierno"
            value={filtros.ciudadGobierno}
            onChange={(value) => setFiltros({ ...filtros, ciudadGobierno: value })}
            options={ciudades}
            placeholder="Seleccione ciudad gobierno"
          />

          {/* Analista Actual - Select con búsqueda */}
          <SelectConBusqueda
            label="Analista Actual"
            value={filtros.analistaActual}
            onChange={(value) => setFiltros({ ...filtros, analistaActual: value })}
            options={analistas}
            placeholder="Seleccione analista"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <Button onClick={handleLimpiarFiltros} variant="outline">
            Limpiar Filtros
          </Button>
          <Button onClick={handleBuscar} className="bg-primary hover:bg-primary/90">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Resultados */}
      {showResults && (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/50">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Entidad</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Departamento</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Ciudad</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Sector</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Marco Normativo</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Naturaleza</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Analista Actual</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entidadesFiltradas.length > 0 ? (
                  entidadesFiltradas.map((entidad) => (
                    <tr key={entidad.id} className="border-b border-border hover:bg-muted/30 transition">
                      <td className="py-4 px-4 text-foreground font-medium">{entidad.nombre}</td>
                      <td className="py-4 px-4 text-foreground">{entidad.departamento}</td>
                      <td className="py-4 px-4 text-foreground">{entidad.ciudad}</td>
                      <td className="py-4 px-4 text-foreground">{entidad.sector}</td>
                      <td className="py-4 px-4 text-foreground">{entidad.marcoNormativo}</td>
                      <td className="py-4 px-4 text-foreground">{entidad.naturaleza}</td>
                      <td className="py-4 px-4 text-foreground">{entidad.analistaActual}</td>
                      <td className="py-4 px-4">
                        <Button size="sm" variant="outline">
                          Asignar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-muted-foreground">
                      No se encontraron entidades con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen de resultados */}
          <div className="px-6 py-4 bg-muted/30 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Se encontraron <span className="font-semibold">{entidadesFiltradas.length}</span> resultado
              {entidadesFiltradas.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay búsqueda realizada */}
      {!showResults && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">Realiza una búsqueda para ver las entidades disponibles</p>
        </div>
      )}
    </div>
  )
}
