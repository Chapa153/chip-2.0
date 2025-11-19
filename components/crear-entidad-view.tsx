"use client"

import { useState } from "react"
import { ChevronLeft, Check, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDepartamentos, getMunicipios } from "@/lib/colombia-data"
import { getNombresClasificadores, getClasificador, type NodoClasificador } from "@/lib/clasificadores-data"

interface CrearEntidadViewProps {
  onBack: () => void
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

// Agregar interfaz para clasificador asignado
interface ClasificadorAsignado {
  id: string
  nombreClasificador: string
  nodoSeleccionado: string
  codigoNodo: string
}

export default function CrearEntidadView({ onBack }: CrearEntidadViewProps) {
  const [activeTab, setActiveTab] = useState<"info" | "estado" | "ambito" | "responsables" | "clasificadores">("info")
  const [infoGuardada, setInfoGuardada] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState(false)
  const [ambitoGuardado, setAmbitoGuardado] = useState(false)
  // Agregar estado para responsables guardado
  const [responsablesGuardado, setResponsablesGuardado] = useState(false)

  const documentoTypes = [
    "Ley",
    "Decreto",
    "Acuerdo",
    "Ordenanza",
    "Escritura pública",
    "Constitución",
    "Otro documento legal",
  ]

  const sectorOptions = [
    "Sector público nacional",
    "Sector público territorial",
    "Sector privado",
    "Fondos no consolidables",
  ]

  const naturalezaBySetor: Record<string, string[]> = {
    "Sector público territorial": [
      "Principal",
      "Patrimonios autónomos",
      "Vinculada asociaciones",
      "Adscrita",
      "Vinculada indirecta no societaria",
      "Vinculada directa no societaria",
      "Vinculada directa societaria",
      "Otro",
    ],
    "Sector público nacional": ["Principal", "Vinculada", "Adscrita", "Otro"],
    "Sector privado": ["Empresa privada", "ONG", "Fundación", "Otro"],
    "Fondos no consolidables": ["Fondo especial", "Otro"],
  }

  const nuevoEstadoOptions = ["SOLICITUD", "ACTIVO"]
  const subestadoOptions = ["ACTIVA", "EN EXCESIÓN", "PROYECTO DECO", "EN FUSIÓN", "EN LIQUIDACIÓN"]

  const categoriaOptions = [
    "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
    "BDME - BOLETÍN DE DEUDORES MOROSOS DEL ESTADO",
    "ECIC - EVALUACIÓN DE CONTROL INTERNO CONTABLE",
  ]

  const formulariosByCategoria: Record<string, string[]> = {
    "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA": [
      "SALDOS y MOVIMIENTOS",
      "OPERACIONES RECÍPROCAS",
      "VARIACIONES TRIMESTRALES",
      "CAMBIOS RELEVANTES",
    ],
    "BDME - BOLETÍN DE DEUDORES MOROSOS DEL ESTADO": ["FORMULARIO ALFA", "FORMULARIO BETA"],
    "ECIC - EVALUACIÓN DE CONTROL INTERNO CONTABLE": ["FORMULARIO GAMMA", "FORMULARIO DELTA"],
  }

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

  const categoriasbyResponsable: Record<string, string[]> = {
    "Representante Legal": categoriaOptions,
    Contador: ["INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA"],
    "Revisor fiscal": [],
    "Director financiero": [],
    "Jefe de presupuesto": [],
    "Jefe de control interno": [],
  }

  const currentYear = new Date().getFullYear()
  const años = Array.from({ length: 11 }, (_, i) => (currentYear + 1 - i).toString())

  const [formInfo, setFormInfo] = useState({
    nit: "",
    sigla: "",
    razonSocial: "",
    objeto: "",
    tipoDocumento: "",
    numeroDocumento: "",
    fechaDocumento: "",
    departamento: "",
    municipio: "",
    direccion: "",
    codigoPostal: "",
    telefono: "",
    fax: "",
    email: "",
    paginaWeb: "",
    sector: "",
    naturaleza: "",
    departamentoTerritorial: "",
    municipioTerritorial: "",
    agregadora: false,
    consolidadora: false,
    planeadora: false,
  })

  const [formEstado, setFormEstado] = useState({
    nit: "",
    razonSocial: "",
    estadoActual: "SOLICITUD",
    subestadoActual: "NINGUNO",
    nuevoEstado: "SOLICITUD",
    subestadoNuevo: "",
    fechaNuevoEstado: new Date().toISOString().split("T")[0],
    actoAdministrativo: "",
    observaciones: "",
  })

  const [formAmbito, setFormAmbito] = useState({
    categoria: "",
    ambito: "",
    año: "",
    periodo: "",
  })

  const [categoriasAgregadas, setCategoriasAgregadas] = useState<CategoriaAmbito[]>([])

  const [formResponsable, setFormResponsable] = useState({
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

  const [responsablesAgregados, setResponsablesAgregados] = useState<Responsable[]>([])

  const [clasificadorSeleccionado, setClasificadorSeleccionado] = useState("")
  const [nodoExpandido, setNodoExpandido] = useState<string[]>([])
  const [nodoSeleccionado, setNodoSeleccionado] = useState<{ codigo: string; nombre: string } | null>(null)
  const [clasificadoresAsignados, setClasificadoresAsignados] = useState<ClasificadorAsignado[]>([])

  const departamentos = getDepartamentos()
  const municipios = formInfo.departamento ? getMunicipios(formInfo.departamento) : []
  const municipiosTerritorial = formInfo.departamentoTerritorial ? getMunicipios(formInfo.departamentoTerritorial) : []

  // Validar email
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return email === "" || re.test(email)
  }

  // Validar URL
  const isValidUrl = (url: string) => {
    if (url === "") return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSaveInfo = () => {
    // Validaciones de campos obligatorios
    const requiredFields = ["nit", "razonSocial", "departamento", "municipio", "sector"]
    const missingFields = requiredFields.filter((field) => !formInfo[field as keyof typeof formInfo])

    if (missingFields.length > 0) {
      alert(`Por favor completa los campos obligatorios: ${missingFields.join(", ")}`)
      return
    }

    // Validar email si está completado
    if (!isValidEmail(formInfo.email)) {
      alert("Por favor ingresa un correo electrónico válido")
      return
    }

    // Validar página web si está completada
    if (!isValidUrl(formInfo.paginaWeb)) {
      alert("Por favor ingresa una URL válida")
      return
    }

    // Actualizar formulario de estado con datos de la entidad
    setFormEstado({
      ...formEstado,
      nit: formInfo.nit,
      razonSocial: formInfo.razonSocial,
      fechaNuevoEstado: new Date().toISOString().split("T")[0],
    })

    setInfoGuardada(true)
    alert("Información general guardada. Ahora puedes configurar los cambios de estado.")
  }

  const handleSaveEstado = () => {
    setEstadoGuardado(true)
    alert("Cambio de estado guardado. Ahora puedes configurar el ámbito.")
  }

  const handleAgregarCategoria = () => {
    // Validar que todos los campos estén completos
    if (!formAmbito.categoria || !formAmbito.ambito || !formAmbito.año || !formAmbito.periodo) {
      alert("Por favor completa todos los campos antes de agregar la categoría")
      return
    }

    const existeCategoria = categoriasAgregadas.some((cat) => cat.categoria === formAmbito.categoria)

    if (existeCategoria) {
      alert("Esta categoría ya fue agregada. No se pueden agregar categorías duplicadas.")
      return
    }

    // Agregar categoría
    const nuevaCategoria: CategoriaAmbito = {
      id: `${Date.now()}`,
      ...formAmbito,
    }

    setCategoriasAgregadas([...categoriasAgregadas, nuevaCategoria])

    // Resetear formulario
    setFormAmbito({
      categoria: "",
      ambito: "",
      año: "",
      periodo: "",
    })

    alert("Categoría agregada exitosamente")
  }

  const handleEliminarCategoria = (id: string) => {
    setCategoriasAgregadas(categoriasAgregadas.filter((cat) => cat.id !== id))
  }

  const handleSaveAmbito = () => {
    if (categoriasAgregadas.length === 0) {
      alert("Debes agregar al menos una categoría antes de continuar")
      return
    }

    setAmbitoGuardado(true)
    alert("Ámbito guardado. Ahora puedes agregar los responsables.")
  }

  const handleAgregarResponsable = () => {
    // Validar campos obligatorios
    if (
      !formResponsable.tipo ||
      !formResponsable.nombres ||
      !formResponsable.sexo ||
      !formResponsable.cedula ||
      !formResponsable.email ||
      !formResponsable.cargo
    ) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    // Validar email
    if (!isValidEmail(formResponsable.email)) {
      alert("Por favor ingresa un correo electrónico válido")
      return
    }

    // Validar tarjeta profesional para contador y revisor fiscal
    if (
      (formResponsable.tipo === "Contador" || formResponsable.tipo === "Revisor fiscal") &&
      !formResponsable.tarjetaProfesional
    ) {
      alert(`La tarjeta profesional es obligatoria para ${formResponsable.tipo}`)
      return
    }

    // Verificar que no se agregue dos veces el mismo tipo
    const existeTipo = responsablesAgregados.some((resp) => resp.tipo === formResponsable.tipo)
    if (existeTipo) {
      alert(`Ya existe un responsable de tipo ${formResponsable.tipo}`)
      return
    }

    // Agregar responsable
    const nuevoResponsable: Responsable = {
      id: `${Date.now()}`,
      ...formResponsable,
    }

    setResponsablesAgregados([...responsablesAgregados, nuevoResponsable])

    // Resetear formulario
    setFormResponsable({
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

    alert("Responsable agregado exitosamente")
  }

  const handleEliminarResponsable = (id: string) => {
    setResponsablesAgregados(responsablesAgregados.filter((resp) => resp.id !== id))
  }

  const handleFinalizarCreacion = () => {
    // Validar que existan al menos Representante Legal y Contador
    const tieneRepresentante = responsablesAgregados.some((resp) => resp.tipo === "Representante Legal")
    const tieneContador = responsablesAgregados.some((resp) => resp.tipo === "Contador")

    if (!tieneRepresentante || !tieneContador) {
      alert("Debes agregar al menos un Representante Legal y un Contador")
      return
    }

    // Actualizar estado y mensaje
    setResponsablesGuardado(true)
    alert("Responsables guardados. Ahora puedes configurar los atributos extensibles.")
  }

  const toggleNodo = (codigo: string) => {
    setNodoExpandido((prev) => (prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]))
  }

  const seleccionarNodo = (codigo: string, nombre: string) => {
    setNodoSeleccionado({ codigo, nombre })
  }

  const handleAgregarClasificador = () => {
    if (!clasificadorSeleccionado) {
      alert("Selecciona un clasificador")
      return
    }

    if (!nodoSeleccionado) {
      alert("Selecciona un nodo del árbol")
      return
    }

    // Validar que no se repita el clasificador
    const existeClasificador = clasificadoresAsignados.some((c) => c.nombreClasificador === clasificadorSeleccionado)
    if (existeClasificador) {
      alert("Este clasificador ya fue agregado")
      return
    }

    const nuevoClasificador: ClasificadorAsignado = {
      id: `${Date.now()}`,
      nombreClasificador: clasificadorSeleccionado,
      nodoSeleccionado: nodoSeleccionado.nombre,
      codigoNodo: nodoSeleccionado.codigo,
    }

    setClasificadoresAsignados([...clasificadoresAsignados, nuevoClasificador])

    // Resetear selección
    setClasificadorSeleccionado("")
    setNodoSeleccionado(null)
    setNodoExpandido([])

    alert("Clasificador agregado exitosamente")
  }

  const handleEliminarClasificador = (id: string) => {
    setClasificadoresAsignados(clasificadoresAsignados.filter((c) => c.id !== id))
  }

  // Función para finalizar la creación de la entidad
  const handleFinalizarEntidad = () => {
    if (clasificadoresAsignados.length === 0) {
      alert("Debes agregar al menos un clasificador antes de finalizar")
      return
    }

    alert("¡Entidad creada exitosamente con todos sus atributos!")
    onBack()
  }

  const renderNodoArbol = (nodo: NodoClasificador, nivel = 0) => {
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0
    const estaExpandido = nodoExpandido.includes(nodo.codigo)
    const estaSeleccionado = nodoSeleccionado?.codigo === nodo.codigo

    return (
      <div key={nodo.codigo} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition ${
            estaSeleccionado ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
          style={{ marginLeft: `${nivel * 20}px` }}
          onClick={() => seleccionarNodo(nodo.codigo, nodo.nombre)}
        >
          {tieneHijos && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNodo(nodo.codigo)
              }}
              className="p-0.5 hover:bg-muted-foreground/20 rounded"
            >
              {estaExpandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {!tieneHijos && <div className="w-5" />}
          <span className="text-sm font-medium">{nodo.codigo}</span>
          <span className="text-sm">{nodo.nombre}</span>
        </div>
        {tieneHijos && estaExpandido && <div>{nodo.hijos!.map((hijo) => renderNodoArbol(hijo, nivel + 1))}</div>}
      </div>
    )
  }

  const clasificadorActual = clasificadorSeleccionado ? getClasificador(clasificadorSeleccionado) : null

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" size="icon" className="rounded-lg bg-transparent">
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crear Nueva Entidad</h1>
            <p className="text-muted-foreground mt-1">Completa el formulario en los diferentes tabs</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-3 px-4 font-medium transition-all border-b-2 ${
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            1. Información General
          </button>
          <button
            onClick={() => {
              if (infoGuardada) {
                setActiveTab("estado")
              } else {
                alert("Debes guardar la Información General primero")
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 ${
              activeTab === "estado"
                ? "border-primary text-primary"
                : `border-transparent ${
                    infoGuardada ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground opacity-50"
                  }`
            }`}
          >
            2. Cambio Estado
            {infoGuardada && <Check size={16} className="inline ml-2" />}
          </button>
          <button
            onClick={() => {
              if (estadoGuardado) {
                setActiveTab("ambito")
              } else {
                alert("Debes guardar el Cambio de Estado primero")
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 ${
              activeTab === "ambito"
                ? "border-primary text-primary"
                : `border-transparent ${
                    estadoGuardado ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground opacity-50"
                  }`
            }`}
          >
            3. Ámbito
            {estadoGuardado && <Check size={16} className="inline ml-2" />}
          </button>
          <button
            onClick={() => {
              if (ambitoGuardado) {
                setActiveTab("responsables")
              } else {
                alert("Debes guardar el Ámbito primero")
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 ${
              activeTab === "responsables"
                ? "border-primary text-primary"
                : `border-transparent ${
                    ambitoGuardado ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground opacity-50"
                  }`
            }`}
          >
            4. Responsables
            {ambitoGuardado && <Check size={16} className="inline ml-2" />}
          </button>
          {/* Nuevo tab para atributos extensibles */}
          <button
            onClick={() => {
              if (responsablesGuardado) {
                setActiveTab("clasificadores")
              } else {
                alert("Debes guardar los Responsables primero")
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 ${
              activeTab === "clasificadores"
                ? "border-primary text-primary"
                : `border-transparent ${
                    responsablesGuardado
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground opacity-50"
                  }`
            }`}
          >
            5. Atributos Extensibles
            {responsablesGuardado && <Check size={16} className="inline ml-2" />}
          </button>
        </div>
      </div>

      {/* TAB 1: INFORMACIÓN GENERAL */}
      {activeTab === "info" && (
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* NIT */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">NIT *</label>
              <input
                type="text"
                value={formInfo.nit}
                onChange={(e) => setFormInfo({ ...formInfo, nit: e.target.value })}
                placeholder="Ej: 1234567890"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* SIGLA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sigla</label>
              <input
                type="text"
                value={formInfo.sigla}
                onChange={(e) => setFormInfo({ ...formInfo, sigla: e.target.value })}
                placeholder="Ej: EPS"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* RAZÓN SOCIAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Razón Social *</label>
              <input
                type="text"
                value={formInfo.razonSocial}
                onChange={(e) => setFormInfo({ ...formInfo, razonSocial: e.target.value })}
                placeholder="Nombre completo de la entidad"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* OBJETO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Objeto</label>
              <textarea
                value={formInfo.objeto}
                onChange={(e) => setFormInfo({ ...formInfo, objeto: e.target.value })}
                placeholder="Descripción del objeto de la entidad"
                rows={2}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* TIPO DOCUMENTO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Documento de Creación</label>
              <select
                value={formInfo.tipoDocumento}
                onChange={(e) => setFormInfo({ ...formInfo, tipoDocumento: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un tipo...</option>
                {documentoTypes.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* NÚMERO DOCUMENTO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Número de Documento</label>
              <input
                type="text"
                value={formInfo.numeroDocumento}
                onChange={(e) => setFormInfo({ ...formInfo, numeroDocumento: e.target.value })}
                placeholder="Ej: 123456"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* FECHA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fecha</label>
              <input
                type="date"
                value={formInfo.fechaDocumento}
                onChange={(e) => setFormInfo({ ...formInfo, fechaDocumento: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* DEPARTAMENTO - Convertido a select simple */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Departamento *</label>
              <select
                value={formInfo.departamento}
                onChange={(e) =>
                  setFormInfo({
                    ...formInfo,
                    departamento: e.target.value,
                    municipio: "", // Reset municipio al cambiar departamento
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un departamento...</option>
                {departamentos.map((depto) => (
                  <option key={depto} value={depto}>
                    {depto}
                  </option>
                ))}
              </select>
            </div>

            {/* MUNICIPIO - Convertido a select simple */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Municipio *</label>
              <select
                value={formInfo.municipio}
                onChange={(e) => setFormInfo({ ...formInfo, municipio: e.target.value })}
                disabled={!formInfo.departamento}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="">
                  {!formInfo.departamento ? "Selecciona departamento primero" : "Selecciona un municipio..."}
                </option>
                {municipios.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>

            {/* DIRECCIÓN */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Dirección</label>
              <input
                type="text"
                value={formInfo.direccion}
                onChange={(e) => setFormInfo({ ...formInfo, direccion: e.target.value })}
                placeholder="Ej: Carrera 5 # 10-50"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* CÓDIGO POSTAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Código Postal</label>
              <input
                type="text"
                value={formInfo.codigoPostal}
                onChange={(e) => setFormInfo({ ...formInfo, codigoPostal: e.target.value })}
                placeholder="Ej: 110111"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Teléfono</label>
              <input
                type="tel"
                value={formInfo.telefono}
                onChange={(e) => setFormInfo({ ...formInfo, telefono: e.target.value })}
                placeholder="Ej: 6012341234"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* FAX */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fax</label>
              <input
                type="text"
                value={formInfo.fax}
                onChange={(e) => setFormInfo({ ...formInfo, fax: e.target.value })}
                placeholder="Ej: 6012341234"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">E-mail</label>
              <div>
                <input
                  type="email"
                  value={formInfo.email}
                  onChange={(e) => setFormInfo({ ...formInfo, email: e.target.value })}
                  placeholder=" correo@example.com"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    !isValidEmail(formInfo.email) && formInfo.email !== ""
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                />
                {!isValidEmail(formInfo.email) && formInfo.email !== "" && (
                  <p className="text-red-500 text-xs mt-1">Correo electrónico inválido</p>
                )}
              </div>
            </div>

            {/* PÁGINA WEB */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Página Web</label>
              <div>
                <input
                  type="text"
                  value={formInfo.paginaWeb}
                  onChange={(e) => setFormInfo({ ...formInfo, paginaWeb: e.target.value })}
                  placeholder="https://www.example.com"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    !isValidUrl(formInfo.paginaWeb) && formInfo.paginaWeb !== ""
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                />
                {!isValidUrl(formInfo.paginaWeb) && formInfo.paginaWeb !== "" && (
                  <p className="text-red-500 text-xs mt-1">URL inválida</p>
                )}
              </div>
            </div>

            {/* SECTOR */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sector *</label>
              <select
                value={formInfo.sector}
                onChange={(e) =>
                  setFormInfo({
                    ...formInfo,
                    sector: e.target.value,
                    naturaleza: "", // Reset naturaleza
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un sector...</option>
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* NATURALEZA (Dependiente de Sector) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Naturaleza</label>
              <select
                value={formInfo.naturaleza}
                onChange={(e) => setFormInfo({ ...formInfo, naturaleza: e.target.value })}
                disabled={!formInfo.sector}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="">
                  {!formInfo.sector ? "Selecciona un sector primero" : "Selecciona una naturaleza..."}
                </option>
                {formInfo.sector &&
                  naturalezaBySetor[formInfo.sector]?.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
              </select>
            </div>

            {/* DEPARTAMENTO TERRITORIAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Departamento Territorial</label>
              <select
                value={formInfo.departamentoTerritorial}
                onChange={(e) =>
                  setFormInfo({
                    ...formInfo,
                    departamentoTerritorial: e.target.value,
                    municipioTerritorial: "",
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un departamento...</option>
                {departamentos.map((depto) => (
                  <option key={depto} value={depto}>
                    {depto}
                  </option>
                ))}
              </select>
            </div>

            {/* MUNICIPIO TERRITORIAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Municipio Territorial</label>
              <select
                value={formInfo.municipioTerritorial}
                onChange={(e) => setFormInfo({ ...formInfo, municipioTerritorial: e.target.value })}
                disabled={!formInfo.departamentoTerritorial}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="">
                  {!formInfo.departamentoTerritorial ? "Selecciona departamento primero" : "Selecciona un municipio..."}
                </option>
                {municipiosTerritorial.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHECKBOXES */}
          <div className="bg-muted rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-foreground mb-4">Características Especiales</p>
            <div className="flex flex-wrap gap-6">
              {[
                { key: "agregadora", label: "Agregadora" },
                { key: "consolidadora", label: "Consolidadora" },
                { key: "planeadora", label: "Planeadora" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formInfo[key as keyof typeof formInfo] as boolean}
                    onChange={(e) => setFormInfo({ ...formInfo, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button onClick={onBack} variant="outline" className="border-border hover:bg-muted bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSaveInfo} className="bg-primary hover:bg-primary/90">
              <Check size={18} className="mr-2" />
              Guardar Información General
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: CAMBIO ESTADO */}
      {activeTab === "estado" && (
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Información de la entidad */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIT</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.nit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.razonSocial}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ESTADO ACTUAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Estado Actual</label>
              <input
                type="text"
                value={formEstado.estadoActual}
                disabled
                className="w-full px-4 py-2 border border-input rounded-md bg-muted text-foreground"
              />
            </div>

            {/* SUBESTADO ACTUAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Subestado Actual</label>
              <input
                type="text"
                value={formEstado.subestadoActual}
                disabled
                className="w-full px-4 py-2 border border-input rounded-md bg-muted text-foreground"
              />
            </div>

            {/* NUEVO ESTADO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Nuevo Estado</label>
              <select
                value={formEstado.nuevoEstado}
                onChange={(e) =>
                  setFormEstado({
                    ...formEstado,
                    nuevoEstado: e.target.value,
                    subestadoNuevo: "",
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {nuevoEstadoOptions.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBESTADO NUEVO (Solo si se selecciona ACTIVO) */}
            {formEstado.nuevoEstado === "ACTIVO" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Subestado Nuevo</label>
                <select
                  value={formEstado.subestadoNuevo}
                  onChange={(e) => setFormEstado({ ...formEstado, subestadoNuevo: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona un subestado...</option>
                  {subestadoOptions.map((subestado) => (
                    <option key={subestado} value={subestado}>
                      {subestado}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* FECHA INICIAL NUEVO ESTADO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fecha Inicial Nuevo Estado</label>
              <input
                type="date"
                value={formEstado.fechaNuevoEstado}
                onChange={(e) => setFormEstado({ ...formEstado, fechaNuevoEstado: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* ACTO ADMINISTRATIVO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Acto Administrativo</label>
              <input
                type="text"
                value={formEstado.actoAdministrativo}
                onChange={(e) => setFormEstado({ ...formEstado, actoAdministrativo: e.target.value })}
                placeholder="Ej: Resolución 001-2024"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-2">Observaciones</label>
            <textarea
              value={formEstado.observaciones}
              onChange={(e) => setFormEstado({ ...formEstado, observaciones: e.target.value })}
              placeholder="Ingresa observaciones relevantes sobre el cambio de estado..."
              rows={4}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button onClick={() => setActiveTab("info")} variant="outline" className="border-border hover:bg-muted">
              Volver
            </Button>
            <Button onClick={handleSaveEstado} className="bg-primary hover:bg-primary/90">
              <Check size={18} className="mr-2" />
              Guardar Cambio Estado
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: ÁMBITO */}
      {activeTab === "ambito" && (
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Información de la entidad */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIT</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.nit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.razonSocial}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-6">Configuración de Ámbito</h3>

          {/* Formulario para agregar categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* CATEGORÍA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Categoría *</label>
              <select
                value={formAmbito.categoria}
                onChange={(e) =>
                  setFormAmbito({
                    ...formAmbito,
                    categoria: e.target.value,
                    ambito: "",
                    periodo: "",
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona una categoría...</option>
                {categoriaOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* ÁMBITO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Ámbito *</label>
              <select
                value={formAmbito.ambito}
                onChange={(e) => setFormAmbito({ ...formAmbito, ambito: e.target.value })}
                disabled={!formAmbito.categoria}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="">
                  {!formAmbito.categoria ? "Selecciona una categoría primero" : "Selecciona un ámbito..."}
                </option>
                {formAmbito.categoria &&
                  ambitoByCategoria[formAmbito.categoria]?.map((amb) => (
                    <option key={amb} value={amb}>
                      {amb}
                    </option>
                  ))}
              </select>
            </div>

            {/* AÑO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Año *</label>
              <select
                value={formAmbito.año}
                onChange={(e) => setFormAmbito({ ...formAmbito, año: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un año...</option>
                {años.map((año) => (
                  <option key={año} value={año}>
                    {año}
                  </option>
                ))}
              </select>
            </div>

            {/* PERIODO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Periodo *</label>
              <select
                value={formAmbito.periodo}
                onChange={(e) => setFormAmbito({ ...formAmbito, periodo: e.target.value })}
                disabled={!formAmbito.categoria}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="">
                  {!formAmbito.categoria ? "Selecciona una categoría primero" : "Selecciona un periodo..."}
                </option>
                {formAmbito.categoria &&
                  periodoByCategoria[formAmbito.categoria]?.map((per) => (
                    <option key={per} value={per}>
                      {per}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Botón para agregar categoría */}
          <div className="mb-8">
            <Button onClick={handleAgregarCategoria} className="bg-green-600 hover:bg-green-700">
              <Plus size={18} className="mr-2" />
              Agregar Categoría
            </Button>
          </div>

          {/* Lista de categorías agregadas */}
          {categoriasAgregadas.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Categorías Configuradas</h4>
              <div className="space-y-3">
                {categoriasAgregadas.map((cat) => (
                  <div key={cat.id} className="bg-muted rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-2">{cat.categoria}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Ámbito:</span>
                          <p className="text-foreground">{cat.ambito}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Año:</span>
                          <p className="text-foreground">{cat.año}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Periodo:</span>
                          <p className="text-foreground">{cat.periodo}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarCategoria(cat.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay categorías */}
          {categoriasAgregadas.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800 text-sm">
                Debes agregar al menos una categoría para continuar con la creación de la entidad.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button onClick={() => setActiveTab("estado")} variant="outline" className="border-border hover:bg-muted">
              Volver
            </Button>
            <Button
              onClick={handleSaveAmbito}
              className="bg-primary hover:bg-primary/90"
              disabled={categoriasAgregadas.length === 0}
            >
              <Check size={18} className="mr-2" />
              Guardar Ámbito
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: RESPONSABLES */}
      {activeTab === "responsables" && (
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Información de la entidad */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIT</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.nit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.razonSocial}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-6">Agregar Responsables</h3>

          {/* Formulario para agregar responsables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* TIPO DE RESPONSABLE */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Tipo de Responsable *</label>
              <select
                value={formResponsable.tipo}
                onChange={(e) => setFormResponsable({ ...formResponsable, tipo: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un tipo...</option>
                {tiposResponsable.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Mostrar categorías asignadas según tipo de responsable */}
            {formResponsable.tipo && categoriasbyResponsable[formResponsable.tipo].length > 0 && (
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-3">
                  Categorías y formularios asignados a {formResponsable.tipo}:
                </p>
                <div className="space-y-3">
                  {categoriasbyResponsable[formResponsable.tipo].map((categoria) => (
                    <div key={categoria} className="bg-white rounded-md p-3">
                      <p className="font-semibold text-sm text-blue-900 mb-2">{categoria}</p>
                      <div className="flex flex-wrap gap-2">
                        {formulariosByCategoria[categoria]?.map((formulario) => (
                          <span key={formulario} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {formulario}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOMBRES Y APELLIDOS */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Nombres y Apellidos *</label>
              <input
                type="text"
                value={formResponsable.nombres}
                onChange={(e) => setFormResponsable({ ...formResponsable, nombres: e.target.value })}
                placeholder="Ej: Juan Pérez García"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* SEXO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sexo *</label>
              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sexo"
                    value="M"
                    checked={formResponsable.sexo === "M"}
                    onChange={(e) => setFormResponsable({ ...formResponsable, sexo: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">M</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sexo"
                    value="F"
                    checked={formResponsable.sexo === "F"}
                    onChange={(e) => setFormResponsable({ ...formResponsable, sexo: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">F</span>
                </label>
              </div>
            </div>

            {/* NÚMERO DE CÉDULA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Número de Cédula *</label>
              <input
                type="text"
                value={formResponsable.cedula}
                onChange={(e) => setFormResponsable({ ...formResponsable, cedula: e.target.value })}
                placeholder="Ej: 1234567890"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Teléfono</label>
              <input
                type="tel"
                value={formResponsable.telefono}
                onChange={(e) => setFormResponsable({ ...formResponsable, telefono: e.target.value })}
                placeholder="Ej: 6012341234"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* FAX */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fax</label>
              <input
                type="text"
                value={formResponsable.fax}
                onChange={(e) => setFormResponsable({ ...formResponsable, fax: e.target.value })}
                placeholder="Ej: 6012341234"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">E-mail *</label>
              <div>
                <input
                  type="email"
                  value={formResponsable.email}
                  onChange={(e) => setFormResponsable({ ...formResponsable, email: e.target.value })}
                  placeholder=" correo@example.com"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    !isValidEmail(formResponsable.email) && formResponsable.email !== ""
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                />
                {!isValidEmail(formResponsable.email) && formResponsable.email !== "" && (
                  <p className="text-red-500 text-xs mt-1">Correo electrónico inválido</p>
                )}
              </div>
            </div>

            {/* CARGO EN LA ENTIDAD */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Cargo en la Entidad *</label>
              <input
                type="text"
                value={formResponsable.cargo}
                onChange={(e) => setFormResponsable({ ...formResponsable, cargo: e.target.value })}
                placeholder="Ej: Director Financiero"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* TARJETA PROFESIONAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tarjeta Profesional{" "}
                {(formResponsable.tipo === "Contador" || formResponsable.tipo === "Revisor fiscal") && "*"}
              </label>
              <input
                type="text"
                value={formResponsable.tarjetaProfesional}
                onChange={(e) => setFormResponsable({ ...formResponsable, tarjetaProfesional: e.target.value })}
                placeholder="Ej: TP-123456"
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* CHECKBOX EN PROPIEDAD */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formResponsable.enPropiedad}
                  onChange={(e) => setFormResponsable({ ...formResponsable, enPropiedad: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm text-foreground">En propiedad</span>
              </label>
            </div>
          </div>

          {/* Botón para agregar responsable */}
          <div className="mb-8">
            <Button onClick={handleAgregarResponsable} className="bg-green-600 hover:bg-green-700">
              <Plus size={18} className="mr-2" />
              Agregar Responsable
            </Button>
          </div>

          {/* Lista de responsables agregados */}
          {responsablesAgregados.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Responsables Agregados</h4>
              <div className="space-y-3">
                {responsablesAgregados.map((resp) => (
                  <div key={resp.id} className="bg-muted rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                          {resp.tipo}
                        </span>
                        {resp.enPropiedad && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">En propiedad</span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground mb-2">{resp.nombres}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cédula:</span>
                          <p className="text-foreground">{resp.cedula}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cargo:</span>
                          <p className="text-foreground">{resp.cargo}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="text-foreground">{resp.email}</p>
                        </div>
                        {resp.tarjetaProfesional && (
                          <div>
                            <span className="text-muted-foreground">T. Profesional:</span>
                            <p className="text-foreground">{resp.tarjetaProfesional}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarResponsable(resp.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si faltan responsables obligatorios */}
          {(!responsablesAgregados.some((r) => r.tipo === "Representante Legal") ||
            !responsablesAgregados.some((r) => r.tipo === "Contador")) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800 text-sm">
                Debes agregar al menos un <strong>Representante Legal</strong> y un <strong>Contador</strong> para
                finalizar la creación de la entidad.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button onClick={() => setActiveTab("ambito")} variant="outline" className="border-border hover:bg-muted">
              Volver
            </Button>
            <Button
              onClick={handleFinalizarCreacion}
              className="bg-primary hover:bg-primary/90"
              disabled={
                !responsablesAgregados.some((r) => r.tipo === "Representante Legal") ||
                !responsablesAgregados.some((r) => r.tipo === "Contador")
              }
            >
              <Check size={18} className="mr-2" />
              Crear Entidad
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: ATRIBUTOS EXTENSIBLES (CLASIFICADORES) */}
      {activeTab === "clasificadores" && (
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Información de la entidad */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIT</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.nit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="text-lg font-semibold text-foreground">{formEstado.razonSocial}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-4">Configuración de Atributos Extensibles</h3>
          <p className="text-muted-foreground mb-6">
            Los atributos extensibles permiten clasificar la entidad según diferentes árboles jerárquicos. Selecciona un
            clasificador y luego elige el nodo específico que aplica a la entidad.
          </p>

          {/* Selector de clasificador */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Selecciona un Clasificador *</label>
            <select
              value={clasificadorSeleccionado}
              onChange={(e) => {
                setClasificadorSeleccionado(e.target.value)
                setNodoSeleccionado(null)
                setNodoExpandido([])
              }}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona un clasificador...</option>
              {getNombresClasificadores().map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Árbol de clasificadores */}
          {clasificadorActual && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-foreground">Selecciona un Nodo del Árbol *</label>
                {nodoSeleccionado && (
                  <span className="text-sm text-primary font-medium">
                    Seleccionado: {nodoSeleccionado.codigo} - {nodoSeleccionado.nombre}
                  </span>
                )}
              </div>
              <div className="border border-border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto">
                {clasificadorActual.arbol.map((nodo) => renderNodoArbol(nodo))}
              </div>
            </div>
          )}

          {/* Botón para agregar clasificador */}
          <div className="mb-8">
            <Button
              onClick={handleAgregarClasificador}
              disabled={!clasificadorSeleccionado || !nodoSeleccionado}
              className="bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground"
            >
              <Plus size={18} className="mr-2" />
              Agregar Clasificador
            </Button>
          </div>

          {/* Lista de clasificadores agregados */}
          {clasificadoresAsignados.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">Clasificadores Configurados</h4>
              <div className="space-y-3">
                {clasificadoresAsignados.map((clas) => (
                  <div key={clas.id} className="bg-muted rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-primary mb-2">{clas.nombreClasificador}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                          {clas.codigoNodo}
                        </span>
                        <span className="text-foreground">{clas.nodoSeleccionado}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarClasificador(clas.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay clasificadores */}
          {clasificadoresAsignados.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800 text-sm">
                Debes agregar al menos un clasificador antes de finalizar la creación de la entidad.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => setActiveTab("responsables")}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Volver
            </Button>
            <Button
              onClick={handleFinalizarEntidad}
              className="bg-primary hover:bg-primary/90"
              disabled={clasificadoresAsignados.length === 0}
            >
              <Check size={18} className="mr-2" />
              Finalizar Creación de Entidad
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
