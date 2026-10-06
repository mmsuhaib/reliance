import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { TransactionType } from '@prisma/client';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    const amount = Number(existingTx.amount);

    // Revert account balances in transaction
    await prisma.$transaction(async (tx) => {
      if (existingTx.type === TransactionType.INCOME) {
        await tx.bankAccount.update({
          where: { id: existingTx.accountId },
          data: { currentBalance: { decrement: amount } },
        });
      } else if (existingTx.type === TransactionType.EXPENSE) {
        await tx.bankAccount.update({
          where: { id: existingTx.accountId },
          data: { currentBalance: { increment: amount } },
        });
      } else if (existingTx.type === TransactionType.TRANSFER && existingTx.toAccountId) {
        await tx.bankAccount.update({
          where: { id: existingTx.accountId },
          data: { currentBalance: { increment: amount } },
        });
        await tx.bankAccount.update({
          where: { id: existingTx.toAccountId },
          data: { currentBalance: { decrement: amount } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      amount,
      accountId,
      toAccountId,
      categoryId,
      categoryName,
      description,
      notes,
      referenceNumber,
      date,
    } = body;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    const oldAmount = Number(existingTx.amount);
    const newAmount = amount !== undefined ? Number(amount) : oldAmount;

    // Update with balance recalculation
    const updated = await prisma.$transaction(async (tx) => {
      // Revert old transaction effect
      if (existingTx.type === TransactionType.INCOME) {
        await tx.bankAccount.update({
          where: { id: existingTx.accountId },
          data: { currentBalance: { decrement: oldAmount } },
        });
      } else if (existingTx.type === TransactionType.EXPENSE) {
        await tx.bankAccount.update({
          where: { id: existingTx.accountId },
          data: { currentBalance: { increment: oldAmount } },
        });
      } else if (existingTx.type === TransactionType.TRANSFER && existingTx.toAccountId) {
        await tx.bankAccount.update({
          where: { id: existingTx.accountId },
          data: { currentBalance: { increment: oldAmount } },
        });
        await tx.bankAccount.update({
          where: { id: existingTx.toAccountId },
          data: { currentBalance: { decrement: oldAmount } },
        });
      }

      // Apply new transaction effect
      const targetAccountId = accountId || existingTx.accountId;
      const targetToAccountId = toAccountId !== undefined ? toAccountId : existingTx.toAccountId;

      if (existingTx.type === TransactionType.INCOME) {
        await tx.bankAccount.update({
          where: { id: targetAccountId },
          data: { currentBalance: { increment: newAmount } },
        });
      } else if (existingTx.type === TransactionType.EXPENSE) {
        await tx.bankAccount.update({
          where: { id: targetAccountId },
          data: { currentBalance: { decrement: newAmount } },
        });
      } else if (existingTx.type === TransactionType.TRANSFER && targetToAccountId) {
        await tx.bankAccount.update({
          where: { id: targetAccountId },
          data: { currentBalance: { decrement: newAmount } },
        });
        await tx.bankAccount.update({
          where: { id: targetToAccountId },
          data: { currentBalance: { increment: newAmount } },
        });
      }

      return tx.transaction.update({
        where: { id },
        data: {
          amount: newAmount,
          accountId: targetAccountId,
          toAccountId: targetToAccountId || null,
          categoryId: categoryId !== undefined ? categoryId : existingTx.categoryId,
          categoryName: categoryName !== undefined ? categoryName : existingTx.categoryName,
          description: description || existingTx.description,
          notes: notes !== undefined ? notes : existingTx.notes,
          referenceNumber: referenceNumber !== undefined ? referenceNumber : existingTx.referenceNumber,
          date: date ? new Date(date) : existingTx.date,
        },
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
