import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 1,
        username: 'testadmin',
        password: 'passw0rd',
        firstName: 'test',
        lastName: 'admin',
        phoneNumber: '000-000-0000',
        role: 'ADMIN',
      },
      {
        id: 2,
        username: 'testuser',
        password: 'passw0rd',
        firstName: 'test',
        lastName: 'user',
        phoneNumber: '000-000-0001',
        role: 'USER',
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
