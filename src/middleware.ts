import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnLogin = req.nextUrl.pathname.startsWith("/login")
  const isOnRegister = req.nextUrl.pathname.startsWith("/register")
  const isOnRoot = req.nextUrl.pathname === "/"

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if ((isOnLogin || isOnRegister || isOnRoot) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*"],
}
