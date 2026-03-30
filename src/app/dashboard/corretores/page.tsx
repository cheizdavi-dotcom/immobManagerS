import { prisma } from "@/lib/prisma"
import CorretoresClient from "./CorretoresClient"

export default async function CorretoresPage() {
  const brokers = await prisma.broker.findMany({
    include: {
      sales: {
        include: {
          client: true,
          development: true,
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { name: 'asc' }
  })

  return <CorretoresClient brokers={brokers} />
}
