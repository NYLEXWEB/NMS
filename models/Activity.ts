import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
    clientId: mongoose.Types.ObjectId;
    type: 'WhatsApp' | 'Call' | 'Meeting' | 'Follow-up' | 'Note' | 'Status Change';
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
    {
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
        type: {
            type: String,
            enum: ['WhatsApp', 'Call', 'Meeting', 'Follow-up', 'Note', 'Status Change'],
            required: true,
        },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Activity: Model<IActivity> =
    mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
