const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.queueItem.deleteMany();
  await prisma.video.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
      role: "USER",
      settings: {
        create: {
          apiKey: "demo-api-key",
          defaultResolution: "1080p",
          defaultRatio: "9:16",
          defaultModel: "seedance-2.0",
          defaultDuration: "5s",
        },
      },
    },
  });

  console.log("✓ Seeded database with demo user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });