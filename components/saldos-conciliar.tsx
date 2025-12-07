"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaldosConciliarProps {
  onBack: () => void
}

export default function SaldosConciliar({ onBack }: SaldosConciliarProps) {
  const [periodo, setPeriodo] = useState<string>("")
  const [entidad, setEntidad] = useState<string>("")
  const { toast } = useToast()

  const handleGenerarReporte = () => {
    console.log("[v0] Generando reporte de Saldos por Conciliar", { periodo, entidad })

    // Simular datos para el reporte
    const datosReporte = [
      ["NIT", "Entidad", "Período", "Cuenta", "Concepto", "Saldo Débito", "Saldo Crédito", "Estado"],
      [
        "811000423",
        entidad === "todas" ? "Todas las entidades" : "Entidad seleccionada",
        periodo,
        "1305",
        "Cuentas por cobrar",
        "1500000",
        "0",
        "Pendiente",
      ],
      [
        "811000423",
        entidad === "todas" ? "Todas las entidades" : "Entidad seleccionada",
        periodo,
        "2335",
        "Costos y gastos por pagar",
        "0",
        "850000",
        "Pendiente",
      ],
      [
        "811000423",
        entidad === "todas" ? "Todas las entidades" : "Entidad seleccionada",
        periodo,
        "1355",
        "Anticipos",
        "2300000",
        "0",
        "En conciliación",
      ],
    ]

    // Convertir a CSV
    const csvContent = datosReporte.map((row) => row.join("\t")).join("\n")

    // Crear el blob y descargar
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `saldos_por_conciliar_${periodo}_${entidad}_${new Date().getTime()}.csv`)
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
          <CardTitle>Parámetros del Reporte</CardTitle>
          <CardDescription>Seleccione los filtros para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger id="periodo">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Período 1</SelectItem>
                  <SelectItem value="2">Período 2</SelectItem>
                  <SelectItem value="3">Período 3</SelectItem>
                  <SelectItem value="4">Período 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entidad">Entidad</Label>
              <Select value={entidad} onValueChange={setEntidad}>
                <SelectTrigger id="entidad">
                  <SelectValue placeholder="Seleccionar entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las entidades</SelectItem>
                  <SelectItem value="entidad1">Entidad 1</SelectItem>
                  <SelectItem value="entidad2">Entidad 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleGenerarReporte} disabled={!periodo || !entidad}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
