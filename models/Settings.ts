import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
    companyName: string;
    businessName: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    logo?: string;
    gstNumber?: string;
    defaultCurrency: string;
    invoicePrefix: string;
    defaultPaymentMethods: string[];
    defaultSupportPeriodDays: number;
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
    {
        companyName: { type: String, required: true, default: 'NYLEX' },
        businessName: { type: String, required: true, default: 'NYLEXWEB' },
        phone: { type: String, required: true, default: '+91 89214 42748' },
        email: { type: String, required: true, default: 'buildwithnylex@gmail.com' },
        website: { type: String, default: 'https://nylexweb.com' },
        address: { type: String, default: 'Kerala, India' },
        logo: { type: String, default: '' },
        gstNumber: { type: String, default: '' },
        defaultCurrency: { type: String, default: '₹' },
        invoicePrefix: { type: String, default: 'NXL-INV-' },
        defaultPaymentMethods: {
            type: [String],
            default: ['UPI', 'Bank Transfer', 'Cash', 'Other'],
        },
        defaultSupportPeriodDays: { type: Number, default: 7 },
    },
    { timestamps: true }
);

const Settings: Model<ISettings> =
    mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
