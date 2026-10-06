import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-cash-1',
    name: 'Main Cash Drawer',
    type: AccountType.CASH,
    openingBalance: 25000,
    currentBalance: 25000,
    color: '#10b981',
    isDefault: true,
  },
  {
    id: 'acc-comb-1',
    name: 'Commercial Bank - Main Current',
    bankName: 'Commercial Bank of Ceylon',
    accountNumber: '8004921004',
    branch: 'Colombo 03',
    type: AccountType.BANK,
    openingBalance: 450000,
    currentBalance: 450000,
    color: '#3b82f6',
    isDefault: false,
  },
  {
    id: 'acc-hnb-1',
    name: 'HNB - Card POS Merchant',
    bankName: 'Hatton National Bank',
    accountNumber: '1092847291',
    branch: 'Kollupitiya',
    type: AccountType.BANK,
    openingBalance: 185000,
    currentBalance: 185000,
    color: '#8b5cf6',
    isDefault: false,
  },
  {
    id: 'acc-sampath-1',
    name: 'Sampath Bank - Online & Web Orders',
    bankName: 'Sampath Bank',
    accountNumber: '0039281726',
    branch: 'Bambalapitiya',
    type: AccountType.BANK,
    openingBalance: 120000,
    currentBalance: 120000,
    color: '#f59e0b',
    isDefault: false,
  },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat-rent', name: 'Shop Rent & Lease', color: '#ef4444', isSystem: true, description: 'Monthly showroom and warehouse rent' },
  { id: 'cat-elec', name: 'Electricity & Utilities', color: '#f97316', isSystem: true, description: 'CEB electricity bill, water & internet' },
  { id: 'cat-salary', name: 'Staff Salaries & Wages', color: '#84cc16', isSystem: true, description: 'Sales assistants and master tailor pay' },
  { id: 'cat-tailor', name: 'Tailoring & Alteration Supplies', color: '#06b6d4', isSystem: true, description: 'Threads, buttons, zippers, linings' },
  { id: 'cat-transport', name: 'Transport & Courier Delivery', color: '#6366f1', isSystem: true, description: 'Pronto, Domex courier & fabric transport' },
  { id: 'cat-maint', name: 'Store Maintenance & Cleaning', color: '#ec4899', isSystem: true, description: 'AC service, lighting repairs, detergents' },
  { id: 'cat-pack', name: 'Packaging, Bags & Labels', color: '#14b8a6', isSystem: false, description: 'Branded carry bags, price tags & boxes' },
  { id: 'cat-marketing', name: 'Social Media Ads & Promo', color: '#a855f7', isSystem: false, description: 'Facebook/Instagram dress promotion ads' },
  { id: 'cat-tea', name: 'Tea & Staff Refreshments', color: '#eab308', isSystem: false, description: 'Daily tea, water dispenser and snacks' },
  { id: 'cat-other', name: 'Other Miscellaneous Expenses', color: '#64748b', isSystem: true, description: 'Incidental daily shop expenses' },
];

const DEFAULT_INCOME_SOURCES = [
  { id: 'inc-sales', name: 'Showroom & Retail Sales', color: '#10b981' },
  { id: 'inc-tailor-adv', name: 'Custom Tailoring Advance', color: '#3b82f6' },
  { id: 'inc-bulk', name: 'Wholesale / Bridal Bulk Order', color: '#8b5cf6' },
  { id: 'inc-scrap', name: 'Fabric Cut Piece / Scrap Sale', color: '#f59e0b' },
  { id: 'inc-other', name: 'Other Direct Income', color: '#06b6d4' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  for (const account of DEFAULT_ACCOUNTS) {
    await prisma.bankAccount.upsert({
      where: { id: account.id },
      update: {},
      create: account,
    });
  }
  console.log('✅ Bank accounts seeded');

  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Expense categories seeded');

  for (const inc of DEFAULT_INCOME_SOURCES) {
    await prisma.incomeCategory.upsert({
      where: { id: inc.id },
      update: {},
      create: inc,
    });
  }
  console.log('✅ Income categories seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
