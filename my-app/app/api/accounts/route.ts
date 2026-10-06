import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { AccountType } from '@prisma/client';

// GET all accounts
export async function GET() {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a new account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, bankName, accountNumber, branch, type, openingBalance, color, isDefault } = body;

    const account = await prisma.bankAccount.create({
      data: {
        name,
        bankName,
        accountNumber,
        branch,
        type: type === 'cash' ? AccountType.CASH : AccountType.BANK,
        openingBalance: openingBalance ?? 0,
        currentBalance: openingBalance ?? 0,
        color: color ?? '#3b82f6',
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
