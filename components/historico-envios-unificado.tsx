"use client"

import { useState } from "react"
import TransmitidosPage from "./transmitidos-page"

interface HistoricoEnviosUnificadoProps {
  onVerDetalle?: (data: any, filters?: any) => void
  onVerDetalleFormulario?: (data: any, filters?: any) => void
  savedFilters?: any
  hideFilters?: boolean
}

export default function HistoricoEnviosUnificado({ 
  onVerDetalle, 
  onVerDetalleFormulario,
  savedFilters,
  hideFilters 
}: HistoricoEnviosUnificadoProps) {
  return (
    <TransmitidosPage
      onBack={() => {}}
      initialFilters={savedFilters}
      onVerDetalle={onVerDetalleFormulario || (() => {})}
      onVerPdf={onVerDetalle}
      hideFilters={hideFilters}
    />
  )
}
