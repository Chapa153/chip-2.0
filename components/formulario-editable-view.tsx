"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"

interface FormularioEditableViewProps {
  nombreFormulario: string
  onBack: () => void
  onSave: () => void
}

export default function FormularioEditableView({ nombreFormulario, onBack, onSave }: FormularioEditableViewProps) {
  const [filas, setFilas] = useState([
    {
      id: 1,
      codigo: "1",
      nombre: "ACTIVO",
      saldoInicial: "1000000",
      debito: "500000",
      credito: "300000",
      saldoFinal: "1200000",
    },
    {
      id: 2,
      codigo: "11",
      nombre: "EFECTIVO Y EQUIVALENTES AL EFECTIVO",
      saldoInicial: "500000",
      debito: "200000",
      credito: "100000",
      saldoFinal: "600000",
    },
    {
      id: 3,
      codigo: "1105",
      nombre: "CAJA",
      saldoInicial: "100000",
      debito: "50000",
      credito: "20000",
      saldoFinal: "130000",
    },
  ])

  const [nuevaFila, setNuevaFila] = useState({
    codigo: "",
    nombre: "",
    saldoInicial: "",
    debito: "",
    credito: "",
    saldoFinal: "",
  })

  const handleCellChange = (id: number, campo: string, valor: string) => {
    setFilas(filas.map((fila) => (fila.id === id ? { ...fila, [campo]: valor } : fila)))
  }

  const handleAgregarFila = () => {
    if (nuevaFila.codigo && nuevaFila.nombre) {
      const newId = Math.max(...filas.map((f) => f.id)) + 1
      setFilas([...filas, { id: newId, ...nuevaFila }])
      setNuevaFila({
        codigo: "",
        nombre: "",
        saldoInicial: "",
        debito: "",
        credito: "",
        saldoFinal: "",
      })
    }
  }

  const handleEliminarFila = (id: number) => {
    setFilas(filas.filter((fila) => fila.id !== id))
  }

  const handleGuardar = () => {
    alert("Datos guardados exitosamente")
    onSave()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Volver
          </Button>
          <h2 className="text-2xl font-bold text-primary">{nombreFormulario}</h2>
        </div>
        <Button onClick={handleGuardar} className="gap-2">
          <Save size={18} />
          Guardar Cambios
        </Button>
      </div>

      {/* Tabla editable */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm min-w-[100px]">Código</th>
                <th className="text-left py-3 px-4 font-semibold text-sm min-w-[250px]">Nombre de Cuenta</th>
                <th className="text-right py-3 px-4 font-semibold text-sm min-w-[150px]">Saldo Inicial</th>
                <th className="text-right py-3 px-4 font-semibold text-sm min-w-[150px]">Débito</th>
                <th className="text-right py-3 px-4 font-semibold text-sm min-w-[150px]">Crédito</th>
                <th className="text-right py-3 px-4 font-semibold text-sm min-w-[150px]">Saldo Final</th>
                <th className="text-center py-3 px-4 font-semibold text-sm w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, index) => (
                <tr
                  key={fila.id}
                  className={`border-b border-border ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                >
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.codigo}
                      onChange={(e) => handleCellChange(fila.id, "codigo", e.target.value)}
                      className="w-full px-2 py-1 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.nombre}
                      onChange={(e) => handleCellChange(fila.id, "nombre", e.target.value)}
                      className="w-full px-2 py-1 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.saldoInicial}
                      onChange={(e) => handleCellChange(fila.id, "saldoInicial", e.target.value)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.debito}
                      onChange={(e) => handleCellChange(fila.id, "debito", e.target.value)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.credito}
                      onChange={(e) => handleCellChange(fila.id, "credito", e.target.value)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={fila.saldoFinal}
                      onChange={(e) => handleCellChange(fila.id, "saldoFinal", e.target.value)}
                      className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Button
                      onClick={() => handleEliminarFila(fila.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}

              {/* Fila para agregar nuevos datos */}
              <tr className="bg-primary/5 border-t-2 border-primary/20">
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={nuevaFila.codigo}
                    onChange={(e) => setNuevaFila({ ...nuevaFila, codigo: e.target.value })}
                    placeholder="Código"
                    className="w-full px-2 py-1 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={nuevaFila.nombre}
                    onChange={(e) => setNuevaFila({ ...nuevaFila, nombre: e.target.value })}
                    placeholder="Nombre de cuenta"
                    className="w-full px-2 py-1 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={nuevaFila.saldoInicial}
                    onChange={(e) => setNuevaFila({ ...nuevaFila, saldoInicial: e.target.value })}
                    placeholder="0"
                    className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={nuevaFila.debito}
                    onChange={(e) => setNuevaFila({ ...nuevaFila, debito: e.target.value })}
                    placeholder="0"
                    className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={nuevaFila.credito}
                    onChange={(e) => setNuevaFila({ ...nuevaFila, credito: e.target.value })}
                    placeholder="0"
                    className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={nuevaFila.saldoFinal}
                    onChange={(e) => setNuevaFila({ ...nuevaFila, saldoFinal: e.target.value })}
                    placeholder="0"
                    className="w-full px-2 py-1 border border-input rounded bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="py-2 px-4 text-center">
                  <Button
                    onClick={handleAgregarFila}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    disabled={!nuevaFila.codigo || !nuevaFila.nombre}
                  >
                    <Plus size={16} />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          <strong>Instrucciones:</strong> Complete los datos en cada celda. Los valores numéricos deben ingresarse sin
          separadores de miles. Use la fila inferior para agregar nuevas cuentas al formulario.
        </p>
      </div>
    </div>
  )
}
