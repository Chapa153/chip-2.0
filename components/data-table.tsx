"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronRight, ChevronDown, Info, Filter, Edit, Save, X, Plus, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert" // Added from updates
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added from updates

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

  const [dynamicConcepts, setDynamicConcepts] = useState<ConceptNode[]>(
    isEstadoCambiosPatrimonio ? generateEstadoCambiosConceptos() : generateMockConcepts(),
  )

  console.log("[v0] dynamicConcepts:", dynamicConcepts)

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [cellData, setCellData] = useState<Map<string, string>>(new Map())
  const [variablePage, setVariablePage] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [rangeStart, setRangeStart] = useState<string>("")
  const [rangeEnd, setRangeEnd] = useState<string>("")
  const [showLargeRangeAlert, setShowLargeRangeAlert] = useState(false)
  const [searchGlobal, setSearchGlobal] = useState("")
  const [atributosDialogOpen, setAtributosDialogOpen] = useState(false)
  const [selectedConceptoAtributos, setSelectedConceptoAtributos] = useState<{ id: string; nombre: string } | null>(
    null,
  )
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
  const [tempRowData, setTempRowData] = useState<Map<string, Map<string, string>>>(new Map())

  // Dialog para agregar hijos
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false)
  const [selectedParentForAdd, setSelectedParentForAdd] = useState<{ id: string; name: string } | null>(null)

  const [nonEditableVars, setNonEditableVars] = useState<Map<string, { var1: string; var2: string }>>(new Map())

  const VARIABLES_PER_PAGE = 6
  const MAX_ROWS_PER_PAGE = 100

  const totalVariables = 28
  const totalVariablePages = Math.ceil(totalVariables / VARIABLES_PER_PAGE)

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

  const calculateParentSum = (conceptId: string, variableId: string): number => {
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

  const handleTempCellChange = (conceptId: string, variableId: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
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
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
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
  const [searchTerm, setSearchTerm] = useState("")
  const [startRange, setStartRange] = useState<string | null>(null)
  const [endRange, setEndRange] = useState<string | null>(null)

  // Updated getAvailableEndConcepts logic to use startRange and endRange
  const getAvailableEndRanges = () => {
    if (!startRange) {
      return getAllConceptsFlat
    }
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === startRange)
    if (startIndex === -1) {
      return getAllConceptsFlat
    }
    // Filter by searchTerm if it's active
    return getAllConceptsFlat
      .slice(startIndex + 1)
      .filter(
        (concept) =>
          concept.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          concept.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
  }

  const handleRangeChange = (newEndRange: string) => {
    setEndRange(newEndRange)
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === startRange)
    const endIndex = getAllConceptsFlat.findIndex((c) => c.id === newEndRange)

    if (startIndex !== -1 && endIndex !== -1) {
      const rangeSize = endIndex - startIndex + 1
      const shouldShowAlert = rangeSize > 30 // Simulating the alert threshold

      if (shouldShowAlert) {
        setShowLargeRangeAlert(true)
      } else {
        setShowLargeRangeAlert(false)
      }
    }
  }

  const handleRangeEndChange = (newEndRange: string) => {
    setEndRange(newEndRange)
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === startRange)
    const endIndex = getAllConceptsFlat.findIndex((c) => c.id === newEndRange)

    if (startIndex !== -1 && endIndex !== -1) {
      const rangeSize = endIndex - startIndex + 1
      const shouldShowAlert = rangeSize > 30 // Simulating the alert threshold

      if (shouldShowAlert) {
        setShowLargeRangeAlert(true)
      } else {
        setShowLargeRangeAlert(false)
      }
    }
  }

  useEffect(() => {
    if (startRange && endRange) {
      setCurrentPage(0)
      setExpandedNodes(new Set())
    }
  }, [startRange, endRange])

  const handleAddChild = (parentId: string, numericValue: string, dropdownValue: string) => {
    const newChildId = `${parentId}.${Date.now()}`
    const newChildLabel = `${numericValue}, ${dropdownValue}`

    const newChild: ConceptNode = {
      id: newChildId,
      label: newChildLabel,
      level: 1,
    }

    // Guardar las variables no editables
    const newNonEditableVars = new Map(nonEditableVars)
    // Ensure the keys used here match the actual variable IDs. Assuming var1Name and var2Name map to the first two variables.
    const firstVariableId = getCurrentVariables()[0]?.id || "var-1"
    const secondVariableId = getCurrentVariables()[1]?.id || "var-2"
    newNonEditableVars.set(newChildId, { var1: numericValue, var2: dropdownValue })
    setNonEditableVars(newNonEditableVars)

    // Actualizar el árbol de conceptos
    const updatedConcepts = dynamicConcepts.map((concept) => {
      if (concept.id === parentId) {
        return {
          ...concept,
          children: [...(concept.children || []), newChild],
        }
      }
      // Recorrer recursivamente para encontrar el padre en caso de que esté anidado
      if (concept.children) {
        const findAndReplace = (nodes: ConceptNode[]): ConceptNode[] | null => {
          const index = nodes.findIndex((node) => node.id === parentId)
          if (index !== -1) {
            return [
              ...nodes.slice(0, index),
              {
                ...nodes[index],
                children: [...(nodes[index].children || []), newChild],
              },
              ...nodes.slice(index + 1),
            ]
          }
          // Si no se encuentra en este nivel, buscar en los hijos
          const updatedChildren = nodes.map((node) =>
            node.children ? { ...node, children: findAndReplace(node.children) || node.children } : node,
          )
          // Verificar si alguno de los hijos fue modificado
          if (updatedChildren.some((node, i) => node !== nodes[i])) {
            return updatedChildren
          }
          return null // No se encontró en este subárbol
        }

        const newChildren = findAndReplace(concept.children)
        if (newChildren) {
          return { ...concept, children: newChildren }
        }
      }
      return concept
    })

    setDynamicConcepts(updatedConcepts)

    // Auto-expandir el padre
    const newExpanded = new Set(expandedNodes)
    newExpanded.add(parentId)
    setExpandedNodes(newExpanded)
  }

  const handleOpenAddDialog = (parentId: string, parentName: string) => {
    setSelectedParentForAdd({ id: parentId, name: parentName })
    setAddChildDialogOpen(true)
  }

  const getExistingChildren = (parentId: string): ConceptNode[] => {
    const parent = dynamicConcepts.find((c) => c.id === parentId)
    return parent?.children || []
  }

  const isCellEditable = (conceptId: string, variableId: string): boolean => {
    if (isEstadoCambiosPatrimonio && nonEditableVars.has(conceptId)) {
      // Las primeras 2 variables no son editables
      if (variableId === "var-1" || variableId === "var-2") {
        return false
      }
    }
    return true
  }

  const allVariables: Variable[] = Array.from({ length: totalVariables }, (_, i) => ({
    id: `var-${i + 1}`,
    label: `Variable ${i + 1}`,
  }))

  // Derived for paginated variables
  const paginatedVariables = useMemo(() => {
    const start = variablePage * VARIABLES_PER_PAGE
    return allVariables.slice(start, start + VARIABLES_PER_PAGE)
  }, [variablePage, allVariables])

  const handleVerAtributos = (conceptId: string, conceptLabel: string) => {
    // Implement handleVerAtributos logic here
    console.log(`Ver atributos for concept ${conceptId}: ${conceptLabel}`)
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header con botón volver y título */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* Alerta de registros pendientes */}
      {editingRows.size > 0 && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-800">
            Tienes {editingRows.size} registro(s) pendiente(s) de guardar. Debes guardar o cancelar antes de modificar
            los filtros de rango.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rango inicial:</label>
          <Select
            value={rangeStart}
            onValueChange={(value) => {
              setRangeStart(value)
              setRangeEnd("")
            }}
            disabled={editingRows.size > 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {getAllConceptsFlat.map((concept) => (
                <SelectItem key={concept.id} value={concept.id}>
                  {concept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rango final:</label>
          <Select value={rangeEnd} onValueChange={handleRangeEndChange} disabled={!rangeStart || editingRows.size > 0}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {getAvailableEndRanges().map((concept) => (
                <SelectItem key={concept.id} value={concept.id}>
                  {concept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar en toda la tabla..."
                value={searchGlobal}
                onChange={(e) => setSearchGlobal(e.target.value)}
                className="max-w-md"
              />
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

          {/* Tabla principal */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-sm font-semibold text-left min-w-[120px]">
                      Acciones
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-semibold text-left min-w-[250px]">
                      Conceptos
                    </th>
                    {paginatedVariables.map((variable) => (
                      <th
                        key={variable.id}
                        className="border border-gray-300 px-4 py-2 text-sm font-semibold text-center min-w-[120px]"
                      >
                        {variable.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flatConcepts.map((concept) => {
                    const isParent = isParentConcept(concept.id)
                    const isExpanded = expandedNodes.has(concept.id)
                    const isEditing = isRowEditing(concept.id)
                    const isRootParent = isEstadoCambiosPatrimonio && concept.level === 0
                    const isChild = concept.level > 0

                    return (
                      <tr key={concept.id} className={cn(isChild && "bg-white")}>
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
                                  onClick={() => {
                                    setSelectedConceptoAtributos({ id: concept.id, nombre: concept.label })
                                    setAtributosDialogOpen(true)
                                  }}
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
                                  onClick={() => {
                                    setSelectedConceptoAtributos({ id: concept.id, nombre: concept.label })
                                    setAtributosDialogOpen(true)
                                  }}
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
                                  onClick={() => {
                                    setSelectedConceptoAtributos({ id: concept.id, nombre: concept.label })
                                    setAtributosDialogOpen(true)
                                  }}
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
                                onClick={() => {
                                  setSelectedConceptoAtributos({ id: concept.id, nombre: concept.label })
                                  setAtributosDialogOpen(true)
                                }}
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
                          if (isEstadoCambiosPatrimonio && nonEditableVars.has(concept.id)) {
                            const vars = nonEditableVars.get(concept.id)!
                            if (variable.id === "var-1" || variable.id === "var-2") {
                              const displayValue = variable.id === "var-1" ? vars.var1 : vars.var2
                              return (
                                <td
                                  key={variable.id}
                                  className="border border-gray-300 px-2 py-1 text-center bg-gray-50"
                                >
                                  <span className="text-sm text-gray-600">{displayValue}</span>
                                </td>
                              )
                            }
                          }

                          if (isRootParent && isEstadoCambiosPatrimonio) {
                            return (
                              <td
                                key={variable.id}
                                className="border border-gray-300 px-2 py-1 text-center bg-gray-100"
                              >
                                <span className="text-sm text-gray-400">-</span>
                              </td>
                            )
                          }

                          if (isEditing) {
                            const cellValue = getTempCellValue(concept.id, variable.id)
                            return (
                              <td key={variable.id} className="border border-gray-300 px-2 py-1 bg-yellow-50">
                                <Input
                                  type="text"
                                  value={cellValue}
                                  onChange={(e) => handleTempCellChange(concept.id, variable.id, e.target.value)}
                                  className="w-full text-center text-sm h-8"
                                />
                              </td>
                            )
                          }

                          if (isParent && !isEstadoCambiosPatrimonio) {
                            const sum = calculateParentSum(concept.id, variable.id)
                            return (
                              <td
                                key={variable.id}
                                className="border border-gray-300 px-2 py-1 text-center bg-gray-100"
                              >
                                <span className="text-sm font-semibold">{sum.toFixed(2)}</span>
                              </td>
                            )
                          }

                          const cellValue = getCellValue(concept.id, variable.id)
                          return (
                            <td key={variable.id} className="border border-gray-300 px-2 py-1 text-center">
                              <span className="text-sm">{cellValue || "0"}</span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {flatConcepts.length} de {allFlattenedConcepts.length} registros totales
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
        </>
      )}

      {/* Dialogs */}
      <AddChildDialog
        open={addChildDialogOpen}
        onOpenChange={setAddChildDialogOpen}
        onAdd={handleAddChild}
        parentId={selectedParentForAdd?.id || ""}
        parentName={selectedParentForAdd?.name || ""}
        variables={paginatedVariables}
        existingChildren={getExistingChildren(selectedParentForAdd?.id || "")}
      />

      <Dialog open={atributosDialogOpen} onOpenChange={setAtributosDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atributos Extensibles</DialogTitle>
            <DialogDescription>Concepto: {selectedConceptoAtributos?.nombre}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {(atributosExtensiblesMock[selectedConceptoAtributos?.id || ""] || atributosExtensiblesMock["1"]).map(
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
                    {atributo.tipo === "boolean" ? (atributo.valor ? "☐" : "☐") : atributo.valor}
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
