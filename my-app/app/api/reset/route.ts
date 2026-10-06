import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST() {
  try {
    // Delete all transactions and reset balances
    await prisma.transaction.deleteMany();
    
    // Reset account balances to their opening balances
    const accounts = await prisma.bankAccount.findMany();
    for (const acc of accounts) {
      await prisma.bankAccount.update({
        where: { id: acc.id },
        data: { currentBalance: acc.openingBalance },
      });
    }

    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
