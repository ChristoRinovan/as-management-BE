import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan seeder awal...");

  const existingLead = await prisma.user.findFirst({
    where: { role: Role.LEAD },
  });

  if (existingLead) {
    console.log(`ℹ️ Akun Ketua Tim sudah ada: ${existingLead.email}`);
    return;
  }

  const defaultPassword = "Password123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const lead = await prisma.user.create({
    data: {
      email: "ketua@tim.com",
      name: "Ketua Tim",
      password: passwordHash,
      role: Role.LEAD,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Akun Ketua Tim awal berhasil dibuat:");
  console.log(`   Email   : ${lead.email}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`   Role    : ${lead.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal menjalankan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

