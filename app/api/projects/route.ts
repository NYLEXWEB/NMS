import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Client from '@/models/Client';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const clientId = searchParams.get('clientId') || '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (clientId) {
            query.clientId = clientId;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.projectName = { $regex: search, $options: 'i' };
        }

        const projects = await Project.find(query)
            .populate('clientId', 'clientName businessName phone email status')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: projects });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const {
            projectName,
            clientId,
            serviceType,
            projectAmount,
            startDate,
            deadline,
            status,
            liveUrl,
            githubUrl,
            hostingProvider,
            domainRegisteredEmail,
            notes,
        } = body;

        if (!projectName || !clientId || projectAmount === undefined) {
            return NextResponse.json(
                { success: false, error: 'Project Name, Client, and Project Amount are required.' },
                { status: 400 }
            );
        }

        const projectData: any = {
            projectName,
            clientId,
            serviceType: serviceType || 'Web Design & Development',
            projectAmount: Number(projectAmount) || 0,
            startDate: startDate ? new Date(startDate) : new Date(),
            status: status || 'Pending',
            liveUrl,
            githubUrl,
            hostingProvider,
            domainRegisteredEmail,
            notes,
        };

        if (deadline) {
            projectData.deadline = new Date(deadline);
        }

        const project: any = await Project.create(projectData);

        // Update client status to 'Project Started' if currently 'Confirmed' or 'Interested'
        const client = await Client.findById(clientId);
        if (client && ['Interested', 'Follow-up', 'Negotiation', 'Confirmed'].includes(client.status)) {
            client.status = 'Project Started';
            await client.save();
        }

        // Log Activity
        await Activity.create({
            clientId,
            type: 'Note',
            description: `Project '${projectName}' created for ₹${projectAmount}. Status: '${project.status}'.`,
            date: new Date(),
        });

        return NextResponse.json({ success: true, data: project }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create project' },
            { status: 500 }
        );
    }
}
