require('dotenv').config();
const { initPrisma } = require('./db');

async function main() {
  console.log("🏁 Initializing database connection for seeding...");
  await initPrisma();
  console.log("✅ Seeding check completed!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Error during seeding:", err);
  process.exit(1);
});
