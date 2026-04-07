import { prisma } from "@/lib/prisma"
import ClientesClient from "./ClientesClient"
import { auth } from "@/auth"

export default async function ClientesPage() {
  // forced recompile to clear turbopack cache
  const session = await auth();
  const userId = session?.user?.id;
  
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
      createdAt: true,
      ultimoContato: true
    }
  })

  return <ClientesClient clients={clients} />
}

