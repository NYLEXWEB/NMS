import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
    clientName: string;
    businessName: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    location?: string;
    businessCategory?: string;
    interestedService?: string;
    status: 'Interested' | 'Follow-up' | 'Negotiation' | 'Confirmed' | 'Project Started' | 'Project Completed' | 'Lost' | 'Not Interested';
    notes?: string;
    nextFollowUpDate?: Date | null;
    followUpNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
    {
        clientName: { type: String, required: true, trim: true },
        businessName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        whatsapp: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        location: { type: String, trim: true },
        businessCategory: { type: String, trim: true, default: 'General' },
        interestedService: { type: String, trim: true, default: 'Web Design & Development' },
        status: {
            type: String,
            enum: [
                'Interested',
                'Follow-up',
                'Negotiation',
                'Confirmed',
                'Project Started',
                'Project Completed',
                'Lost',
                'Not Interested',
            ],
            default: 'Interested',
        },
        notes: { type: String },
        nextFollowUpDate: { type: Date, default: null },
        followUpNote: { type: String },
    },
    { timestamps: true }
);

const Client: Model<IClient> =
    mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
