import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const prisma = new PrismaClient({ adapter });

async function main() {
  const org1 = await prisma.organization.upsert({
    where: { id: 'org-1' },
    update: {},
    create: { id: 'org-1', name: 'Org One' },
  });

  const org2 = await prisma.organization.upsert({
    where: { id: 'org-2' },
    update: {},
    create: { id: 'org-2', name: 'Org Two' },
  });

  await prisma.user.upsert({
    where: { id: 'admin-1' },
    update: {},
    create: { id: 'admin-1', name: 'Admin One', role: 'ADMIN', organizationId: org1.id },
  });

  await prisma.user.upsert({
    where: { id: 'member-1' },
    update: {},
    create: { id: 'member-1', name: 'Member One', role: 'MEMBER', organizationId: org1.id },
  });

  await prisma.user.upsert({
    where: { id: 'admin-2' },
    update: {},
    create: { id: 'admin-2', name: 'Admin Two', role: 'ADMIN', organizationId: org2.id },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
