"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"

interface TablaDatosInteractivaProps {
  onBack: () => void
}

export default function TablaDatosInteractiva({ onBack }: TablaDatosInteractivaProps) {
  const [datos, setDatos] = useState([
    {
      id: 1,
      codigo: "1105",
      nombre: "CAJA",
      saldoInicial: 1000000,
      debito: 500000,
      credito: 200000,
      saldoFinal: 1300000,
    },
    {
      id: 2,
      codigo: "1110",
      nombre: "BANCOS Y CORPORACIONES",
      saldoInicial: 5000000,
      debito: 2000000,
      credito: 1000000,
      saldoFinal: 6000000,
    },
    {
      id: 3,
      codigo: "1305",
      nombre: "CLIENTES",
      saldoInicial: 3000000,
      debito: 1500000,
      credito: 500000,
      saldoFinal: 4000000,
    },
  ])

  const [filaEditando, setFilaEditando] = useState<number | null>(null)

  const agregarFila = () => {
    const nuevaFila = {
      id: datos.length + 1,
      codigo: "",
      nombre: "",
      saldoInicial: 0,
      debito: 0,
      credito: 0,
      saldoFinal: 0,
    }
    setDatos([...datos, nuevaFila])
    setFilaEditando(nuevaFila.id)
  }

  const eliminarFila = (id: number) => {
    setDatos(datos.filter((fila) => fila.id !== id))
  }

  const actualizarCelda = (id: number, campo: string, valor: string | number) => {
    setDatos(
      datos.map((fila) => {
        if (fila.id === id) {
          const filaActualizada = { ...fila, [campo]: valor }
          // Calcular saldo final automáticamente
          if (campo === "saldoInicial" || campo === "debito" || campo === "credito") {
            filaActualizada.saldoFinal =
              Number(filaActualizada.saldoInicial) + Number(filaActualizada.debito) - Number(filaActualizada.credito)
          }
          return filaActualizada
        }
        return fila
      }),
    )
  }

  const guardarCambios = () => {
    setFilaEditando(null)
    alert("Datos guardados exitosamente")
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Gestión de datos</h2>
            <p className="text-sm text-muted-foreground mt-1">Agregue, edite o elimine filas de la tabla interactiva</p>
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={agregarFila}>
            <Plus size={16} className="mr-2" />
            Agregar Fila
          </Button>
          <Button onClick={guardarCambios} variant="outline">
            <Save size={16} className="mr-2" />
            Guardar Cambios
          </Button>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Código</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Nombre de Cuenta</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Saldo Inicial</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Débito</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Crédito</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Saldo Final</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((fila) => (
                <tr key={fila.id} className="border-t border-border hover:bg-accent/50">
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.codigo}
                      onChange={(e) => actualizarCelda(fila.id, "codigo", e.target.value)}
                      onFocus={() => setFilaEditando(fila.id)}
                      className="w-full px-2 py-1 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.nombre}
                      onChange={(e) => actualizarCelda(fila.id, "nombre", e.target.value)}
                      onFocus={() => setFilaEditando(fila.id)}
                      className="w-full px-2 py-1 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={fila.saldoInicial}
                      onChange={(e) => actualizarCelda(fila.id, "saldoInicial", Number(e.target.value))}
                      onFocus={() => setFilaEditando(fila.id)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={fila.debito}
                      onChange={(e) => actualizarCelda(fila.id, "debito", Number(e.target.value))}
                      onFocus={() => setFilaEditando(fila.id)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={fila.credito}
                      onChange={(e) => actualizarCelda(fila.id, "credito", Number(e.target.value))}
                      onFocus={() => setFilaEditando(fila.id)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={fila.saldoFinal}
                      readOnly
                      className="w-full px-2 py-1 border border-input rounded bg-muted text-right font-semibold"
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarFila(fila.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>💡 Haga clic en cualquier celda para editarla. El saldo final se calcula automáticamente.</p>
        </div>
      </div>
    </div>
  )
}
