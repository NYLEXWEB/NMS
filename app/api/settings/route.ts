import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
    try {
        await dbConnect();
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(body);
        } else {
            settings = await Settings.findByIdAndUpdate(settings._id, body, {
                new: true,
                runValidators: true,
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update settings' },
            { status: 500 }
        );
    }
}
