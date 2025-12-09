"use client"
import { useState, useMemo } from "react"
import { ChevronLeft, Check, Plus, Trash2, ChevronRight, ChevronDown, AlertCircle, Edit, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDepartamentos, getMunicipios } from "@/lib/colombia-data"
import { getNombresClasificadores, getClasificador, type NodoClasificador } from "@/lib/clasificadores-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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
  const [activeTab, setActiveTab] = useState<
    "info" | "estado" | "ambito" | "responsables" | "clasificadores" | "composicion" | "cuin"
  >("info")
  const [infoGuardada, setInfoGuardada] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState(false)
  const [ambitoGuardado, setAmbitoGuardado] = useState(false)
  const [responsablesGuardado, setResponsablesGuardado] = useState(false)
  const [atributosGuardado, setAtributosGuardado] = useState(false)
  const [composicionGuardada, setComposicionGuardada] = useState(false)

  const [erroresInfo, setErroresInfo] = useState<Record<string, string>>({})
  const [erroresEstado, setErroresEstado] = useState<Record<string, string>>({})
  const [erroresAmbito, setErroresAmbito] = useState<Record<string, string>>({})
  const [erroresResponsables, setErroresResponsables] = useState<Record<string, string>>({})

  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")

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
    nombreUsuario: "",
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

  const [entidadesSocietarias, setEntidadesSocietarias] = useState<
    Array<{
      id: string
      nit: string
      codigo: string
      razonSocial: string
      departamento: string
      municipio: string
      estado: string
      sector: string
      naturaleza: string
      porcentaje: number
    }>
  >([])

  const [showBuscarEntidad, setShowBuscarEntidad] = useState(false)
  const [showFormReferenciada, setShowFormReferenciada] = useState(false)
  const [busquedaEntidad, setBusquedaEntidad] = useState("")
  const [resultadosBusqueda, setResultadosBusqueda] = useState<
    Array<{
      nit: string
      codigo: string
      razonSocial: string
      departamento: string
      municipio: string
      estado: string
      sector: string
      naturaleza: string
    }>
  >([])
  const [entidadSeleccionada, setEntidadSeleccionada] = useState<{
    nit: string
    codigo: string
    razonSocial: string
    departamento: string
    municipio: string
    estado: string
    sector: string
    naturaleza: string
  } | null>(null)
  const [porcentajeParticipacion, setPorcentajeParticipacion] = useState("")
  const [editandoEntidad, setEditandoEntidad] = useState<string | null>(null)

  // Form for referenced entity
  const [formReferenciada, setFormReferenciada] = useState({
    nit: "",
    razonSocial: "",
    sigla: "",
    departamento: "",
    municipio: "",
    naturaleza: "",
    sector: "",
  })
  const [erroresReferenciada, setErroresReferenciada] = useState<Record<string, string>>({})

  // Sample entities for search
  const entidadesDisponibles = [
    {
      nit: "1234567890",
      codigo: "ENT-001",
      razonSocial: "EMPRESA NACIONAL DE INVERSIONES S.A.",
      departamento: "CUNDINAMARCA",
      municipio: "BOGOTÁ D.C.",
      estado: "Activo",
      sector: "Financiero",
      naturaleza: "Vinculada directa societaria",
    },
    {
      nit: "9876543210",
      codigo: "ENT-002",
      razonSocial: "CORPORACIÓN INDUSTRIAL DEL CARIBE S.A.S.",
      departamento: "ATLÁNTICO",
      municipio: "BARRANQUILLA",
      estado: "Activo",
      sector: "Industrial",
      naturaleza: "Vinculada indirecta societaria",
    },
    {
      nit: "5555555555",
      codigo: "ENT-003",
      razonSocial: "INVERSIONES DEL PACÍFICO LTDA.",
      departamento: "VALLE DEL CAUCA",
      municipio: "CALI",
      estado: "Activo",
      sector: "Comercial",
      naturaleza: "Vinculada directa societaria",
    },
  ]

  // Check if naturaleza allows composición patrimonial
  const permitirComposicion =
    formInfo.naturaleza === "Vinculada directa societaria" || formInfo.naturaleza === "Vinculada indirecta societaria"

  // Calculate total percentage
  const totalPorcentaje = useMemo(() => {
    return entidadesSocietarias.reduce((sum, ent) => sum + ent.porcentaje, 0)
  }, [entidadesSocietarias])

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
    const errores: Record<string, string> = {}

    // Campos obligatorios
    if (!formInfo.nit) errores.nit = "El NIT es obligatorio"
    if (!formInfo.sigla) errores.sigla = "La sigla es obligatoria"
    if (!formInfo.razonSocial) errores.razonSocial = "La razón social es obligatoria"
    if (!formInfo.objeto) errores.objeto = "El objeto es obligatorio"
    if (!formInfo.tipoDocumento) errores.tipoDocumento = "El tipo de documento es obligatorio"
    if (!formInfo.numeroDocumento) errores.numeroDocumento = "El número de documento es obligatorio"
    if (!formInfo.fechaDocumento) errores.fechaDocumento = "La fecha del documento es obligatoria"
    if (!formInfo.departamento) errores.departamento = "El departamento es obligatorio"
    if (!formInfo.municipio) errores.municipio = "El municipio es obligatorio"
    if (!formInfo.direccion) errores.direccion = "La dirección es obligatoria"
    if (!formInfo.codigoPostal) errores.codigoPostal = "El código postal es obligatorio"
    if (!formInfo.telefono) errores.telefono = "El teléfono es obligatorio"
    if (!formInfo.email) errores.email = "El correo electrónico es obligatorio"
    if (!formInfo.sector) errores.sector = "El sector es obligatorio"
    if (!formInfo.naturaleza) errores.naturaleza = "La naturaleza es obligatoria"
    if (!formInfo.departamentoTerritorial)
      errores.departamentoTerritorial = "El departamento territorial es obligatorio"
    if (!formInfo.municipioTerritorial) errores.municipioTerritorial = "El municipio territorial es obligatorio"
    if (!formInfo.nombreUsuario) errores.nombreUsuario = "El nombre de usuario es obligatorio"

    // Validar email si está completado
    if (formInfo.email && !isValidEmail(formInfo.email)) {
      errores.email = "El correo electrónico no es válido"
    }

    // Validar página web si está completada (no obligatoria)
    if (formInfo.paginaWeb && !isValidUrl(formInfo.paginaWeb)) {
      errores.paginaWeb = "La URL no es válida"
    }

    if (Object.keys(errores).length > 0) {
      setErroresInfo(errores)
      setValidationMessage("Por favor completa los campos obligatorios marcados en rojo.")
      setShowValidationModal(true)
      return
    }

    // Limpiar errores
    setErroresInfo({})

    // Actualizar formulario de estado con datos de la entidad
    setFormEstado({
      ...formEstado,
      nit: formInfo.nit,
      razonSocial: formInfo.razonSocial,
      fechaNuevoEstado: new Date().toISOString().split("T")[0],
    })

    setInfoGuardada(true)
    setValidationMessage("Información general guardada. Ahora puedes configurar los cambios de estado.")
    setShowValidationModal(true)
    // Mover al siguiente tab después de cerrar el modal
    setTimeout(() => {
      setActiveTab("estado")
    }, 100)
  }

  const handleSaveEstado = () => {
    const errores: Record<string, string> = {}

    if (!formEstado.nuevoEstado) errores.nuevoEstado = "El nuevo estado es obligatorio"
    if (formEstado.nuevoEstado === "ACTIVO" && !formEstado.subestadoNuevo) {
      errores.subestadoNuevo = "El subestado es obligatorio cuando el estado es ACTIVO"
    }
    if (!formEstado.fechaNuevoEstado) errores.fechaNuevoEstado = "La fecha del nuevo estado es obligatoria"
    if (!formEstado.actoAdministrativo) errores.actoAdministrativo = "El acto administrativo es obligatorio"

    if (Object.keys(errores).length > 0) {
      setErroresEstado(errores)
      setValidationMessage("Por favor completa los campos obligatorios marcados en rojo.")
      setShowValidationModal(true)
      return
    }

    setErroresEstado({})
    setEstadoGuardado(true)
    setValidationMessage("Cambio de estado guardado. Ahora puedes configurar los ámbitos.")
    setShowValidationModal(true)
    setTimeout(() => {
      setActiveTab("ambito")
    }, 100)
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
    // Ámbito no es obligatorio, pero si hay categorías agregadas se valida
    setAmbitoGuardado(true)
    setValidationMessage("Ámbitos guardados. Ahora puedes configurar los Responsables.")
    setShowValidationModal(true)
    setTimeout(() => {
      setActiveTab("responsables")
    }, 100)
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

  const handleSaveResponsables = () => {
    // Solo se puede guardar si se ha guardado el ámbito
    if (!ambitoGuardado) {
      setValidationMessage("Debes guardar el Ámbito primero para poder guardar los Responsables.")
      setShowValidationModal(true)
      return
    }

    if (responsablesAgregados.length === 0) {
      setValidationMessage("Debes agregar al menos un responsable.")
      setShowValidationModal(true)
      return
    }

    setResponsablesGuardado(true)
    setValidationMessage("Responsables guardados. Ahora puedes configurar los Atributos extensibles de la entidad.")
    setShowValidationModal(true)
    setTimeout(() => {
      setActiveTab("clasificadores")
    }, 100)
  }

  const handleSaveAtributos = () => {
    setAtributosGuardado(true)
    setValidationMessage(
      "Atributos extensibles guardados. Ahora puedes configurar la composición patrimonial de la entidad.",
    )
    setShowValidationModal(true)
    // Mover a la siguiente pestaña después de guardar los atributos
    setTimeout(() => {
      setActiveTab("composicion")
    }, 100)
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

  // Search entities
  const handleBuscarEntidad = (termino?: string) => {
    const buscar = termino !== undefined ? termino : busquedaEntidad
    if (buscar.trim()) {
      const resultados = entidadesDisponibles.filter(
        (ent) => ent.nit.includes(buscar) || ent.razonSocial.toLowerCase().includes(buscar.toLowerCase()),
      )
      setResultadosBusqueda(resultados)
    } else {
      setResultadosBusqueda([])
    }
  }

  // Add entity to composition
  const handleAgregarEntidad = () => {
    if (!entidadSeleccionada || !porcentajeParticipacion) return

    const porcentaje = Number.parseFloat(porcentajeParticipacion)
    if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 1) {
      setValidationMessage("El porcentaje debe estar entre 0 y 1 (ej: 0.5 para 50%)")
      setShowValidationModal(true)
      return
    }

    if (editandoEntidad) {
      setEntidadesSocietarias((prev) =>
        prev.map((ent) => (ent.id === editandoEntidad ? { ...ent, ...entidadSeleccionada, porcentaje } : ent)),
      )
      setEditandoEntidad(null)
    } else {
      const nuevaEntidad = {
        id: Date.now().toString(),
        ...entidadSeleccionada,
        porcentaje,
      }
      setEntidadesSocietarias((prev) => [...prev, nuevaEntidad])
    }

    setEntidadSeleccionada(null)
    setPorcentajeParticipacion("")
    setShowBuscarEntidad(false)
    setBusquedaEntidad("")
    setResultadosBusqueda([])
  }

  // Validate and save referenced entity
  const handleGuardarReferenciada = () => {
    const errores: Record<string, string> = {}
    if (!formReferenciada.nit) errores.nit = "NIT es obligatorio"
    if (!formReferenciada.razonSocial) errores.razonSocial = "Razón Social es obligatoria"
    if (!formReferenciada.sigla) errores.sigla = "Sigla es obligatoria"
    if (!formReferenciada.departamento) errores.departamento = "Departamento es obligatorio"
    if (!formReferenciada.municipio) errores.municipio = "Municipio es obligatorio"
    if (!formReferenciada.naturaleza) errores.naturaleza = "Naturaleza es obligatoria"
    if (!formReferenciada.sector) errores.sector = "Sector es obligatorio"

    if (Object.keys(errores).length > 0) {
      setErroresReferenciada(errores)
      setValidationMessage("Por favor completa los campos obligatorios de la entidad referenciada.")
      setShowValidationModal(true)
      return
    }

    setEntidadSeleccionada({
      nit: formReferenciada.nit,
      codigo: "REF-" + Date.now().toString().slice(-4),
      razonSocial: formReferenciada.razonSocial,
      departamento: formReferenciada.departamento,
      municipio: formReferenciada.municipio,
      estado: "REFERENCIA",
      sector: formReferenciada.sector,
      naturaleza: formReferenciada.naturaleza,
    })

    setShowFormReferenciada(false)
    setFormReferenciada({
      nit: "",
      razonSocial: "",
      sigla: "",
      departamento: "",
      municipio: "",
      naturaleza: "",
      sector: "",
    })
    setErroresReferenciada({})
  }

  // Edit entity
  const handleEditarEntidad = (entidad: (typeof entidadesSocietarias)[0]) => {
    setEntidadSeleccionada({
      nit: entidad.nit,
      codigo: entidad.codigo,
      razonSocial: entidad.razonSocial,
      departamento: entidad.departamento,
      municipio: entidad.municipio,
      estado: entidad.estado,
      sector: entidad.sector,
      naturaleza: entidad.naturaleza,
    })
    setPorcentajeParticipacion(entidad.porcentaje.toString())
    setEditandoEntidad(entidad.id)
    setShowBuscarEntidad(true)
  }

  // Delete entity
  const handleEliminarEntidadSocietaria = (id: string) => {
    setEntidadesSocietarias((prev) => prev.filter((ent) => ent.id !== id))
  }

  // Save Composición Patrimonial
  const handleSaveComposicion = () => {
    if (entidadesSocietarias.length > 0 && Math.abs(totalPorcentaje - 1) > 0.0000000001) {
      setValidationMessage("La composición patrimonial no suma el 100%")
      setShowValidationModal(true)
      return
    }

    setComposicionGuardada(true)
    setValidationMessage("Composición Patrimonial guardada. Ahora puedes configurar el CUIN de la entidad.")
    setShowValidationModal(true)
    setActiveTab("cuin")
  }

  // Skip Composición if naturaleza doesn't allow it
  const handleSkipComposicion = () => {
    setComposicionGuardada(true)
    setValidationMessage("La naturaleza de la entidad no permite registrar composición patrimonial.")
    setShowValidationModal(true)
    setActiveTab("cuin")
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
    <div className="p-8 bg-background min-h-screen">
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Mensaje del Sistema
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">{validationMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowValidationModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Tabs de navegación */}
      <div className="mb-6">
        <div className="flex border-b border-border overflow-x-auto">
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
                setValidationMessage("Debes guardar la Información General primero.")
                setShowValidationModal(true)
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
                setValidationMessage("Debes guardar el Cambio de Estado primero.")
                setShowValidationModal(true)
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
                setValidationMessage("Debes guardar el Ámbito primero.")
                setShowValidationModal(true)
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

          <button
            onClick={() => {
              if (responsablesGuardado) {
                setActiveTab("clasificadores")
              } else {
                setValidationMessage("Debes guardar los Responsables primero.")
                setShowValidationModal(true)
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
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

          <button
            onClick={() => {
              if (atributosGuardado) {
                if (!permitirComposicion) {
                  handleSkipComposicion()
                } else {
                  setActiveTab("composicion")
                }
              } else {
                setValidationMessage("Debes guardar los Atributos Extensibles primero.")
                setShowValidationModal(true)
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "composicion"
                ? "border-primary text-primary"
                : `border-transparent ${
                    atributosGuardado
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground opacity-50"
                  }`
            }`}
          >
            6. Composición Patrimonial
            {atributosGuardado && <Check size={16} className="inline ml-2" />}
          </button>

          <button
            onClick={() => {
              if (composicionGuardada) {
                setActiveTab("cuin")
              } else {
                setValidationMessage("Debes completar la Composición Patrimonial primero.")
                setShowValidationModal(true)
              }
            }}
            className={`py-3 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "cuin"
                ? "border-primary text-primary"
                : `border-transparent ${
                    composicionGuardada
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground opacity-50"
                  }`
            }
            `}
          >
            7. CUIN
            {composicionGuardada && <Check size={16} className="inline ml-2" />}
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
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.nit ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.nit && <p className="text-red-500 text-xs mt-1">{erroresInfo.nit}</p>}
            </div>

            {/* SIGLA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sigla *</label>
              <input
                type="text"
                value={formInfo.sigla}
                onChange={(e) => setFormInfo({ ...formInfo, sigla: e.target.value })}
                placeholder="Ej: EPS"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.sigla ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.sigla && <p className="text-red-500 text-xs mt-1">{erroresInfo.sigla}</p>}
            </div>

            {/* RAZÓN SOCIAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Razón Social *</label>
              <input
                type="text"
                value={formInfo.razonSocial}
                onChange={(e) => setFormInfo({ ...formInfo, razonSocial: e.target.value })}
                placeholder="Nombre completo de la entidad"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.razonSocial ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.razonSocial && <p className="text-red-500 text-xs mt-1">{erroresInfo.razonSocial}</p>}
            </div>

            {/* OBJETO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Objeto *</label>
              <textarea
                value={formInfo.objeto}
                onChange={(e) => setFormInfo({ ...formInfo, objeto: e.target.value })}
                placeholder="Descripción del objeto de la entidad"
                rows={2}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 resize-none ${
                  erroresInfo.objeto ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.objeto && <p className="text-red-500 text-xs mt-1">{erroresInfo.objeto}</p>}
            </div>

            {/* TIPO DOCUMENTO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Documento de Creación *</label>
              <select
                value={formInfo.tipoDocumento}
                onChange={(e) => setFormInfo({ ...formInfo, tipoDocumento: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.tipoDocumento ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              >
                <option value="">Selecciona un tipo...</option>
                {documentoTypes.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {erroresInfo.tipoDocumento && <p className="text-red-500 text-xs mt-1">{erroresInfo.tipoDocumento}</p>}
            </div>

            {/* NÚMERO DOCUMENTO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Número de Documento *</label>
              <input
                type="text"
                value={formInfo.numeroDocumento}
                onChange={(e) => setFormInfo({ ...formInfo, numeroDocumento: e.target.value })}
                placeholder="Ej: 123456"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.numeroDocumento ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.numeroDocumento && (
                <p className="text-red-500 text-xs mt-1">{erroresInfo.numeroDocumento}</p>
              )}
            </div>

            {/* FECHA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fecha *</label>
              <input
                type="date"
                value={formInfo.fechaDocumento}
                onChange={(e) => setFormInfo({ ...formInfo, fechaDocumento: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.fechaDocumento ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.fechaDocumento && <p className="text-red-500 text-xs mt-1">{erroresInfo.fechaDocumento}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Nombre de Usuario *</label>
              <input
                type="text"
                value={formInfo.nombreUsuario}
                onChange={(e) => setFormInfo({ ...formInfo, nombreUsuario: e.target.value })}
                placeholder="Ej: usuario_entidad"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.nombreUsuario ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.nombreUsuario && <p className="text-red-500 text-xs mt-1">{erroresInfo.nombreUsuario}</p>}
            </div>

            {/* DEPARTAMENTO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Departamento *</label>
              <select
                value={formInfo.departamento}
                onChange={(e) =>
                  setFormInfo({
                    ...formInfo,
                    departamento: e.target.value,
                    municipio: "",
                  })
                }
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.departamento ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              >
                <option value="">Selecciona un departamento...</option>
                {departamentos.map((depto) => (
                  <option key={depto} value={depto}>
                    {depto}
                  </option>
                ))}
              </select>
              {erroresInfo.departamento && <p className="text-red-500 text-xs mt-1">{erroresInfo.departamento}</p>}
            </div>

            {/* MUNICIPIO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Municipio *</label>
              <select
                value={formInfo.municipio}
                onChange={(e) => setFormInfo({ ...formInfo, municipio: e.target.value })}
                disabled={!formInfo.departamento}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 disabled:bg-muted disabled:text-muted-foreground ${
                  erroresInfo.municipio ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
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
              {erroresInfo.municipio && <p className="text-red-500 text-xs mt-1">{erroresInfo.municipio}</p>}
            </div>

            {/* DIRECCIÓN */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Dirección *</label>
              <input
                type="text"
                value={formInfo.direccion}
                onChange={(e) => setFormInfo({ ...formInfo, direccion: e.target.value })}
                placeholder="Ej: Carrera 5 # 10-50"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.direccion ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.direccion && <p className="text-red-500 text-xs mt-1">{erroresInfo.direccion}</p>}
            </div>

            {/* CÓDIGO POSTAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Código Postal *</label>
              <input
                type="text"
                value={formInfo.codigoPostal}
                onChange={(e) => setFormInfo({ ...formInfo, codigoPostal: e.target.value })}
                placeholder="Ej: 110111"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.codigoPostal ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.codigoPostal && <p className="text-red-500 text-xs mt-1">{erroresInfo.codigoPostal}</p>}
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Teléfono *</label>
              <input
                type="tel"
                value={formInfo.telefono}
                onChange={(e) => setFormInfo({ ...formInfo, telefono: e.target.value })}
                placeholder="Ej: 6012341234"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.telefono ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              />
              {erroresInfo.telefono && <p className="text-red-500 text-xs mt-1">{erroresInfo.telefono}</p>}
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
              <label className="block text-sm font-semibold text-foreground mb-2">E-mail *</label>
              <div>
                <input
                  type="email"
                  value={formInfo.email}
                  onChange={(e) => setFormInfo({ ...formInfo, email: e.target.value })}
                  placeholder=" correo@example.com"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresInfo.email ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {erroresInfo.email && <p className="text-red-500 text-xs mt-1">{erroresInfo.email}</p>}
              </div>
            </div>

            {/* PÁGINA WEB - No obligatoria */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Página Web</label>
              <div>
                <input
                  type="text"
                  value={formInfo.paginaWeb}
                  onChange={(e) => setFormInfo({ ...formInfo, paginaWeb: e.target.value })}
                  placeholder="https://www.example.com"
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresInfo.paginaWeb ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {erroresInfo.paginaWeb && <p className="text-red-500 text-xs mt-1">{erroresInfo.paginaWeb}</p>}
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
                    naturaleza: "",
                  })
                }
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.sector ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              >
                <option value="">Selecciona un sector...</option>
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              {erroresInfo.sector && <p className="text-red-500 text-xs mt-1">{erroresInfo.sector}</p>}
            </div>

            {/* NATURALEZA */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Naturaleza *</label>
              <select
                value={formInfo.naturaleza}
                onChange={(e) => setFormInfo({ ...formInfo, naturaleza: e.target.value })}
                disabled={!formInfo.sector}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 disabled:bg-muted disabled:text-muted-foreground ${
                  erroresInfo.naturaleza ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
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
              {erroresInfo.naturaleza && <p className="text-red-500 text-xs mt-1">{erroresInfo.naturaleza}</p>}
            </div>

            {/* DEPARTAMENTO TERRITORIAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Departamento Territorial *</label>
              <select
                value={formInfo.departamentoTerritorial}
                onChange={(e) =>
                  setFormInfo({
                    ...formInfo,
                    departamentoTerritorial: e.target.value,
                    municipioTerritorial: "",
                  })
                }
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresInfo.departamentoTerritorial
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
              >
                <option value="">Selecciona un departamento...</option>
                {departamentos.map((depto) => (
                  <option key={depto} value={depto}>
                    {depto}
                  </option>
                ))}
              </select>
              {erroresInfo.departamentoTerritorial && (
                <p className="text-red-500 text-xs mt-1">{erroresInfo.departamentoTerritorial}</p>
              )}
            </div>

            {/* MUNICIPIO TERRITORIAL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Municipio Territorial *</label>
              <select
                value={formInfo.municipioTerritorial}
                onChange={(e) => setFormInfo({ ...formInfo, municipioTerritorial: e.target.value })}
                disabled={!formInfo.departamentoTerritorial}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 disabled:bg-muted disabled:text-muted-foreground ${
                  erroresInfo.municipioTerritorial
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
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
              {erroresInfo.municipioTerritorial && (
                <p className="text-red-500 text-xs mt-1">{erroresInfo.municipioTerritorial}</p>
              )}
            </div>
          </div>

          {/* CHECKBOXES */}
          <div className="bg-muted rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-foreground mb-4">Características Especiales (opcionales)</p>
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
              <label className="block text-sm font-semibold text-foreground mb-2">Nuevo Estado *</label>
              <select
                value={formEstado.nuevoEstado}
                onChange={(e) =>
                  setFormEstado({
                    ...formEstado,
                    nuevoEstado: e.target.value,
                    subestadoNuevo: "",
                  })
                }
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresEstado.nuevoEstado ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                }`}
              >
                {nuevoEstadoOptions.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {erroresEstado.nuevoEstado && <p className="text-red-500 text-xs mt-1">{erroresEstado.nuevoEstado}</p>}
            </div>

            {/* SUBESTADO NUEVO */}
            {formEstado.nuevoEstado === "ACTIVO" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Subestado Nuevo *</label>
                <select
                  value={formEstado.subestadoNuevo}
                  onChange={(e) => setFormEstado({ ...formEstado, subestadoNuevo: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresEstado.subestadoNuevo
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                >
                  <option value="">Selecciona un subestado...</option>
                  {subestadoOptions.map((subestado) => (
                    <option key={subestado} value={subestado}>
                      {subestado}
                    </option>
                  ))}
                </select>
                {erroresEstado.subestadoNuevo && (
                  <p className="text-red-500 text-xs mt-1">{erroresEstado.subestadoNuevo}</p>
                )}
              </div>
            )}

            {/* FECHA INICIAL NUEVO ESTADO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fecha Inicial Nuevo Estado *</label>
              <input
                type="date"
                value={formEstado.fechaNuevoEstado}
                onChange={(e) => setFormEstado({ ...formEstado, fechaNuevoEstado: e.target.value })}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresEstado.fechaNuevoEstado
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
              />
              {erroresEstado.fechaNuevoEstado && (
                <p className="text-red-500 text-xs mt-1">{erroresEstado.fechaNuevoEstado}</p>
              )}
            </div>

            {/* ACTO ADMINISTRATIVO */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Acto Administrativo *</label>
              <input
                type="text"
                value={formEstado.actoAdministrativo}
                onChange={(e) => setFormEstado({ ...formEstado, actoAdministrativo: e.target.value })}
                placeholder="Ej: Resolución 001-2024"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                  erroresEstado.actoAdministrativo
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-primary"
                }`}
              />
              {erroresEstado.actoAdministrativo && (
                <p className="text-red-500 text-xs mt-1">{erroresEstado.actoAdministrativo}</p>
              )}
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              El diligenciamiento del ámbito no es obligatorio. Puedes continuar sin agregar categorías.
            </p>
          </div>

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

          {!ambitoGuardado && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                Debes guardar el Ámbito primero para poder diligenciar y guardar los Responsables.
              </p>
            </div>
          )}

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
                Debes agregar al menos un Representante Legal y un Contador para finalizar la creación de la entidad.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button onClick={() => setActiveTab("ambito")} variant="outline" className="border-border hover:bg-muted">
              Volver
            </Button>
            <Button
              onClick={handleSaveResponsables}
              className="bg-primary hover:bg-primary/90"
              disabled={!ambitoGuardado}
            >
              <Check size={18} className="mr-2" />
              Guardar Responsables
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: ATRIBUTOS EXTENSIBLES */}
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              El diligenciamiento de los atributos extensibles no es obligatorio. Puedes continuar sin agregar
              clasificadores.
            </p>
          </div>

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
            <Button onClick={handleSaveAtributos} className="bg-primary hover:bg-primary/90">
              <Check size={18} className="mr-2" />
              Guardar Atributos Extensibles
            </Button>
          </div>
        </div>
      )}

      {activeTab === "composicion" && (
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Información de la entidad */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIT</p>
                <p className="text-lg font-semibold text-foreground">{formInfo.nit || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="text-lg font-semibold text-foreground">{formInfo.razonSocial || "—"}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-4">Composición Patrimonial</h3>
          <p className="text-muted-foreground mb-6">
            Agregue las entidades que tienen participación patrimonial en esta entidad. El total de participación debe
            sumar exactamente 100%.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              No es obligatorio el diligenciamiento del tab "Composición Patrimonial". Puedes continuar sin agregar
              entidades societarias.
            </p>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              {editandoEntidad ? "Editar Entidad Societaria" : "Agregar Entidad Societaria"}
            </h4>

            {!entidadSeleccionada ? (
              <div className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Buscar Entidad por NIT o Razón Social
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={busquedaEntidad}
                      onChange={(e) => {
                        setBusquedaEntidad(e.target.value)
                        handleBuscarEntidad(e.target.value)
                      }}
                      placeholder="Ej: 1234567890 o EMPRESA NACIONAL..."
                      className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => e.key === "Enter" && handleBuscarEntidad()}
                    />
                    <Button onClick={() => handleBuscarEntidad()} className="bg-primary hover:bg-primary/90">
                      <Search size={18} className="mr-2" />
                      Buscar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prueba buscando: 1234567890, 9876543210, o parte de la razón social
                  </p>
                </div>

                {/* Resultados de búsqueda */}
                {resultadosBusqueda.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left text-sm font-semibold">NIT</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Razón Social</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Departamento</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadosBusqueda.map((ent) => (
                          <tr key={ent.nit} className="hover:bg-muted/50 border-t border-border">
                            <td className="px-4 py-2 text-sm font-mono">{ent.nit}</td>
                            <td className="px-4 py-2 text-sm">{ent.razonSocial}</td>
                            <td className="px-4 py-2 text-sm">{ent.departamento}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                {ent.estado}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                size="sm"
                                onClick={() => setEntidadSeleccionada(ent)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Seleccionar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* No results message */}
                {busquedaEntidad && resultadosBusqueda.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm mb-3">
                      No se encontraron resultados para "{busquedaEntidad}".
                    </p>
                    <Button
                      onClick={() => setShowFormReferenciada(true)}
                      variant="outline"
                      className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                    >
                      <Plus size={18} className="mr-2" />
                      Agregar como Entidad Referenciada
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Entidad seleccionada */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-green-800">Entidad Seleccionada:</p>
                      <p className="text-green-700 text-sm mt-1">
                        <span className="font-mono">{entidadSeleccionada.nit}</span> - {entidadSeleccionada.razonSocial}
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        {entidadSeleccionada.departamento} | {entidadSeleccionada.sector} |{" "}
                        {entidadSeleccionada.naturaleza}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEntidadSeleccionada(null)
                        setBusquedaEntidad("")
                        setResultadosBusqueda([])
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>

                {/* Porcentaje de participación */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Porcentaje de Participación (en decimales)
                  </label>
                  <input
                    type="text"
                    value={porcentajeParticipacion}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                        setPorcentajeParticipacion(value)
                      }
                    }}
                    placeholder="Ej: 0.25 para 25%, 0.5 para 50%"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingrese el porcentaje en formato decimal (ej: 0.25 para 25%, 0.5 para 50%)
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button onClick={handleAgregarEntidad} className="bg-green-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" />
                    {editandoEntidad ? "Actualizar Entidad" : "Agregar a la Lista"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEntidadSeleccionada(null)
                      setPorcentajeParticipacion("")
                      setBusquedaEntidad("")
                      setResultadosBusqueda([])
                      setEditandoEntidad(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de entidades agregadas */}
          {entidadesSocietarias.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Entidades Societarias Agregadas</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">NIT</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Código</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Razón Social</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Departamento</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Municipio</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Estado</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Sector</th>
                      <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Naturaleza</th>
                      <th className="border border-border px-4 py-2 text-right text-sm font-semibold">Porcentaje</th>
                      <th className="border border-border px-4 py-2 text-center text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entidadesSocietarias.map((entidad) => (
                      <tr key={entidad.id} className="hover:bg-muted/50">
                        <td className="border border-border px-4 py-2 text-sm font-mono">{entidad.nit}</td>
                        <td className="border border-border px-4 py-2 text-sm">{entidad.codigo}</td>
                        <td className="border border-border px-4 py-2 text-sm">{entidad.razonSocial}</td>
                        <td className="border border-border px-4 py-2 text-sm">{entidad.departamento}</td>
                        <td className="border border-border px-4 py-2 text-sm">{entidad.municipio}</td>
                        <td className="border border-border px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              entidad.estado === "REFERENCIA"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {entidad.estado}
                          </span>
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">{entidad.sector}</td>
                        <td className="border border-border px-4 py-2 text-sm">{entidad.naturaleza}</td>
                        <td className="border border-border px-4 py-2 text-sm text-right font-mono">
                          {(entidad.porcentaje * 100).toFixed(2)}%
                        </td>
                        <td className="border border-border px-4 py-2">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditarEntidad(entidad)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleEliminarEntidadSocietaria(entidad.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted font-semibold">
                      <td colSpan={8} className="border border-border px-4 py-2 text-right">
                        Total Participación:
                      </td>
                      <td
                        className={`border border-border px-4 py-2 text-right font-mono ${
                          Math.abs(totalPorcentaje - 1) < 0.0000000001 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {(totalPorcentaje * 100).toFixed(2)}%
                      </td>
                      <td className="border border-border"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {Math.abs(totalPorcentaje - 1) > 0.0000000001 && entidadesSocietarias.length > 0 && (
                <p className="text-red-500 text-sm mt-2">
                  El total de participación debe ser exactamente 100% para poder guardar.
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => setActiveTab("clasificadores")}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Volver
            </Button>
            <Button onClick={handleSaveComposicion} className="bg-primary hover:bg-primary/90">
              <Check size={18} className="mr-2" />
              Guardar Composición Patrimonial
            </Button>
          </div>
        </div>
      )}

      {activeTab === "cuin" && (
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Información de la entidad */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">NIT</p>
                <p className="text-lg font-semibold text-foreground">{formInfo.nit || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="text-lg font-semibold text-foreground">{formInfo.razonSocial || "—"}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-4">Configuración CUIN</h3>
          <p className="text-muted-foreground mb-6">
            Configure el Código Único de Identificación Nacional (CUIN) para la entidad.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <Check className="text-green-600" size={24} />
              <div>
                <p className="text-green-800 font-semibold">Entidad creada correctamente</p>
                <p className="text-green-700 text-sm">
                  La entidad ha sido registrada en el sistema. Puede finalizar el proceso o configurar opciones
                  adicionales.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => setActiveTab("composicion")}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Volver
            </Button>
            <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
              <Check size={18} className="mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      )}

      {/* Dialog para agregar entidad referenciada */}
      <Dialog open={showFormReferenciada} onOpenChange={setShowFormReferenciada}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Entidad Referenciada</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete los datos de la entidad que no se encuentra registrada en el sistema.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">NIT *</label>
                <input
                  type="text"
                  value={formReferenciada.nit}
                  onChange={(e) => setFormReferenciada({ ...formReferenciada, nit: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresReferenciada.nit ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {erroresReferenciada.nit && <p className="text-red-500 text-xs mt-1">{erroresReferenciada.nit}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Sigla o Nombre Corto *</label>
                <input
                  type="text"
                  value={formReferenciada.sigla}
                  onChange={(e) => setFormReferenciada({ ...formReferenciada, sigla: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresReferenciada.sigla ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                />
                {erroresReferenciada.sigla && <p className="text-red-500 text-xs mt-1">{erroresReferenciada.sigla}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Razón Social *</label>
                <input
                  type="text"
                  value={formReferenciada.razonSocial}
                  onChange={(e) => setFormReferenciada({ ...formReferenciada, razonSocial: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresReferenciada.razonSocial
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                />
                {erroresReferenciada.razonSocial && (
                  <p className="text-red-500 text-xs mt-1">{erroresReferenciada.razonSocial}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Departamento *</label>
                <select
                  value={formReferenciada.departamento}
                  onChange={(e) =>
                    setFormReferenciada({ ...formReferenciada, departamento: e.target.value, municipio: "" })
                  }
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresReferenciada.departamento
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                >
                  <option value="">Selecciona...</option>
                  {departamentos.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {erroresReferenciada.departamento && (
                  <p className="text-red-500 text-xs mt-1">{erroresReferenciada.departamento}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Municipio *</label>
                <select
                  value={formReferenciada.municipio}
                  onChange={(e) => setFormReferenciada({ ...formReferenciada, municipio: e.target.value })}
                  disabled={!formReferenciada.departamento}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 disabled:bg-muted ${
                    erroresReferenciada.municipio
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                >
                  <option value="">Selecciona...</option>
                  {municipios.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {erroresReferenciada.municipio && (
                  <p className="text-red-500 text-xs mt-1">{erroresReferenciada.municipio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Sector *</label>
                <select
                  value={formReferenciada.sector}
                  onChange={(e) => setFormReferenciada({ ...formReferenciada, sector: e.target.value, naturaleza: "" })}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 ${
                    erroresReferenciada.sector ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
                  }`}
                >
                  <option value="">Selecciona...</option>
                  {sectorOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {erroresReferenciada.sector && (
                  <p className="text-red-500 text-xs mt-1">{erroresReferenciada.sector}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Naturaleza *</label>
                <select
                  value={formReferenciada.naturaleza}
                  onChange={(e) => setFormReferenciada({ ...formReferenciada, naturaleza: e.target.value })}
                  disabled={!formReferenciada.sector}
                  className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 disabled:bg-muted ${
                    erroresReferenciada.naturaleza
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-primary"
                  }`}
                >
                  <option value="">Selecciona...</option>
                  {formReferenciada.sector &&
                    naturalezaBySetor[formReferenciada.sector]?.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                </select>
                {erroresReferenciada.naturaleza && (
                  <p className="text-red-500 text-xs mt-1">{erroresReferenciada.naturaleza}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowFormReferenciada(false)
                  setShowBuscarEntidad(true)
                  setFormReferenciada({
                    nit: "",
                    razonSocial: "",
                    sigla: "",
                    departamento: "",
                    municipio: "",
                    naturaleza: "",
                    sector: "",
                  })
                  setErroresReferenciada({})
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarReferenciada} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar y Seleccionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBuscarEntidad} onOpenChange={setShowBuscarEntidad}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoEntidad ? "Editar Entidad Societaria" : "Agregar Entidad Societaria"}</DialogTitle>
          </DialogHeader>

          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              {editandoEntidad ? "Editar Entidad Societaria" : "Agregar Entidad Societaria"}
            </h4>

            {!entidadSeleccionada ? (
              <div className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Buscar Entidad por NIT o Razón Social
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={busquedaEntidad}
                      onChange={(e) => {
                        setBusquedaEntidad(e.target.value)
                        handleBuscarEntidad(e.target.value)
                      }}
                      placeholder="Ej: 1234567890 o EMPRESA NACIONAL..."
                      className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => e.key === "Enter" && handleBuscarEntidad()}
                    />
                    <Button onClick={() => handleBuscarEntidad()} className="bg-primary hover:bg-primary/90">
                      <Search size={18} className="mr-2" />
                      Buscar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prueba buscando: 1234567890, 9876543210, o parte de la razón social
                  </p>
                </div>

                {/* Resultados de búsqueda */}
                {resultadosBusqueda.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left text-sm font-semibold">NIT</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Razón Social</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Departamento</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadosBusqueda.map((ent) => (
                          <tr key={ent.nit} className="hover:bg-muted/50 border-t border-border">
                            <td className="px-4 py-2 text-sm font-mono">{ent.nit}</td>
                            <td className="px-4 py-2 text-sm">{ent.razonSocial}</td>
                            <td className="px-4 py-2 text-sm">{ent.departamento}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                {ent.estado}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                size="sm"
                                onClick={() => setEntidadSeleccionada(ent)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Seleccionar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* No results message */}
                {busquedaEntidad && resultadosBusqueda.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm mb-3">
                      No se encontraron resultados para "{busquedaEntidad}".
                    </p>
                    <Button
                      onClick={() => {
                        setShowFormReferenciada(true)
                        setShowBuscarEntidad(false)
                      }}
                      variant="outline"
                      className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                    >
                      <Plus size={18} className="mr-2" />
                      Agregar como Entidad Referenciada
                    </Button>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setShowBuscarEntidad(false)
                      setBusquedaEntidad("")
                      setResultadosBusqueda([])
                      setEditandoEntidad(null)
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Entidad seleccionada */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-green-800">Entidad Seleccionada:</p>
                      <p className="text-green-700 text-sm mt-1">
                        <span className="font-mono">{entidadSeleccionada.nit}</span> - {entidadSeleccionada.razonSocial}
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        {entidadSeleccionada.departamento} | {entidadSeleccionada.sector} |{" "}
                        {entidadSeleccionada.naturaleza}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEntidadSeleccionada(null)
                        setBusquedaEntidad("")
                        setResultadosBusqueda([])
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>

                {/* Porcentaje de participación */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Porcentaje de Participación (en decimales)
                  </label>
                  <input
                    type="text"
                    value={porcentajeParticipacion}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                        setPorcentajeParticipacion(value)
                      }
                    }}
                    placeholder="Ej: 0.25 para 25%, 0.5 para 50%"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingrese el porcentaje en formato decimal (ej: 0.25 para 25%, 0.5 para 50%)
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button onClick={handleAgregarEntidad} className="bg-green-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" />
                    {editandoEntidad ? "Actualizar Entidad" : "Agregar a la Lista"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEntidadSeleccionada(null)
                      setPorcentajeParticipacion("")
                      setBusquedaEntidad("")
                      setResultadosBusqueda([])
                      setEditandoEntidad(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
