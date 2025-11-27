"use client"

import React, { useState, useMemo, useEffect } from "react" // Corrected import of React
import {
  ChevronRight,
  ChevronDown,
  Info,
  Filter,
  Edit,
  Save,
  X,
  Plus,
  ChevronLeft,
  ArrowLeft,
  Send,
} from "lucide-react" // Added ArrowLeft and Send
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog" // Added DialogFooter
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos para la estructura de datos
interface ConceptNode {
  id: string
  label: string
  children?: ConceptNode[]
  level: number
}

interface CellData {
  conceptId: string
  variableId: string
  value: string
}

interface AtributoExtensible {
  nombre: string
  valor: string | boolean
  tipo: "texto" | "boolean"
}

interface Variable {
  id: string
  label: string
  type: "numeric" | "dropdown" | "string" | "calculated" | "boolean" | "decimal" | "date" // Agregados nuevos tipos
  maxLength?: number // Longitud máxima para validación
}

interface DataTableProps {
  title?: string
  onBack?: () => void
  filtrosPrevios?: {
    categoria?: string
    ano?: string
    periodo?: string
  }
}

const AddChildDialog = ({
  open,
  onOpenChange,
  onAdd,
  parentId,
  parentName,
  variables,
  existingChildren,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (parentId: string, numericValue: string, dropdownValue: string) => void
  parentId: string
  parentName: string
  variables: Variable[]
  existingChildren: ConceptNode[]
}) => {
  const [numericValue, setNumericValue] = useState("")
  const [dropdownValue, setDropdownValue] = useState("")
  const [error, setError] = useState("")

  const var1Name = variables[0]?.label || "Variable 1"
  const var2Name = variables[1]?.label || "Variable 2"

  const opcionesLista = ["Opción A", "Opción B", "Opción C", "Opción D", "Opción E"]

  const handleSubmit = () => {
    if (numericValue && dropdownValue) {
      const newChildLabel = `${numericValue}, ${dropdownValue}`
      const isDuplicate = existingChildren.some((child) => child.label === newChildLabel)

      if (isDuplicate) {
        setError("Ya existe un concepto hijo con estos valores. No se permiten duplicados.")
        return
      }

      onAdd(parentId, numericValue, dropdownValue)
      setNumericValue("")
      setDropdownValue("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Concepto Hijo</DialogTitle>
          <DialogDescription>Agregando concepto hijo a: {parentName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {var1Name} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={numericValue}
              onChange={(e) => {
                const value = e.target.value
                if (value === "" || /^\d+$/.test(value)) {
                  setNumericValue(value)
                  setError("")
                }
              }}
              placeholder="Ingrese un valor numérico"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {var2Name} <span className="text-red-500">*</span>
            </label>
            <select
              value={dropdownValue}
              onChange={(e) => {
                setDropdownValue(e.target.value)
                setError("")
              }}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Seleccione una opción</option>
              {opcionesLista.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
            <strong>Nota:</strong> El nombre del concepto será: "{numericValue || "###"}, {dropdownValue || "Opción"}"
            <br />
            Estas variables no podrán ser editadas posteriormente.
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!numericValue || !dropdownValue}>
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const atributosExtensiblesMock: Record<string, AtributoExtensible[]> = {
  "1": [
    { nombre: "NIVEL DE CLASIFICACION", valor: "SUBCUENTA", tipo: "texto" },
    { nombre: "CLASES DE AGRUPACION", valor: "ACTIVO", tipo: "texto" },
    { nombre: "CUENTA RECIPROCA", valor: false, tipo: "boolean" },
    { nombre: "LIQUIDEZ Y EXIGIBILIDAD", valor: "CORRIENTE", tipo: "texto" },
    { nombre: "PERTENECE A REGLA DE CONSOLID.", valor: false, tipo: "boolean" },
    { nombre: "ACEPTA SIGNO", valor: "POSITIVO", tipo: "texto" },
    { nombre: "OBLIGA A REPORTAR EL 100% EN O.R", valor: false, tipo: "boolean" },
    { nombre: "SALDO POR CONCILIAR", valor: false, tipo: "boolean" },
    { nombre: "CATALOGO GENERAL DE CONSOLID.", valor: false, tipo: "boolean" },
    { nombre: "NATURALEZA CONTABLE", valor: "DB", tipo: "texto" },
    { nombre: "SALDOS CERO", valor: "NO APLICA", tipo: "texto" },
  ],
}

const generateEstadoCambiosConceptos = (): ConceptNode[] => {
  return [
    {
      id: "1",
      label: "Capital Social",
      level: 0,
      children: [],
    },
    {
      id: "2",
      label: "Reservas",
      level: 0,
      children: [],
    },
  ]
}

const generateMockConcepts = (): ConceptNode[] => {
  const concepts: ConceptNode[] = []

  for (let i = 1; i <= 100; i++) {
    const childrenCount = Math.floor(Math.random() * 10) + 5
    const children: ConceptNode[] = []

    for (let j = 1; j <= childrenCount; j++) {
      children.push({
        id: `${i}.${j}`,
        label: `Subcuenta ${i}.${j}`,
        level: 1,
      })
    }

    concepts.push({
      id: `${i}`,
      label: `Cuenta ${i}`,
      level: 0,
      children,
    })
  }

  return concepts
}

// const mockConcepts: ConceptNode[] = generateMockConcepts() // Obsoleta, se usa dynamicConcepts

function DataTable({ title = "Gestión de Datos", onBack, filtrosPrevios }: DataTableProps) {
  const isEstadoCambiosPatrimonio = title === "Estado de Cambios en el Patrimonio"

  console.log("[v0] DataTable renderizado - title:", title)
  console.log("[v0] isEstadoCambiosPatrimonio:", isEstadoCambiosPatrimonio)

  const [dynamicConcepts, setDynamicConcepts] = useState<ConceptNode[]>(() =>
    isEstadoCambiosPatrimonio ? generateEstadoCambiosConceptos() : generateMockConcepts(),
  )

  console.log("[v0] dynamicConcepts:", dynamicConcepts)

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [cellData, setCellData] = useState<Map<string, string>>(new Map())
  const [variablePage, setVariablePage] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [rangeStart, setRangeStart] = useState<string>("") // Unificando estados de rango
  const [rangeEnd, setRangeEnd] = useState<string>("") // Unificando estados de rango
  const [showLargeRangeAlert, setShowLargeRangeAlert] = useState(false) // Unificando estados de rango
  const [searchGlobal, setSearchGlobal] = useState("")
  const [atributosDialogOpen, setAtributosDialogOpen] = useState(false)
  const [selectedConceptoAtributos, setSelectedConceptoAtributos] = useState<{ id: string; nombre: string } | null>(
    null,
  )
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
  // Nuevo estado para celdas editadas
  const [editedCells, setEditedCells] = useState<Map<string, string>>(new Map())
  const [tempRowData, setTempRowData] = useState<Map<string, Map<string, string>>>(new Map())

  // Dialog para agregar hijos
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string>("") // Declarando selectedParentId
  const [newChildVar1, setNewChildVar1] = useState<string>("") // Declarando newChildVar1
  const [newChildVar2, setNewChildVar2] = useState<string>("") // Declarando newChildVar2
  const [errorMessage, setErrorMessage] = useState<string>("") // Declarando errorMessage
  const [showAddChildDialog, setShowAddChildDialog] = useState(false) // Declarando showAddChildDialog

  const [nonEditableVars, setNonEditableVars] = useState<Map<string, { var1: string; var2: string }>>(new Map())

  // Cambiar "selectedEncabezado" y "encabezadosDisponibles" por "selectedSegmento" y "segmentos"
  const [selectedSegmento, setSelectedSegmento] = useState<string>("Persona Natural") // Valor inicial
  const segmentos = ["Persona Natural", "Persona Jurídica"]

  // Actualizar el estado y el useEffect para usar "segmento"
  const [conceptosPorSegmento, setConceptosPorSegmento] = useState<Map<string, ConceptNode[]>>(() => {
    if (isEstadoCambiosPatrimonio) {
      const initialMap = new Map<string, ConceptNode[]>()
      segmentos.forEach((seg) => {
        initialMap.set(seg, generateEstadoCambiosConceptos())
      })
      return initialMap
    }
    return new Map()
  })

  // These states and their setters were introduced to fix lint errors
  // const [conceptosPorSegmento, setConceptosPorSegmento] = useState<Map<string, ConceptNode[]>>(new Map())
  // const [selectedSegmento, setSelectedSegmento] = useState<string>("")

  useEffect(() => {
    if (isEstadoCambiosPatrimonio && selectedSegmento) {
      const conceptosSegmento = conceptosPorSegmento.get(selectedSegmento)
      if (conceptosSegmento) {
        setDynamicConcepts(conceptosSegmento)
      }
    } else if (!isEstadoCambiosPatrimonio) {
      // Si no es Estado de Cambios, solo se usa dynamicConcepts directamente
      setDynamicConcepts(generateMockConcepts())
    }
  }, [selectedSegmento, conceptosPorSegmento, isEstadoCambiosPatrimonio])

  // Alerta suave de validación
  const [validationAlert, setValidationAlert] = useState<string>("")

  const VARIABLES_PER_PAGE = 6
  const MAX_ROWS_PER_PAGE = 100

  const totalVariables = 7 // Total de variables incluyendo la calculada
  const CALCULATED_VAR_ID = "var-calculated" // Variable calculada especial

  // Actualizar allVariables:
  // - `var-2` (string) ahora tiene `maxLength: 20`.
  // - `var-calculated` se renombra a `var-calculated`.
  // - Se elimina `totalVariables` como parámetro de cálculo y se usa un valor fijo de 7.
  const allVariables: Variable[] = useMemo(() => {
    const vars: Variable[] = [
      { id: "var-1", label: "Variable 1", type: "dropdown" },
      { id: "var-2", label: "Variable 2", type: "string", maxLength: 20 },
      { id: "var-3", label: "Variable 3", type: "numeric", maxLength: 10 }, // 10 dígitos
      { id: "var-4", label: "Variable 4", type: "decimal", maxLength: 10 }, // 8 enteros + 2 decimales
      { id: "var-5", label: "Variable 5", type: "boolean", maxLength: 1 },
      { id: "var-6", label: "Variable 6", type: "date" },
    ]

    // Variable calculada al final
    vars.push({ id: CALCULATED_VAR_ID, label: "Total Calculado", type: "calculated" })

    return vars
  }, []) // No depende de totalVariables

  const totalVariablePages = Math.ceil(totalVariables / VARIABLES_PER_PAGE)

  // Derived for paginated variables
  const paginatedVariables = useMemo(() => {
    const start = variablePage * VARIABLES_PER_PAGE
    return allVariables.slice(start, start + VARIABLES_PER_PAGE)
  }, [variablePage, allVariables])

  const getAllConceptsFlat = useMemo((): Array<{ id: string; label: string; level: number }> => {
    const result: Array<{ id: string; label: string; level: number }> = []

    const traverse = (nodes: ConceptNode[]) => {
      nodes.forEach((node) => {
        result.push({ id: node.id, label: node.label, level: node.level })
        if (node.children) {
          traverse(node.children)
        }
      })
    }

    traverse(dynamicConcepts) // Usar dynamicConcepts
    return result
  }, [dynamicConcepts]) // Dependencia en dynamicConcepts

  const getFilteredConcepts = useMemo((): ConceptNode[] => {
    if (!rangeStart || !rangeEnd) {
      return dynamicConcepts // Usar dynamicConcepts
    }

    const allFlat = getAllConceptsFlat
    const startIndex = allFlat.findIndex((c) => c.id === rangeStart)
    const endIndex = allFlat.findIndex((c) => c.id === rangeEnd)

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return dynamicConcepts // Usar dynamicConcepts
    }

    const rangeIds = new Set(allFlat.slice(startIndex, endIndex + 1).map((c) => c.id))

    const filterTree = (nodes: ConceptNode[]): ConceptNode[] => {
      return nodes
        .map((node) => {
          if (rangeIds.has(node.id)) {
            return {
              ...node,
              children: node.children ? filterTree(node.children) : undefined,
            }
          }
          if (node.children) {
            const filteredChildren = filterTree(node.children)
            if (filteredChildren.length > 0) {
              return {
                ...node,
                children: filteredChildren,
              }
            }
          }
          return null
        })
        .filter((node): node is ConceptNode => node !== null)
    }

    return filterTree(dynamicConcepts) // Usar dynamicConcepts
  }, [rangeStart, rangeEnd, getAllConceptsFlat, dynamicConcepts]) // Dependencia en dynamicConcepts

  const getFilteredConceptsWithSearch = useMemo((): ConceptNode[] => {
    const conceptosFiltrados = getFilteredConcepts

    if (!searchGlobal.trim()) {
      return conceptosFiltrados
    }

    const searchLower = searchGlobal.toLowerCase()

    const filterBySearch = (nodes: ConceptNode[]): ConceptNode[] => {
      return nodes
        .map((node) => {
          const matchesSearch =
            node.label.toLowerCase().includes(searchLower) || node.id.toLowerCase().includes(searchLower)

          if (matchesSearch) {
            return {
              ...node,
              children: node.children ? filterBySearch(node.children) : undefined,
            }
          }

          if (node.children) {
            const filteredChildren = filterBySearch(node.children)
            if (filteredChildren.length > 0) {
              return {
                ...node,
                children: filteredChildren,
              }
            }
          }

          return null
        })
        .filter((node): node is ConceptNode => node !== null)
    }

    return filterBySearch(conceptosFiltrados)
  }, [getFilteredConcepts, searchGlobal])

  const getCurrentVariables = () => {
    const start = variablePage * VARIABLES_PER_PAGE + 1
    return Array.from({ length: VARIABLES_PER_PAGE }, (_, i) => ({
      id: `var-${start + i}`,
      label: `Variable ${start + i}`,
    }))
  }

  const getPaginatedRootConcepts = (): ConceptNode[] => {
    const start = currentPage * MAX_ROWS_PER_PAGE
    return getFilteredConceptsWithSearch.slice(start, start + MAX_ROWS_PER_PAGE)
  }

  const getFlattenedConceptsForPagination = (): ConceptNode[] => {
    const result: ConceptNode[] = []
    const filteredConcepts = getFilteredConceptsWithSearch

    const traverse = (nodes: ConceptNode[]) => {
      nodes.forEach((node) => {
        result.push(node)
        if (expandedNodes.has(node.id) && node.children) {
          traverse(node.children)
        }
      })
    }

    traverse(filteredConcepts)
    return result
  }

  const allFlattenedConcepts = getFlattenedConceptsForPagination()
  const totalPages = Math.ceil(allFlattenedConcepts.length / MAX_ROWS_PER_PAGE)

  const getCurrentPageConcepts = (): ConceptNode[] => {
    const start = currentPage * MAX_ROWS_PER_PAGE
    const end = start + MAX_ROWS_PER_PAGE
    return allFlattenedConcepts.slice(start, end)
  }

  const flatConcepts = getCurrentPageConcepts()

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const isParentConcept = (conceptId: string): boolean => {
    const findNode = (nodes: ConceptNode[]): ConceptNode | null => {
      for (const node of nodes) {
        if (node.id === conceptId) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(dynamicConcepts) // Usar dynamicConcepts
    return node ? node.children && node.children.length > 0 : false
  }

  const getChildrenIds = (conceptId: string): string[] => {
    const findNode = (nodes: ConceptNode[]): ConceptNode | null => {
      for (const node of nodes) {
        if (node.id === conceptId) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }

    const collectIds = (node: ConceptNode): string[] => {
      if (!node.children || node.children.length === 0) {
        return [node.id]
      }
      return node.children.flatMap((child) => collectIds(child))
    }

    const node = findNode(dynamicConcepts) // Usar dynamicConcepts
    return node && node.children ? node.children.flatMap((child) => collectIds(child)) : []
  }

  const calculateTotalForRow = (conceptId: string): number => {
    // Solo calcular para conceptos hijo en Estado de Cambios
    if (!isEstadoCambiosPatrimonio) return 0

    // Encuentra el nodo por su ID
    const findNodeById = (nodes: ConceptNode[], id: string): ConceptNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNodeById(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    const concept = findNodeById(dynamicConcepts, conceptId)

    if (!concept || concept.level === 0) return 0

    let total = 0

    // Sumar todas las variables numéricas excepto var-1 y var-2 (las no editables)
    allVariables.forEach((variable) => {
      // Asumiendo que las variables no editables son var-1 y var-2
      if (variable.type === "numeric" && variable.id !== "var-1" && variable.id !== "var-2") {
        const value = getCellValue(conceptId, variable.id)
        const numValue = Number.parseFloat(value)
        if (!isNaN(numValue)) {
          total += numValue
        }
      }
    })

    return total
  }

  const calculateParentSum = (conceptId: string, variableId: string): number => {
    // Si es la variable calculada, calcular el total de totales de los hijos
    if (variableId === CALCULATED_VAR_ID) {
      const childrenIds = getChildrenIds(conceptId)
      let sum = 0
      childrenIds.forEach((childId) => {
        sum += calculateTotalForRow(childId)
      })
      return sum
    }

    const variable = allVariables.find((v) => v.id === variableId)

    // Solo sumar si es tipo numérico
    if (variable?.type !== "numeric") {
      return 0
    }

    const childrenIds = getChildrenIds(conceptId)
    let sum = 0

    childrenIds.forEach((childId) => {
      const value = getCellValue(childId, variableId)
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        sum += numValue
      }
    })

    return sum
  }

  const startEditingRow = (conceptId: string) => {
    const newEditingRows = new Set(editingRows)
    newEditingRows.add(conceptId)
    setEditingRows(newEditingRows)

    const rowData = new Map<string, string>()
    getCurrentVariables().forEach((variable) => {
      const value = getCellValue(conceptId, variable.id)
      rowData.set(variable.id, value)
    })

    const newTempData = new Map(tempRowData)
    newTempData.set(conceptId, rowData)
    setTempRowData(newTempData)
  }

  const saveEditingRow = (conceptId: string) => {
    const newEditingRows = new Set(editingRows)
    newEditingRows.delete(conceptId)
    setEditingRows(newEditingRows)

    const tempData = tempRowData.get(conceptId)
    if (tempData) {
      const newCellData = new Map(cellData)
      tempData.forEach((value, variableId) => {
        const key = `${conceptId}-${variableId}`
        newCellData.set(key, value)
      })
      setCellData(newCellData)

      const newTempData = new Map(tempRowData)
      newTempData.delete(conceptId)
      setTempRowData(newTempData)
    }
  }

  const cancelEditingRow = (conceptId: string) => {
    const newEditingRows = new Set(editingRows)
    newEditingRows.delete(conceptId)
    setEditingRows(newEditingRows)

    const newTempData = new Map(tempRowData)
    newTempData.delete(conceptId)
    setTempRowData(newTempData)
  }

  // Cambiar el nombre de la función y la lógica para usar `editedCells` y validaciones
  const handleCellEdit = (conceptId: string, variableId: string, value: string) => {
    const variable = allVariables.find((v) => v.id === variableId)
    if (variable) {
      validateFieldLength(variable, value) // Solo muestra alerta, no bloquea
    }

    setEditedCells((prev) => {
      const newMap = new Map(prev)
      const key = `${conceptId}-${variableId}`
      newMap.set(key, value)
      return newMap
    })
  }

  const hasUnsavedChanges = () => {
    return editingRows.size > 0
  }

  const handleVolverClick = () => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        `Tienes ${editingRows.size} registro(s) pendiente(s) de guardar. ¿Estás seguro de que deseas salir sin guardar?`,
      )
      if (!confirmed) {
        return
      }
    }
    onBack?.()
  }

  const handleTempCellChange = (conceptId: string, variableId: string, value: string) => {
    // Permitir valores vacíos y números para inputs numéricos
    const variable = allVariables.find((v) => v.id === variableId)
    if (variable?.type === "numeric") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        const rowData = tempRowData.get(conceptId) || new Map<string, string>()
        rowData.set(variableId, value)

        const newTempData = new Map(tempRowData)
        newTempData.set(conceptId, rowData)
        setTempRowData(newTempData)
      }
    } else {
      // Para otros tipos, permitir cualquier valor (o aplicar validación específica si es necesario)
      const rowData = tempRowData.get(conceptId) || new Map<string, string>()
      rowData.set(variableId, value)

      const newTempData = new Map(tempRowData)
      newTempData.set(conceptId, rowData)
      setTempRowData(newTempData)
    }
  }

  const getTempCellValue = (conceptId: string, variableId: string) => {
    const rowData = tempRowData.get(conceptId)
    if (rowData) {
      return rowData.get(variableId) || ""
    }
    return getCellValue(conceptId, variableId)
  }

  const isRowEditing = (conceptId: string) => {
    return editingRows.has(conceptId)
  }

  const handleCellChange = (conceptId: string, variableId: string, value: string) => {
    // Permitir valores vacíos y números para inputs numéricos
    const variable = allVariables.find((v) => v.id === variableId)
    if (variable?.type === "numeric") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        const key = `${conceptId}-${variableId}`
        const newData = new Map(cellData)
        newData.set(key, value)
        setCellData(newData)
      }
    } else {
      // Para otros tipos, permitir cualquier valor (o aplicar validación específica si es necesario)
      const key = `${conceptId}-${variableId}`
      const newData = new Map(cellData)
      newData.set(key, value)
      setCellData(newData)
    }
  }

  const handleCellBlur = (conceptId: string, variableId: string) => {
    // setEditingCellKey(null) // This state is not defined, likely a leftover.
    setCellData(new Map(cellData))
  }

  const getCellValue = (conceptId: string, variableId: string) => {
    // Usar editedCells para valores en edición
    const editedValue = editedCells.get(`${conceptId}-${variableId}`)
    if (editedValue !== undefined) {
      return editedValue
    }

    if (isEstadoCambiosPatrimonio && nonEditableVars.has(conceptId)) {
      // The mapping for nonEditableVars needs to align with the actual variable IDs used.
      // Assuming 'var-1' and 'var-2' map to the first two in getCurrentVariables().
      const vars = nonEditableVars.get(conceptId)!
      if (variableId === "var-1") return vars.var1
      if (variableId === "var-2") return vars.var2
    }

    const key = `${conceptId}-${variableId}`
    return cellData.get(key) || ""
  }

  const getNodeInfo = (nodeId: string): { node: ConceptNode | null; totalChildren: number } => {
    const findNode = (
      nodes: ConceptNode[],
      targetId: string,
      parent: ConceptNode | null = null,
    ): ConceptNode | null => {
      for (const node of nodes) {
        if (node.id === targetId) return node
        if (node.children) {
          for (const child of node.children) {
            if (child.id === targetId) return node
          }
          const found = findNode(node.children, targetId, node)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(dynamicConcepts, nodeId) // Usar dynamicConcepts

    const totalChildren = node?.children?.length || 0
    return { node, totalChildren }
  }

  const shouldShowChildrenPagination = (concept: ConceptNode, index: number): boolean => {
    const findParent = (
      nodes: ConceptNode[],
      targetId: string,
      parent: ConceptNode | null = null,
    ): ConceptNode | null => {
      for (const node of nodes) {
        if (node.children) {
          for (const child of node.children) {
            if (child.id === targetId) return node
          }
          const found = findParent(node.children, targetId, node)
          if (found) return found
        }
      }
      return null
    }

    const parent = findParent(dynamicConcepts, concept.id) // Usar dynamicConcepts

    if (!parent || !expandedNodes.has(parent.id)) {
      return false
    }

    if (!parent.children || parent.children.length <= MAX_ROWS_PER_PAGE) {
      return false
    }

    const currentPage = 0 // Placeholder for getChildrenPage, assuming it should always be 0 in this context
    const start = currentPage * MAX_ROWS_PER_PAGE
    const visibleChildren = parent.children.slice(start, start + MAX_ROWS_PER_PAGE)
    const lastVisibleChild = visibleChildren[visibleChildren.length - 1]

    return lastVisibleChild?.id === concept.id
  }

  // New state and derived values from updates
  // const [searchTerm, setSearchTerm] = useState("") // Removed as searchGlobal is used
  // const [startRange, setStartRange] = useState<string | null>(null) // Removed as rangeStart is used
  // const [endRange, setEndRange] = useState<string | null>(null) // Removed as rangeEnd is used

  const MAX_DROPDOWN_OPTIONS = 100 // Limitar opciones visibles para mejor rendimiento
  const [rangeSearchInitial, setRangeSearchInitial] = useState("")
  const [rangeSearchFinal, setRangeSearchFinal] = useState("")

  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}-${month}-${year}`
  }

  const formatDateForInput = (displayDate: string): string => {
    if (!displayDate) return ""
    const [day, month, year] = displayDate.split("-")
    return `${year}-${month}-${day}`
  }

  const isCalculatedVariable = (variableId: string): boolean => {
    return variableId === CALCULATED_VAR_ID
  }

  const validateFieldLength = (variable: Variable, value: string): { valid: boolean; message?: string } => {
    if (!variable.maxLength) return { valid: true }

    if (variable.type === "numeric") {
      const numericValue = value.replace(/[^0-9]/g, "")
      if (numericValue.length > variable.maxLength) {
        setValidationAlert(`El campo ${variable.label} permite máximo ${variable.maxLength} dígitos`)
        return { valid: false }
      }
    } else if (variable.type === "decimal") {
      const parts = value.split(".")
      const integerPart = parts[0] || ""
      const decimalPart = parts[1] || ""

      if (integerPart.length > 8) {
        setValidationAlert(`El campo ${variable.label} permite máximo 8 dígitos enteros`)
        return { valid: false }
      }
      if (decimalPart.length > 2) {
        setValidationAlert(`El campo ${variable.label} permite máximo 2 decimales`)
        return { valid: false }
      }
    } else if (variable.type === "string") {
      if (value.length > variable.maxLength) {
        setValidationAlert(`El campo ${variable.label} permite máximo ${variable.maxLength} caracteres`)
        return { valid: false }
      }
    } else if (variable.type === "boolean") {
      if (value.length > 1) {
        setValidationAlert(`El campo ${variable.label} permite máximo 1 carácter (S/N)`)
        return { valid: false }
      }
    }

    return { valid: true }
  }

  useEffect(() => {
    if (validationAlert) {
      const timer = setTimeout(() => setValidationAlert(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [validationAlert])

  const getFilteredStartRanges = useMemo(() => {
    const filtered = getAllConceptsFlat.filter(
      (concept) =>
        concept.label.toLowerCase().includes(rangeSearchInitial.toLowerCase()) ||
        concept.id.toLowerCase().includes(rangeSearchInitial.toLowerCase()),
    )
    return filtered.slice(0, MAX_DROPDOWN_OPTIONS)
  }, [getAllConceptsFlat, rangeSearchInitial])

  const getAvailableEndRanges = useMemo(() => {
    if (!rangeStart) {
      return []
    }
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeStart)
    if (startIndex === -1) {
      return []
    }

    const filtered = getAllConceptsFlat
      .slice(startIndex + 1)
      .filter(
        (concept) =>
          concept.label.toLowerCase().includes(rangeSearchFinal.toLowerCase()) ||
          concept.id.toLowerCase().includes(rangeSearchFinal.toLowerCase()),
      )

    return filtered.slice(0, MAX_DROPDOWN_OPTIONS)
  }, [getAllConceptsFlat, rangeStart, rangeSearchFinal])

  const handleRangeEndChange = (newEndRange: string) => {
    setRangeEnd(newEndRange)
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeStart)
    const endIndex = getAllConceptsFlat.findIndex((c) => c.id === newEndRange)

    if (startIndex !== -1 && endIndex !== -1) {
      const rangeSize = endIndex - startIndex + 1
      const shouldShowAlert = rangeSize > 30 // Considerar un umbral para la alerta
      if (shouldShowAlert) {
        setShowLargeRangeAlert(true)
      } else {
        setShowLargeRangeAlert(false)
      }
    }
  }

  useEffect(() => {
    if (rangeStart && rangeEnd) {
      setCurrentPage(0)
      setExpandedNodes(new Set())
    }
  }, [rangeStart, rangeEnd])

  const handleAddChild = () => {
    if (!newChildVar1.trim() || !newChildVar2.trim()) {
      setErrorMessage("Debe completar ambas variables")
      return
    }

    const childName = `${newChildVar1}, ${newChildVar2}`

    const parent = dynamicConcepts.find((c) => c.id === selectedParentId)
    if (parent) {
      const duplicate = parent.children?.some((child) => child.label === childName)
      if (duplicate) {
        setErrorMessage(`Ya existe un concepto hijo con el nombre: ${childName}`)
        return
      }

      const newChildId = `${selectedParentId}.${(parent.children?.length || 0) + 1}`
      const newChild: ConceptNode = {
        id: newChildId,
        label: childName,
        level: 1,
      }

      const updatedConcepts = dynamicConcepts.map((c) => {
        if (c.id === selectedParentId) {
          return {
            ...c,
            children: [...(c.children || []), newChild],
          }
        }
        return c
      })

      if (isEstadoCambiosPatrimonio) {
        const newConceptosPorSegmento = new Map(conceptosPorSegmento)
        newConceptosPorSegmento.set(selectedSegmento, updatedConcepts)
        setConceptosPorSegmento(newConceptosPorSegmento)
      }

      setDynamicConcepts(updatedConcepts)

      const newNonEditableVars = new Map(nonEditableVars)
      newNonEditableVars.set(newChildId, { var1: newChildVar1, var2: newChildVar2 })
      setNonEditableVars(newNonEditableVars)

      setShowAddChildDialog(false)
      setNewChildVar1("")
      setNewChildVar2("")
      setErrorMessage("")
    }
  }

  const handleOpenAddDialog = (parentId: string, parentName: string) => {
    setSelectedParentId(parentId)
    setShowAddChildDialog(true)
  }

  const getExistingChildren = (parentId: string): ConceptNode[] => {
    const parent = dynamicConcepts.find((c) => c.id === parentId)
    return parent?.children || []
  }

  // Modificar isCellEditable para que no tenga en cuenta nonEditableVars.has(concept.id)
  // sino que las variables var-1 y var-2 sean siempre no editables si isEstadoCambiosPatrimonio es true.
  const isCellEditable = (conceptId: string, variableId: string): boolean => {
    if (isCalculatedVariable(variableId)) {
      return false
    }

    // Variables var-1 y var-2 son no editables si el título es "Estado de Cambios en el Patrimonio"
    if (isEstadoCambiosPatrimonio && (variableId === "var-1" || variableId === "var-2")) {
      return false
    }
    return true
  }

  // Actualizar lógica de renderizado de celdas para mostrar variables no editables con fondo gris
  const renderCellContent = (concept: ConceptNode, variable: Variable, isEditing: boolean) => {
    const cellKey = `${concept.id}-${variable.id}`
    // Priorizar editedCells para mostrar el valor mientras se edita
    const cellValue = editedCells.get(cellKey) || cellData.get(cellKey) || ""

    // Variable calculada - solo lectura con fondo gris
    if (variable.type === "calculated") {
      const calculatedValue = calculateTotalForRow(concept.id)
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 text-blue-700 font-bold">
          {calculatedValue}
        </div>
      )
    }

    // Variables no editables con fondo gris
    // Si es Estado de Cambios y las variables son var-1 o var-2, son no editables y se muestran con fondo gris.
    if (isEstadoCambiosPatrimonio && (variable.id === "var-1" || variable.id === "var-2")) {
      // Debemos obtener el valor correcto, ya sea de nonEditableVars o de cellData si fue editado previamente
      const nonEditableData = nonEditableVars.get(concept.id)
      const displayValue = nonEditableData
        ? variable.id === "var-1"
          ? nonEditableData.var1
          : nonEditableData.var2
        : cellValue // Fallback a cellValue si nonEditableVars no tiene el dato (esto no debería pasar si se maneja correctamente)

      return (
        <div className="h-full flex items-center justify-center bg-gray-100 text-gray-700">{displayValue || "-"}</div>
      )
    }

    // Modo edición con fondo amarillo
    if (isEditing && isCellEditable(concept.id, variable.id)) {
      if (variable.type === "dropdown") {
        return (
          <select
            value={cellValue}
            onChange={(e) => handleCellEdit(concept.id, variable.id, e.target.value)}
            className="w-full h-full px-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
          >
            <option value="">Seleccionar...</option>
            <option value="Opción A">Opción A</option>
            <option value="Opción B">Opción B</option>
            <option value="Opción C">Opción C</option>
          </select>
        )
      } else if (variable.type === "boolean") {
        return (
          <input
            type="text"
            value={cellValue}
            onChange={(e) => {
              const value = e.target.value.toUpperCase()
              if (value === "" || value === "S" || value === "N") {
                handleCellEdit(concept.id, variable.id, value)
              } else {
                setValidationAlert("Solo se permite S o N")
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.toUpperCase()
              if (value !== "" && value !== "S" && value !== "N") {
                setValidationAlert(`El campo ${variable.label} solo acepta S o N`)
              }
            }}
            className="w-full h-full px-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50 text-center uppercase"
            maxLength={1}
          />
        )
      } else if (variable.type === "date") {
        return (
          <div className="relative w-full h-full">
            <input
              type="date"
              value={formatDateForInput(cellValue)}
              onChange={(e) => {
                const isoDate = e.target.value // yyyy-mm-dd
                const formattedDate = formatDateForDisplay(isoDate) // dd-mm-yyyy
                handleCellEdit(concept.id, variable.id, formattedDate)
              }}
              className="w-full h-full px-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
            />
          </div>
        )
      } else if (variable.type === "decimal") {
        return (
          <input
            type="text"
            inputMode="decimal"
            value={cellValue}
            onChange={(e) => {
              const value = e.target.value
              if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                handleCellEdit(concept.id, variable.id, value)
              }
            }}
            onBlur={(e) => {
              const validation = validateFieldLength(variable, e.target.value)
              if (!validation.valid) {
                console.log("[v0] Validación fallida:", validation.message)
              }
            }}
            className="w-full h-full px-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50 text-right"
          />
        )
      } else if (variable.type === "numeric") {
        return (
          <input
            type="text"
            inputMode="numeric"
            value={cellValue}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "")
              handleCellEdit(concept.id, variable.id, value)
            }}
            onBlur={(e) => {
              const validation = validateFieldLength(variable, e.target.value)
              if (!validation.valid) {
                console.log("[v0] Validación fallida:", validation.message)
              }
            }}
            className="w-full h-full px-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50 text-right"
          />
        )
      } else {
        return (
          <input
            type="text"
            value={cellValue}
            onChange={(e) => handleCellEdit(concept.id, variable.id, e.target.value)}
            onBlur={(e) => {
              const validation = validateFieldLength(variable, e.target.value)
              if (!validation.valid) {
                console.log("[v0] Validación fallida:", validation.message)
              }
            }}
            className="w-full h-full px-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
            maxLength={variable.maxLength}
          />
        )
      }
    }

    // Vista normal
    return (
      <div className="h-full flex items-center justify-center">
        {variable.type === "date" && cellValue ? cellValue : cellValue || "0"}
      </div>
    )
  }

  // Función handleEnviar
  const handleEnviar = () => {
    // Aquí iría la lógica para enviar los datos, por ejemplo:
    // - Validar que todas las celdas editables tengan valores correctos.
    // - Construir el payload con los datos de `cellData` y `editedCells`.
    // - Realizar la llamada a la API.
    alert("Formulario enviado correctamente")
  }

  const handleVerAtributos = (conceptId: string, conceptName: string) => {
    setSelectedConceptoAtributos([{ id: conceptId, nombre: conceptName }])
    setAtributosDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg">
      {validationAlert && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded mb-4">
          <p className="text-sm">{validationAlert}</p>
        </div>
      )}

      {/* Header con título y botones volver/enviar */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          {onBack && (
            // Usar handleVolverClick para la lógica del botón Volver
            <Button variant="outline" onClick={handleVolverClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          )}
          <Button onClick={handleEnviar}>
            <Send className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </div>
      </div>

      {isEstadoCambiosPatrimonio && (
        <div className="flex items-center gap-4 pb-4 border-b">
          <label className="text-sm font-medium text-gray-700">Encabezado:</label>
          <select
            value={selectedSegmento}
            onChange={(e) => {
              setSelectedSegmento(e.target.value)
              setCurrentPage(0)
              setExpandedNodes(new Set()) // Reset expanded nodes when segment changes
            }}
            className="border rounded px-3 py-2"
          >
            {segmentos.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Controles de rango */}
      <div className="flex items-end gap-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <div>
          <label className="block text-sm font-medium mb-2">Rango inicial:</label>
          <Select
            value={rangeStart}
            onValueChange={(value) => {
              setRangeStart(value)
              setRangeEnd("") // Reset rangeEnd when rangeStart changes
              setRangeSearchInitial("")
            }}
            disabled={editingRows.size > 0} // Deshabilitar si hay registros en edición
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Seleccionar concepto..." />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b">
                <Input
                  placeholder="Buscar concepto..."
                  value={rangeSearchInitial}
                  onChange={(e) => setRangeSearchInitial(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {getFilteredStartRanges.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">No se encontraron resultados</div>
              ) : (
                getFilteredStartRanges.map((concept) => (
                  <SelectItem key={concept.id} value={concept.id}>
                    {concept.label}
                  </SelectItem>
                ))
              )}
              {getFilteredStartRanges.length === MAX_DROPDOWN_OPTIONS && (
                <div className="p-2 text-xs text-orange-600 bg-orange-50 border-t">
                  Mostrando primeros {MAX_DROPDOWN_OPTIONS} resultados. Use el buscador para refinar.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rango final:</label>
          <Select
            value={rangeEnd}
            onValueChange={(value) => {
              handleRangeEndChange(value)
              setRangeSearchFinal("")
            }}
            disabled={!rangeStart || editingRows.size > 0} // Deshabilitar si no hay rangeStart o si hay registros en edición
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Seleccionar concepto..." />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b">
                <Input
                  placeholder="Buscar concepto..."
                  value={rangeSearchFinal}
                  onChange={(e) => setRangeSearchFinal(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {getAvailableEndRanges.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  {rangeStart
                    ? "No hay conceptos disponibles después del rango inicial"
                    : "Seleccione primero un rango inicial"}
                </div>
              ) : (
                getAvailableEndRanges.map((concept) => (
                  <SelectItem key={concept.id} value={concept.id}>
                    {concept.label}
                  </SelectItem>
                ))
              )}
              {getAvailableEndRanges.length === MAX_DROPDOWN_OPTIONS && (
                <div className="p-2 text-xs text-orange-600 bg-orange-50 border-t">
                  Mostrando primeros {MAX_DROPDOWN_OPTIONS} resultados. Use el buscador para refinar.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerta de registros pendientes */}
      {/* Mostrar alerta solo si hay cambios no guardados */}
      {hasUnsavedChanges() && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-800">
            Tienes {editingRows.size} registro(s) pendiente(s) de guardar. Debes guardar o cancelar antes de modificar
            los filtros de rango.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de más de 10,000 registros */}
      {showLargeRangeAlert && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            El rango seleccionado contiene más de 10,000 registros. Se aplicará paginación automática de 100 filas por
            página y los conceptos padres se mostrarán colapsados por defecto para optimizar el rendimiento.
          </AlertDescription>
        </Alert>
      )}

      {!rangeStart || !rangeEnd ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Filter className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">Seleccione un rango de conceptos</p>
          <p className="text-sm">Para visualizar los datos, debe seleccionar un rango inicial y final</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar en toda la tabla..."
                value={searchGlobal}
                onChange={(e) => setSearchGlobal(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Variables:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVariablePage(Math.max(0, variablePage - 1))}
                disabled={variablePage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {variablePage * VARIABLES_PER_PAGE + 1} -{" "}
                {Math.min((variablePage + 1) * VARIABLES_PER_PAGE, totalVariables)} de {totalVariables}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVariablePage(Math.min(totalVariablePages - 1, variablePage + 1))}
                disabled={variablePage >= totalVariablePages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabla principal */}
          <div className="overflow-x-auto border border-gray-300 rounded-md">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left text-sm font-semibold min-w-[100px]">
                    Acciones
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-sm font-semibold min-w-[200px]">
                    Conceptos
                  </th>
                  {paginatedVariables.map((variable) => (
                    <th
                      key={variable.id}
                      className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold min-w-[120px]"
                    >
                      {variable.label}
                      <span className="block text-xs font-normal text-gray-500">
                        {variable.type === "numeric" && "(Numérico)"}
                        {variable.type === "dropdown" && "(Lista)"}
                        {variable.type === "string" && "(Texto)"}
                        {variable.type === "calculated" && "(Calculado)"}
                        {variable.type === "decimal" && "(Decimal)"}
                        {variable.type === "boolean" && "(Booleano)"}
                        {variable.type === "date" && "(Fecha)"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getCurrentPageConcepts().map((concept) => {
                  const isParent = isParentConcept(concept.id)
                  const isExpanded = expandedNodes.has(concept.id)
                  const isEditing = isRowEditing(concept.id)
                  const isRootParent = isEstadoCambiosPatrimonio && concept.level === 0
                  const isChild = concept.level > 0

                  return (
                    <React.Fragment key={concept.id}>
                      {/* Fila del concepto padre */}
                      <tr className={isParent ? "bg-gray-50" : ""}>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            {isRootParent && isEstadoCambiosPatrimonio ? (
                              // Solo botón + para padres raíz en Estado de Cambios
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleOpenAddDialog(concept.id, concept.label)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleVerAtributos(concept.id, concept.label)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isChild && isEstadoCambiosPatrimonio ? (
                              // Editar e info para hijos en Estado de Cambios
                              <>
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => saveEditingRow(concept.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => cancelEditingRow(concept.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => startEditingRow(concept.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleVerAtributos(concept.id, concept.label)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isChild && !isEstadoCambiosPatrimonio ? (
                              // Para formularios normales, mostrar editar e info en hijos
                              <>
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => saveEditingRow(concept.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => cancelEditingRow(concept.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => startEditingRow(concept.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleVerAtributos(concept.id, concept.label)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              // Solo info para padres normales
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleVerAtributos(concept.id, concept.label)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex items-center gap-2" style={{ paddingLeft: `${concept.level * 24}px` }}>
                            {isParent && (
                              <button
                                onClick={() => toggleNode(concept.id)}
                                className="hover:bg-gray-100 rounded p-0.5"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <span className={cn("text-sm", concept.level === 0 && "font-semibold")}>
                              {concept.label}
                            </span>
                          </div>
                        </td>

                        {paginatedVariables.map((variable) => {
                          // Si es padre Y NO es Estado de Cambios, calculamos y mostramos la suma
                          if (isParent && !isEstadoCambiosPatrimonio) {
                            const sum = calculateParentSum(concept.id, variable.id)

                            // Si la variable no es numérica, mostrar guion
                            if (variable.type !== "numeric") {
                              return (
                                <td
                                  key={variable.id}
                                  className="border border-gray-300 px-2 py-1 text-center bg-gray-100"
                                >
                                  <span className="text-sm text-gray-400">-</span>
                                </td>
                              )
                            }

                            return (
                              <td
                                key={variable.id}
                                className="border border-gray-300 px-2 py-1 text-center bg-gray-100"
                              >
                                <span className="text-sm font-semibold">{sum.toFixed(2)}</span>
                              </td>
                            )
                          }

                          // Para Estado de Cambios en el Patrimonio, padres no muestran valores en celdas
                          if (isParent && isEstadoCambiosPatrimonio) {
                            return (
                              <td
                                key={variable.id}
                                className="border border-gray-300 px-2 py-1 text-center bg-gray-100"
                              >
                                <span className="text-sm text-gray-400">-</span>
                              </td>
                            )
                          }

                          // Llamar a renderCellContent para renderizar la celda para conceptos hijo
                          return (
                            <td
                              key={variable.id}
                              className={`border border-gray-300 px-0 py-0 ${isEditing && isCellEditable(concept.id, variable.id) ? "bg-yellow-50" : ""}`}
                            >
                              {renderCellContent(concept, variable, isEditing)}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Fila para los hijos del concepto (si está expandido) */}
                      {isExpanded && concept.children && concept.children.length > 0 && (
                        // A placeholder row for indentation purposes, actual children will be rendered recursively
                        // This part might need adjustment based on how you want to render nested children visually
                        <></>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {getCurrentPageConcepts().length} de {allFlattenedConcepts.length} registros totales
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground">
                Página {currentPage + 1} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Dialogs */}
      <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Concepto Hijo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {allVariables[0]?.label} ({allVariables[0]?.type === "dropdown" ? "Lista" : "Texto"}):
              </label>
              <select
                value={newChildVar1}
                onChange={(e) => setNewChildVar1(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar...</option>
                <option value="Opción A">Opción A</option>
                <option value="Opción B">Opción B</option>
                <option value="Opción C">Opción C</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {allVariables[1]?.label} ({allVariables[1]?.type === "string" ? "Texto" : "Lista"}):
              </label>
              <input
                type="text"
                value={newChildVar2}
                onChange={(e) => setNewChildVar2(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Ingrese texto..."
              />
            </div>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChildDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddChild}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={atributosDialogOpen} onOpenChange={setAtributosDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atributos Extensibles</DialogTitle>
            <DialogDescription>Concepto: {selectedConceptoAtributos?.[0]?.nombre || "N/A"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {(atributosExtensiblesMock[selectedConceptoAtributos?.[0]?.id || ""] || atributosExtensiblesMock["1"]).map(
              (atributo, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div className="text-sm font-medium text-gray-700">{atributo.nombre}:</div>
                  <div
                    className={cn(
                      "px-3 py-1 text-sm rounded",
                      atributo.tipo === "boolean"
                        ? atributo.valor
                          ? "bg-gray-300 text-gray-800"
                          : "bg-white border border-gray-300"
                        : "bg-gray-300 text-gray-800",
                    )}
                  >
                    {atributo.tipo === "boolean" ? (atributo.valor ? "Sí" : "No") : atributo.valor}
                  </div>
                </div>
              ),
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { DataTable }
export default DataTable
