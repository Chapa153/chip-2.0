"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Check, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDepartamentos, getMunicipios } from "@/lib/colombia-data"
import { getNombresClasificadores, getClasificador, type NodoClasificador } from "@/lib/clasificadores-data"

interface EditarEntidadViewProps {
  onBack: () => void
  entidadId: string
}

interface CategoriaAmbito {
  id: string
  categoria: string
  ambito: string
  año: string
  periodo: string
}

interface Responsable {
  id: string
  tipo: string
  nombres: string
  sexo: string
  cedula: string
  telefono: string
  fax: string
  email: string
  cargo: string
  tarjetaProfesional: string
  enPropiedad: boolean
}

interface ClasificadorAsignado {
  id: string
  nombreClasificador: string
  nodoSeleccionado: string
  codigoNodo: string
}

export default function EditarEntidadView({ onBack, entidadId }: EditarEntidadViewProps) {
  const [activeTab, setActiveTab] = useState<
    "info" | "estado" | "ambito" | "responsables" | "clasificadores" | "composicion" | "cuin"
  >("info")

  // Estados de pestañas guardadas
  const [infoGuardada, setInfoGuardada] = useState(true) // Ya guardada porque es edición
  const [estadoGuardado, setEstadoGuardado] = useState(true)
  const [ambitoGuardado, setAmbitoGuardado] = useState(true)
  const [responsablesGuardado, setResponsablesGuardado] = useState(true)
  const [clasificadoresGuardado, setClasificadoresGuardado] = useState(true)

  // Formulario Información General
  const [formInfo, setFormInfo] = useState({
    nit: "",
    sigla: "",
    razonSocial: "",
    codigoEntidad: "",
    tipoDocumento: "",
    numeroDocumento: "",
    fechaDocumento: "",
    sector: "",
    naturaleza: "",
    departamento: "",
    municipio: "",
    direccion: "",
    telefono: "",
    email: "",
  })

  // Formulario Estado
  const [formEstado, setFormEstado] = useState({
    estado: "",
    subestado: "",
    fechaNuevoEstado: "",
    actoAdministrativo: "",
    observaciones: "",
  })

  // Datos de ámbitos
  const [categoriasAmbito, setCategoriasAmbito] = useState<CategoriaAmbito[]>([])
  const [showAddCategoria, setShowAddCategoria] = useState(false)
  const [newCategoria, setNewCategoria] = useState({
    categoria: "",
    ambito: "",
    año: "",
    periodo: "",
  })

  // Datos de responsables
  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [showAddResponsable, setShowAddResponsable] = useState(false)
  const [newResponsable, setNewResponsable] = useState({
    tipo: "",
    nombres: "",
    sexo: "",
    cedula: "",
    telefono: "",
    fax: "",
    email: "",
    cargo: "",
    tarjetaProfesional: "",
    enPropiedad: false,
  })

  // Datos de clasificadores/atributos extensibles
  const [clasificadoresAsignados, setClasificadoresAsignados] = useState<ClasificadorAsignado[]>([])
  const [showAddClasificador, setShowAddClasificador] = useState(false)
  const [selectedClasificador, setSelectedClasificador] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Opciones
  const categoriaOptions = [
    "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
    "BDME - BOLETÍN DE DEUDORES MOROSOS DEL ESTADO",
    "ECIC - EVALUACIÓN DE CONTROL INTERNO CONTABLE",
  ]

  const ambitoByCategoria: Record<string, string[]> = {
    "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA": [
      "Empresas cotizantes",
      "Banco de la República",
      "Empresas NO cotizantes",
      "Entidades de Gobierno",
      "Entidades en liquidación",
      "Sistema General de Regalías",
      "Patrimonios autónomos y fondos",
      "Otros",
    ],
    "BDME - BOLETÍN DE DEUDORES MOROSOS DEL ESTADO": ["General_BDME", "Otros"],
    "ECIC - EVALUACIÓN DE CONTROL INTERNO CONTABLE": ["General_ECIC", "Otros"],
  }

  const periodoByCategoria: Record<string, string[]> = {
    "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA": [
      "Enero - Marzo",
      "Abril - Junio",
      "Julio - Septiembre",
      "Octubre - Diciembre",
    ],
    "BDME - BOLETÍN DE DEUDORES MOROSOS DEL ESTADO": [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    "ECIC - EVALUACIÓN DE CONTROL INTERNO CONTABLE": ["Enero - Diciembre"],
  }

  const tiposResponsable = [
    "Representante Legal",
    "Contador",
    "Revisor fiscal",
    "Director financiero",
    "Jefe de presupuesto",
    "Jefe de control interno",
  ]

  const nuevoEstadoOptions = ["SOLICITUD", "ACTIVO", "INACTIVO", "EN LIQUIDACIÓN"]
  const subestadoOptions = ["ACTIVA", "EN EXCESIÓN", "PROYECTO DECO", "EN FUSIÓN", "EN LIQUIDACIÓN"]

  // Cargar datos de la entidad (simulado)
  useEffect(() => {
    // Aquí se cargarían los datos reales de la entidad desde el backend
    // Por ahora, datos de ejemplo
    setFormInfo({
      nit: "900123456-7",
      sigla: "CGN",
      razonSocial: "Contaduría General de la Nación",
      codigoEntidad: "E001",
      tipoDocumento: "Decreto",
      numeroDocumento: "D-2024-001",
      fechaDocumento: "2024-01-15",
      sector: "Sector público nacional",
      naturaleza: "Principal",
      departamento: "Cundinamarca",
      municipio: "Bogotá D.C.",
      direccion: "Carrera 8 # 6-64",
      telefono: "+57 1 5187000",
      email: "contacto@contaduria.gov.co",
    })

    setFormEstado({
      estado: "ACTIVO",
      subestado: "ACTIVA",
      fechaNuevoEstado: "2024-01-15",
      actoAdministrativo: "Decreto 123 de 2024",
      observaciones: "Entidad activa y operando normalmente",
    })

    setCategoriasAmbito([
      {
        id: "1",
        categoria: "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
        ambito: "Entidades de Gobierno",
        año: "2024",
        periodo: "Enero - Marzo",
      },
    ])

    setResponsables([
      {
        id: "1",
        tipo: "Representante Legal",
        nombres: "Juan Pérez González",
        sexo: "Masculino",
        cedula: "123456789",
        telefono: "+57 300 1234567",
        fax: "",
        email: "juan.perez@contaduria.gov.co",
        cargo: "Contador General",
        tarjetaProfesional: "TP-12345",
        enPropiedad: true,
      },
    ])

    setClasificadoresAsignados([
      {
        id: "1",
        nombreClasificador: "Nivel de Clasificación",
        nodoSeleccionado: "Nivel 1",
        codigoNodo: "N1",
      },
    ])
  }, [entidadId])

  const departamentos = getDepartamentos()

  // Handlers para Información General
  const handleGuardarInfo = () => {
    if (!formInfo.razonSocial || !formInfo.nit || !formInfo.departamento || !formInfo.municipio) {
      alert("Por favor completa todos los campos requeridos")
      return
    }
    setInfoGuardada(true)
    alert("Información General guardada exitosamente")
  }

  // Handlers para Estado
  const handleGuardarEstado = () => {
    if (!formEstado.estado || !formEstado.subestado) {
      alert("Por favor completa todos los campos requeridos")
      return
    }
    setEstadoGuardado(true)
    alert("Estado guardado exitosamente")
  }

  // Handlers para Ámbito
  const handleAddCategoria = () => {
    if (!newCategoria.categoria || !newCategoria.ambito || !newCategoria.año || !newCategoria.periodo) {
      alert("Por favor completa todos los campos")
      return
    }

    setCategoriasAmbito([
      ...categoriasAmbito,
      {
        id: Date.now().toString(),
        ...newCategoria,
      },
    ])

    setNewCategoria({ categoria: "", ambito: "", año: "", periodo: "" })
    setShowAddCategoria(false)
  }

  const handleEliminarCategoria = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      setCategoriasAmbito(categoriasAmbito.filter((c) => c.id !== id))
    }
  }

  const handleGuardarAmbito = () => {
    setAmbitoGuardado(true)
    alert("Ámbito guardado exitosamente")
  }

  // Handlers para Responsables
  const handleAddResponsable = () => {
    if (!newResponsable.tipo || !newResponsable.nombres || !newResponsable.cedula) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    setResponsables([
      ...responsables,
      {
        id: Date.now().toString(),
        ...newResponsable,
      },
    ])

    setNewResponsable({
      tipo: "",
      nombres: "",
      sexo: "",
      cedula: "",
      telefono: "",
      fax: "",
      email: "",
      cargo: "",
      tarjetaProfesional: "",
      enPropiedad: false,
    })
    setShowAddResponsable(false)
  }

  const handleEliminarResponsable = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este responsable?")) {
      setResponsables(responsables.filter((r) => r.id !== id))
    }
  }

  const handleGuardarResponsables = () => {
    setResponsablesGuardado(true)
    alert("Responsables guardados exitosamente")
  }

  // Handlers para Clasificadores
  const handleAddClasificador = () => {
    if (!selectedClasificador || !selectedNode) {
      alert("Por favor selecciona un clasificador y un nodo")
      return
    }

    const clasificador = getClasificador(selectedClasificador)
    const nodo = findNodeByCode(clasificador, selectedNode)

    if (nodo) {
      setClasificadoresAsignados([
        ...clasificadoresAsignados,
        {
          id: Date.now().toString(),
          nombreClasificador: selectedClasificador,
          nodoSeleccionado: nodo.nombre,
          codigoNodo: nodo.codigo,
        },
      ])
    }

    setShowAddClasificador(false)
    setSelectedClasificador("")
    setSelectedNode(null)
  }

  const findNodeByCode = (nodo: NodoClasificador, codigo: string): NodoClasificador | null => {
    if (nodo.codigo === codigo) return nodo
    if (nodo.hijos) {
      for (const hijo of nodo.hijos) {
        const found = findNodeByCode(hijo, codigo)
        if (found) return found
      }
    }
    return null
  }

  const handleEliminarClasificador = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este atributo?")) {
      setClasificadoresAsignados(clasificadoresAsignados.filter((c) => c.id !== id))
    }
  }

  const handleGuardarClasificadores = () => {
    setClasificadoresGuardado(true)
    alert("Atributos Extensibles guardados exitosamente")
  }

  const toggleNode = (codigo: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(codigo)) {
      newExpanded.delete(codigo)
    } else {
      newExpanded.add(codigo)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNodo = (nodo: NodoClasificador, nivel = 0) => {
    const hasChildren = nodo.hijos && nodo.hijos.length > 0
    const isExpanded = expandedNodes.has(nodo.codigo)
    const isSelected = selectedNode === nodo.codigo

    return (
      <div key={nodo.codigo}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
            isSelected ? "bg-primary/20" : "hover:bg-muted/50"
          }`}
          style={{ paddingLeft: `${nivel * 20 + 8}px` }}
          onClick={() => setSelectedNode(nodo.codigo)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(nodo.codigo)
              }}
              className="p-1"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          {!hasChildren && <span className="w-6" />}
          <span className="text-sm text-foreground">
            {nodo.codigo} - {nodo.nombre}
          </span>
        </div>
        {hasChildren && isExpanded && nodo.hijos!.map((hijo) => renderNodo(hijo, nivel + 1))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={onBack} variant="outline" size="icon" className="rounded-lg bg-transparent">
              <ChevronLeft size={24} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Editar Entidad</h1>
              <p className="text-muted-foreground mt-1">Modifica la información de la entidad</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              1. Información General
              {infoGuardada && <Check size={16} className="inline ml-2" />}
            </button>
            <button
              onClick={() => setActiveTab("estado")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "estado"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              2. Estado
              {estadoGuardado && <Check size={16} className="inline ml-2" />}
            </button>
            <button
              onClick={() => setActiveTab("ambito")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "ambito"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              3. Ámbitos
              {ambitoGuardado && <Check size={16} className="inline ml-2" />}
            </button>
            <button
              onClick={() => setActiveTab("responsables")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "responsables"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              4. Responsables
              {responsablesGuardado && <Check size={16} className="inline ml-2" />}
            </button>
            <button
              onClick={() => setActiveTab("clasificadores")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "clasificadores"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              5. Atributos Extensibles
              {clasificadoresGuardado && <Check size={16} className="inline ml-2" />}
            </button>
            <button
              onClick={() => setActiveTab("composicion")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "composicion"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              6. Composición Patrimonial
            </button>
            <button
              onClick={() => setActiveTab("cuin")}
              className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === "cuin"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              7. CUIN
            </button>
          </div>
        </div>

        {/* TAB 1: INFORMACIÓN GENERAL */}
        {activeTab === "info" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">NIT *</label>
                <input
                  type="text"
                  value={formInfo.nit}
                  disabled
                  className="w-full px-4 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Sigla</label>
                <input
                  type="text"
                  value={formInfo.sigla}
                  onChange={(e) => setFormInfo({ ...formInfo, sigla: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Razón Social *</label>
                <input
                  type="text"
                  value={formInfo.razonSocial}
                  onChange={(e) => setFormInfo({ ...formInfo, razonSocial: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Código Entidad</label>
                <input
                  type="text"
                  value={formInfo.codigoEntidad}
                  onChange={(e) => setFormInfo({ ...formInfo, codigoEntidad: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Departamento *</label>
                <select
                  value={formInfo.departamento}
                  onChange={(e) => setFormInfo({ ...formInfo, departamento: e.target.value, municipio: "" })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona un departamento...</option>
                  {departamentos.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Municipio *</label>
                <select
                  value={formInfo.municipio}
                  onChange={(e) => setFormInfo({ ...formInfo, municipio: e.target.value })}
                  disabled={!formInfo.departamento}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                >
                  <option value="">Selecciona municipio...</option>
                  {formInfo.departamento &&
                    getMunicipios(formInfo.departamento).map((mun) => (
                      <option key={mun} value={mun}>
                        {mun}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Dirección</label>
                <input
                  type="text"
                  value={formInfo.direccion}
                  onChange={(e) => setFormInfo({ ...formInfo, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Teléfono</label>
                <input
                  type="text"
                  value={formInfo.telefono}
                  onChange={(e) => setFormInfo({ ...formInfo, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={formInfo.email}
                  onChange={(e) => setFormInfo({ ...formInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button onClick={handleGuardarInfo} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Información General
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: ESTADO */}
        {activeTab === "estado" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Estado de la Entidad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Estado *</label>
                <select
                  value={formEstado.estado}
                  onChange={(e) => setFormEstado({ ...formEstado, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona estado...</option>
                  {nuevoEstadoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Subestado *</label>
                <select
                  value={formEstado.subestado}
                  onChange={(e) => setFormEstado({ ...formEstado, subestado: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona subestado...</option>
                  {subestadoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Fecha Nuevo Estado</label>
                <input
                  type="date"
                  value={formEstado.fechaNuevoEstado}
                  onChange={(e) => setFormEstado({ ...formEstado, fechaNuevoEstado: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Acto Administrativo</label>
                <input
                  type="text"
                  value={formEstado.actoAdministrativo}
                  onChange={(e) => setFormEstado({ ...formEstado, actoAdministrativo: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Observaciones</label>
                <textarea
                  value={formEstado.observaciones}
                  onChange={(e) => setFormEstado({ ...formEstado, observaciones: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button onClick={handleGuardarEstado} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Estado
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: ÁMBITOS */}
        {activeTab === "ambito" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Ámbitos</h2>
              <Button
                onClick={() => setShowAddCategoria(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Categoría
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {categoriasAmbito.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-border rounded-lg p-4 flex justify-between items-start hover:bg-muted/30 transition"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Categoría</p>
                      <p className="text-foreground">{cat.categoria}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Ámbito</p>
                      <p className="text-foreground">{cat.ambito}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Año</p>
                      <p className="text-foreground">{cat.año}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Periodo</p>
                      <p className="text-foreground">{cat.periodo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminarCategoria(cat.id)}
                    className="ml-4 p-2 hover:bg-destructive/20 rounded-md transition text-destructive"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {categoriasAmbito.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay categorías agregadas. Haz clic en "Agregar Categoría" para comenzar.
                </div>
              )}
            </div>

            {/* Modal Agregar Categoría */}
            {showAddCategoria && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground">Agregar Categoría</h3>
                    <button onClick={() => setShowAddCategoria(false)}>
                      <X size={24} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-foreground mb-2">Categoría *</label>
                      <select
                        value={newCategoria.categoria}
                        onChange={(e) =>
                          setNewCategoria({ ...newCategoria, categoria: e.target.value, ambito: "", periodo: "" })
                        }
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecciona una categoría...</option>
                        {categoriaOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Ámbito *</label>
                      <select
                        value={newCategoria.ambito}
                        onChange={(e) => setNewCategoria({ ...newCategoria, ambito: e.target.value })}
                        disabled={!newCategoria.categoria}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                      >
                        <option value="">Selecciona un ámbito...</option>
                        {newCategoria.categoria &&
                          ambitoByCategoria[newCategoria.categoria]?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Año *</label>
                      <select
                        value={newCategoria.año}
                        onChange={(e) => setNewCategoria({ ...newCategoria, año: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecciona año...</option>
                        {[2024, 2025, 2026].map((año) => (
                          <option key={año} value={año}>
                            {año}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Periodo *</label>
                      <select
                        value={newCategoria.periodo}
                        onChange={(e) => setNewCategoria({ ...newCategoria, periodo: e.target.value })}
                        disabled={!newCategoria.categoria}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                      >
                        <option value="">Selecciona periodo...</option>
                        {newCategoria.categoria &&
                          periodoByCategoria[newCategoria.categoria]?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button onClick={() => setShowAddCategoria(false)} variant="outline">
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCategoria} className="bg-primary hover:bg-primary/90">
                      <Plus size={18} className="mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Button onClick={handleGuardarAmbito} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Ámbitos
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: RESPONSABLES */}
        {activeTab === "responsables" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Responsables</h2>
              <Button
                onClick={() => setShowAddResponsable(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Responsable
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {responsables.map((resp) => (
                <div
                  key={resp.id}
                  className="border border-border rounded-lg p-4 flex justify-between items-start hover:bg-muted/30 transition"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Tipo</p>
                      <p className="text-foreground">{resp.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Nombres</p>
                      <p className="text-foreground">{resp.nombres}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Cédula</p>
                      <p className="text-foreground">{resp.cedula}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                      <p className="text-foreground">{resp.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Cargo</p>
                      <p className="text-foreground">{resp.cargo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">En Propiedad</p>
                      <p className="text-foreground">{resp.enPropiedad ? "Sí" : "No"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminarResponsable(resp.id)}
                    className="ml-4 p-2 hover:bg-destructive/20 rounded-md transition text-destructive"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {responsables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay responsables agregados. Haz clic en "Agregar Responsable" para comenzar.
                </div>
              )}
            </div>

            {/* Modal Agregar Responsable */}
            {showAddResponsable && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                <div className="bg-card border border-border rounded-lg p-6 max-w-3xl w-full mx-4 my-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground">Agregar Responsable</h3>
                    <button onClick={() => setShowAddResponsable(false)}>
                      <X size={24} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Tipo *</label>
                      <select
                        value={newResponsable.tipo}
                        onChange={(e) => setNewResponsable({ ...newResponsable, tipo: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecciona tipo...</option>
                        {tiposResponsable.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Nombres *</label>
                      <input
                        type="text"
                        value={newResponsable.nombres}
                        onChange={(e) => setNewResponsable({ ...newResponsable, nombres: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Sexo</label>
                      <select
                        value={newResponsable.sexo}
                        onChange={(e) => setNewResponsable({ ...newResponsable, sexo: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecciona...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Cédula *</label>
                      <input
                        type="text"
                        value={newResponsable.cedula}
                        onChange={(e) => setNewResponsable({ ...newResponsable, cedula: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Teléfono</label>
                      <input
                        type="text"
                        value={newResponsable.telefono}
                        onChange={(e) => setNewResponsable({ ...newResponsable, telefono: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        value={newResponsable.email}
                        onChange={(e) => setNewResponsable({ ...newResponsable, email: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Cargo</label>
                      <input
                        type="text"
                        value={newResponsable.cargo}
                        onChange={(e) => setNewResponsable({ ...newResponsable, cargo: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Tarjeta Profesional</label>
                      <input
                        type="text"
                        value={newResponsable.tarjetaProfesional}
                        onChange={(e) => setNewResponsable({ ...newResponsable, tarjetaProfesional: e.target.value })}
                        className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newResponsable.enPropiedad}
                        onChange={(e) => setNewResponsable({ ...newResponsable, enPropiedad: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-semibold text-foreground">En Propiedad</label>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button onClick={() => setShowAddResponsable(false)} variant="outline">
                      Cancelar
                    </Button>
                    <Button onClick={handleAddResponsable} className="bg-primary hover:bg-primary/90">
                      <Plus size={18} className="mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Button onClick={handleGuardarResponsables} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Responsables
              </Button>
            </div>
          </div>
        )}

        {/* TAB 5: ATRIBUTOS EXTENSIBLES */}
        {activeTab === "clasificadores" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Atributos Extensibles</h2>
              <Button
                onClick={() => setShowAddClasificador(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Atributo
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {clasificadoresAsignados.map((clas) => (
                <div
                  key={clas.id}
                  className="border border-border rounded-lg p-4 flex justify-between items-start hover:bg-muted/30 transition"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Clasificador</p>
                      <p className="text-foreground">{clas.nombreClasificador}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Nodo Seleccionado</p>
                      <p className="text-foreground">{clas.nodoSeleccionado}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Código</p>
                      <p className="text-foreground">{clas.codigoNodo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminarClasificador(clas.id)}
                    className="ml-4 p-2 hover:bg-destructive/20 rounded-md transition text-destructive"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {clasificadoresAsignados.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay atributos agregados. Haz clic en "Agregar Atributo" para comenzar.
                </div>
              )}
            </div>

            {/* Modal Agregar Clasificador */}
            {showAddClasificador && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground">Agregar Atributo Extensible</h3>
                    <button onClick={() => setShowAddClasificador(false)}>
                      <X size={24} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Selecciona Clasificador *
                    </label>
                    <select
                      value={selectedClasificador}
                      onChange={(e) => {
                        setSelectedClasificador(e.target.value)
                        setSelectedNode(null)
                        setExpandedNodes(new Set())
                      }}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecciona...</option>
                      {getNombresClasificadores().map((nombre) => (
                        <option key={nombre} value={nombre}>
                          {nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedClasificador && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">Selecciona Nodo *</label>
                      <div className="border border-border rounded-lg p-4 max-h-64 overflow-y-auto bg-background">
                        {renderNodo(getClasificador(selectedClasificador))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 justify-end">
                    <Button onClick={() => setShowAddClasificador(false)} variant="outline">
                      Cancelar
                    </Button>
                    <Button onClick={handleAddClasificador} className="bg-primary hover:bg-primary/90">
                      <Plus size={18} className="mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Button onClick={handleGuardarClasificadores} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar Atributos Extensibles
              </Button>
            </div>
          </div>
        )}

        {/* TAB 6: COMPOSICIÓN PATRIMONIAL */}
        {activeTab === "composicion" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Composición Patrimonial</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Sección pendiente de especificación</p>
              <p className="text-sm">Las instrucciones para esta sección están en desarrollo.</p>
            </div>
          </div>
        )}

        {/* TAB 7: CUIN */}
        {activeTab === "cuin" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">CUIN</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Sección pendiente de especificación</p>
              <p className="text-sm">Las instrucciones para esta sección están en desarrollo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
