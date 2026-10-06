import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const [expenseCategories, incomeCategories] = await Promise.all([
      prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } }),
      prisma.incomeCategory.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        expenseCategories,
        incomeCategories,
      },
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, color, icon, description, isSystem } = body;

    if (type === 'income') {
      const created = await prisma.incomeCategory.create({
        data: { name, color: color || '#10b981' },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } else {
      const created = await prisma.expenseCategory.create({
        data: {
          name,
          color: color || '#ef4444',
          icon: icon || null,
          description: description || null,
          isSystem: isSystem || false,
        },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
