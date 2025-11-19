"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Upload, Edit, Download, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { DataTable } from "./data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GestionFormulariosViewProps {
  onBack: () => void
}

export default function GestionFormulariosView({ onBack }: GestionFormulariosViewProps) {
  const [pasoActual, setPasoActual] = useState<"seleccion" | "metodo" | "formularios">("seleccion")
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<"manual" | "archivo" | null>(null)
  const [categoria, setCategoria] = useState("")
  const [año, setAño] = useState("")
  const [periodo, setPeriodo] = useState("")
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [formularioEditando, setFormularioEditando] = useState<string | null>(null)
  const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false)

  const categorias = [
    "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
    "BDME - BOLETÍN DE DEUDORES MOROSOS DEL ESTADO",
    "ECIC - EVALUACIÓN DE CONTROL INTERNO CONTABLE",
  ]

  const años = [2025, 2024, 2023]

  const getPeriodos = (cat: string) => {
    if (cat === "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA") {
      const periodos = ["Enero - Marzo", "Abril - Junio", "Julio - Septiembre", "Octubre - Diciembre"]
      const now = new Date()
      const mesActual = now.getMonth() + 1
      const añoActual = now.getFullYear()

      if (Number.parseInt(año) === añoActual) {
        return periodos.filter((_, index) => {
          const mesFinPeriodo = (index + 1) * 3
          return mesFinPeriodo <= mesActual
        })
      }
      return periodos
    }
    return []
  }

  const [formularios, setFormularios] = useState([
    {
      entidad: "ALCALDIA DE CUMARAL",
      categoria: "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
      formulario: "SALDOS Y MOVIMIENTOS",
      estado: "",
    },
    {
      entidad: "ALCALDIA DE CUMARAL",
      categoria: "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
      formulario: "OPERACIONES RECÍPROCAS",
      estado: "",
    },
    {
      entidad: "ALCALDIA DE CUMARAL",
      categoria: "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
      formulario: "VARIACIONES TRIMESTRALES",
      estado: "",
    },
    {
      entidad: "ALCALDIA DE CUMARAL",
      categoria: "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA",
      formulario: "CAMBIOS RELEVANTES",
      estado: "",
    },
  ])

  const handleContinuar = () => {
    if (categoria && año && periodo) {
      setPasoActual("metodo")
    }
  }

  const handleProcesarMetodo = () => {
    if (opcionSeleccionada === "manual") {
      setPasoActual("formularios")
    } else if (opcionSeleccionada === "archivo" && archivoSeleccionado) {
      setPasoActual("formularios")
    }
  }

  const handleValidar = () => {
    const nuevosFormularios = formularios.map((f) => ({
      ...f,
      estado: Math.random() > 0.3 ? "Aceptado" : "Rechazado por formato",
    }))
    setFormularios(nuevosFormularios)
    alert("Validación completada exitosamente")
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Aceptado":
        return <CheckCircle className="text-green-600" size={20} />
      case "Pendiente validar":
        return <Clock className="text-yellow-600" size={20} />
      case "Rechazado por formato":
      case "Rechazado por deficiencia":
        return <XCircle className="text-red-600" size={20} />
      default:
        return <AlertCircle className="text-gray-600" size={20} />
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoSeleccionado(e.target.files[0])
    }
  }

  const handleEditarFormulario = (nombreFormulario: string) => {
    setFormularioEditando(nombreFormulario)
  }

  const handleVolverDeFormulario = () => {
    setFormularioEditando(null)
  }

  const handleGuardarFormulario = () => {
    setMostrarModalGuardar(true)
  }

  const confirmarGuardado = () => {
    const nuevosFormularios = formularios.map((f) =>
      f.formulario === formularioEditando ? { ...f, estado: "Pendiente validar" } : f,
    )
    setFormularios(nuevosFormularios)
    setMostrarModalGuardar(false)
    setFormularioEditando(null)
  }

  const handleNuevaCarga = () => {
    setPasoActual("seleccion")
    setOpcionSeleccionada(null)
    setCategoria("")
    setAño("")
    setPeriodo("")
    setArchivoSeleccionado(null)
  }

  if (formularioEditando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{formularioEditando}</h2>
          <div className="flex gap-2">
            <Button onClick={handleVolverDeFormulario} variant="outline">
              Volver
            </Button>
            <Button onClick={handleGuardarFormulario}>Guardar</Button>
          </div>
        </div>
        <DataTable />

        <Dialog open={mostrarModalGuardar} onOpenChange={setMostrarModalGuardar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar guardado</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea guardar los cambios realizados en el formulario {formularioEditando}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalGuardar(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarGuardado}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {pasoActual === "seleccion" && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Información del Reporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoría *</label>
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value)
                  setPeriodo("")
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                <option value="">Seleccione...</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Año *</label>
              <select
                value={año}
                onChange={(e) => {
                  setAño(e.target.value)
                  setPeriodo("")
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                <option value="">Seleccione...</option>
                {años.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Periodo *</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
                disabled={!categoria || !año}
              >
                <option value="">Seleccione...</option>
                {categoria &&
                  año &&
                  getPeriodos(categoria).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleContinuar} disabled={!categoria || !año || !periodo} className="px-8">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {pasoActual === "metodo" && (
        <>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Categoría:</span> {categoria} | <span className="font-medium">Año:</span>{" "}
              {año} | <span className="font-medium">Periodo:</span> {periodo}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Seleccione el método de carga</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setOpcionSeleccionada("manual")
                  setArchivoSeleccionado(null)
                }}
                className={`p-6 rounded-lg border-2 transition ${
                  opcionSeleccionada === "manual"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Edit size={32} className="mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-center">Diligenciar Manualmente</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Complete los formularios directamente en el sistema
                </p>
              </button>

              <button
                onClick={() => {
                  setOpcionSeleccionada("archivo")
                }}
                className={`p-6 rounded-lg border-2 transition ${
                  opcionSeleccionada === "archivo"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Upload size={32} className="mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-center">Cargar Archivo</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Cargue un archivo Excel o CSV con la información
                </p>
              </button>
            </div>

            {opcionSeleccionada === "archivo" && (
              <div className="mt-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">Seleccione un archivo Excel (.xlsx) o CSV (.csv)</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" onClick={() => document.getElementById("file-upload")?.click()}>
                      Seleccionar Archivo
                    </Button>
                  </label>
                  {archivoSeleccionado && (
                    <p className="mt-4 text-sm text-primary font-medium">
                      Archivo seleccionado: {archivoSeleccionado.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button onClick={() => setPasoActual("seleccion")} variant="outline">
                Volver
              </Button>
              <Button
                onClick={handleProcesarMetodo}
                disabled={!opcionSeleccionada || (opcionSeleccionada === "archivo" && !archivoSeleccionado)}
                className="px-8"
              >
                {opcionSeleccionada === "archivo" ? "Cargar y Procesar" : "Aceptar"}
              </Button>
            </div>
          </div>
        </>
      )}

      {pasoActual === "formularios" && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Formularios de la Categoría</h3>
            <div className="flex gap-2">
              <Button onClick={handleValidar} variant="outline">
                Validar Formularios
              </Button>
              <Button onClick={handleNuevaCarga} variant="outline">
                Nueva Carga
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Entidad</th>
                  <th className="text-left py-3 px-4 font-medium">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium">Formulario</th>
                  {formularios.some((f) => f.estado !== "") && (
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                  )}
                  <th className="text-left py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formularios.map((form, index) => (
                  <tr key={index} className="border-b border-border hover:bg-accent/50">
                    <td className="py-3 px-4">{form.entidad}</td>
                    <td className="py-3 px-4 text-sm">{form.categoria}</td>
                    <td className="py-3 px-4 font-medium">{form.formulario}</td>
                    {formularios.some((f) => f.estado !== "") && (
                      <td className="py-3 px-4">
                        {form.estado && (
                          <div className="flex items-center gap-2">
                            {getEstadoIcon(form.estado)}
                            <span className="text-sm">{form.estado}</span>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditarFormulario(form.formulario)}>
                          <Edit size={16} className="mr-1" />
                          Editar
                        </Button>
                        {form.estado !== "Aceptado" && form.estado !== "Pendiente validar" && form.estado !== "" && (
                          <Button size="sm" variant="outline">
                            <Download size={16} className="mr-1" />
                            Log
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
