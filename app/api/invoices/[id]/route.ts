import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Settings from '@/models/Settings';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const invoice = await Invoice.findById(id)
            .populate('clientId')
            .populate('projectId');

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        return NextResponse.json({
            success: true,
            data: {
                invoice,
                settings,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch invoice' },
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

        const invoice = await Invoice.findByIdAndDelete(id);
        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete invoice' },
            { status: 500 }
        );
    }
}
