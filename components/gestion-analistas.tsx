"use client"

import { useState, useMemo } from "react"
import { Search, ChevronLeft, UserCog, FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Entidad {
  nit: string
  nombre: string
  estado: string
  marcoNormativo: string
  departamento: string
  ciudad: string
  sector: string
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

  const [entidades] = useState<Entidad[]>([
    {
      nit: "811036423:1",
      nombre: "A.C.I Agencia de Cooperación e Inversión de Medellín y el Área Metropolitana",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DEPARTAMENTO DE ANTIOQUIA",
      ciudad: "MEDELLIN",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "HVALENCIA",
    },
    {
      nit: "890981195:5",
      nombre: "E.S.E. Hospital San Juan de Dios - Abejorral",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE ANTIOQUIA",
      ciudad: "ABEJORRAL",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "ABEJORRAL",
      analistaActual: "ERODELO",
    },
    {
      nit: "890504612:0",
      nombre: "E.S.E. Hospital San Roque - Pradera",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE NORTE DE SANTANDER",
      ciudad: "ABREGO",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DE NORTE DE SANTANDER",
      ciudadGobierno: "ABREGO",
      analistaActual: "MCUELLAR",
    },
    {
      nit: "890981251:1",
      nombre: "Empresa de Tecnología, Imprenta y Comunicaciones de Nariño",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE ANTIOQUIA",
      ciudad: "ABRIAQUI",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "ABRIAQUI",
      analistaActual: "ERODELO",
    },
    {
      nit: "892001457:3",
      nombre: "Instituto de Financiamiento, Promoción y Desarrollo de Caldas",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DEL META",
      ciudad: "ACACIAS",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DEL META",
      ciudadGobierno: "ACACIAS",
      analistaActual: "JARANGO",
    },
    {
      nit: "891680050:8",
      nombre: "E.S.E. Hospital Laureano Pino - San José de la Montaña",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE CHOCO",
      ciudad: "ACANDI",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DE CHOCO",
      ciudadGobierno: "ACANDI",
      analistaActual: "NOSORIO",
    },
    {
      nit: "891180069:1",
      nombre: "E.S.P. Empresas Públicas de El Santuario",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE HUILA",
      ciudad: "ACEVEDO",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DE HUILA",
      ciudadGobierno: "ACEVEDO",
      analistaActual: "ERODELO",
    },
    {
      nit: "800037371:1",
      nombre: "E.S.E. Centro de Salud - Luis Patiño Camargo",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE BOLIVAR",
      ciudad: "ACHI",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "PRINCIPAL",
      deptoGobierno: "DEPARTAMENTO DE BOLIVAR",
      ciudadGobierno: "ACHI",
      analistaActual: "SGALVIS",
    },
    {
      nit: "900266932:6",
      nombre: "Plaza de Mercado de Apartadó",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DEPARTAMENTO DE ANTIOQUIA",
      ciudad: "MEDELLIN",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "HVALENCIA",
    },
    {
      nit: "900336004:7",
      nombre: "E.S.P. Empresas Públicas - Concordia",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO NACIONAL",
      naturaleza: "VINCULADA DIRECTA NO SOCIETARIA",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "MCASTAÑO",
    },
    {
      nit: "901037916:1",
      nombre: "E.S.P. Empresa Aguas del Oriente Antioqueño S.A.",
      estado: "ACTIVO",
      marcoNormativo: "Empresas cotizantes",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO NACIONAL",
      naturaleza: "ADSCRITA SECTOR SALUD",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "BCRISTIANO",
    },
    {
      nit: "900505060:5",
      nombre: "E.S.P. Servicio Público de Aseo - Venecia",
      estado: "ACTIVO",
      marcoNormativo: "Empresas no cotizantes",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO NACIONAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "ERODELO",
    },
    {
      nit: "800157073:4",
      nombre: "E.S.P. Hydros Melgar S en C. A. -  En Liquidación",
      estado: "ACTIVO",
      marcoNormativo: "Entidades en liquidación",
      departamento: "DEPARTAMENTO DE ANTIOQUIA",
      ciudad: "MEDELLIN",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "HVALENCIA",
    },
    {
      nit: "901486723:0",
      nombre: "E.S.P. Hydros Chía S. en C.A. - En Liquidación",
      estado: "ACTIVO",
      marcoNormativo: "Entidades en liquidación",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DISTRITO CAPITAL",
      ciudadGobierno: "BOGOTA - DISTRITO CAPITAL",
      analistaActual: "LBLANCO",
    },
    {
      nit: "901024331:5",
      nombre: "Agencia de Cundinamarca para la Paz y la Convivencia",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DISTRITO CAPITAL",
      ciudadGobierno: "BOGOTA - DISTRITO CAPITAL",
      analistaActual: "LBLANCO",
    },
    {
      nit: "814004674:5",
      nombre: "Agencia de Desarrollo Local Nariño",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DEPARTAMENTO DE NARIÑO",
      ciudad: "SAN JUAN DE PASTO",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE NARIÑO",
      ciudadGobierno: "SAN JUAN DE PASTO",
      analistaActual: "MCARMONA",
    },
    {
      nit: "900948958:4",
      nombre: "Agencia de Desarrollo Rural - ADR",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO NACIONAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE NARIÑO",
      ciudadGobierno: "SAN JUAN DE PASTO",
      analistaActual: "MMARTINEZ",
    },
    {
      nit: "901006886:4",
      nombre: "Agencia de Renovación del Territorio",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO NACIONAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE ANTIOQUIA",
      ciudadGobierno: "MEDELLIN",
      analistaActual: "LALDANA",
    },
    {
      nit: "802024407:7",
      nombre: "Agencia Distrital de Infraestructura del Distrito de Barranquilla",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DEPARTAMENTO DE ATLANTICO",
      ciudad: "BARRANQUILLA - DISTRITO ESPECIAL, INDUSTRIAL Y PORTUARIO",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DEPARTAMENTO DE ATLANTICO",
      ciudadGobierno: "BARRANQUILLA - DISTRITO ESPECIAL, INDUSTRIAL Y PORTUARIO",
      analistaActual: "JARANGO",
    },
    {
      nit: "901508361:4",
      nombre: "Agencia Distrital para la Educación Superior, la Ciencia y la Tecnología",
      estado: "ACTIVO",
      marcoNormativo: "Entidades de gobierno",
      departamento: "DISTRITO CAPITAL",
      ciudad: "BOGOTA - DISTRITO CAPITAL",
      sector: "SECTOR PUBLICO TERRITORIAL",
      naturaleza: "ADSCRITA",
      deptoGobierno: "DISTRITO CAPITAL",
      ciudadGobierno: "BOGOTA - DISTRITO CAPITAL",
      analistaActual: "YORTIZ",
    },
  ])

  const departamentos = useMemo(() => Array.from(new Set(entidades.map((e) => e.departamento))).sort(), [entidades])
  const ciudades = useMemo(() => Array.from(new Set(entidades.map((e) => e.ciudad))).sort(), [entidades])
  const sectores = useMemo(() => Array.from(new Set(entidades.map((e) => e.sector))).sort(), [entidades])
  const marcosNormativos = useMemo(
    () => Array.from(new Set(entidades.map((e) => e.marcoNormativo))).sort(),
    [entidades],
  )
  const naturalezas = useMemo(() => Array.from(new Set(entidades.map((e) => e.naturaleza))).sort(), [entidades])
  const analistas = useMemo(() => Array.from(new Set(entidades.map((e) => e.analistaActual))).sort(), [entidades])

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
                  <th className="text-left py-4 px-4 font-semibold text-foreground">NIT</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Entidad</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Estado</th>
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
                    <tr key={entidad.nit} className="border-b border-border hover:bg-muted/30 transition">
                      <td className="py-4 px-4 text-foreground font-mono text-sm">{entidad.nit}</td>
                      <td className="py-4 px-4 text-foreground font-medium">{entidad.nombre}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {entidad.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-foreground text-sm">{entidad.departamento}</td>
                      <td className="py-4 px-4 text-foreground text-sm">{entidad.ciudad}</td>
                      <td className="py-4 px-4 text-foreground text-sm">{entidad.sector}</td>
                      <td className="py-4 px-4 text-foreground text-sm">{entidad.marcoNormativo}</td>
                      <td className="py-4 px-4 text-foreground text-sm">{entidad.naturaleza}</td>
                      <td className="py-4 px-4 text-foreground font-semibold">{entidad.analistaActual}</td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-teal-600 border-teal-600 hover:bg-teal-50 bg-transparent"
                        >
                          Asignar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 px-4 text-center text-muted-foreground">
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
