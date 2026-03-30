"use client"

import { registerUser } from "@/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import PasswordInput from "./PasswordInput"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await registerUser(formData)
    
    if (result?.error) {
      setError("Este email já está cadastrado.")
    } else {
      router.push("/login?registered=true")
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl text-center shadow-inner">
          {error}
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2 pl-1">Seu Nome</label>
          <input required name="name" type="text" placeholder="Maria Silva" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner" />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2 pl-1">E-mail</label>
          <input required name="email" type="email" placeholder="seu@email.com" className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner" />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2 pl-1">Senha</label>
          <PasswordInput name="password" placeholder="Mínimo 6 caracteres" required minLength={6} />
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98]">
            Criar Minha Conta
          </button>
        </div>
      </form>
    </div>
  )
}
