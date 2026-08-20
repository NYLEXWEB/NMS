import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const template = await Template.findById(id);
        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch template' },
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

        if (body.tags && typeof body.tags === 'string') {
            body.tags = body.tags.split(',').map((t: string) => t.trim());
        }

        const template = await Template.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update template' },
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

        const template = await Template.findByIdAndDelete(id);
        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete template' },
            { status: 500 }
        );
    }
}
