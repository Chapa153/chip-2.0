"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  onLogin: (username: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("JLMUNOZ")
  const [password, setPassword] = useState("$Contaduria2025")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("Por favor ingrese su usuario")
      return
    }

    if (!password) {
      setError("Por favor ingrese su contraseña")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      if (username === "JLMUNOZ" && password === "$Contaduria2025") {
        onLogin(username)
      } else {
        setError("Usuario o contraseña incorrectos")
      }
      setIsLoading(false)
    }, 600)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError("")
    setForgotSuccess(false)

    if (!forgotEmail.trim()) {
      setForgotError("Por favor ingrese su correo electrónico")
      return
    }

    if (!forgotEmail.includes("@")) {
      setForgotError("Por favor ingrese un correo válido")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setForgotSuccess(true)
      setForgotEmail("")
      setIsLoading(false)
      setTimeout(() => {
        setShowForgotPassword(false)
        setForgotSuccess(false)
      }, 2000)
    }, 600)
  }

  // Pantalla de recuperación de contraseña
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-2xl p-8 border border-border animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 text-center">CHIP</h1>
              <p className="text-center text-muted-foreground text-sm">Recuperación de Contraseña</p>
            </div>

            {/* Mensaje de éxito */}
            {forgotSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md mb-6">
                <p className="text-green-700 dark:text-green-200 text-sm font-medium text-center">
                  ¡Éxito! Se ha enviado un enlace de recuperación a su correo.
                </p>
              </div>
            )}

            {/* Formulario de recuperación */}
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="su.correo@ejemplo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Mensaje de error */}
              {forgotError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="text-destructive text-sm">{forgotError}</p>
                </div>
              )}

              {/* Botón enviar */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-2.5 rounded-md transition"
              >
                {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
              </Button>
            </form>

            {/* Volver al login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de login normal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Card de login */}
        <div className="bg-card rounded-lg shadow-2xl p-8 border border-border animate-fadeIn">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">CHIP</h1>
            <p className="text-center text-muted-foreground text-sm">Sistema de Gestión Administrativa</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-foreground">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md animate-shake">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Botón Ingresar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-2.5 rounded-md transition"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          {/* Hipervínculo Recuperación de Contraseña */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          {/* Footer con datos de demostración */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Credenciales de prueba:</p>
            <div className="bg-muted/50 rounded p-3 space-y-1 text-xs">
              <p className="text-foreground">
                <span className="font-semibold">Usuario:</span> JLMUNOZ
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Contraseña:</span> $Contaduria2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
