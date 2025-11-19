"use client"

import { useState } from "react"
import TransmitidosPage from "./transmitidos-page"

interface HistoricoEnviosUnificadoProps {
  onVerDetalle?: (data: any, filters?: any) => void
  onVerDetalleFormulario?: (data: any, filters?: any) => void
  savedFilters?: any
}

export default function HistoricoEnviosUnificado({ 
  onVerDetalle, 
  onVerDetalleFormulario,
  savedFilters 
}: HistoricoEnviosUnificadoProps) {
  return (
    <TransmitidosPage
      onBack={() => {}}
      initialFilters={savedFilters}
      onVerDetalle={onVerDetalleFormulario || (() => {})}
      onVerPdf={onVerDetalle}
    />
  )
}
