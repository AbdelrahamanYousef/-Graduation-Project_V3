const app = require('./app');
const config = require('./config');
const prisma = require('./lib/prisma');

async function main() {
    // Test database connection
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }

    app.listen(config.port, () => {
        console.log(`🚀 Nour Backend running on http://localhost:${config.port}`);
        console.log(`📋 API docs: http://localhost:${config.port}/api/v1`);
        console.log(`🔧 Environment: ${config.nodeEnv}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});

main();
