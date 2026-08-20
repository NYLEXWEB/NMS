import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailTemplate extends Document {
    name: string;
    subject: string;
    templateText: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DEFAULT_EMAIL_BODY = `Dear Sir,

We are pleased to inform you that your website project has been successfully completed and is now live.

Project Details

Project Completion Date: [PROJECT_COMPLETION_DATE]

Live Website

[PROJECT_LIVE_URL]

Source Code & Project Files

Complete Source Code:
[PROJECT_GITHUB_URL]

Hosting Details

Hosting Provider: [HOSTING_PROVIDER]

Domain Purchase Account

Registered Email: [DOMAIN_REGISTERED_EMAIL]

Free Support

A 7-day free support period is included from the project completion date ([PROJECT_COMPLETION_DATE]). During this period, we will provide assistance with fixes, technical support, and guidance related to the delivered website.

Contact Details

NYLEX – Web Design & Development

+91 89214 42748
buildwithnylex@gmail.com

Thank you for choosing NYLEX. We sincerely appreciate your trust and support. It was a pleasure working with you, and we look forward to serving you again in the future.

Kind Regards,

NYLEXWEB
Web Design & Development`;

const EmailTemplateSchema = new Schema<IEmailTemplate>(
    {
        name: { type: String, required: true, unique: true, default: 'Project Completion Email' },
        subject: { type: String, required: true, default: 'Project Completion Notification - NYLEX' },
        templateText: { type: String, required: true, default: DEFAULT_EMAIL_BODY },
        isDefault: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const EmailTemplate: Model<IEmailTemplate> =
    mongoose.models.EmailTemplate ||
    mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
