"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Info } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface Variable {
  nombre: string
  tipo: "entero" | "decimal" | "string" | "booleano"
  valor: string | number | boolean
}

interface Concepto {
  codigo: string
  nombre: string
  variables: Variable[]
  esNivelPadre: boolean
  subniveles?: Concepto[]
}

interface DetalleData {
  id_entrada: string
  entidad: string
  categoria: string
  periodo: string
  ano: string
  formulario: string
}

interface DetalleFormulariosProps {
  onBack?: () => void
  detalleData: DetalleData | null
}

const mockConceptos: Concepto[] = [
  {
    codigo: "1",
    nombre: "ACTIVOS",
    variables: [
      { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 70000000.0 },
      { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 45000000.0 },
      { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 35000000.0 },
      { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 80000000.0 },
      { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 90000000.0 },
      { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 70000000.0 },
      { nombre: "% Ejecución", tipo: "decimal", valor: 77.78 },
      { nombre: "Observaciones", tipo: "string", valor: "Cumplimiento parcial" },
      { nombre: "Activo", tipo: "booleano", valor: true },
    ],
    esNivelPadre: true,
    subniveles: [
      {
        codigo: "1.1",
        nombre: "EFECTIVO",
        variables: [
          { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 20000000.0 },
          { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 15000000.0 },
          { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 10000000.0 },
          { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 25000000.0 },
          { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 30000000.0 },
          { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 25000000.0 },
          { nombre: "% Ejecución", tipo: "decimal", valor: 83.33 },
          { nombre: "Observaciones", tipo: "string", valor: "Flujo adecuado" },
          { nombre: "Activo", tipo: "booleano", valor: true },
        ],
        esNivelPadre: true,
        subniveles: [
          {
            codigo: "1.1.1",
            nombre: "CAJA PRINCIPAL",
            variables: [
              { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 12000000.0 },
              { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 8000000.0 },
              { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 5000000.0 },
              { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 15000000.0 },
              { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 18000000.0 },
              { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 15000000.0 },
              { nombre: "% Ejecución", tipo: "decimal", valor: 83.33 },
              { nombre: "Observaciones", tipo: "string", valor: "Normal" },
              { nombre: "Activo", tipo: "booleano", valor: true },
            ],
            esNivelPadre: false,
          },
          {
            codigo: "1.1.2",
            nombre: "CAJA MENOR",
            variables: [
              { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 8000000.0 },
              { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 7000000.0 },
              { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 5000000.0 },
              { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 10000000.0 },
              { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 12000000.0 },
              { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 10000000.0 },
              { nombre: "% Ejecución", tipo: "decimal", valor: 83.33 },
              { nombre: "Observaciones", tipo: "string", valor: "Ajuste requerido" },
              { nombre: "Activo", tipo: "booleano", valor: true },
            ],
            esNivelPadre: false,
          },
        ],
      },
      {
        codigo: "1.2",
        nombre: "DEPÓSITOS EN INSTITUCIONES",
        variables: [
          { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 50000000.0 },
          { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 30000000.0 },
          { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 25000000.0 },
          { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 55000000.0 },
          { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 60000000.0 },
          { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 45000000.0 },
          { nombre: "% Ejecución", tipo: "decimal", valor: 75.0 },
          { nombre: "Observaciones", tipo: "string", valor: "Rendimiento estable" },
          { nombre: "Activo", tipo: "booleano", valor: true },
        ],
        esNivelPadre: true,
        subniveles: [
          {
            codigo: "1.2.1",
            nombre: "CUENTA CORRIENTE",
            variables: [
              { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 30000000.0 },
              { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 18000000.0 },
              { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 15000000.0 },
              { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 33000000.0 },
              { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 35000000.0 },
              { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 28000000.0 },
              { nombre: "% Ejecución", tipo: "decimal", valor: 80.0 },
              { nombre: "Observaciones", tipo: "string", valor: "Operativo" },
              { nombre: "Activo", tipo: "booleano", valor: true },
            ],
            esNivelPadre: false,
          },
          {
            codigo: "1.2.2",
            nombre: "CUENTA DE AHORRO",
            variables: [
              { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 20000000.0 },
              { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 12000000.0 },
              { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 10000000.0 },
              { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 22000000.0 },
              { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 25000000.0 },
              { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 17000000.0 },
              { nombre: "% Ejecución", tipo: "decimal", valor: 68.0 },
              { nombre: "Observaciones", tipo: "string", valor: "Crecimiento moderado" },
              { nombre: "Activo", tipo: "booleano", valor: true },
            ],
            esNivelPadre: false,
          },
        ],
      },
    ],
  },
  {
    codigo: "2",
    nombre: "PASIVOS",
    variables: [
      { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 30000000.0 },
      { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 20000000.0 },
      { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 15000000.0 },
      { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 35000000.0 },
      { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 40000000.0 },
      { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 30000000.0 },
      { nombre: "% Ejecución", tipo: "decimal", valor: 75.0 },
      { nombre: "Observaciones", tipo: "string", valor: "Bajo control" },
      { nombre: "Activo", tipo: "booleano", valor: true },
    ],
    esNivelPadre: true,
    subniveles: [
      {
        codigo: "2.1",
        nombre: "OBLIGACIONES",
        variables: [
          { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 30000000.0 },
          { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 20000000.0 },
          { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 15000000.0 },
          { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 35000000.0 },
          { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 40000000.0 },
          { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 30000000.0 },
          { nombre: "% Ejecución", tipo: "decimal", valor: 75.0 },
          { nombre: "Observaciones", tipo: "string", valor: "Compromisos vigentes" },
          { nombre: "Activo", tipo: "booleano", valor: true },
        ],
        esNivelPadre: true,
        subniveles: [
          {
            codigo: "2.1.1",
            nombre: "CRÉDITOS BANCARIOS",
            variables: [
              { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 18000000.0 },
              { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 12000000.0 },
              { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 9000000.0 },
              { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 21000000.0 },
              { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 24000000.0 },
              { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 18000000.0 },
              { nombre: "% Ejecución", tipo: "decimal", valor: 75.0 },
              { nombre: "Observaciones", tipo: "string", valor: "Pagos puntuales" },
              { nombre: "Activo", tipo: "booleano", valor: true },
            ],
            esNivelPadre: false,
          },
          {
            codigo: "2.1.2",
            nombre: "CUENTAS POR PAGAR",
            variables: [
              { nombre: "Saldo Inicial (Pesos)", tipo: "decimal", valor: 12000000.0 },
              { nombre: "Movimiento Débito (Pesos)", tipo: "decimal", valor: 8000000.0 },
              { nombre: "Movimiento Crédito (Pesos)", tipo: "decimal", valor: 6000000.0 },
              { nombre: "Saldo Final (Pesos)", tipo: "decimal", valor: 14000000.0 },
              { nombre: "Presupuesto Asignado (Pesos)", tipo: "decimal", valor: 16000000.0 },
              { nombre: "Presupuesto Ejecutado (Pesos)", tipo: "decimal", valor: 12000000.0 },
              { nombre: "% Ejecución", tipo: "decimal", valor: 75.0 },
              { nombre: "Observaciones", tipo: "string", valor: "En seguimiento" },
              { nombre: "Activo", tipo: "booleano", valor: true },
            ],
            esNivelPadre: false,
          },
        ],
      },
    ],
  },
]

