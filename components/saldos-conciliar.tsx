"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react"

interface SaldosConciliarProps {
  onBack: () => void
}

export default function SaldosConciliar({ onBack }: SaldosConciliarProps) {
  const [periodo, setPeriodo] = useState<string>("")
  const [ano, setAno] = useState<string>("")
  const [entidad, setEntidad] = useState<string>("")

  const handleGenerarReporte = () => {
    console.log("[v0] Generando reporte de Saldos por Conciliar", { periodo, ano, entidad })
    // Lógica para generar el reporte
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros del Reporte</CardTitle>
          <CardDescription>Seleccione los filtros para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Año</Label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger id="ano">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            <Button onClick={handleGenerarReporte} disabled={!periodo || !ano}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
            <Button variant="outline" onClick={handleGenerarReporte} disabled={!periodo || !ano}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área de resultados (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>Los resultados del reporte se mostrarán aquí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Seleccione los parámetros y genere el reporte para ver los resultados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
