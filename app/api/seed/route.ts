import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import EmailTemplate from '@/models/EmailTemplate';
import Template from '@/models/Template';

export async function POST() {
    try {
        await dbConnect();

        // 1. Ensure default settings
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        // 2. Ensure default email template
        let emailTemplate = await EmailTemplate.findOne({ name: 'Project Completion Email' });
        if (!emailTemplate) {
            emailTemplate = await EmailTemplate.create({});
        }

        // 3. Optional sample templates if empty
        const templateCount = await Template.countDocuments();
        if (templateCount === 0) {
            await Template.insertMany([
                {
                    templateName: 'Modern Wedding Photography',
                    category: 'Photography',
                    description: 'Sleek dark-mode editorial layout designed for luxury wedding photographers.',
                    previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60',
                    demoUrl: 'https://example.com/demo-photography',
                    sourceUrl: 'https://github.com/example/photography-template',
                    tags: ['photography', 'dark-mode', 'gallery', 'portfolio'],
                },
                {
                    templateName: 'Retail & Fashion Boutique E-Commerce',
                    category: 'E-Commerce',
                    description: 'Minimalist high-converting e-commerce web application layout.',
                    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60',
                    demoUrl: 'https://example.com/demo-ecommerce',
                    sourceUrl: 'https://github.com/example/ecommerce-template',
                    tags: ['ecommerce', 'shop', 'fashion', 'tailwind'],
                },
            ]);
        }

        return NextResponse.json({
            success: true,
            message: 'Initial seed data verified successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to seed data' },
            { status: 500 }
        );
    }
}
