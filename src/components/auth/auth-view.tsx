'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Mail, Lock, User, AtSign, Loader2, Check, AlertCircle, Eye, EyeOff, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Modo = 'login' | 'registro'

export function AuthView({ onLoginExitoso }: { onLoginExitoso?: () => void }) {
  const [modo, setModo] = useState<Modo>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login state
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  // Registro state
  const [rNombre, setRNombre] = useState('')
  const [rUsername, setRUsername] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rColor, setRColor] = useState('#6366f1')

  // Verificación de email
  const [verifyToken, setVerifyToken] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)

  const COLORES = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']

  // Detectar token de verificación en URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('verify')
    if (token) {
      setVerifyToken(token)
      // Limpiar URL
      window.history.replaceState({}, '', '/')
    }
  }, [])

  // Auto-verificar al montar si hay token
  useEffect(() => {
    if (!verifyToken) return
    setVerifying(true)
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verifyToken }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          toast.success('Email verificado. Iniciá sesión.')
          setVerifyToken(null)
        } else {
          toast.error(data.error || 'Token inválido')
        }
      })
      .finally(() => setVerifying(false))
  }, [verifyToken])

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!identifier.trim() || !password) {
      toast.error('Completá usuario y contraseña')
      return
    }
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        identifier: identifier.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        const msg = result.error === 'CredentialsSignin' ? 'Usuario o contraseña incorrectos' : result.error
        toast.error(msg)
        setLoading(false)
      } else if (result?.ok) {
        toast.success('¡Bienvenido!')
        // Avisar al padre que el login fue exitoso para que refresque la sesión
        // sin necesidad de recargar la página completa
        setTimeout(() => {
          onLoginExitoso?.()
          setLoading(false)
        }, 500)
      } else {
        toast.error('Respuesta inesperada del servidor')
        setLoading(false)
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleRegistro = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!rNombre.trim() || !rUsername.trim() || !rEmail.trim() || !rPassword) {
      toast.error('Completá todos los campos')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: rNombre,
          username: rUsername,
          email: rEmail,
          password: rPassword,
          color: rColor,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al registrar')
        return
      }

      // Guardar URL de verificación (dev mode)
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl)
        toast.success('Cuenta creada. Verificá tu email para continuar.')
      } else {
        toast.success('Cuenta creada. Iniciá sesión.')
        setModo('login')
        setIdentifier(rUsername)
        setPassword('')
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de verificación
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[var(--primary)]" />
          <h2 className="text-xl font-bold mb-2">Verificando tu email...</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Un momento por favor</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            <Zap className="w-8 h-8 text-[var(--foreground)]" fill="white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">LiderControl</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Finanzas familiares inteligentes</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 glass-strong">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--muted)] mb-6">
            <button
              type="button"
              onClick={() => setModo('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                modo === 'login'
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Ya tengo cuenta
            </button>
            <button
              type="button"
              onClick={() => setModo('registro')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                modo === 'registro'
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Crear cuenta nueva
            </button>
          </div>

          <AnimatePresence mode="wait">
            {modo === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="identifier">Usuario o email</Label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          // Mover focus al password si está vacío, si no, submit
                          const pw = document.getElementById('password') as HTMLInputElement
                          if (!pw?.value) {
                            pw?.focus()
                          } else {
                            handleLogin()
                          }
                        }
                      }}
                      className="bg-[var(--muted)] border-[var(--border)] pl-10"
                      placeholder="demo o demo@lidercontrol.com"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleLogin()
                        }
                      }}
                      className="bg-[var(--muted)] border-[var(--border)] pl-10 pr-10"
                      placeholder="••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer h-11 text-base"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>

                {/* Credenciales demo */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">Cuenta demo:</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('demo')
                      setPassword('demo123')
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--secondary)] text-sm cursor-pointer transition-all text-left flex items-center justify-between"
                  >
                    <span>
                      <span className="font-semibold">Demo</span>
                      <span className="text-xs text-[var(--muted-foreground)] ml-2">demo / demo123</span>
                    </span>
                    <span className="text-xs text-[var(--primary)]">Autocompletar →</span>
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="registro"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegistro}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="r-nombre">Nombre</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="r-nombre"
                      value={rNombre}
                      onChange={(e) => setRNombre(e.target.value)}
                      className="bg-[var(--muted)] border-[var(--border)] pl-10"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="r-username">Usuario</Label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="r-username"
                      value={rUsername}
                      onChange={(e) => setRUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="bg-[var(--muted)] border-[var(--border)] pl-10"
                      placeholder="demo_usuario"
                      autoCapitalize="none"
                    />
                  </div>
                  <p className="text-[0.7rem] text-[var(--muted-foreground)]">Mínimo 3 caracteres. Letras, números y _</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="r-email">Email</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="r-email"
                      type="email"
                      value={rEmail}
                      onChange={(e) => setREmail(e.target.value)}
                      className="bg-[var(--muted)] border-[var(--border)] pl-10"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="r-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="r-password"
                      type={showPassword ? 'text' : 'password'}
                      value={rPassword}
                      onChange={(e) => setRPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleRegistro()
                        }
                      }}
                      className="bg-[var(--muted)] border-[var(--border)] pl-10 pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color identificatorio</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setRColor(c)}
                        className={`w-8 h-8 rounded-lg transition-all cursor-pointer ${
                          rColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070708] scale-110' : 'hover:scale-105'
                        }`}
                        style={{ background: c }}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-[#10b981] to-[#34d399] hover:from-[#10b981]/80 hover:to-[#34d399]/80 cursor-pointer h-11 text-base"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {loading ? 'Creando...' : 'Crear cuenta'}
                </Button>

                {/* Banner de verificación tras registro */}
                {verificationUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[var(--chart-4)] mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-[var(--chart-4)] mb-1">
                          Verificá tu email para continuar
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mb-2">
                          En producción te enviaríamos un email. En modo demo, hacé clic acá:
                        </p>
                        <a
                          href={verificationUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1] text-[var(--foreground)] text-xs font-semibold hover:bg-[#6366f1]/80 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Verificar email
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          Al continuar aceptás nuestros términos y política de privacidad.
        </p>
      </motion.div>
    </div>
  )
}

// Botón de cerrar sesión para usar en el sidebar
// Acepta prop `collapsed` para mostrar solo el icono cuando el sidebar está colapsado
export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    setLoading(true)
    await signOut({ redirect: false })
    // Limpiar cache y forzar refetch de la sesión
    queryClient.clear()
    queryClient.invalidateQueries({ queryKey: ['auth-session'] })
    setLoading(false)
    // Recargar la página para asegurar estado limpio
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title={collapsed ? 'Cerrar sesión' : undefined}
      className={`flex items-center gap-3 rounded-xl text-[0.9rem] font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer w-full ${
        collapsed ? 'justify-center p-3' : 'px-4 py-3'
      }`}
    >
      {loading ? (
        <Loader2 className="w-[18px] h-[18px] animate-spin shrink-0" />
      ) : (
        <LogOut className="w-[18px] h-[18px] shrink-0" />
      )}
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  )
}
