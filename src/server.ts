import { createApp } from "./app";
import { env } from "./configs/env.config";
import { prisma } from "./configs/database.config";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${env.PORT}`);
  console.log(`📡 Lingkungan: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health`);
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Menerima sinyal ${signal}. Menutup server secara aman...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("💾 Koneksi database berhasil ditutup.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Kesalahan saat menutup koneksi database:", err);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

