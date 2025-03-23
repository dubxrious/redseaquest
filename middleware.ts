import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of paths that require authentication
const authRequiredPaths = ["/account", "/bookings"]

// List of paths that are admin-only
const adminOnlyPaths = ["/admin"]

// List of paths that are vendor-only
const vendorOnlyPaths = ["/vendor"]

// List of paths that are for non-authenticated users only (e.g., login, register)
const nonAuthPaths = ["/login", "/register", "/forgot-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  // Check if the path requires authentication
  const isAuthRequired = authRequiredPaths.some((path) => pathname.startsWith(path))

  // Check if the path is admin-only
  const isAdminOnly = adminOnlyPaths.some((path) => pathname.startsWith(path))

  // Check if the path is vendor-only
  const isVendorOnly = vendorOnlyPaths.some((path) => pathname.startsWith(path))

  // Check if the path is for non-authenticated users only
  const isNonAuthPath = nonAuthPaths.some((path) => pathname.startsWith(path))

  // If no token and auth is required, redirect to login
  if (!token && isAuthRequired) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // If token and path is for non-authenticated users, redirect to home
  if (token && isNonAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For admin and vendor routes, we need to check the role
  if (token && (isAdminOnly || isVendorOnly)) {
    try {
      // For simplicity, we'll just check the token without full validation
      // In a real app, you would probably decode the JWT and check the role
      // This is a simplified approach for demonstration
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          Cookie: `token=${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to authenticate")
      }

      const { user } = await response.json()

      if (isAdminOnly && user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }

      if (isVendorOnly && user.role !== "vendor") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      // If there's an error, assume the user doesn't have permission
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/account/:path*",
    "/bookings/:path*",
    "/admin/:path*",
    "/vendor/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
}

