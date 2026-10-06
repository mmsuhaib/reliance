import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { AccountType } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, bankName, accountNumber, branch, type, openingBalance, currentBalance, color, isDefault } = body;

    const updated = await prisma.bankAccount.update({
      where: { id },
      data: {
        name,
        bankName: bankName !== undefined ? bankName : undefined,
        accountNumber: accountNumber !== undefined ? accountNumber : undefined,
        branch: branch !== undefined ? branch : undefined,
        type: type ? (type === 'cash' ? AccountType.CASH : AccountType.BANK) : undefined,
        openingBalance: openingBalance !== undefined ? Number(openingBalance) : undefined,
        currentBalance: currentBalance !== undefined ? Number(currentBalance) : undefined,
        color: color !== undefined ? color : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.bankAccount.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
