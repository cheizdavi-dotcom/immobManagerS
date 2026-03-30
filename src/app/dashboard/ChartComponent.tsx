"use client"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ChartComponent({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
          <Tooltip 
             contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
             itemStyle={{ color: '#e2e8f0' }}
             formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
          <Area type="monotone" name="Receita Bruta (VGV)" dataKey="vgt" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
          <Area type="monotone" name="Comissões Líquidas" dataKey="commission" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCommissions)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
