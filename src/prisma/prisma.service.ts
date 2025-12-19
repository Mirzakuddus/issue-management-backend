import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// adapter for sqlite (Prisma v7 no-rust engine)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Provide an adapter instance for Prisma v7 (better-sqlite3)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
