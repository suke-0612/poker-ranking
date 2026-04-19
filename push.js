require('dotenv').config();
const { execSync } = require('child_process');
process.env.DATABASE_URL = process.env.DIRECT_URL;
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
