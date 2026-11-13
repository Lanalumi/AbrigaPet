// Creates the admin account when it does not exist yet.
// Run: npx tsx prisma/seed-admin.ts
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma/client'

const ADMIN_EMAIL = 'admin@abrigapet.com'
const ADMIN_PASSWORD = '123456'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL não está definido.')
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

  try {
    const existing = await prisma.pessoa.findFirst({
      where: {
        email: ADMIN_EMAIL,
        tipo: { tipo: 'admin' },
      },
    })

    if (existing) {
      console.info('Admin já existe:', ADMIN_EMAIL)
      return
    }

    const tipo =
      (await prisma.tipoPessoa.findFirst({ where: { tipo: 'admin' } })) ??
      (await prisma.tipoPessoa.create({ data: { tipo: 'admin' } }))

    await prisma.pessoa.create({
      data: {
        tipoId: tipo.id,
        nome: 'Admin',
        cpf: '00000000000',
        dataNascimento: new Date('1990-01-01T00:00:00.000Z'),
        telefone: '0000000000',
        rua: 'Abrigo',
        numero: 1,
        bairro: 'Centro',
        cidade: 'Abrigo',
        dataInicio: new Date(),
        email: ADMIN_EMAIL,
        senhaHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      },
    })

    console.info('Admin criado:', ADMIN_EMAIL)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
