import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { templateName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const templates = await Template.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: templates });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const { templateName, category, description, previewImage, demoUrl, sourceUrl, tags } = body;

        if (!templateName || !category) {
            return NextResponse.json(
                { success: false, error: 'Template Name and Category are required.' },
                { status: 400 }
            );
        }

        const template = await Template.create({
            templateName,
            category,
            description,
            previewImage,
            demoUrl,
            sourceUrl,
            tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        });

        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create template' },
            { status: 500 }
        );
    }
}
