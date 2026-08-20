import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Project from '@/models/Project';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');
        const clientId = searchParams.get('clientId');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (projectId) query.projectId = projectId;
        if (clientId) query.clientId = clientId;

        const payments = await Payment.find(query)
            .populate('clientId', 'clientName businessName')
            .populate('projectId', 'projectName projectAmount')
            .sort({ date: -1 });

        return NextResponse.json({ success: true, data: payments });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const {
            amount,
            paymentType,
            paymentMethod,
            date,
            clientId,
            projectId,
            invoiceId,
            notes,
        } = body;

        if (!amount || amount <= 0 || !clientId || !projectId || !paymentType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Valid payment amount, client, project, and payment type are required.',
                },
                { status: 400 }
            );
        }

        const payment = await Payment.create({
            amount: Number(amount),
            paymentType,
            paymentMethod: paymentMethod || 'UPI',
            date: date ? new Date(date) : new Date(),
            clientId,
            projectId,
            invoiceId: invoiceId || null,
            notes,
        });

        // Log Activity on client timeline
        const project = await Project.findById(projectId);
        const projectName = project ? project.projectName : 'Project';

        await Activity.create({
            clientId,
            type: 'Note',
            description: `Payment of ₹${amount.toLocaleString('en-IN')} (${paymentType}) received via ${paymentMethod || 'UPI'} for '${projectName}'.`,
            date: new Date(),
        });

        return NextResponse.json({ success: true, data: payment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to record payment' },
            { status: 500 }
        );
    }
}
