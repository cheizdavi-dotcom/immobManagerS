import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import VendasClient from "./VendasClient"
import { redirect } from "next/navigation"

export default async function VendasPage() {
  const session = await auth()
  if(!session) redirect("/")

  const role = (session.user as any).role || "ADMIN"
  const isAdmin = role === "ADMIN"
  const email = session.user?.email || ""

  let brokerObj = null
  if (!isAdmin) {
    brokerObj = await prisma.broker.findFirst({ where: { email: email.toLowerCase().trim() } })
  }

  // Se não for Admin e não tiver corretor linkado, não deve ver nada
  const salesFilter = !isAdmin ? (brokerObj ? { brokerId: brokerObj.id } : { id: "none" }) : {}

  // Load contextual data
  const [sales, developments, clients, brokers] = await Promise.all([
    prisma.sale.findMany({
      where: salesFilter,
      include: {
        client: true,
        broker: true,
        development: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.development.findMany(),
    prisma.client.findMany(),
    isAdmin ? prisma.broker.findMany() : (brokerObj ? [brokerObj] : [])
  ])

  return (
     <VendasClient 
        sales={sales} 
        developments={developments} 
        clients={clients} 
        brokers={brokers} 
        userRole={role}
     />
  )
}
