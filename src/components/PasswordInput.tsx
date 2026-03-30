"use client"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  name: string
  placeholder?: string
  required?: boolean
  minLength?: number
  className?: string
}

export default function PasswordInput({ name, placeholder, required, minLength, className }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        required={required}
        minLength={minLength}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={`w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-4 text-sm font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner ${className || ""}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  )
}
