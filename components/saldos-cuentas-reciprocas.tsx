"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaldosCuentasReciprocasProps {
  onBack: () => void
}

export default function SaldosCuentasReciprocas({ onBack }: SaldosCuentasReciprocasProps) {
  const [periodo, setPeriodo] = useState<string>("")
  const { toast } = useToast()

  // Datos simulados de la entidad
  const entidadData = {
    nombre: "Contaduría General de la Nación",
    codigo: "811000423",
    estado: "Activo",
  }

  const handleGenerarReporte = () => {
    console.log("[v0] Generando reporte de Saldos Cuentas Recíprocas", { periodo, entidad: entidadData })

    // Simular datos para el reporte
    const datosReporte = [
      ["Reporte", "NIT", "Entidad", "Estado", "Período", "Cuenta", "Concepto", "Saldo Débito", "Saldo Crédito"],
      [
        "Saldos Cuentas Recíprocas",
        entidadData.codigo,
        entidadData.nombre,
        entidadData.estado,
        periodo,
        "1305",
        "Cuentas por cobrar operaciones recíprocas",
        "1500000",
        "0",
      ],
      [
        "Saldos Cuentas Recíprocas",
        entidadData.codigo,
        entidadData.nombre,
        entidadData.estado,
        periodo,
        "2335",
        "Cuentas por pagar operaciones recíprocas",
        "0",
        "850000",
      ],
      [
        "Saldos Cuentas Recíprocas",
        entidadData.codigo,
        entidadData.nombre,
        entidadData.estado,
        periodo,
        "1355",
        "Anticipos operaciones recíprocas",
        "2300000",
        "0",
      ],
    ]

    // Convertir a CSV
    const csvContent = datosReporte.map((row) => row.join("\t")).join("\n")

    // Crear el blob y descargar
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `saldos_cuentas_reciprocas_${entidadData.codigo}_${periodo}_${new Date().getTime()}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Reporte generado",
      description: "El archivo Excel se ha descargado correctamente.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saldos Cuentas Recíprocas</h1>
          <p className="text-muted-foreground">Reporte de saldos de cuentas recíprocas por entidad</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Reporte</CardTitle>
          <CardDescription>Datos de la entidad y parámetros de generación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Datos de la entidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nombre de la Entidad</Label>
              <p className="text-sm font-medium">{entidadData.nombre}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Código de la Entidad</Label>
              <p className="text-sm font-medium">{entidadData.codigo}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <p className="text-sm font-medium">{entidadData.estado}</p>
            </div>
          </div>

          {/* Selector de período */}
          <div className="space-y-2">
            <Label htmlFor="periodo">Período *</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger id="periodo">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enero-marzo">Enero - Marzo</SelectItem>
                <SelectItem value="abril-junio">Abril - Junio</SelectItem>
                <SelectItem value="julio-septiembre">Julio - Septiembre</SelectItem>
                <SelectItem value="octubre-diciembre">Octubre - Diciembre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón generar */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleGenerarReporte} disabled={!periodo}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
