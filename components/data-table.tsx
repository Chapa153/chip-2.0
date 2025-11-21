"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ChevronRight,
  ChevronDown,
  Check,
  ChevronsUpDown,
  ArrowLeft,
  Info,
  Filter,
  Edit,
  Save,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (parentId: string, numericValue: string, dropdownValue: string) => void
  parentId: string
  parentName: string
}) => {
  const [numericValue, setNumericValue] = useState("")
  const [dropdownValue, setDropdownValue] = useState("")

  const opcionesLista = ["Opción A", "Opción B", "Opción C", "Opción D", "Opción E"]

  const handleSubmit = () => {
    if (numericValue && dropdownValue) {
      onAdd(parentId, numericValue, dropdownValue)
      setNumericValue("")
      setDropdownValue("")
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
              Variable Numérica <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={numericValue}
              onChange={(e) => {
                const value = e.target.value
                if (value === "" || /^\d+$/.test(value)) {
                  setNumericValue(value)
                }
              }}
              placeholder="Ingrese un valor numérico"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Variable de Selección <span className="text-red-500">*</span>
            </label>
            <select
              value={dropdownValue}
              onChange={(e) => setDropdownValue(e.target.value)}
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
  const [openStartCombobox, setOpenStartCombobox] = useState(false)
  const [openEndCombobox, setOpenEndCombobox] = useState(false)
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
    currentVariables.forEach((variable) => {
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

  const currentVariables = getCurrentVariables()

  const handleVerAtributos = (conceptoId: string, conceptoNombre: string) => {
    setSelectedConceptoAtributos({ id: conceptoId, nombre: conceptoNombre })
    setAtributosDialogOpen(true)
  }

  const getAvailableEndConcepts = useMemo(() => {
    if (!rangeStart) {
      return getAllConceptsFlat
    }
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeStart)
    if (startIndex === -1) {
      return getAllConceptsFlat
    }
    return getAllConceptsFlat.slice(startIndex + 1)
  }, [rangeStart, getAllConceptsFlat])

  const getRangeSize = useMemo((): number => {
    if (!rangeStart || !rangeEnd) {
      return 0
    }
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeStart)
    const endIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeEnd)
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return 0
    }
    return endIndex - startIndex + 1
  }, [rangeStart, rangeEnd, getAllConceptsFlat])

  const handleRangeEndChange = (newRangeEnd: string) => {
    setRangeEnd(newRangeEnd)
    setOpenEndCombobox(false)

    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeStart)
    const endIndex = getAllConceptsFlat.findIndex((c) => c.id === newRangeEnd)

    if (startIndex !== -1 && endIndex !== -1) {
      const rangeSize = endIndex - startIndex + 1
      // Simular alerta de 10,000 registros cuando el rango supera 30 conceptos
      const shouldShowAlert = rangeSize > 30

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

  const isCellEditable = (conceptId: string, variableId: string): boolean => {
    if (isEstadoCambiosPatrimonio && nonEditableVars.has(conceptId)) {
      // Las primeras 2 variables no son editables
      if (variableId === "var-1" || variableId === "var-2") {
        return false
      }
    }
    return true
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
      </div>

      {showLargeRangeAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">Rango grande detectado</h4>
            <p className="text-sm text-amber-800">
              El rango seleccionado contiene más de 10,000 registros. Para optimizar el rendimiento:
            </p>
            <ul className="list-disc list-inside text-sm text-amber-800 mt-2 space-y-1">
              <li>Se mostrará un máximo de 100 filas por página</li>
              <li>Los conceptos padres se mostrarán colapsados por defecto</li>
              <li>Puede expandir cada concepto individualmente según necesite</li>
            </ul>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rango inicial:</label>
              <Popover open={openStartCombobox} onOpenChange={setOpenStartCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-transparent"
                    disabled={editingRows.size > 0}
                  >
                    {rangeStart
                      ? getAllConceptsFlat.find((concept) => concept.id === rangeStart)?.label || "Seleccionar..."
                      : "Seleccionar..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar concepto..." />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No se encontraron conceptos.</CommandEmpty>
                      <CommandGroup>
                        {getAllConceptsFlat.slice(0, 200).map((concept) => (
                          <CommandItem
                            key={concept.id}
                            value={`${concept.id} ${concept.label}`}
                            onSelect={() => {
                              setRangeStart(concept.id)
                              setOpenStartCombobox(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", rangeStart === concept.id ? "opacity-100" : "opacity-0")}
                            />
                            <span className="truncate">
                              {concept.label} ({concept.id})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rango final:</label>
              <Popover open={openEndCombobox} onOpenChange={setOpenEndCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-transparent"
                    disabled={!rangeStart || editingRows.size > 0}
                  >
                    {rangeEnd
                      ? getAllConceptsFlat.find((concept) => concept.id === rangeEnd)?.label || "Seleccionar..."
                      : "Seleccionar..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar concepto..." />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No se encontraron conceptos.</CommandEmpty>
                      <CommandGroup>
                        {getAvailableEndConcepts.slice(0, 200).map((concept) => (
                          <CommandItem
                            key={concept.id}
                            value={`${concept.id} ${concept.label}`}
                            onSelect={() => {
                              handleRangeEndChange(concept.id)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", rangeEnd === concept.id ? "opacity-100" : "opacity-0")}
                            />
                            <span className="truncate">
                              {concept.label} ({concept.id})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {editingRows.size > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-orange-700">
                    Hay {editingRows.size} registro(s) en edición pendiente de guardar. Debe guardar o cancelar los
                    cambios antes de modificar el filtro de rango.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!rangeStart || !rangeEnd ? (
          <div className="p-12 text-center">
            <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Seleccione un rango de conceptos</h3>
            <p className="text-gray-500">Para visualizar los datos, debe seleccionar un rango inicial y final</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold w-16">Acciones</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold min-w-[250px]">Conceptos</th>
                  {currentVariables.map((variable) => (
                    <th
                      key={variable.id}
                      className="border border-gray-300 px-4 py-2 text-center font-semibold min-w-[120px]"
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

                  return (
                    <tr key={concept.id} className={cn(concept.level > 0 && "bg-blue-50")}>
                      <td className="border border-gray-300 px-2 py-2">
                        <div className="flex items-center gap-1">
                          {!isParent && (
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
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleVerAtributos(concept.id, concept.label)}
                          >
                            <Info className="h-4 w-4 text-blue-600" />
                          </Button>
                          {isEstadoCambiosPatrimonio && isParent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleOpenAddDialog(concept.id, concept.label)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${concept.level * 24}px` }}>
                          {isParent && (
                            <button onClick={() => toggleNode(concept.id)} className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                          <span className={cn("text-sm", isParent && "font-semibold")}>{concept.label}</span>
                        </div>
                      </td>
                      {currentVariables.map((variable) => {
                        const cellValue = isEditing
                          ? getTempCellValue(concept.id, variable.id)
                          : getCellValue(concept.id, variable.id)
                        const displayValue = isParent
                          ? calculateParentSum(concept.id, variable.id).toLocaleString()
                          : cellValue
                        const editable = isCellEditable(concept.id, variable.id)

                        return (
                          <td key={variable.id} className="border border-gray-300 px-2 py-1 text-center">
                            {isParent || !isEditing ? (
                              <span className={cn("text-sm", isParent && "font-semibold")}>{displayValue}</span>
                            ) : (
                              <Input
                                type="text"
                                value={cellValue}
                                onChange={(e) => handleTempCellChange(concept.id, variable.id, e.target.value)}
                                disabled={!editable}
                                className={cn("text-center h-8 text-sm", !editable && "bg-gray-100 cursor-not-allowed")}
                                placeholder={editable ? "0" : "No editable"}
                              />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Mostrando registros {currentPage * MAX_ROWS_PER_PAGE + 1} -{" "}
              {Math.min((currentPage + 1) * MAX_ROWS_PER_PAGE, allFlattenedConcepts.length)} de{" "}
              {allFlattenedConcepts.length} (máximo 100 por página)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={atributosDialogOpen} onOpenChange={setAtributosDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atributos Extensibles</DialogTitle>
            <DialogDescription>
              {selectedConceptoAtributos?.nombre} ({selectedConceptoAtributos?.id})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {(atributosExtensiblesMock[selectedConceptoAtributos?.id || ""] || atributosExtensiblesMock["1"]).map(
                (atributo, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
                    <div className="text-sm font-medium text-gray-700">{atributo.nombre}:</div>
                    <div className={`text-sm ${atributo.tipo === "boolean" ? "flex items-center" : ""}`}>
                      {atributo.tipo === "boolean" ? (
                        <input type="checkbox" checked={atributo.valor as boolean} disabled className="rounded" />
                      ) : (
                        <span className="bg-gray-100 px-3 py-1 rounded">{atributo.valor as string}</span>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isEstadoCambiosPatrimonio && selectedParentForAdd && (
        <AddChildDialog
          open={addChildDialogOpen}
          onOpenChange={setAddChildDialogOpen}
          onAdd={handleAddChild}
          parentId={selectedParentForAdd.id}
          parentName={selectedParentForAdd.name}
        />
      )}
    </div>
  )
}

export { DataTable }
export default DataTable