const formatearNumero = (valor: number | string | boolean | undefined, tipo: string): string => {
  if (valor === undefined || valor === null || valor === "-") return "-"
  if (tipo === "booleano") return String(valor)
  if (tipo === "string") return String(valor)

  const num = Number(valor)
  if (isNaN(num)) return String(valor)

  if (tipo === "decimal") {
    return num.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return num.toLocaleString("es-CO")
}

const obtenerVariablesUnicas = (conceptos: Concepto[]): Variable[] => {
  const variablesMap = new Map<string, Variable>()

  const extraerVariables = (conceptoArray: Concepto[]) => {
    conceptoArray.forEach((c) => {
      c.variables.forEach((v) => {
        if (!variablesMap.has(v.nombre)) {
          variablesMap.set(v.nombre, v)
        }
      })
      if (c.subniveles) {
        extraerVariables(c.subniveles)
      }
    })
  }

  extraerVariables(conceptos)
  return Array.from(variablesMap.values())
}

const obtenerValorVariable = (concepto: Concepto, nombreVariable: string): string | number | boolean | undefined => {
  return concepto.variables.find((v) => v.nombre === nombreVariable)?.valor
}

const calcularSumatoriaHijos = (concepto: Concepto, nombreVariable: string): number | undefined => {
  if (!concepto.subniveles || concepto.subniveles.length === 0) return undefined

  let suma = 0
  let tieneValoresNumericos = false

  concepto.subniveles.forEach((hijo) => {
    const valor = obtenerValorVariable(hijo, nombreVariable)
    if (valor !== undefined && typeof valor === "number" && !isNaN(Number(valor))) {
      suma += Number(valor)
      tieneValoresNumericos = true
    }
  })

  return tieneValoresNumericos ? suma : undefined
}

const ConceptoRow = ({
  concepto,
  variablesUnicas,
  nivel = 0,
  maxNivel,
}: {
  concepto: Concepto
  variablesUnicas: Variable[]
  nivel?: number
  maxNivel?: number
}) => {
  const [expandido, setExpandido] = useState(true)
  const indentacion = nivel * 20

  const nivelActual = (concepto.codigo.match(/\./g) || []).length + 1

  if (maxNivel && nivelActual > maxNivel) {
    return null
  }

  return (
    <>
      <tr className="hover:bg-[#f9f9f9] border-b border-[#e8e8e8]">
        <td className="px-4 py-3 text-[#1a1a1a] font-semibold" style={{ paddingLeft: `${16 + indentacion}px` }}>
          <div className="flex items-center gap-2">
            {concepto.subniveles && concepto.subniveles.length > 0 && (
              <button
                onClick={() => setExpandido(!expandido)}
                className="text-[#0052cc] hover:text-[#003d99] font-bold w-4 text-center flex-shrink-0"
              >
                {expandido ? "▼" : "▶"}
              </button>
            )}
            {(!concepto.subniveles || concepto.subniveles.length === 0) && <span className="w-4 flex-shrink-0"></span>}
            <span>{concepto.codigo}</span>
          </div>
        </td>

        <td className="px-4 py-3 text-[#1a1a1a] font-semibold">{concepto.nombre}</td>

        {variablesUnicas.map((variable) => {
          const valor = obtenerValorVariable(concepto, variable.nombre)
          const sumatoria = concepto.esNivelPadre ? calcularSumatoriaHijos(concepto, variable.nombre) : undefined

          const valorFormato = concepto.esNivelPadre
            ? formatearNumero(sumatoria, variable.tipo)
            : formatearNumero(valor, variable.tipo)

          return (
            <td key={variable.nombre} className="px-4 py-3 text-[#1a1a1a] text-right font-mono text-sm">
              {concepto.esNivelPadre ? (
                <span className="font-bold text-[#0052cc]">{valorFormato}</span>
              ) : (
                <span>{valorFormato}</span>
              )}
            </td>
          )
        })}
      </tr>

      {expandido &&
        concepto.subniveles?.map((subnivel) => (
          <ConceptoRow
            key={subnivel.codigo}
            concepto={subnivel}
            variablesUnicas={variablesUnicas}
            nivel={nivel + 1}
            maxNivel={maxNivel}
          />
        ))}
    </>
  )
}

const DATOS_ESTANDARIZADOS = {
  entidad: "Contraloría General de la Nación",
  categoria: "Categoría Financiera",
  ano: "2024",
  periodo: "Enero - Marzo",
}

export default function DetalleFormularios({ onBack, detalleData }: DetalleFormulariosProps) {
  const variablesUnicas = obtenerVariablesUnicas(mockConceptos)
  const [nivelFiltro, setNivelFiltro] = useState<string>("todos")
  const [showExportMenu, setShowExportMenu] = useState(false)

  const maxNivel = nivelFiltro === "todos" ? undefined : Number.parseInt(nivelFiltro)

  const nivelesDisponibles = useMemo(() => {
    const niveles = new Set<number>()

    const calcularNiveles = (conceptos: Concepto[]) => {
      conceptos.forEach((c) => {
        const cantidadPuntos = (c.codigo.match(/\./g) || []).length
        niveles.add(cantidadPuntos + 1) // Nivel 1 = 0 puntos + 1
        if (c.subniveles) {
          calcularNiveles(c.subniveles)
        }
      })
    }

    calcularNiveles(mockConceptos)
    return Array.from(niveles).sort((a, b) => a - b)
  }, [])

  const handleExportDetail = (format: "csv" | "pdf" | "excel" | "txt") => {
    const data = mockConceptos.map((c) => {
      const row: Record<string, string | number | boolean> = {
        codigo: c.codigo,
        concepto: c.nombre,
      }
      variablesUnicas.forEach((v) => {
        row[v.nombre] = obtenerValorVariable(c, v.nombre) || "-"
      })
      return row
    })

    if (format === "csv" || format === "txt") {
      const headers = ["Código", "Concepto", ...variablesUnicas.map((v) => v.nombre)]
      const rows = data.map((d) => [d.codigo, d.concepto, ...variablesUnicas.map((v) => d[v.nombre])])
      const separator = format === "csv" ? "," : "\t"
      const content = [headers, ...rows]
        .map((row) => row.map((cell) => (format === "csv" ? `"${cell}"` : cell)).join(separator))
        .join("\n")

      const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `detalle_${detalleData?.id_entrada}.${format}`
      a.click()
    }
    setShowExportMenu(false)
  }

  const hayDatosEnNivel = useMemo(() => {
    if (nivelFiltro === "todos") return false

    const recolectarConceptos = (conceptos: Concepto[]): Concepto[] => {
      const resultado: Concepto[] = []
      conceptos.forEach((c) => {
        resultado.push(c)
        if (c.subniveles) {
          resultado.push(...recolectarConceptos(c.subniveles))
        }
      })
      return resultado
    }

    const todosConceptos = recolectarConceptos(mockConceptos)
    const nivelSeleccionado = Number.parseInt(nivelFiltro)

    return todosConceptos.some((c) => {
      const nivelConcepto = (c.codigo.match(/\./g) || []).length + 1
      return nivelConcepto <= nivelSeleccionado
    })
  }, [nivelFiltro])

  if (!detalleData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Detalle Formularios</h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Entidad</label>
                <p className="text-gray-900 font-semibold text-sm">
                  {detalleData?.entidad || DATOS_ESTANDARIZADOS.entidad}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                <p className="text-gray-900 font-semibold text-sm">
                  {detalleData?.categoria || DATOS_ESTANDARIZADOS.categoria}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Período</label>
                <p className="text-gray-900 font-semibold text-sm">
                  {detalleData?.periodo || DATOS_ESTANDARIZADOS.periodo}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Año</label>
                <p className="text-gray-900 font-semibold text-sm">{detalleData?.ano || DATOS_ESTANDARIZADOS.ano}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Formulario</label>
                <p className="text-gray-900 font-semibold text-sm">{detalleData?.formulario}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Filtrar por nivel:</label>
                <select
                  value={nivelFiltro}
                  onChange={(e) => setNivelFiltro(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="todos">Seleccione un nivel</option>
                  {nivelesDisponibles.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      Nivel {nivel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center gap-2">
                <TooltipProvider>
                  <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
                    <DropdownMenuTrigger asChild>
                      <button 
                        disabled={nivelFiltro === "todos"}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                          nivelFiltro === "todos" 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-teal-600 text-white hover:bg-teal-700"
                        }`}
                      >
                        EXPORTAR
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExportDetail("csv")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>CSV</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">CSV</p>
                          <p className="text-xs">• Sin límite de filas</p>
                          <p className="text-xs">• Encoding UTF-8</p>
                          <p className="text-xs">• Headers incluidos</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExportDetail("excel")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>Excel (XLSX)</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">Excel (XLSX)</p>
                          <p className="text-xs">• Múltiples hojas por archivo</p>
                          <p className="text-xs">• Límite de 50MB</p>
                          <p className="text-xs">• Máximo 1M filas por hoja</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExportDetail("pdf")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>PDF</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">PDF</p>
                          <p className="text-xs">• Máximo 10,000 líneas</p>
                          <p className="text-xs">• Múltiples archivos auto</p>
                          <p className="text-xs">• Texto seleccionable</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => handleExportDetail("txt")}
                            className="cursor-pointer flex items-center justify-between"
                          >
                            <span>TXT</span>
                            <Info size={14} className="text-gray-400" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">TXT</p>
                          <p className="text-xs">• Sin límite de filas</p>
                          <p className="text-xs">• Encoding UTF-8</p>
                          <p className="text-xs">• Delimitadores consistentes</p>
                        </TooltipContent>
                      </Tooltip>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>

            {nivelFiltro !== "todos" && hayDatosEnNivel && (
              <div
                className="overflow-x-auto overflow-y-auto border border-gray-200 rounded-md"
                style={{ maxHeight: "500px" }}
              >
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32 bg-gray-50 sticky left-0 z-20 border-r border-gray-200">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-64 bg-gray-50 sticky left-32 z-20 border-r border-gray-200">
                        Concepto
                      </th>
                      {variablesUnicas.map((variable) => (
                        <th
                          key={variable.nombre}
                          className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap min-w-48 bg-gray-50"
                        >
                          {variable.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockConceptos.map((concepto) => (
                      <ConceptoRow
                        key={concepto.codigo}
                        concepto={concepto}
                        variablesUnicas={variablesUnicas}
                        maxNivel={maxNivel}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {nivelFiltro === "todos" && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg font-medium">Seleccione un nivel para visualizar los conceptos</p>
                <p className="text-sm mt-2">Use el filtro superior para elegir el nivel del árbol que desea ver</p>
              </div>
            )}

            {nivelFiltro !== "todos" && !hayDatosEnNivel && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p>No hay conceptos disponibles para el nivel seleccionado.</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 flex justify-end bg-gray-50">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
