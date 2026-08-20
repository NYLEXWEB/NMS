import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const category = searchParams.get('category') || '';

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (category && category !== 'all') {
            query.businessCategory = category;
        }

        const clients = await Client.find(query).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: clients });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const {
            clientName,
            businessName,
            phone,
            whatsapp,
            email,
            location,
            businessCategory,
            interestedService,
            status,
            notes,
            nextFollowUpDate,
            followUpNote,
        } = body;

        if (!clientName || !businessName || !phone) {
            return NextResponse.json(
                { success: false, error: 'Client Name, Business Name, and Phone are required.' },
                { status: 400 }
            );
        }

        const client = await Client.create({
            clientName,
            businessName,
            phone,
            whatsapp: whatsapp || phone,
            email,
            location,
            businessCategory: businessCategory || 'General',
            interestedService: interestedService || 'Web Design & Development',
            status: status || 'Interested',
            notes,
            nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
            followUpNote,
        });

        // Automatically create initial activity timeline record
        await Activity.create({
            clientId: client._id,
            type: 'Note',
            description: `Client profile created with status '${client.status}'.`,
            date: new Date(),
        });

        return NextResponse.json({ success: true, data: client }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create client' },
            { status: 500 }
        );
    }
}
