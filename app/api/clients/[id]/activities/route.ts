import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Activity from '@/models/Activity';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const activities = await Activity.find({ clientId: id }).sort({ date: -1 });
        return NextResponse.json({ success: true, data: activities });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const { type, description, date, nextFollowUpDate, followUpNote } = body;

        if (!type || !description) {
            return NextResponse.json(
                { success: false, error: 'Activity type and description are required.' },
                { status: 400 }
            );
        }

        const activityDate = date ? new Date(date) : new Date();

        const activity = await Activity.create({
            clientId: id,
            type,
            description,
            date: activityDate,
        });

        // Update client follow-up info if provided
        const updateData: any = { updatedAt: new Date() };
        if (nextFollowUpDate !== undefined) {
            updateData.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
        }
        if (followUpNote !== undefined) {
            updateData.followUpNote = followUpNote;
        }

        await Client.findByIdAndUpdate(id, updateData);

        return NextResponse.json({ success: true, data: activity }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to add activity' },
            { status: 500 }
        );
    }
}
