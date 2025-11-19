"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import Breadcrumb from "./breadcrumb"
import GestionFormularios from "./gestion-formularios"
import TransmitidosPage from "./transmitidos-page"
import DetalleFormularios from "./detalle-formularios"
import { useAuth } from "@/lib/auth-context"
import HistoricoEnviosUnificado from "./historico-envios-unificado"
import PdfViewer from "./pdf-viewer"

interface FormFilters {
  entidad: string
  categoria: string
  ano: string
  periodo: string
}

interface HistoricoEnviosFilters {
  analista: string
  entidad: string
  categoria: string
  ano: string
  periodo: string
}

interface DetalleData {
  id_entrada: string
  entidad: string
  categoria: string
  periodo: string
  ano: string
  formulario: string
}

const FormularioPage = forwardRef((props, ref) => {
  const { user } = useAuth()
  
  // Estados para el flujo de Gestión de Formularios
  const [gestionFilters, setGestionFilters] = useState<FormFilters>({
    entidad: "",
    categoria: "",
    ano: "",
    periodo: "",
  })
  
  // Estados para el flujo de Consultas > Histórico de Envíos
  const [consultasFilters, setConsultasFilters] = useState<HistoricoEnviosFilters | undefined>(undefined)
  
  const [selectedDetalleData, setSelectedDetalleData] = useState<DetalleData | null>(null)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [selectedPdfData, setSelectedPdfData] = useState<any>(null)
  const [origenDetalle, setOrigenDetalle] = useState<"gestion" | "consultas">("gestion")

  useImperativeHandle(ref, () => ({
    navigateToGestion: () => {
      setCurrentView("gestion")
      setShowPdfViewer(false)
      setSelectedPdfData(null)
    },
    navigateToHistoricoEnvios: () => {
      setCurrentView("historico-consultas")
      setShowPdfViewer(false)
      setSelectedPdfData(null)
    }
  }))

  const handleEnviosDesdeGestion = (filters: FormFilters) => {
    setGestionFilters(filters)
    setCurrentView("transmitidos-gestion")
    setOrigenDetalle("gestion")
  }

  const handleVerDetalleDesdeGestion = (detalleData: DetalleData) => {
    setSelectedDetalleData(detalleData)
    setCurrentView("detalle-gestion")
    setOrigenDetalle("gestion")
  }

  const handleVerPdfDesdeGestion = (data: any) => {
    setSelectedPdfData(data)
    setShowPdfViewer(true)
    setOrigenDetalle("gestion")
  }

  const handleVerDetalleDesdeConsultas = (detalleData: DetalleData, filters?: HistoricoEnviosFilters) => {
    setSelectedDetalleData(detalleData)
    if (filters) {
      setConsultasFilters(filters)
    }
    setCurrentView("detalle-consultas")
    setOrigenDetalle("consultas")
  }

  const handleVerPdfDesdeConsultas = (data: any, filters?: HistoricoEnviosFilters) => {
    setSelectedPdfData(data)
    if (filters) {
      setConsultasFilters(filters)
    }
    setShowPdfViewer(true)
    setOrigenDetalle("consultas")
  }

  const handleClosePdf = () => {
    setShowPdfViewer(false)
    setSelectedPdfData(null)
    if (origenDetalle === "gestion") {
      setCurrentView("transmitidos-gestion")
    } else {
      setCurrentView("historico-consultas")
    }
  }

  const handleVolverDesdeDetalle = () => {
    if (origenDetalle === "gestion") {
      setCurrentView("transmitidos-gestion")
    } else {
      setCurrentView("historico-consultas")
    }
    setShowPdfViewer(false)
    setSelectedPdfData(null)
  }

  const handleVolverDesdeTransmitidos = () => {
    setCurrentView("gestion")
  }

  console.log("[v0] FormularioPage renderizado")
  
  const [currentView, setCurrentView] = useState<
    "gestion" | "transmitidos-gestion" | "detalle-gestion" | "historico-consultas" | "detalle-consultas" | null
  >("gestion")

  console.log("[v0] FormularioPage currentView:", currentView)

  if (currentView === null) {
    return (
      <main className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bienvenido al Sistema CHIP 2.0
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Sistema de gestión y validación de formularios contables
            </p>
            <p className="text-gray-500">
              Seleccione una opción del menú para comenzar
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (currentView === "historico-consultas") {
    return (
      <>
        <HistoricoEnviosUnificado 
          onVerDetalle={handleVerPdfDesdeConsultas} 
          onVerDetalleFormulario={handleVerDetalleDesdeConsultas}
          savedFilters={consultasFilters}
        />
        {showPdfViewer && selectedPdfData && <PdfViewer data={selectedPdfData} onClose={handleClosePdf} />}
      </>
    )
  }

  if (currentView === "detalle-consultas") {
    return (
      <>
        <DetalleFormularios onBack={handleVolverDesdeDetalle} detalleData={selectedDetalleData} />
        {showPdfViewer && selectedPdfData && <PdfViewer data={selectedPdfData} onClose={handleClosePdf} />}
      </>
    )
  }

  return (
    <>
      {console.log("[v0] FormularioPage renderizando vista:", currentView)}
      {currentView === "gestion" && (
        <GestionFormularios onEnviosClick={handleEnviosDesdeGestion} savedFilters={gestionFilters} />
      )}
      {currentView === "transmitidos-gestion" && (
        <>
          <TransmitidosPage
            onBack={handleVolverDesdeTransmitidos}
            initialFilters={gestionFilters}
            onVerDetalle={handleVerDetalleDesdeGestion}
            onVerPdf={handleVerPdfDesdeGestion}
          />
          {showPdfViewer && selectedPdfData && <PdfViewer data={selectedPdfData} onClose={handleClosePdf} />}
        </>
      )}
      {currentView === "detalle-gestion" && (
        <DetalleFormularios onBack={handleVolverDesdeDetalle} detalleData={selectedDetalleData} />
      )}
    </>
  )
})

FormularioPage.displayName = "FormularioPage"

export default FormularioPage
