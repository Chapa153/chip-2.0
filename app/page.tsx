"use client"

import { useState, useRef } from "react"
import LoginForm from "@/components/login-form"
import ModulosPrincipales from "@/components/modulos-principales"
import AdministracionSubmodulos from "@/components/administracion-submódulos"
import FormulariosSubmodulos from "@/components/formularios-submodulos"
import UsuariosModule from "@/components/usuarios-module"
import RolesModule from "@/components/roles-module"
import EntidadesView from "@/components/entidades-view"
import GestionFormulariosSimple from "@/components/gestion-formularios-simple"
import DataTable from "@/components/data-table"
import Footer from "@/components/footer"
import Breadcrumb from "@/components/breadcrumb"
import Home from "@/components/home"
import GestionRolesView from "@/components/gestion-roles-view"

interface NavigationState {
  view: string | null
  subview?: string | null
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [navigationStack, setNavigationStack] = useState<NavigationState>({ view: null })
  const [editingFormulario, setEditingFormulario] = useState<{id: string, nombre: string} | null>(null)
  const [filtrosGestionFormularios, setFiltrosGestionFormularios] = useState<{
    categoria?: string
    ano?: string
    periodo?: string
  }>({})

  const handleLogin = (user: string) => {
    setUsername(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
    setNavigationStack({ view: null })
  }

  const handleModuleSelect = (moduleId: string) => {
    if (["entidades", "usuarios", "roles", "auditoria"].includes(moduleId)) {
      setNavigationStack({ view: "administracion", subview: moduleId })
    } else if (moduleId === "gestion-formularios") {
      setNavigationStack({ view: "formularios", subview: "gestion-formularios" })
    } else if (moduleId === "historico-envios") {
      setNavigationStack({ view: "formularios", subview: "historico-envios" })
    } else {
      setNavigationStack({ view: moduleId })
    }
  }

  const handleSubmoduleSelect = (submoduleId: string) => {
    setNavigationStack({ view: navigationStack.view, subview: submoduleId })
  }

  const handleEditFormulario = (formId: string, formName: string) => {
    const filtrosActuales = {
      categoria: filtrosGestionFormularios.categoria,
      ano: filtrosGestionFormularios.ano,
      periodo: filtrosGestionFormularios.periodo
    }
    setEditingFormulario({ id: formId, nombre: formName })
    setNavigationStack({ view: "formularios", subview: "editar" })
  }

  const handleVolverDeEdicion = () => {
    setNavigationStack({ view: "formularios", subview: "gestion-formularios" })
    setEditingFormulario(null)
  }

  const goToHome = () => {
    setNavigationStack({ view: null })
  }

  const goToAdminModules = () => {
    setNavigationStack({ view: "administracion" })
  }

  const goToFormulariosModules = () => {
    setNavigationStack({ view: "formularios" })
  }

  const handleBack = () => {
    if (navigationStack.subview) {
      setNavigationStack({ view: navigationStack.view })
    } else {
      setNavigationStack({ view: null })
    }
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  // Construir breadcrumb dinámico
  const breadcrumbItems: Array<{ label: string; onClick?: () => void; isActive?: boolean }> = [
    { label: "Inicio", onClick: goToHome },
  ]

  if (navigationStack.view === "administracion") {
    breadcrumbItems.push({ label: "Administración", onClick: goToAdminModules })
    if (navigationStack.subview === "entidades") {
      breadcrumbItems.push({ label: "Gestión de Entidades", isActive: true })
    } else if (navigationStack.subview === "usuarios") {
      breadcrumbItems.push({ label: "Gestión de Usuarios", isActive: true })
    } else if (navigationStack.subview === "roles") {
      breadcrumbItems.push({ label: "Gestión de Roles", isActive: true })
    } else if (navigationStack.subview === "auditoria") {
      breadcrumbItems.push({ label: "Auditoría", isActive: true })
    } else {
      breadcrumbItems[breadcrumbItems.length - 1].isActive = true
    }
  } else if (navigationStack.view === "formularios") {
    breadcrumbItems.push({ label: "Formularios", onClick: goToFormulariosModules })
    if (navigationStack.subview === "gestion-formularios") {
      breadcrumbItems.push({ label: "Gestión de Formularios", isActive: true })
    } else if (navigationStack.subview === "historico-envios") {
      breadcrumbItems.push({ label: "Histórico de Envíos", isActive: true })
    } else if (navigationStack.subview === "editar") {
      breadcrumbItems.push({ label: "Gestión de Formularios", onClick: () => setNavigationStack({ view: "formularios", subview: "gestion-formularios" }) })
      breadcrumbItems.push({ label: editingFormulario?.nombre || "Editar Formulario", isActive: true })
    } else {
      breadcrumbItems[breadcrumbItems.length - 1].isActive = true
    }
  } else if (navigationStack.view === "entidades") {
    breadcrumbItems.push({ label: "Administración", onClick: goToAdminModules })
    breadcrumbItems.push({ label: "Gestión de Entidades", isActive: true })
  } else if (navigationStack.view === "usuarios") {
    breadcrumbItems.push({ label: "Administración", onClick: goToAdminModules })
    breadcrumbItems.push({ label: "Gestión de Usuarios", isActive: true })
  } else if (navigationStack.view === "roles") {
    breadcrumbItems.push({ label: "Administración", onClick: goToAdminModules })
    breadcrumbItems.push({ label: "Gestión de Roles", isActive: true })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {console.log("[v0] Navigation state:", navigationStack)}
      {/* Header - ahora centralizado */}
      <Home username={username} onLogout={handleLogout} onModuleSelect={handleModuleSelect} />

      {navigationStack.view && (
        <div className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 w-full">
        {!navigationStack.view && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <ModulosPrincipales onModuleSelect={handleModuleSelect} />
          </div>
        )}

        {/* Vista de submódulos de administración */}
        {navigationStack.view === "administracion" && !navigationStack.subview && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <AdministracionSubmodulos onModuleSelect={handleSubmoduleSelect} />
          </div>
        )}

        {navigationStack.view === "formularios" && !navigationStack.subview && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <FormulariosSubmodulos onModuleSelect={handleSubmoduleSelect} />
          </div>
        )}

        {/* Vistas de módulos específicos desde administración */}
        {navigationStack.view === "administracion" && navigationStack.subview === "entidades" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <EntidadesView onBack={handleBack} />
          </div>
        )}
        {navigationStack.view === "administracion" && navigationStack.subview === "usuarios" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <UsuariosModule onClose={handleBack} />
          </div>
        )}
        {navigationStack.view === "administracion" && navigationStack.subview === "roles" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <GestionRolesView onBack={handleBack} />
          </div>
        )}

        {navigationStack.view === "formularios" && navigationStack.subview === "gestion-formularios" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {console.log("[v0] Renderizando GestionFormulariosSimple")}
            <GestionFormulariosSimple 
              onEditForm={handleEditFormulario}
              filtrosPrevios={filtrosGestionFormularios}
            />
          </div>
        )}

        {navigationStack.view === "formularios" && navigationStack.subview === "editar" && editingFormulario && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <DataTable 
              title={editingFormulario.nombre}
              onBack={handleVolverDeEdicion}
              filtrosPrevios={filtrosGestionFormularios}
            />
          </div>
        )}

        {/* Vistas de módulos desde menú directo (compatibilidad) */}
        {navigationStack.view === "entidades" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <EntidadesView onBack={handleBack} />
          </div>
        )}
        {navigationStack.view === "usuarios" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <UsuariosModule onClose={handleBack} />
          </div>
        )}
        {navigationStack.view === "roles" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <GestionRolesView onBack={handleBack} />
          </div>
        )}
      </main>

      {/* Footer visible en todas las vistas */}
      <Footer />
    </div>
  )
}
