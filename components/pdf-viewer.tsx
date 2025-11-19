"use client"

import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface PdfViewerProps {
  data: any
  onClose: () => void
}

export default function PdfViewer({ data, onClose }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100)

  const pdfUrl = "/placeholder-pdf.pdf"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Detalle de Formulario - {data.codigo}</h2>
            <p className="text-sm text-gray-600">{data.nombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white shadow-lg mx-auto" style={{ width: `${zoom}%` }}>
            <div className="aspect-[8.5/11] border border-gray-300 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Vista Previa de PDF</h3>
                <p className="text-gray-600 mb-4">Documento: {data.codigo}</p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-left max-w-md mx-auto">
                  <p className="font-semibold mb-2">Información del envío:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>
                      <strong>Código:</strong> {data.codigo}
                    </li>
                    <li>
                      <strong>Formulario:</strong> {data.nombre}
                    </li>
                    <li>
                      <strong>Estado:</strong> {data.estado}
                    </li>
                    <li>
                      <strong>Fecha:</strong> {data.fecha}
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  En producción, aquí se mostraría el PDF real del formulario
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
