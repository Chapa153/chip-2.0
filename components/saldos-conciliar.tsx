"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaldosConciliarProps {
  onBack: () => void
}

export default function SaldosConciliar({ onBack }: SaldosConciliarProps) {
  const [periodo, setPeriodo] = useState<string>("")
  const { toast } = useToast()

  const nombreEntidad = "Contaduría General de la Nación"
  const codigoEntidad = "811000423"
  const estadoEntidad = "Activo"

  const handleGenerarReporte = () => {
    console.log("[v0] Generando reporte de Saldos por Conciliar", { periodo, nombreEntidad, codigoEntidad })

    const datosReporte = [
      ["NIT", "Entidad", "Período", "Cuenta", "Concepto", "Saldo Débito", "Saldo Crédito", "Estado"],
      [codigoEntidad, nombreEntidad, periodo, "1305", "Cuentas por cobrar", "1500000", "0", "Pendiente"],
      [codigoEntidad, nombreEntidad, periodo, "2335", "Costos y gastos por pagar", "0", "850000", "Pendiente"],
      [codigoEntidad, nombreEntidad, periodo, "1355", "Anticipos", "2300000", "0", "En conciliación"],
    ]

    const csvContent = datosReporte.map((row) => row.join("\t")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `saldos_por_conciliar_${periodo}_${new Date().getTime()}.csv`)
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
          <h1 className="text-3xl font-bold text-foreground">Saldos por Conciliar</h1>
          <p className="text-muted-foreground">Reporte de operaciones recíprocas pendientes de conciliación</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-muted-foreground text-sm">Entidad</Label>
              <p className="font-medium">{nombreEntidad}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Código</Label>
              <p className="font-medium">{codigoEntidad}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Estado</Label>
              <p className="font-medium">{estadoEntidad}</p>
            </div>
          </div>

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

          <div className="flex gap-2 pt-4">
            <Button onClick={handleGenerarReporte} disabled={!periodo} className="w-full md:w-auto">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
