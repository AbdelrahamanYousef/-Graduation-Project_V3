const { PrismaClient } = require('@prisma/client');
// const { Pool } = require('pg');
// const { PrismaPg } = require('@prisma/adapter-pg');

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    // adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;
