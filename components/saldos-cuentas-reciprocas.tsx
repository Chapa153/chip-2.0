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

  // Datos de ejemplo para la entidad (estos vendrían del sistema)
  const entidadActual = {
    nombre: "Contaduría General de la Nación",
    codigo: "811000423",
    estado: "Activo", // Agregando campo estado
  }

  const handleGenerarReporte = () => {
    console.log("[v0] Generando reporte de Saldos Cuentas Recíprocas", { periodo, entidad: entidadActual })

    // Simular datos para el reporte
    const datosReporte = [
      ["NIT", "Entidad", "Código Entidad", "Período", "Cuenta", "Concepto", "Saldo Débito", "Saldo Crédito"],
      [
        "811000423",
        entidadActual.nombre,
        entidadActual.codigo,
        periodo,
        "1305",
        "Cuentas por cobrar recíprocas",
        "1500000",
        "0",
      ],
      [
        "811000423",
        entidadActual.nombre,
        entidadActual.codigo,
        periodo,
        "2335",
        "Costos y gastos por pagar recíprocos",
        "0",
        "850000",
      ],
      [
        "811000423",
        entidadActual.nombre,
        entidadActual.codigo,
        periodo,
        "1355",
        "Anticipos recíprocos",
        "2300000",
        "0",
      ],
      [
        "811000423",
        entidadActual.nombre,
        entidadActual.codigo,
        periodo,
        "2805",
        "Ingresos diferidos recíprocos",
        "0",
        "1200000",
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
      `saldos_cuentas_reciprocas_${entidadActual.codigo}_${periodo}_${new Date().getTime()}.csv`,
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
          <CardDescription>Datos de la entidad y parámetros para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información de la entidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Nombre de la Entidad</Label>
              <p className="text-base font-medium">{entidadActual.nombre}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Código de la Entidad</Label>
              <p className="text-base font-medium">{entidadActual.codigo}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Estado</Label>
              <p className="text-base font-medium">{entidadActual.estado}</p>
            </div>
          </div>

          {/* Selector de período */}
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
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

          {/* Botón generar reporte */}
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
