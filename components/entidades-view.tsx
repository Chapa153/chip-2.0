"use client"

import { useState, useMemo } from "react"
import { Search, ChevronLeft, Edit2, Plus, Check, MapPin, Building2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDepartamentos, getMunicipios } from "@/lib/colombia-data"
import CrearEntidadView from "./crear-entidad-view"
import EditarEntidadView from "./editar-entidad-view"

interface Entidad {
  id: string
  razonSocial: string
  nit: string
  sigla: string
  codigoEntidad: string
  departamento: string
  municipio: string
  estado: "activa" | "inactiva"
  sector: string
}

interface EntidadesViewProps {
  onBack: () => void
}

export default function EntidadesView({ onBack }: EntidadesViewProps) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showCrearEntidad, setShowCrearEntidad] = useState(false)
  const [entidades, setEntidades] = useState<Entidad[]>([
    {
      id: "1",
      razonSocial: "Empresa Principal SA",
      nit: "1234567890",
      sigla: "EPS",
      codigoEntidad: "E001",
      departamento: "Cundinamarca",
      municipio: "Bogotá",
      estado: "activa",
      sector: "Financiero",
    },
    {
      id: "2",
      razonSocial: "Sucursal Regional",
      nit: "0987654321",
      sigla: "SR",
      codigoEntidad: "E002",
      departamento: "Antioquia",
      municipio: "Medellín",
      estado: "activa",
      sector: "Industrial",
    },
    {
      id: "3",
      razonSocial: "Oficina Comercial",
      nit: "5555555555",
      sigla: "OC",
      codigoEntidad: "E003",
      departamento: "Valle del Cauca",
      municipio: "Cali",
      estado: "inactiva",
      sector: "Comercio",
    },
  ])

  const [searchFilters, setSearchFilters] = useState({
    razonSocial: "",
    nit: "",
    sigla: "",
    codigoEntidad: "",
    departamento: "",
    municipio: "",
  })

  const [showResults, setShowResults] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    razonSocial: "",
    nit: "",
    sigla: "",
    codigoEntidad: "",
    departamento: "",
    municipio: "",
    estado: "activa" as const,
    sector: "",
  })

  const [showEditView, setShowEditView] = useState(false)

  const departamentos = getDepartamentos()
  const municipios = searchFilters.departamento ? getMunicipios(searchFilters.departamento) : []

  const filteredEntidades = useMemo(() => {
    return entidades.filter((e) => {
      return (
        (searchFilters.razonSocial === "" ||
          e.razonSocial.toLowerCase().includes(searchFilters.razonSocial.toLowerCase())) &&
        (searchFilters.nit === "" || e.nit.includes(searchFilters.nit)) &&
        (searchFilters.sigla === "" || e.sigla.toLowerCase().includes(searchFilters.sigla.toLowerCase())) &&
        (searchFilters.codigoEntidad === "" ||
          e.codigoEntidad.toLowerCase().includes(searchFilters.codigoEntidad.toLowerCase())) &&
        (searchFilters.departamento === "" || e.departamento === searchFilters.departamento) &&
        (searchFilters.municipio === "" || e.municipio === searchFilters.municipio)
      )
    })
  }, [entidades, searchFilters])

  const handleSearch = () => {
    setShowResults(true)
  }

  const handleClearFilters = () => {
    setSearchFilters({
      razonSocial: "",
      nit: "",
      sigla: "",
      codigoEntidad: "",
      departamento: "",
      municipio: "",
    })
    setShowResults(false)
  }

  const handleAdd = () => {
    setShowCrearEntidad(true)
  }

  const handleEdit = (entidad: Entidad) => {
    setEditingId(entidad.id)
    setShowEditView(true)
  }

  const handleSave = () => {
    if (!formData.razonSocial.trim() || !formData.nit.trim() || !formData.departamento || !formData.municipio) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (editingId) {
      setEntidades(
        entidades.map((e) =>
          e.id === editingId
            ? {
                ...e,
                razonSocial: formData.razonSocial,
                nit: formData.nit,
                sigla: formData.sigla,
                codigoEntidad: formData.codigoEntidad,
                departamento: formData.departamento,
                municipio: formData.municipio,
                estado: formData.estado,
                sector: formData.sector,
              }
            : e,
        ),
      )
    } else {
      setEntidades([
        ...entidades,
        {
          id: Date.now().toString(),
          razonSocial: formData.razonSocial,
          nit: formData.nit,
          sigla: formData.sigla,
          codigoEntidad: formData.codigoEntidad,
          departamento: formData.departamento,
          municipio: formData.municipio,
          estado: formData.estado,
          sector: formData.sector,
        },
      ])
    }

    setShowForm(false)
  }

  if (showCrearEntidad) {
    return <CrearEntidadView onBack={() => setShowCrearEntidad(false)} />
  }

  if (showEditView && editingId) {
    return (
      <EditarEntidadView
        entidadId={editingId}
        onBack={() => {
          setShowEditView(false)
          setEditingId(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg transition text-foreground" title="Volver">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 size={32} className="text-primary" />
              Gestión de Entidades
            </h1>
            <p className="text-muted-foreground mt-1">Administra todas las entidades del sistema</p>
          </div>
        </div>
      </div>

      {!showForm ? (
        <>
          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {showAdvancedSearch ? "Búsqueda Avanzada" : "Búsqueda por NIT"}
              </h2>
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {showAdvancedSearch ? (
                  <>
                    <ChevronUp size={16} />
                    Búsqueda simple
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Búsqueda avanzada
                  </>
                )}
              </button>
            </div>

            {!showAdvancedSearch ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">NIT</label>
                <input
                  type="text"
                  value={searchFilters.nit}
                  onChange={(e) => setSearchFilters({ ...searchFilters, nit: e.target.value })}
                  placeholder="Ingrese el NIT de la entidad"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              /* Búsqueda avanzada: todos los campos */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Razón Social */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Razón Social</label>
                  <input
                    type="text"
                    value={searchFilters.razonSocial}
                    onChange={(e) => setSearchFilters({ ...searchFilters, razonSocial: e.target.value })}
                    placeholder="Ej: Empresa Principal"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* NIT */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">NIT</label>
                  <input
                    type="text"
                    value={searchFilters.nit}
                    onChange={(e) => setSearchFilters({ ...searchFilters, nit: e.target.value })}
                    placeholder="Ej: 1234567890"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* SIGLA */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">SIGLA</label>
                  <input
                    type="text"
                    value={searchFilters.sigla}
                    onChange={(e) => setSearchFilters({ ...searchFilters, sigla: e.target.value })}
                    placeholder="Ej: EPS"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Código Entidad */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Código Entidad</label>
                  <input
                    type="text"
                    value={searchFilters.codigoEntidad}
                    onChange={(e) => setSearchFilters({ ...searchFilters, codigoEntidad: e.target.value })}
                    placeholder="Ej: E001"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Departamento</label>
                  <select
                    value={searchFilters.departamento}
                    onChange={(e) => {
                      setSearchFilters({
                        ...searchFilters,
                        departamento: e.target.value,
                        municipio: "",
                      })
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona un departamento...</option>
                    {departamentos.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Municipio</label>
                  <select
                    value={searchFilters.municipio}
                    onChange={(e) => setSearchFilters({ ...searchFilters, municipio: e.target.value })}
                    disabled={!searchFilters.departamento}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                  >
                    <option value="">
                      {!searchFilters.departamento ? "Selecciona departamento primero" : "Selecciona un municipio..."}
                    </option>
                    {municipios.map((mun) => (
                      <option key={mun} value={mun}>
                        {mun}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Botones de búsqueda */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-border hover:bg-muted bg-transparent"
              >
                Limpiar Filtros
              </Button>
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                <Search size={18} className="mr-2" />
                Buscar
              </Button>
              <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus size={18} className="mr-2" />
                Nueva Entidad
              </Button>
            </div>
          </div>

          {showResults && (
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border bg-muted/50">
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Acciones</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">NIT</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Código</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Razón Social</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Departamento</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Municipio</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Estado</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntidades.length > 0 ? (
                      filteredEntidades.map((entidad) => (
                        <tr key={entidad.id} className="border-b border-border hover:bg-muted/30 transition">
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleEdit(entidad)}
                              className="p-2 hover:bg-accent/20 rounded-md transition text-accent"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                          </td>
                          <td className="py-4 px-4 text-foreground font-medium">{entidad.nit}</td>
                          <td className="py-4 px-4 text-foreground">{entidad.codigoEntidad}</td>
                          <td className="py-4 px-4 text-foreground font-medium">{entidad.razonSocial}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-foreground">
                              <MapPin size={16} className="text-primary" />
                              {entidad.departamento}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-foreground">{entidad.municipio}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                entidad.estado === "activa"
                                  ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-200"
                                  : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200"
                              }`}
                            >
                              {entidad.estado === "activa" ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-foreground">{entidad.sector}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 px-4 text-center text-muted-foreground">
                          No se encontraron entidades con los criterios de búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Resumen de resultados */}
              <div className="px-6 py-4 bg-muted/30 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Se encontraron <span className="font-semibold">{filteredEntidades.length}</span> resultado
                  {filteredEntidades.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay búsqueda realizada */}
          {!showResults && (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">Realiza una búsqueda para ver las entidades disponibles</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Formulario de edición */}
          <div className="bg-card border border-border rounded-lg p-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingId ? "Editar Entidad" : "Nueva Entidad"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Razón Social *</label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  placeholder="Nombre completo de la entidad"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">NIT *</label>
                <input
                  type="text"
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">SIGLA</label>
                <input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  placeholder="Ej: EPS"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Código Entidad</label>
                <input
                  type="text"
                  value={formData.codigoEntidad}
                  onChange={(e) => setFormData({ ...formData, codigoEntidad: e.target.value })}
                  placeholder="Ej: E001"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Departamento *</label>
                <select
                  value={formData.departamento}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      departamento: e.target.value,
                      municipio: "",
                    })
                  }}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona un departamento...</option>
                  {departamentos.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Municipio *</label>
                <select
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  disabled={!formData.departamento}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                >
                  <option value="">
                    {!formData.departamento ? "Selecciona departamento primero" : "Selecciona municipio..."}
                  </option>
                  {getMunicipios(formData.departamento).map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Sector</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Ej: Financiero"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as "activa" | "inactiva" })}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 justify-end">
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-border hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
