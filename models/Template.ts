import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplate extends Document {
    templateName: string;
    category: string;
    description?: string;
    previewImage?: string;
    demoUrl?: string;
    sourceUrl?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
    {
        templateName: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true, default: 'General' },
        description: { type: String },
        previewImage: { type: String, trim: true },
        demoUrl: { type: String, trim: true },
        sourceUrl: { type: String, trim: true },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

const Template: Model<ITemplate> =
    mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;
