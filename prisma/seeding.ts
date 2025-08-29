import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.SALT_ROUND);
  const defaultPassword = process.env.DEFAULT_PASSWORD;

  if (!saltRounds || !defaultPassword) {
    throw new Error('.env is not set completely');
  }

  const adminPassword = await bcrypt.hash(defaultPassword, saltRounds);
  const userPassword = await bcrypt.hash(defaultPassword, saltRounds);

  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 1,
        username: 'testadmin',
        password: adminPassword,
        firstName: 'test',
        lastName: 'admin',
        phoneNumber: '000-000-0000',
        role: Role.ADMIN,
      },
      {
        id: 2,
        username: 'testuser',
        password: userPassword,
        firstName: 'test',
        lastName: 'user',
        phoneNumber: '000-000-0001',
        role: Role.USER,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
