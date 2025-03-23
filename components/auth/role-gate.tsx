"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/auth"

interface RoleGateProps {
  children: ReactNode
  allowedRoles: UserRole | UserRole[]
  fallback?: ReactNode
}

export default function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return fallback
  }

  const hasAccess = Array.isArray(allowedRoles)
    ? allowedRoles.includes(user.role as UserRole)
    : user.role === allowedRoles

  if (!hasAccess) {
    return fallback
  }

  return <>{children}</>
}

