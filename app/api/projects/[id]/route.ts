import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Client from '@/models/Client';
import Activity from '@/models/Activity';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const project = await Project.findById(id).populate('clientId');
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        const payments = await Payment.find({ projectId: id }).sort({ date: -1 });
        const invoices = await Invoice.find({ projectId: id }).sort({ createdAt: -1 });

        // Calculate total received payments for this project
        const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = Math.max(0, project.projectAmount - totalReceived);

        return NextResponse.json({
            success: true,
            data: {
                project,
                payments,
                invoices,
                totalReceived,
                pendingAmount,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const existingProject = await Project.findById(id);
        if (!existingProject) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        const oldStatus = existingProject.status;
        const newStatus = body.status;

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            {
                ...body,
                startDate: body.startDate ? new Date(body.startDate) : existingProject.startDate,
                deadline: body.deadline ? new Date(body.deadline) : null,
            },
            { new: true, runValidators: true }
        );

        // If status changed to Completed, update Client status and log activity
        if (newStatus && oldStatus !== newStatus) {
            if (newStatus === 'Completed') {
                await Client.findByIdAndUpdate(existingProject.clientId, {
                    status: 'Project Completed',
                });
                await Activity.create({
                    clientId: existingProject.clientId,
                    type: 'Status Change',
                    description: `Project '${existingProject.projectName}' marked as Completed.`,
                    date: new Date(),
                });
            } else {
                await Activity.create({
                    clientId: existingProject.clientId,
                    type: 'Status Change',
                    description: `Project '${existingProject.projectName}' status updated from '${oldStatus}' to '${newStatus}'.`,
                    date: new Date(),
                });
            }
        }

        return NextResponse.json({ success: true, data: updatedProject });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete project' },
            { status: 500 }
        );
    }
}
