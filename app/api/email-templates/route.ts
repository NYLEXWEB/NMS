import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';

export async function GET() {
    try {
        await dbConnect();

        let template = await EmailTemplate.findOne({ name: 'Project Completion Email' });
        if (!template) {
            template = await EmailTemplate.create({});
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch email template' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const { subject, templateText } = body;

        let template = await EmailTemplate.findOne({ name: 'Project Completion Email' });
        if (!template) {
            template = await EmailTemplate.create({ subject, templateText });
        } else {
            if (subject !== undefined) template.subject = subject;
            if (templateText !== undefined) template.templateText = templateText;
            await template.save();
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update email template' },
            { status: 500 }
        );
    }
}
