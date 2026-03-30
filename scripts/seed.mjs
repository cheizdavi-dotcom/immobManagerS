import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@immob.com'
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    console.log('User already exists')
    return
  }

  const hashedPassword = await bcrypt.hash('123456', 10)
  await prisma.user.create({
    data: {
      email,
      name: 'Gestor Master',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })
  
  console.log('Admin user created: admin@immob.com / Senha: 123456')
}

main().catch(console.error).finally(() => prisma.$disconnect())
