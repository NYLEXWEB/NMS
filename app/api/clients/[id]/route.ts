import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Activity from '@/models/Activity';
import Project from '@/models/Project';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const client = await Client.findById(id);
        if (!client) {
            return NextResponse.json(
                { success: false, error: 'Client not found' },
                { status: 404 }
            );
        }

        const activities = await Activity.find({ clientId: id }).sort({ date: -1 });
        const projects = await Project.find({ clientId: id }).sort({ createdAt: -1 });
        const payments = await Payment.find({ clientId: id }).sort({ date: -1 });
        const invoices = await Invoice.find({ clientId: id }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: {
                client,
                activities,
                projects,
                payments,
                invoices,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch client details' },
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

        const existingClient = await Client.findById(id);
        if (!existingClient) {
            return NextResponse.json(
                { success: false, error: 'Client not found' },
                { status: 404 }
            );
        }

        const oldStatus = existingClient.status;
        const newStatus = body.status;

        const updatedClient = await Client.findByIdAndUpdate(
            id,
            {
                ...body,
                nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null,
            },
            { new: true, runValidators: true }
        );

        // If status changed, log an activity
        if (newStatus && oldStatus !== newStatus) {
            await Activity.create({
                clientId: id,
                type: 'Status Change',
                description: `Status changed from '${oldStatus}' to '${newStatus}'.`,
                date: new Date(),
            });
        }

        return NextResponse.json({ success: true, data: updatedClient });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update client' },
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

        const client = await Client.findByIdAndDelete(id);
        if (!client) {
            return NextResponse.json(
                { success: false, error: 'Client not found' },
                { status: 404 }
            );
        }

        // Clean up related activities
        await Activity.deleteMany({ clientId: id });

        return NextResponse.json({
            success: true,
            message: 'Client and associated activities deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete client' },
            { status: 500 }
        );
    }
}
