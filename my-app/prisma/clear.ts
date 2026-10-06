import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all database data...');

  // Delete transactions first (due to foreign key constraints)
  const deletedTxs = await prisma.transaction.deleteMany();
  console.log(`🗑️ Deleted ${deletedTxs.count} transactions`);

  // Delete categories
  const deletedExpenseCats = await prisma.expenseCategory.deleteMany();
  console.log(`🗑️ Deleted ${deletedExpenseCats.count} expense categories`);

  const deletedIncomeCats = await prisma.incomeCategory.deleteMany();
  console.log(`🗑️ Deleted ${deletedIncomeCats.count} income categories`);

  // Delete bank accounts
  const deletedAccounts = await prisma.bankAccount.deleteMany();
  console.log(`🗑️ Deleted ${deletedAccounts.count} bank accounts`);

  console.log('✨ All database tables cleared successfully!');
}

main()
  .catch((e) => {
    console.error('Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
