import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, name, color, icon, description } = body;

    if (type === 'income') {
      const updated = await prisma.incomeCategory.update({
        where: { id },
        data: { name, color },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const updated = await prisma.expenseCategory.update({
        where: { id },
        data: {
          name,
          color,
          icon: icon !== undefined ? icon : undefined,
          description: description !== undefined ? description : undefined,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'income') {
      await prisma.incomeCategory.delete({ where: { id } });
    } else {
      await prisma.expenseCategory.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
