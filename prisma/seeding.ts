import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        username: 'testAdmin',
        password: 'passw0rd',
        firstName: 'test',
        lastName: 'admin',
        phoneNumber: '000-000-0000',
        role: 'ADMIN',
      },
      {
        id: 2,
        username: 'testUser',
        password: 'passw0rd',
        firstName: 'test',
        lastName: 'user',
        phoneNumber: '000-000-0000',
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
