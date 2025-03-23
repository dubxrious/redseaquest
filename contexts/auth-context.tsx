"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
}

interface AuthState {
  user: User | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  })

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()

        if (data.authenticated) {
          setState({ user: data.user, loading: false })
        } else {
          setState({ user: null, loading: false })
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setState({ user: null, loading: false })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await response.json()
      setState({ user: data.user, loading: false })
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      // After successful registration, log the user in
      await login(userData.email, userData.password)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setState({ user: null, loading: false })
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Request failed")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      throw error
    }
  }

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Password reset failed")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

