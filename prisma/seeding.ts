import { Position, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.SALT_ROUND);
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const userPassword = process.env.DEFAULT_USER_PASSWORD;

  if (!saltRounds || !adminPassword || !userPassword) {
    throw new Error('.env is not set completely');
  }

  const hashAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
  const hashUserPassword = await bcrypt.hash(userPassword, saltRounds);

  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      {
        username: 'testadmin',
        password: hashAdminPassword,
        firstName: 'test',
        lastName: 'admin',
        phoneNumber: '000-000-0000',
        position: Position.CEO,
        role: Role.ADMIN,
      },
      {
        username: 'testuser',
        password: hashUserPassword,
        firstName: 'test',
        lastName: 'user',
        phoneNumber: '000-000-0001',
        position: Position.INTERN,
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
