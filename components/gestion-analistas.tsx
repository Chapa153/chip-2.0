"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronLeft, UserCog, X, BarChart3, ChevronsLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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

const entidadesIniciales = [
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
    sector: "SECTOR PUBLICO TERRITORIAL",
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
]

export default function GestionAnalistas() {
  const [showResults, setShowResults] = useState(false)
  const [filtros, setFiltros] = useState({
    entidad: "",
    departamento: [] as string[],
    ciudad: [] as string[],
    sector: [] as string[],
    marcoNormativo: [] as string[],
    naturaleza: [] as string[],
    deptoGobierno: [] as string[],
    ciudadGobierno: [] as string[],
    analistaActual: [] as string[],
  })

  const [entidades, setEntidades] = useState<Entidad[]>(entidadesIniciales)
  const [paginaActual, setPaginaActual] = useState(1)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
  const [entidadesSeleccionadas, setEntidadesSeleccionadas] = useState<string[]>([])
  const [mostrarDialogAsignacion, setMostrarDialogAsignacion] = useState(false)
  const [perfilSeleccionado, setPerfilSeleccionado] = useState("")
  const [analistaSeleccionado, setAnalistaSeleccionado] = useState("")
  const [mostrarCargaAnalistas, setMostrarCargaAnalistas] = useState(false)
  const [filtrosAplicados, setFiltrosAplicados] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [mostrarExito, setMostrarExito] = useState(false)
  const [numEntidadesActualizadas, setNumEntidadesActualizadas] = useState(0)
  const toast = useToast()

  const SelectMultipleConBusqueda = ({
    label,
    values,
    onChange,
    options,
    placeholder,
  }: {
    label: string
    values: string[]
    onChange: (values: string[]) => void
    options: string[]
    placeholder: string
  }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const opcionesFiltradas = options.filter((opcion) => opcion.toLowerCase().includes(searchTerm.toLowerCase()))

    const toggleOption = (opcion: string) => {
      if (values.includes(opcion)) {
        onChange(values.filter((v) => v !== opcion))
      } else {
        onChange([...values, opcion])
      }
    }

    const removeValue = (value: string) => {
      onChange(values.filter((v) => v !== value))
    }

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">{label}</label>

        {/* Badges de selección */}
        {values.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {values.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
              >
                {value}
                <button onClick={() => removeValue(value)} className="hover:text-primary/80" type="button">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
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
              {values.length > 0 && (
                <button
                  onClick={() => onChange([])}
                  className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted border-b"
                  type="button"
                >
                  Limpiar selección
                </button>
              )}
              {opcionesFiltradas.map((opcion) => (
                <label key={opcion} className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={values.includes(opcion)}
                    onChange={() => toggleOption(opcion)}
                    className="rounded border-gray-300"
                  />
                  {opcion}
                </label>
              ))}
            </div>
          )}
        </div>
        {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
      </div>
    )
  }

  const perfiles = useMemo(() => ["Analista Senior", "Analista Junior", "Coordinador", "Supervisor"], [])

  const analistasPorPerfil = useMemo(
    () => ({
      "Analista Senior": ["MARTINEZ", "JARAMILLO", "DIAZ"],
      "Analista Junior": ["MOSQUERA", "ESCANDOR", "PATIÑO"],
      Coordinador: ["GUTIERREZ", "RODRIGUEZ"],
      Supervisor: ["JIMENEZ", "MORALES"],
    }),
    [],
  )

  const analistasDisponibles = useMemo(() => {
    if (!perfilSeleccionado) return []
    return analistasPorPerfil[perfilSeleccionado as keyof typeof analistasPorPerfil] || []
  }, [perfilSeleccionado, analistasPorPerfil])

  const entidadesFiltradas = useMemo(() => {
    if (!filtrosAplicados) return []

    return entidades.filter((entidad) => {
      if (filtros.entidad && !entidad.nombre.toLowerCase().includes(filtros.entidad.toLowerCase())) return false
      if (filtros.departamento.length > 0 && !filtros.departamento.includes(entidad.departamento)) return false
      if (filtros.ciudad.length > 0 && !filtros.ciudad.includes(entidad.ciudad)) return false
      if (filtros.sector.length > 0 && !filtros.sector.includes(entidad.sector)) return false
      if (filtros.marcoNormativo.length > 0 && !filtros.marcoNormativo.includes(entidad.marcoNormativo)) return false
      if (filtros.naturaleza.length > 0 && !filtros.naturaleza.includes(entidad.naturaleza)) return false
      if (filtros.deptoGobierno.length > 0 && !filtros.deptoGobierno.includes(entidad.deptoGobierno)) return false
      if (filtros.ciudadGobierno.length > 0 && !filtros.ciudadGobierno.includes(entidad.ciudadGobierno)) return false
      if (filtros.analistaActual.length > 0 && !filtros.analistaActual.includes(entidad.analistaActual)) return false
      return true
    })
  }, [entidades, filtros, filtrosAplicados])

  const cargaAnalistas = useMemo(() => {
    // Usar entidades filtradas si hay filtros aplicados, sino todas las entidades
    const entidadesParaCarga = filtrosAplicados ? entidadesFiltradas : entidades

    // Obtener todos los analistas únicos del sistema
    const todosAnalistas = Array.from(new Set(entidades.map((e) => e.analistaActual)))

    const carga: { [key: string]: number } = {}

    // Inicializar todos los analistas con 0
    todosAnalistas.forEach((analista) => {
      carga[analista] = 0
    })

    // Contar entidades asignadas
    entidadesParaCarga.forEach((entidad) => {
      const analista = entidad.analistaActual
      carga[analista] = (carga[analista] || 0) + 1
    })

    return Object.entries(carga)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }, [entidades, entidadesFiltradas, filtrosAplicados])

  // Handlers para selección de entidades
  const toggleSeleccionEntidad = (nit: string) => {
    setEntidadesSeleccionadas((prev) => (prev.includes(nit) ? prev.filter((n) => n !== nit) : [...prev, nit]))
  }

  const seleccionarTodas = () => {
    const nitsTodasFiltradas = entidades.map((e) => e.nit)
    setEntidadesSeleccionadas(nitsTodasFiltradas)
  }

  const deseleccionarTodas = () => {
    setEntidadesSeleccionadas([])
  }

  const aplicarFiltros = () => {
    setFiltrosAplicados(true)
    setPaginaActual(1)
  }

  const limpiarFiltros = () => {
    setFiltros({
      entidad: "",
      departamento: [],
      ciudad: [],
      sector: [],
      marcoNormativo: [],
      naturaleza: [],
      deptoGobierno: [],
      ciudadGobierno: [],
      analistaActual: [],
    })
    setFiltrosAplicados(false)
    setEntidadesSeleccionadas([])
  }

  const handleAsignarAnalista = () => {
    if (!analistaSeleccionado || entidadesSeleccionadas.length === 0) return
    setMostrarConfirmacion(true)
  }

  const confirmarAsignacion = () => {
    const numEntidades = entidadesSeleccionadas.length

    // Actualizar las entidades en el estado local
    setEntidades((prevEntidades) =>
      prevEntidades.map((entidad) =>
        entidadesSeleccionadas.includes(entidad.nit) ? { ...entidad, analistaActual: analistaSeleccionado } : entidad,
      ),
    )

    // Cerrar modales primero
    setMostrarConfirmacion(false)
    setMostrarDialogAsignacion(false)

    // Limpiar selecciones y estados
    setEntidadesSeleccionadas([])
    setPerfilSeleccionado("")
    setAnalistaSeleccionado("")

    setNumEntidadesActualizadas(numEntidades)
    setMostrarExito(true)
  }

  const entidadesPaginadas = useMemo(() => {
    if (!filtrosAplicados) return []
    const inicio = (paginaActual - 1) * registrosPorPagina
    const fin = inicio + registrosPorPagina
    return entidadesFiltradas.slice(inicio, fin)
  }, [entidadesFiltradas, paginaActual, registrosPorPagina, filtrosAplicados])

  const totalPaginas = Math.ceil(entidadesFiltradas.length / registrosPorPagina)

  useEffect(() => {
    setPaginaActual(1)
  }, [filtros])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => window.history.back()} variant="ghost" size="sm" className="gap-2">
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

      {/* Sección de filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-teal-700">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Departamento - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Departamento"
              values={filtros.departamento}
              onChange={(values) => setFiltros({ ...filtros, departamento: values })}
              options={Array.from(new Set(entidades.map((e) => e.departamento))).sort()}
              placeholder="Buscar departamento..."
            />

            {/* Ciudad - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Ciudad"
              values={filtros.ciudad}
              onChange={(values) => setFiltros({ ...filtros, ciudad: values })}
              options={Array.from(new Set(entidades.map((e) => e.ciudad))).sort()}
              placeholder="Buscar ciudad..."
            />

            {/* Sector - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Sector"
              values={filtros.sector}
              onChange={(values) => setFiltros({ ...filtros, sector: values })}
              options={Array.from(new Set(entidades.map((e) => e.sector))).sort()}
              placeholder="Buscar sector..."
            />

            {/* Marco Normativo - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Marco Normativo"
              values={filtros.marcoNormativo}
              onChange={(values) => setFiltros({ ...filtros, marcoNormativo: values })}
              options={Array.from(new Set(entidades.map((e) => e.marcoNormativo))).sort()}
              placeholder="Buscar marco normativo..."
            />

            {/* Naturaleza - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Naturaleza"
              values={filtros.naturaleza}
              onChange={(values) => setFiltros({ ...filtros, naturaleza: values })}
              options={Array.from(new Set(entidades.map((e) => e.naturaleza))).sort()}
              placeholder="Buscar naturaleza..."
            />

            {/* Depto. Gobierno - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Depto. Gobierno"
              values={filtros.deptoGobierno}
              onChange={(values) => setFiltros({ ...filtros, deptoGobierno: values })}
              options={Array.from(new Set(entidades.map((e) => e.deptoGobierno))).sort()}
              placeholder="Buscar departamento gobierno..."
            />

            {/* Ciudad Gobierno - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Ciudad Gobierno"
              values={filtros.ciudadGobierno}
              onChange={(values) => setFiltros({ ...filtros, ciudadGobierno: values })}
              options={Array.from(new Set(entidades.map((e) => e.ciudadGobierno))).sort()}
              placeholder="Buscar ciudad gobierno..."
            />

            {/* Analista Actual - Select múltiple con búsqueda */}
            <SelectMultipleConBusqueda
              label="Analista Actual"
              values={filtros.analistaActual}
              onChange={(values) => setFiltros({ ...filtros, analistaActual: values })}
              options={Array.from(new Set(entidades.map((e) => e.analistaActual))).sort()}
              placeholder="Buscar analista..."
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button onClick={aplicarFiltros} className="bg-teal-600 hover:bg-teal-700">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button onClick={limpiarFiltros} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {filtrosAplicados && (
        <>
          {/* Barra de acciones antes de la tabla */}
          <div className="flex items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarDialogAsignacion(true)}
                disabled={entidadesSeleccionadas.length === 0}
                className="text-teal-600 border-teal-600 hover:bg-teal-50"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Asignar Analista
              </Button>

              {entidadesPaginadas.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={seleccionarTodas}>
                    Seleccionar Todos
                  </Button>
                  {entidadesSeleccionadas.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={deseleccionarTodas}>
                      Limpiar selección
                    </Button>
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarCargaAnalistas(true)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver carga de analistas
            </Button>
          </div>

          {/* Tabla con checkboxes */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-muted/50">
                    <th className="text-left py-4 px-4">
                      <input
                        type="checkbox"
                        checked={entidades.length > 0 && entidades.every((e) => entidadesSeleccionadas.includes(e.nit))}
                        onChange={(e) => (e.target.checked ? seleccionarTodas() : deseleccionarTodas())}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">NIT</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Entidad</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Estado</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Departamento</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Ciudad</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Sector</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Marco Normativo</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Naturaleza</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Analista Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {entidadesPaginadas.length > 0 ? (
                    entidadesPaginadas.map((entidad) => (
                      <tr key={entidad.nit} className="border-b border-border hover:bg-muted/30 transition">
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={entidadesSeleccionadas.includes(entidad.nit)}
                            onChange={() => toggleSeleccionEntidad(entidad.nit)}
                            className="rounded border-gray-300"
                          />
                        </td>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-8 px-4 text-center text-muted-foreground">
                        No se encontraron entidades con los criterios de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Mostrando {entidadesPaginadas.length > 0 ? (paginaActual - 1) * registrosPorPagina + 1 : 0} -{" "}
                {Math.min(paginaActual * registrosPorPagina, entidadesFiltradas.length)} de {entidadesFiltradas.length}{" "}
                resultados
              </span>
              <div className="flex items-center gap-2 ml-4">
                <Label htmlFor="registros-por-pagina" className="text-sm">
                  Registros por página:
                </Label>
                <Select
                  value={registrosPorPagina.toString()}
                  onValueChange={(value) => {
                    setRegistrosPorPagina(Number(value))
                    setPaginaActual(1)
                  }}
                >
                  <SelectTrigger id="registros-por-pagina" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Página {paginaActual} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M13 17l5-5m0 0l-5-5m5 5H7"></path>
                </svg>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Dialog de asignación */}
      <Dialog open={mostrarDialogAsignacion} onOpenChange={setMostrarDialogAsignacion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar Analista</DialogTitle>
            <DialogDescription>
              Selecciona un perfil y luego un analista para asignar a las entidades seleccionadas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil</Label>
              <Select value={perfilSeleccionado} onValueChange={setPerfilSeleccionado}>
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Seleccionar perfil..." />
                </SelectTrigger>
                <SelectContent>
                  {perfiles.map((perfil) => (
                    <SelectItem key={perfil} value={perfil}>
                      {perfil}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="analista">Analista</Label>
              <Select
                value={analistaSeleccionado}
                onValueChange={setAnalistaSeleccionado}
                disabled={!perfilSeleccionado}
              >
                <SelectTrigger id="analista">
                  <SelectValue placeholder="Seleccionar analista..." />
                </SelectTrigger>
                <SelectContent>
                  {analistasDisponibles.map((analista) => (
                    <SelectItem key={analista} value={analista}>
                      {analista}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarDialogAsignacion(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAsignarAnalista}
              disabled={!analistaSeleccionado}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Asignación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de asignar el analista <strong>{analistaSeleccionado}</strong> a{" "}
              <strong>{entidadesSeleccionadas.length}</strong> entidad(es) seleccionada(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarConfirmacion(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAsignacion} className="bg-teal-600 hover:bg-teal-700">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarExito} onOpenChange={setMostrarExito}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Asignación Exitosa</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Se ha actualizado con éxito <strong>{numEntidadesActualizadas}</strong> entidad(es) seleccionada(s).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setMostrarExito(false)} className="bg-teal-600 hover:bg-teal-700">
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de carga de analistas */}
      <Dialog open={mostrarCargaAnalistas} onOpenChange={setMostrarCargaAnalistas}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carga de Trabajo de Analistas</DialogTitle>
            <DialogDescription>
              {filtrosAplicados ? (
                <>
                  Cantidad de entidades asignadas a cada analista según los filtros aplicados.
                  <span className="block mt-1 text-yellow-600">
                    Nota: Se muestran datos filtrados ({entidadesFiltradas.length} de {entidades.length} entidades)
                  </span>
                </>
              ) : (
                "Cantidad de entidades asignadas a cada analista en todo el sistema."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b-2 border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Analista</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Cantidad de Entidades</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {cargaAnalistas.map(({ nombre, cantidad }) => {
                  const totalEntidades = filtrosAplicados ? entidadesFiltradas.length : entidades.length
                  const porcentaje = totalEntidades > 0 ? Math.round((cantidad / totalEntidades) * 100) : 0

                  return (
                    <tr key={nombre} className="border-b border-border hover:bg-muted/30">
                      <td className="py-3 px-4 text-foreground font-medium">{nombre}</td>
                      <td className="py-3 px-4 text-right text-foreground font-semibold">{cantidad}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{porcentaje}%</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="sticky bottom-0 bg-card border-t-2 border-border">
                <tr className="bg-muted/50 font-semibold">
                  <td className="py-3 px-4 text-foreground">Total</td>
                  <td className="py-3 px-4 text-right text-foreground">
                    {filtrosAplicados ? entidadesFiltradas.length : entidades.length}
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <DialogFooter>
            <Button onClick={() => setMostrarCargaAnalistas(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mensaje cuando no hay búsqueda realizada */}
      {!filtrosAplicados && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">Realiza una búsqueda para ver las entidades disponibles</p>
        </div>
      )}
    </div>
  )
}
