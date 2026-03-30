import { prisma } from "@/lib/prisma"
import EmpreendimentosClient from "./EmpreendimentosClient"

export default async function EmpreendimentosPage() {
  const developments = await prisma.development.findMany({ 
     include: { sales: true }, 
     orderBy: { createdAt: 'desc' } 
  })

  return <EmpreendimentosClient developments={developments} />
}
