import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hashPassword, canManageUsers } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!canManageUsers(session) && session?.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.department) updateData.department = body.department;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    // Role and active status can only be modified by ADMIN
    if (canManageUsers(session)) {
      if (body.role) updateData.role = body.role;
      if (body.active !== undefined) updateData.active = Boolean(body.active);
    }

    if (body.password) {
      updateData.passwordHash = await hashPassword(body.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        active: true,
        avatar: true,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: params.id,
      metadata: { name: updatedUser.name, role: updatedUser.role, active: updatedUser.active },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!canManageUsers(session)) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    if (session?.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const user = await prisma.user.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'USER_DELETED',
      entity: 'User',
      entityId: params.id,
      metadata: { name: user.name, email: user.email },
    });

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
