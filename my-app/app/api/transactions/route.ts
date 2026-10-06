import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { TransactionType } from '@prisma/client';

// GET transactions (with optional date filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const whereClause: any = {};
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        toAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create transaction & update account balances atomically
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
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

    const parsedAmount = Number(amount);
    const txTypeEnum = type.toUpperCase() as TransactionType;

    // Run transaction and account balance updates in a Prisma interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      const transactionRecord = await tx.transaction.create({
        data: {
          type: txTypeEnum,
          amount: parsedAmount,
          accountId,
          toAccountId: toAccountId || null,
          categoryId: categoryId || null,
          categoryName: categoryName || null,
          description,
          notes: notes || null,
          referenceNumber: referenceNumber || null,
          date: date ? new Date(date) : new Date(),
        },
      });

      // Update account balances based on transaction type
      if (txTypeEnum === TransactionType.INCOME) {
        await tx.bankAccount.update({
          where: { id: accountId },
          data: { currentBalance: { increment: parsedAmount } },
        });
      } else if (txTypeEnum === TransactionType.EXPENSE) {
        await tx.bankAccount.update({
          where: { id: accountId },
          data: { currentBalance: { decrement: parsedAmount } },
        });
      } else if (txTypeEnum === TransactionType.TRANSFER && toAccountId) {
        await tx.bankAccount.update({
          where: { id: accountId },
          data: { currentBalance: { decrement: parsedAmount } },
        });
        await tx.bankAccount.update({
          where: { id: toAccountId },
          data: { currentBalance: { increment: parsedAmount } },
        });
      }

      return transactionRecord;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
