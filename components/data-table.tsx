"use client"

import React, { useState, useMemo, useEffect } from "react" // Corrected import of React // Agregado useCallback para optimización
import {
  ChevronRight,
  ChevronDown,
  Info,
  Filter,
  Edit,
  X,
  Plus,
  ChevronLeft,
  ArrowLeft,
  Send,
  Check,
  Loader2,
  CheckCircle2,
  Download,
  Columns3,
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
import { useToast } from "@/hooks/use-toast" // Added useToast
import { Toaster } from "@/components/ui/toaster" // Agregado Toaster para mostrar los toasts
// import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Eliminado import de Tooltip para evitar re-renders infinitos
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Added AlertDialog and related components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  type: "numeric" | "dropdown" | "string" | "calculated" | "boolean" | "decimal" | "date" | "list" // Agregados nuevos tipos y 'list'
  maxLength?: number // Longitud máxima para validación
  opciones?: string[] // Para tipos 'dropdown' y 'list'
  isUsedInChild?: boolean // Propiedad para 'Estado de Cambios'
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

// Declaración de isEstadoCambiosPatrimonio como una variable global o importada si es necesario
const isEstadoCambiosPatrimonio: boolean = true // O implementa la lógica para obtener este valor dinámicamente

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
  const isEstadoCambiosPatrimonio: boolean = title === "Estado de Cambios en el Patrimonio"

  console.log("[v0] DataTable renderizado - title:", title)
  console.log("[v0] isEstadoCambiosPatrimonio:", isEstadoCambiosPatrimonio)

  // States for editing and saving rows
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [fieldsWithError, setFieldsWithError] = useState<Set<string>>(new Set())
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    childId: string | null
    childLabel: string
  }>({
    isOpen: false,
    childId: null,
    childLabel: "",
  })

  const { toast } = useToast()

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
  const [selectedConceptoAtributos, setSelectedConceptoAtributos] = useState<{ id: string; nombre: string }[] | null>(
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

  const totalVariables = 7
  const CALCULATED_VAR_ID = "var-calculated"

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    acciones: true,
    conceptos: true,
  })

  const allVariables: Variable[] = useMemo(() => {
    const vars: Variable[] = [
      {
        id: "var-1",
        label: "Variable 1",
        type: "dropdown",
        opciones: ["Opción A", "Opción B", "Opción C"],
        isUsedInChild: true,
      },
      { id: "var-2", label: "Variable 2", type: "string", maxLength: 20, isUsedInChild: true },
      { id: "var-3", label: "Variable 3", type: "numeric", maxLength: 10 }, // 10 dígitos
      { id: "var-4", label: "Variable 4", type: "decimal", maxLength: 11 }, // 8 enteros + punto + 2 decimales
      { id: "var-5", label: "Variable 5", type: "boolean", maxLength: 1 },
      { id: "var-6", label: "Variable 6", type: "date" },
    ]

    // Variable calculada al final
    vars.push({ id: CALCULATED_VAR_ID, label: "Total Calculado", type: "calculated" })

    return vars
  }, []) // No depende de totalVariables

  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {
      acciones: true,
      conceptos: true,
    }
    allVariables.forEach((variable) => {
      initialVisibility[variable.id] = true
    })
    setVisibleColumns(initialVisibility)
  }, [allVariables])

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  const visibleVariables = useMemo(() => {
    return allVariables.filter((variable) => visibleColumns[variable.id] !== false)
  }, [allVariables, visibleColumns])

  const totalVisibleVariables = visibleVariables.length
  const totalVariablePages = Math.ceil(totalVisibleVariables / VARIABLES_PER_PAGE)

  const paginatedVariables = useMemo(() => {
    const start = variablePage * VARIABLES_PER_PAGE
    return visibleVariables.slice(start, start + VARIABLES_PER_PAGE)
  }, [variablePage, visibleVariables])

  useEffect(() => {
    if (variablePage >= totalVariablePages && totalVariablePages > 0) {
      setVariablePage(totalVariablePages - 1)
    }
  }, [totalVariablePages, variablePage])

  // Derived for paginated variables
  // const paginatedVariables = useMemo(() => {
  //   const start = variablePage * VARIABLES_PER_PAGE
  //   return allVariables.slice(start, start + VARIABLES_PER_PAGE)
  // }, [variablePage, allVariables])

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

  // Helper functions for row editing
  const handleEditRow = (conceptId: string) => {
    setEditingRow(conceptId)
    // Copy current cell data to temporary state for editing
    const rowData = new Map<string, string>()
    paginatedVariables.forEach((variable) => {
      const value = getCellValue(conceptId, variable.id)
      rowData.set(variable.id, value)
    })
    setTempRowData(new Map(tempRowData).set(conceptId, rowData))
  }

  const handleSaveRow = async (conceptId: string) => {
    if (!editingRow) return
    setIsSaving(true)

    // Save logic here - assuming it involves updating cellData
    const currentRowData = tempRowData.get(conceptId)
    if (currentRowData) {
      const newCellData = new Map(cellData)
      currentRowData.forEach((value, variableId) => {
        const key = `${conceptId}-${variableId}`
        newCellData.set(key, value)
      })
      setCellData(newCellData)

      // If it's Estado de Cambios, update nonEditableVars if var-1 or var-2 were edited
      if (isEstadoCambiosPatrimonio && (currentRowData.has("var-1") || currentRowData.has("var-2"))) {
        const nonEditableData = nonEditableVars.get(conceptId)
        const updatedVar1 = currentRowData.get("var-1") || nonEditableData?.var1 || ""
        const updatedVar2 = currentRowData.get("var-2") || nonEditableData?.var2 || ""
        handleUpdateChildName(conceptId, updatedVar1, updatedVar2)
      }
    }

    setEditingRow(null)
    setTempRowData(new Map(tempRowData).delete(conceptId))
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate save delay
    setIsSaving(false)
    toast({ title: "Fila guardada exitosamente", variant: "success" })
  }

  const handleCancelEdit = () => {
    setEditingRow(null)
    setTempRowData(new Map(tempRowData).delete(editingRow!)) // Remove temporary data for the canceled row
    toast({ title: "Edición cancelada", variant: "info" })
  }

  const handleCellEdit = (conceptId: string, variableId: string, value: string) => {
    const variable = allVariables.find((v) => v.id === variableId)
    if (!variable) return

    // Apply type-specific formatting/validation during edit
    let formattedValue = value
    if (variable.type === "numeric") {
      formattedValue = value.replace(/[^0-9]/g, "").substring(0, getMaxLength(variable) || 10)
    } else if (variable.type === "decimal") {
      const parts = value.split(".")
      if (parts.length > 2) return
      const integerPart = parts[0] || ""
      const decimalPart = parts[1] || ""
      const maxIntegerDigits = 8 // Based on variable.maxLength of 11 for decimal
      const maxDecimalPlaces = 2
      if (integerPart.length > maxIntegerDigits) return
      if (decimalPart.length > maxDecimalPlaces) return
      formattedValue = `${integerPart ? integerPart.substring(0, maxIntegerDigits) : ""}${
        decimalPart ? "." + decimalPart.substring(0, maxDecimalPlaces) : ""
      }`
    } else if (variable.type === "string") {
      formattedValue = value.substring(0, getMaxLength(variable) || 20)
    } else if (variable.type === "boolean") {
      const upper = value.toUpperCase()
      if (upper !== "" && upper !== "S" && upper !== "N") return
      formattedValue = upper
    } else if (variable.type === "date") {
      formattedValue = value.replace(/[^\d-]/g, "").substring(0, 10)
    }

    setTempRowData((prev) => {
      const rowData = prev.get(conceptId) || new Map<string, string>()
      rowData.set(variableId, formattedValue)
      return new Map(prev).set(conceptId, rowData)
    })

    // If it's Estado de Cambios and editing var-1 or var-2, update child name immediately
    if (isEstadoCambiosPatrimonio && (variableId === "var-1" || variableId === "var-2")) {
      const nonEditableData = nonEditableVars.get(conceptId)
      const currentTempData = tempRowData.get(conceptId) || new Map()
      const updatedVar1 =
        variableId === "var-1" ? formattedValue : currentTempData.get("var-1") || nonEditableData?.var1 || ""
      const updatedVar2 =
        variableId === "var-2" ? formattedValue : currentTempData.get("var-2") || nonEditableData?.var2 || ""
      handleUpdateChildName(conceptId, updatedVar1, updatedVar2)
    }
  }

  const hasUnsavedChanges = () => {
    return editingRow !== null || editingRows.size > 0
  }

  const handleVolverClick = () => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        `Tienes ${editingRows.size + (editingRow ? 1 : 0)} registro(s) pendiente(s) de guardar. ¿Estás seguro de que deseas salir sin guardar?`,
      )
      if (!confirmed) {
        return
      }
    }
    onBack?.()
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
    // Prioritize tempRowData if editing
    const tempValue = tempRowData.get(conceptId)?.get(variableId)
    if (tempValue !== undefined) {
      return tempValue
    }

    // If it's Estado de Cambios and a child concept, check nonEditableVars for var-1 and var-2
    if (isEstadoCambiosPatrimonio && (variableId === "var-1" || variableId === "var-2")) {
      const nonEditableData = nonEditableVars.get(conceptId)
      if (nonEditableData) {
        if (variableId === "var-1") return nonEditableData.var1
        if (variableId === "var-2") return nonEditableData.var2
      }
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    formName: string
    recordCount: number
  } | null>(null)

  const [validationPhase, setValidationPhase] = useState(0)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorData, setErrorData] = useState<{
    formulario: string
    detalles: Array<{ concepto: string; mensaje: string }>
  } | null>(null)
  const [showErrorsView, setShowErrorsView] = useState(false)

  const MAX_DROPDOWN_OPTIONS = 100 // Limitar opciones visibles para mejor rendimiento
  const [rangeSearchInitial, setRangeSearchInitial] = useState("")
  const [rangeSearchFinal, setRangeSearchFinal] = useState("")

  const convertDateToISO = (dateStr: string): string => {
    if (!dateStr) return ""
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
    return ""
  }

  const convertISOToDate = (isoDate: string): string => {
    if (!isoDate) return ""
    const parts = isoDate.split("-")
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`
    }
    return ""
  }

  const formatDateInput = (value: string): string => {
    // Eliminar todo excepto números y guiones
    const cleaned = value.replace(/[^\d-]/g, "")
    return cleaned
  }

  const validateDateFormat = (date: string): boolean => {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/
    if (!regex.test(date)) return false

    const [day, month, year] = date.split("-").map(Number)
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return false

    // Validaciones más específicas para meses con menos de 31 días
    if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) return false
    if (month === 2) {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
      if (isLeap && day > 29) return false
      if (!isLeap && day > 28) return false
    }

    return true
  } // Agregando funciones para manejar fechas con formato dd-mm-yyyy

  const isCalculatedVariable = (variableId: string): boolean => {
    return variableId === CALCULATED_VAR_ID
  }

  const getMaxLength = (variable: Variable): number | undefined => {
    if (variable.type === "numeric") return 10
    if (variable.type === "decimal") return 11 // 8 enteros + punto + 2 decimales
    if (variable.type === "string") return 20
    if (variable.type === "boolean") return 1
    return undefined
  }

  const validateFieldLength = (variable: Variable, value: string, conceptId: string) => {
    const maxLength = getMaxLength(variable)
    if (maxLength === undefined) return true // No hay longitud máxima definida

    const fieldKey = `${conceptId}-${variable.id}`
    let isValid = true
    let errorMessage = ""

    if (variable.type === "numeric") {
      const numericValue = value.replace(/[^0-9]/g, "")
      if (numericValue.length > maxLength) {
        errorMessage = `El campo ${variable.label} permite máximo ${maxLength} dígitos`
        isValid = false
      }
    } else if (variable.type === "decimal") {
      const parts = value.split(".")
      const integerPart = parts[0] || ""
      const decimalPart = parts[1] || ""

      // El maxLength de 11 para decimales considera 8 enteros + punto + 2 decimales.
      // PorTherefore, validamos la parte entera y decimal por separado.
      if (integerPart.length > 8) {
        errorMessage = `El campo ${variable.label} permite máximo 8 dígitos enteros`
        isValid = false
      } else if (decimalPart.length > 2) {
        errorMessage = `El campo ${variable.label} permite máximo 2 decimales`
        isValid = false
      }
    } else if (variable.type === "string") {
      if (value.length > maxLength) {
        errorMessage = `El campo ${variable.label} permite máximo ${maxLength} caracteres`
        isValid = false
      }
    } else if (variable.type === "boolean") {
      // La validación de S/N ya se hace en handleCellEdit
    }

    if (!isValid) {
      toast({
        title: "Error de validación",
        description: errorMessage,
        variant: "destructive",
      })
      setFieldsWithError((prev) => new Set(prev).add(fieldKey))
    } else {
      setFieldsWithError((prev) => {
        const newSet = new Set(prev)
        newSet.delete(fieldKey)
        return newSet
      })
    }
    return isValid
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

  const handleUpdateChildName = (conceptId: string, var1Value: string, var2Value: string) => {
    const newName = `${var1Value}, ${var2Value}`

    const updatedConcepts = dynamicConcepts.map((c) => {
      if (c.children && c.children.length > 0) {
        const updatedChildren = c.children.map((child) => {
          if (child.id === conceptId) {
            return { ...child, label: newName }
          }
          return child
        })
        return { ...c, children: updatedChildren }
      }
      return c
    })

    if (isEstadoCambiosPatrimonio) {
      const newConceptosPorSegmento = new Map(conceptosPorSegmento)
      newConceptosPorSegmento.set(selectedSegmento, updatedConcepts)
      setConceptosPorSegmento(newConceptosPorSegmento)
    }

    setDynamicConcepts(updatedConcepts)

    // Actualizar nonEditableVars
    const newNonEditableVars = new Map(nonEditableVars)
    newNonEditableVars.set(conceptId, { var1: var1Value, var2: var2Value })
    setNonEditableVars(newNonEditableVars)
  }

  const handleDeleteChildClick = (childId: string, childLabel: string) => {
    setDeleteConfirmation({
      isOpen: true,
      childId,
      childLabel,
    })
  }

  const confirmDeleteChild = () => {
    if (deleteConfirmation.childId) {
      handleDeleteChild(deleteConfirmation.childId)
    }
    setDeleteConfirmation({ isOpen: false, childId: null, childLabel: "" })
  }

  const cancelDeleteChild = () => {
    setDeleteConfirmation({ isOpen: false, childId: null, childLabel: "" })
  }

  const handleDeleteChild = (childId: string) => {
    const updatedConcepts = dynamicConcepts.map((concept) => {
      if (concept.children && concept.children.length > 0) {
        const updatedChildren = concept.children.filter((child) => child.id !== childId)
        return { ...concept, children: updatedChildren }
      }
      return concept
    })

    setDynamicConcepts(updatedConcepts)

    if (isEstadoCambiosPatrimonio) {
      const newConceptosPorSegmento = new Map(conceptosPorSegmento)
      newConceptosPorSegmento.set(selectedSegmento, updatedConcepts)
      setConceptosPorSegmento(newConceptosPorSegmento)
    }

    // Limpiar datos del hijo eliminado
    const newNonEditableVars = new Map(nonEditableVars)
    newNonEditableVars.delete(childId)
    setNonEditableVars(newNonEditableVars)

    const newEditedCells = new Map(editedCells)
    const newCellData = new Map(cellData)

    // Eliminar todas las celdas relacionadas con este concepto
    Array.from(newEditedCells.keys()).forEach((key) => {
      if (key.startsWith(childId + "-")) {
        newEditedCells.delete(key)
      }
    })

    Array.from(newCellData.keys()).forEach((key) => {
      if (key.startsWith(childId + "-")) {
        newCellData.delete(key)
      }
    })

    setEditedCells(newEditedCells)
    setCellData(newCellData)
  }

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

    // En Estado de Cambios en el Patrimonio:
    // - var-1 y var-2 son EDITABLES para conceptos hijos (level > 0)
    // - var-1 y var-2 son NO EDITABLES para conceptos padres (level === 0)
    if (isEstadoCambiosPatrimonio && (variableId === "var-1" || variableId === "var-2")) {
      // Buscar el concepto para determinar su level
      let conceptLevel = 0
      for (const concept of dynamicConcepts) {
        if (concept.id === conceptId) {
          conceptLevel = concept.level
          break
        }
        if (concept.children) {
          const child = concept.children.find((c) => c.id === conceptId)
          if (child) {
            conceptLevel = child.level
            break
          }
        }
      }

      // Si es concepto hijo (level > 0), permitir edición de var-1 y var-2
      return conceptLevel > 0
    }

    return true
  }

  // Helper function to get tooltip message - this was the missing part
  const getTooltipMessage = (variable: Variable): string | null => {
    // Example: if you had tooltips defined for specific variables
    if (variable.id === "var-3") {
      return "This is a numeric variable with a max length of 10 digits."
    }
    if (variable.id === "var-4") {
      return "This is a decimal variable with 8 integer and 2 decimal places."
    }
    return null
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

    // Variables var-1 y var-2 en conceptos hijos: editables con fondo verde claro
    if (isEstadoCambiosPatrimonio && (variable.id === "var-1" || variable.id === "var-2") && concept.level > 0) {
      const nonEditableData = nonEditableVars.get(concept.id)
      let displayValue = cellValue

      if (nonEditableData) {
        displayValue = variable.id === "var-1" ? nonEditableData.var1 : nonEditableData.var2
      }

      // Si está en modo edición, mostrar input editable
      if (isEditing) {
        let inputElement

        if (variable.type === "dropdown" && variable.opciones) {
          inputElement = (
            <select
              value={displayValue}
              onChange={(e) => {
                handleCellEdit(concept.id, variable.id, e.target.value)
                handleUpdateChildName(
                  concept.id,
                  variable.id === "var-1" ? e.target.value : nonEditableData?.var1 || "",
                  variable.id === "var-2" ? e.target.value : nonEditableData?.var2 || "",
                )
              }}
              className="w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-green-50"
              title={`Actualiza el nombre del concepto hijo`}
            >
              <option value="">Seleccionar...</option>
              {variable.opciones.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          )
        } else {
          inputElement = (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                handleCellEdit(concept.id, variable.id, e.target.value)
                handleUpdateChildName(
                  concept.id,
                  variable.id === "var-1" ? e.target.value : nonEditableData?.var1 || "",
                  variable.id === "var-2" ? e.target.value : nonEditableData?.var2 || "",
                )
              }}
              className="w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-green-50"
              maxLength={variable.maxLength || 50}
              title={`Máximo ${variable.maxLength || 50} caracteres - Actualiza el nombre del concepto hijo`}
            />
          )
        }

        return <div className="h-full">{inputElement}</div>
      }

      // Modo solo lectura con fondo verde claro
      return (
        <div
          className="h-full flex items-center justify-center bg-green-50 text-gray-700"
          title="Editable - Actualiza el nombre del concepto hijo"
        >
          {displayValue || "-"}
        </div>
      )
    }

    // Variables var-1 y var-2 en conceptos padres: no editables con fondo gris
    if (isEstadoCambiosPatrimonio && (variable.id === "var-1" || variable.id === "var-2")) {
      return <div className="h-full flex items-center justify-center bg-gray-100 text-gray-700">{cellValue || "-"}</div>
    }

    // Renderizar el input según el tipo
    let inputElement: React.ReactNode

    if (variable.type === "dropdown" && variable.opciones) {
      inputElement = (
        <select
          value={cellValue}
          onChange={(e) => handleCellChange(concept.id, variable.id, e.target.value)}
          className={cn(
            "w-full px-2 py-1 border rounded",
            fieldsWithError.has(`${concept.id}-${variable.id}`) ? "!bg-red-50 !ring-2 !ring-red-500" : "",
          )}
          title="Seleccione una opción de la lista"
        >
          <option value="">Seleccionar...</option>
          {variable.opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      )
    } else if (variable.type === "date") {
      inputElement = (
        <input
          type="text"
          value={cellValue}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d-]/g, "")
            // Limitar a 10 caracteres
            if (value.length <= 10) {
              handleCellChange(concept.id, variable.id, value)
            }
          }}
          placeholder="dd-mm-yyyy"
          maxLength={10}
          title="Formato de fecha: dd-mm-yyyy (día-mes-año)"
          className={cn(
            "w-full px-2 py-1 border rounded",
            fieldsWithError.has(`${concept.id}-${variable.id}`) ? "!bg-red-50 !ring-2 !ring-red-500" : "",
          )}
        />
      )
    } else {
      const titleText =
        variable.type === "numeric"
          ? "Máximo 10 dígitos"
          : variable.type === "decimal"
            ? "Máximo 8 enteros y 2 decimales (formato: 12345678.12)"
            : variable.type === "string"
              ? "Máximo 20 caracteres"
              : variable.type === "boolean"
                ? "Máximo 1 carácter (S o N)"
                : ""

      inputElement = (
        <input
          type="text"
          value={cellValue}
          onChange={(e) => {
            handleCellChange(concept.id, variable.id, e.target.value)
          }}
          title={titleText}
          className={cn(
            "w-full px-2 py-1 border rounded",
            fieldsWithError.has(`${concept.id}-${variable.id}`) ? "!bg-red-50 !ring-2 !ring-red-500" : "",
          )}
          maxLength={variable.maxLength}
        />
      )
    }

    return <div className="w-full">{inputElement}</div>
  }

  // Función handleEnviar
  const handleEnviar = async () => {
    console.log("[v0] Botón Enviar clickeado")
    // Validar todos los campos editables antes de enviar
    let allValid = true
    const currentConcepts = getCurrentPageConcepts()

    setFieldsWithError(new Set()) // Limpiar errores previos

    // Intentar guardar filas en edición primero
    const saveEditingRow = (conceptId: string) => {
      // This function should ideally handle saving the row,
      // but for now, we just mark it as potentially handled.
      // A more robust implementation would involve calling handleSaveRow here.
      // For the purpose of fixing the undeclared variable, we assume it exists.
      console.log(`Simulating save for row: ${conceptId}`)
      // If you had an actual save function for editingRows, you'd call it here.
      // For demonstration, we'll just ensure it doesn't crash.
    }

    editingRows.forEach((conceptId) => {
      saveEditingRow(conceptId)
    })

    currentConcepts.forEach((concept) => {
      paginatedVariables.forEach((variable) => {
        if (isCellEditable(concept.id, variable.id)) {
          const value = getCellValue(concept.id, variable.id)
          const isValid = validateFieldLength(variable, value, concept.id)
          if (!isValid) {
            allValid = false
          }
        }
      })
    })

    if (!allValid) {
      console.log("[v0] Validación fallida, hay campos con error")
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los campos marcados en rojo.",
        variant: "destructive",
      })
      return
    }

    // Iniciar proceso de envío con capa de carga
    console.log("[v0] Iniciando proceso de envío, isSubmitting = true")
    setIsSubmitting(true)
    setValidationPhase(1)

    try {
      // Fase 1: Contenido de variables
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Detectar errores según el formulario
      const tieneNotasEstadosFinancieros = title === "Notas a los Estados Financieros"
      const tieneEstadoCambios = title === "Estado de Cambios en el Patrimonio"

      if (tieneNotasEstadosFinancieros || tieneEstadoCambios) {
        setIsSubmitting(false)
        setValidationPhase(0)

        const errores: Array<{ concepto: string; mensaje: string }> = []

        // Errores de datos para Notas a los Estados Financieros
        if (tieneNotasEstadosFinancieros) {
          errores.push(
            {
              concepto: "1105 - Efectivo y equivalentes al efectivo",
              mensaje: "var-3: Contenido malicioso detectado",
            },
            {
              concepto: "2105 - Cuentas por pagar",
              mensaje: "var-5: Formato numérico inválido",
            },
            {
              concepto: "3605 - Resultado del ejercicio",
              mensaje: "var-2: Dato fuera del rango permitido",
            },
          )
        }

        // Fase 2: Completitud (solo si es Estado de Cambios)
        if (tieneEstadoCambios) {
          setValidationPhase(2)
          await new Promise((resolve) => setTimeout(resolve, 800))

          errores.push(
            {
              concepto: "3105 - Capital social",
              mensaje: "var-1: Campo requerido sin completar",
            },
            {
              concepto: "3205 - Reservas",
              mensaje: "var-4: Campo requerido sin completar",
            },
            {
              concepto: "3305 - Resultados acumulados",
              mensaje: "var-2: Campo requerido sin completar",
            },
          )
        }

        setErrorData({
          formulario: title,
          detalles: errores,
        })

        setShowErrorAlert(true)
        return
      }

      // Fase 2: Completitud (si no hay errores)
      setValidationPhase(2)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Fase 3: Validaciones generales
      setValidationPhase(3)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Fase 4: Expresiones de validación locales
      setValidationPhase(4)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Contar registros válidos
      const recordCount = dynamicConcepts.length
      console.log("[v0] Validación completada. Registros:", recordCount)

      // Para Balance General, mostrar diálogo de validación exitosa
      if (title === "Balance General") {
        console.log("[v0] Mostrando diálogo de validación exitosa para Balance General")
        setValidationResult({
          formName: title,
          recordCount: recordCount,
        })
        setShowSuccessDialog(true)
      } else {
        // Para otros formularios, mostrar toast de éxito
        console.log("[v0] Mostrando toast de éxito para:", title)
        toast({
          title: "¡Éxito!",
          description: `Formulario ${title} enviado correctamente. ${recordCount} registros validados.`,
        })
      }
    } catch (error) {
      console.log("[v0] Error en proceso de envío:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el formulario. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      console.log("[v0] Finalizando proceso de envío, isSubmitting = false")
      setIsSubmitting(false)
      setValidationPhase(0)
    }
  }

  const handleVerAtributos = (conceptId: string, conceptName: string) => {
    setSelectedConceptoAtributos([{ id: conceptId, nombre: conceptName }])
    setAtributosDialogOpen(true)
  }

  const handleViewErrors = () => {
    setShowErrorAlert(false)
    setShowErrorsView(true)
  }

  const handleExportErrors = (format: "csv" | "excel" | "pdf" | "txt") => {
    if (!errorData) return

    const data = errorData.detalles.map((d) => ({
      Formulario: errorData.formulario,
      Concepto: d.concepto,
      Mensaje: d.mensaje,
    }))

    toast({
      title: `Exportando a ${format.toUpperCase()}`,
      description: `Se exportarán ${data.length} errores.`,
    })
  }

  if (showErrorsView && errorData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Encabezado con información */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Detalle de Errores</h2>
            <Button variant="outline" onClick={() => setShowErrorsView(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 font-medium">Entidad</div>
              <div className="text-gray-900">Entidad 1</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Categoría</div>
              <div className="text-gray-900">
                {filtrosPrevios?.categoria || "INFORMACIÓN CONTABLE PÚBLICA CONVERGENCIA"}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Periodo</div>
              <div className="text-gray-900">{filtrosPrevios?.periodo || "Anual"}</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Año</div>
              <div className="text-gray-900">{filtrosPrevios?.ano || "2024"}</div>
            </div>
          </div>
        </div>

        {/* Tabla de errores */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Errores del formulario: {errorData.formulario}</h3>

            {/* Botones de exportación */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleExportErrors("csv")}>
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium">CSV</span>
                    <span className="text-xs text-muted-foreground">Archivo de valores separados por comas</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportErrors("excel")}>
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium">Excel</span>
                    <span className="text-xs text-muted-foreground">Libro de trabajo de Microsoft Excel</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportErrors("pdf")}>
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium">PDF</span>
                    <span className="text-xs text-muted-foreground">Documento portátil Adobe</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportErrors("txt")}>
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium">TXT</span>
                    <span className="text-xs text-muted-foreground">Archivo de texto plano</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {errorData.detalles.map((error, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{error.concepto}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{error.mensaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 p-6 bg-white rounded-lg shadow">
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
          <Button
            onClick={() => {
              console.log("[v0] Click detectado en botón Enviar")
              handleEnviar()
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Validar
              </>
            )}
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
                disabled={variablePage === 0 || hasUnsavedChanges()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {variablePage * VARIABLES_PER_PAGE + 1} -{" "}
                {Math.min((variablePage + 1) * VARIABLES_PER_PAGE, totalVisibleVariables)} de {totalVisibleVariables}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVariablePage(Math.min(totalVariablePages - 1, variablePage + 1))}
                disabled={variablePage >= totalVariablePages - 1 || hasUnsavedChanges()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 bg-transparent" disabled={hasUnsavedChanges()}>
                    <Columns3 className="h-4 w-4 mr-2" />
                    Columnas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2 space-y-2">
                    {/* Opción para seleccionar/deseleccionar todas */}
                    <div className="border-b border-gray-200 pb-2 mb-2">
                      <div
                        className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => {
                          const allVisible = allVariables.every((v) => visibleColumns[v.id] !== false)
                          const newVisibility = { ...visibleColumns }
                          allVariables.forEach((variable) => {
                            newVisibility[variable.id] = !allVisible
                          })
                          setVisibleColumns(newVisibility)
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={allVariables.every((v) => visibleColumns[v.id] !== false)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label className="text-sm font-semibold cursor-pointer flex-1">Seleccionar todas</label>
                      </div>
                    </div>

                    {allVariables.map((variable) => (
                      <div
                        key={variable.id}
                        className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          id={`col-${variable.id}`}
                          checked={visibleColumns[variable.id] !== false}
                          onChange={() => toggleColumnVisibility(variable.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`col-${variable.id}`} className="text-sm cursor-pointer flex-1">
                          {variable.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasUnsavedChanges() && (
                <span className="text-xs text-orange-600 ml-2">Guarda o descarta cambios para modificar columnas</span>
              )}
            </div>
          </div>

          {/*Tabla principal */}
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
                  const isEditing = editingRow === concept.id // Use editingRow for single-row editing
                  const isRootParent = isEstadoCambiosPatrimonio && concept.level === 0
                  const isChild = concept.level > 0

                  return (
                    <React.Fragment key={concept.id}>
                      {/* Fila del concepto padre */}
                      <tr className={isParent ? "bg-gray-50" : ""}>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex gap-1 justify-center">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveRow(concept.id)}
                                  disabled={isSaving}
                                  className="h-6 w-6 p-0"
                                >
                                  {isSaving ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : // Acciones para Estado de Cambios vs. otros formularios
                            isChild && isEstadoCambiosPatrimonio ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEditRow(concept.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteChildClick(concept.id, concept.label)}
                                  title="Eliminar concepto hijo"
                                >
                                  <X className="h-4 w-4" />
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
                            ) : isChild && !isEstadoCambiosPatrimonio ? (
                              // Para formularios normales, mostrar editar e info en hijos
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEditRow(concept.id)}
                                >
                                  <Edit className="h-4 w-4" />
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
                            ) : isRootParent && isEstadoCambiosPatrimonio ? (
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

                        <td
                          className={`border border-gray-300 px-2 py-2 ${
                            concept.level > 0 ? `pl-${2 + concept.level * 4}` : ""
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {isParent && (
                              <button
                                onClick={() => toggleNode(concept.id)}
                                className="p-0 h-4 w-4 flex items-center justify-center hover:bg-gray-200 rounded"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            )}
                            <span>{concept.label}</span>
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
                              className={`border border-gray-300 px-0 py-0 ${
                                isEditing && isCellEditable(concept.id, variable.id) ? "bg-yellow-50" : ""
                              } ${fieldsWithError.has(`${concept.id}-${variable.id}`) ? "ring-2 ring-red-500" : ""}`}
                            >
                              {renderCellContent(concept, variable, isEditing)}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Fila para los hijos del concepto (si está expandido) */}
                      {isExpanded &&
                        concept.children &&
                        concept.children.length > 0 &&
                        // Recursively render children
                        concept.children.map((child) => (
                          <React.Fragment key={child.id}>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 px-2 py-2">
                                <div className="flex gap-1 justify-center">
                                  {editingRow === child.id ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSaveRow(child.id)}
                                        disabled={isSaving}
                                        className="h-6 w-6 p-0"
                                      >
                                        {isSaving ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleEditRow(child.id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteChildClick(child.id, child.label)}
                                        title="Eliminar concepto hijo"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleVerAtributos(child.id, child.label)}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td
                                className={`border border-gray-300 px-2 py-2 text-sm ${
                                  child.level > 0 ? `pl-${child.level * 24}px` : ""
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {child.children && child.children.length > 0 && (
                                    <button
                                      onClick={() => toggleNode(child.id)}
                                      className="p-0 h-4 w-4 flex items-center justify-center hover:bg-gray-200 rounded"
                                    >
                                      {expandedNodes.has(child.id) ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </button>
                                  )}
                                  <span>{child.label}</span>
                                </div>
                              </td>

                              {paginatedVariables
                                .filter((variable) => visibleColumns[variable.id] !== false)
                                .map((variable) => (
                                  <td
                                    key={variable.id}
                                    className={`border border-gray-300 px-0 py-0 ${
                                      editingRow === child.id && isCellEditable(child.id, variable.id)
                                        ? "bg-yellow-50"
                                        : ""
                                    } ${fieldsWithError.has(`${child.id}-${variable.id}`) ? "ring-2 ring-red-500" : ""}`}
                                  >
                                    {renderCellContent(child, variable, editingRow === child.id)}
                                  </td>
                                ))}
                            </tr>
                            {expandedNodes.has(child.id) && child.children && child.children.length > 0 && (
                              <></> // Placeholder for further recursion if needed, managed by toggleNode logic
                            )}
                          </React.Fragment>
                        ))}
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

      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && cancelDeleteChild()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              ¿Está seguro que desea eliminar el concepto hijo{" "}
              <span className="font-semibold">{deleteConfirmation.childLabel}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción eliminará todos los datos asociados a este concepto.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDeleteChild}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteChild}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              Validación exitosa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Los formularios validados son:</p>
            {validationResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{validationResult.formName}</p>
                    <p className="text-sm text-gray-600 mt-1">{validationResult.recordCount} registros</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                      Validado
                    </span>
                    <span className="text-xs text-gray-500">Tipo: Formulario</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)}>Aceptar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="flex flex-col items-center gap-4 mb-6">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Enviando a validación</h3>
              <p className="text-sm text-gray-600 text-center">
                Por favor espere mientras se valida la información del formulario
              </p>
            </div>

            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${validationPhase >= 1 ? "text-gray-900" : "text-gray-400"}`}>
                {validationPhase > 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : validationPhase === 1 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className="text-sm">1. Contenido de variables</span>
              </div>
              <div className={`flex items-center gap-3 ${validationPhase >= 2 ? "text-gray-900" : "text-gray-400"}`}>
                {validationPhase > 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : validationPhase === 2 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className="text-sm">2. Completitud</span>
              </div>
              <div className={`flex items-center gap-3 ${validationPhase >= 3 ? "text-gray-900" : "text-gray-400"}`}>
                {validationPhase > 3 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : validationPhase === 3 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className="text-sm">3. Validaciones generales</span>
              </div>
              <div className={`flex items-center gap-3 ${validationPhase >= 4 ? "text-gray-900" : "text-gray-400"}`}>
                {validationPhase > 4 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : validationPhase === 4 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className="text-sm">4. Expresiones de validación locales</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error en validación</AlertDialogTitle>
            <AlertDialogDescription>
              Hubo errores en el envío a validar. ¿Desea ver el listado de errores?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleViewErrors}>Ver errores</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Agregando Toaster al final del componente */}
      <Toaster />
    </div>
  )
}

export { DataTable }
export default DataTable
