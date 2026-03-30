import { prisma } from "@/lib/prisma"
import ClientesClient from "./ClientesClient"

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({ 
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      status: true,
      kanbanPhase: true,
      contractUrl: true,
      createdAt: true
    }
  })

  // Convert Date objects to ISO strings or pass directly if supported by RSC
  return <ClientesClient clients={clients} />
}

