"use client"

import { useState, useMemo } from "react"
import { ChevronRight, ChevronDown, Check, ChevronsUpDown, ArrowLeft, Search, Info, Filter, Edit, Save, X } from 'lucide-react'
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
  tipo: 'texto' | 'boolean'
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

const generateMockConcepts = (): ConceptNode[] => {
  const concepts: ConceptNode[] = []
  
  // Generar 50 conceptos raíz, cada uno con 10-30 hijos (750 registros aprox)
  for (let i = 1; i <= 50; i++) {
    const childrenCount = Math.floor(Math.random() * 20) + 10
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

const mockConcepts: ConceptNode[] = generateMockConcepts()

function DataTable({ title = "Gestión de Datos", onBack, filtrosPrevios }: DataTableProps) {
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
  const [selectedConceptoAtributos, setSelectedConceptoAtributos] = useState<{id: string, nombre: string} | null>(null)
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
  const [tempRowData, setTempRowData] = useState<Map<string, Map<string, string>>>(new Map())

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

    traverse(mockConcepts)
    return result
  }, [])

  const getFilteredConcepts = useMemo((): ConceptNode[] => {
    if (!rangeStart || !rangeEnd) {
      return mockConcepts
    }

    const allFlat = getAllConceptsFlat
    const startIndex = allFlat.findIndex((c) => c.id === rangeStart)
    const endIndex = allFlat.findIndex((c) => c.id === rangeEnd)

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return mockConcepts
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

    return filterTree(mockConcepts)
  }, [rangeStart, rangeEnd, getAllConceptsFlat])

  const getFilteredConceptsWithSearch = useMemo((): ConceptNode[] => {
    const conceptosFiltrados = getFilteredConcepts
    
    if (!searchGlobal.trim()) {
      return conceptosFiltrados
    }

    const searchLower = searchGlobal.toLowerCase()
    
    const filterBySearch = (nodes: ConceptNode[]): ConceptNode[] => {
      return nodes
        .map((node) => {
          const matchesSearch = node.label.toLowerCase().includes(searchLower) || 
                                node.id.toLowerCase().includes(searchLower)
          
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

    const node = findNode(mockConcepts)
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

    const node = findNode(mockConcepts)
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
    setEditingCellKey(null)
    setCellData(new Map(cellData))
  }

  const getCellValue = (conceptId: string, variableId: string) => {
    const key = `${conceptId}-${variableId}`
    return cellData.get(key) || ""
  }

  const getNodeInfo = (nodeId: string): { node: ConceptNode | null; totalChildren: number } => {
    const findNode = (nodes: ConceptNode[], targetId: string, parent: ConceptNode | null = null): ConceptNode | null => {
      for (const node of nodes) {
        if (node.id === targetId) return node
        if (node.children) {
          const found = findNode(node.children, targetId, node)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(mockConcepts, nodeId)

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

    const parent = findParent(mockConcepts, concept.id)

    if (!parent || !expandedNodes.has(parent.id)) {
      return false
    }

    if (!parent.children || parent.children.length <= MAX_ROWS_PER_PAGE) {
      return false
    }

    const currentPage = getChildrenPage(parent.id)
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
    
    // Calcular el tamaño del rango
    const startIndex = getAllConceptsFlat.findIndex((c) => c.id === rangeStart)
    const endIndex = getAllConceptsFlat.findIndex((c) => c.id === newRangeEnd)
    
    if (startIndex !== -1 && endIndex !== -1) {
      const rangeSize = endIndex - startIndex + 1
      const shouldShowAlert = rangeSize > 30 || (rangeStart === "1" && newRangeEnd === getAllConceptsFlat[getAllConceptsFlat.length - 1]?.id)
      
      if (shouldShowAlert) {
        setShowLargeRangeAlert(true)
      }
    }
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
                    className="w-full justify-between"
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
                            <span className="truncate">{concept.label} ({concept.id})</span>
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
                    className="w-full justify-between"
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
                            <span className="truncate">{concept.label} ({concept.id})</span>
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
                    Hay {editingRows.size} registro(s) en edición pendiente de guardar. 
                    Debe guardar o cancelar los cambios antes de modificar el filtro de rango.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showLargeRangeAlert && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                    Rango grande detectado
                  </h4>
                  <p className="text-sm text-yellow-700">
                    El rango seleccionado contiene más de 10,000 registros potenciales. 
                    La paginación se ha configurado automáticamente a 100 filas por página y los conceptos padres 
                    se mostrarán colapsados para optimizar el rendimiento y reducir el consumo de recursos.
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLargeRangeAlert(false)}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {(!rangeStart || !rangeEnd) ? (
          <div className="p-12 text-center">
            <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Seleccione un rango de conceptos</h3>
            <p className="text-gray-500">Para visualizar los datos, debe seleccionar un rango inicial y final</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="border-b bg-muted/30">
                <div className="flex items-center justify-between p-4">
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar en toda la tabla..."
                      value={searchGlobal}
                      onChange={(e) => setSearchGlobal(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVariablePage(Math.max(0, variablePage - 1))}
                      disabled={variablePage === 0}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {variablePage + 1} de {totalVariablePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVariablePage(Math.min(totalVariablePages - 1, variablePage + 1))}
                      disabled={variablePage === totalVariablePages - 1}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="sticky top-0 z-10 flex border-b bg-card">
                  <div className="w-32 shrink-0 border-r bg-muted/50 p-3">
                    <span className="text-sm font-semibold text-foreground">Acciones</span>
                  </div>
                  <div className="w-80 shrink-0 border-r bg-muted/50 p-3">
                    <span className="text-sm font-semibold text-foreground">Conceptos</span>
                  </div>
                  {currentVariables.map((variable) => (
                    <div key={variable.id} className="w-32 shrink-0 border-r p-3 text-center last:border-r-0">
                      <span className="text-sm font-medium text-foreground">{variable.label}</span>
                    </div>
                  ))}
                </div>

                <div className="divide-y">
                  {flatConcepts.map((concept, index) => {
                    const isParent = isParentConcept(concept.id)
                    const isEditing = isRowEditing(concept.id)

                    return (
                      <div key={concept.id}>
                        <div className="flex hover:bg-muted/20">
                          <div className="w-32 shrink-0 border-r bg-card p-2">
                            <div className="flex items-center justify-center gap-1">
                              {!isParent ? (
                                <>
                                  {!isEditing ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => startEditingRow(concept.id)}
                                        title="Editar fila"
                                      >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => handleVerAtributos(concept.id, concept.label)}
                                        title="Ver atributos"
                                      >
                                        <Info className="h-4 w-4 text-gray-600" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => saveEditingRow(concept.id)}
                                        title="Guardar cambios"
                                      >
                                        <Save className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => cancelEditingRow(concept.id)}
                                        title="Cancelar"
                                      >
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleVerAtributos(concept.id, concept.label)}
                                  title="Ver atributos"
                                >
                                  <Info className="h-4 w-4 text-gray-600" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="w-80 shrink-0 border-r bg-card p-3">
                            <div className="flex items-center gap-2" style={{ paddingLeft: `${concept.level * 24}px` }}>
                              {concept.children && concept.children.length > 0 ? (
                                <button
                                  onClick={() => toggleNode(concept.id)}
                                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted"
                                >
                                  {expandedNodes.has(concept.id) ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              ) : (
                                <div className="h-5 w-5 shrink-0" />
                              )}
                              <span className={`text-sm flex-1 ${isParent ? "font-semibold text-foreground" : "text-foreground"}`}>
                                {concept.label}
                              </span>
                            </div>
                          </div>
                          {currentVariables.map((variable) => {
                            if (isParent) {
                              const sum = calculateParentSum(concept.id, variable.id)
                              return (
                                <div key={variable.id} className="w-32 shrink-0 border-r p-2 last:border-r-0">
                                  <div className="flex h-9 items-center justify-center rounded-md bg-muted/50 text-sm font-semibold text-foreground">
                                    {sum > 0 ? sum.toFixed(2) : ""}
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <div key={variable.id} className="w-32 shrink-0 border-r p-2 last:border-r-0">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  value={isEditing ? getTempCellValue(concept.id, variable.id) : getCellValue(concept.id, variable.id)}
                                  onChange={(e) => {
                                    if (isEditing) {
                                      handleTempCellChange(concept.id, variable.id, e.target.value)
                                    }
                                  }}
                                  disabled={!isEditing}
                                  className={`h-9 text-center text-sm ${isEditing ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50'}`}
                                  placeholder="0"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

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
            </div>
          </div>
        )}
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
              {(atributosExtensiblesMock[selectedConceptoAtributos?.id || ""] || atributosExtensiblesMock["1"]).map((atributo, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
                  <div className="text-sm font-medium text-gray-700">
                    {atributo.nombre}:
                  </div>
                  <div className={`text-sm ${atributo.tipo === 'boolean' ? 'flex items-center' : ''}`}>
                    {atributo.tipo === 'boolean' ? (
                      <input 
                        type="checkbox" 
                        checked={atributo.valor as boolean} 
                        disabled 
                        className="rounded"
                      />
                    ) : (
                      <span className="bg-gray-100 px-3 py-1 rounded">{atributo.valor as string}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { DataTable }
export default DataTable
