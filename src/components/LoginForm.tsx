"use client"

import { signIn } from "next-auth/react"
import { useState, useTransition } from "react"
import PasswordInput from "./PasswordInput"
import Link from "next/link"

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciais incorretas ou conta não existe.")
      } else {
        window.location.href = "/dashboard"
      }
    })
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl text-center shadow-inner animate-in shake duration-300">
          {error}
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none"></div>

      <div className="text-center mb-6">
        <Link href="/register" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors hover:underline">
          Criar uma nova conta
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2 pl-1">E-mail de Acesso</label>
          <input required name="email" type="email" placeholder="nome@imobiliaria.com" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner" />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2 pl-1">Senha Corporativa</label>
          <PasswordInput name="password" placeholder="Sua senha secreta" required />
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold tracking-wide py-4.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {isPending ? "Entrando..." : "Acessar Painel"}
          </button>
        </div>
      </form>
    </div>
  )
}
