import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    clientId: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    paymentType: 'Advance Payment' | 'Balance Payment' | 'Complete Payment';
    invoiceDate: Date;
    paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';
    items: IInvoiceItem[];
    subtotal: number;
    gst: number;
    discount: number;
    total: number;
    status: 'Paid' | 'Sent' | 'Draft';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },
});

const InvoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: { type: String, required: true, unique: true, index: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
        paymentType: {
            type: String,
            enum: ['Advance Payment', 'Balance Payment', 'Complete Payment'],
            required: true,
        },
        invoiceDate: { type: Date, default: Date.now },
        paymentMethod: {
            type: String,
            enum: ['UPI', 'Bank Transfer', 'Cash', 'Other'],
            default: 'UPI',
        },
        items: [InvoiceItemSchema],
        subtotal: { type: Number, required: true, default: 0 },
        gst: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true, default: 0 },
        status: {
            type: String,
            enum: ['Paid', 'Sent', 'Draft'],
            default: 'Paid',
        },
        notes: { type: String },
    },
    { timestamps: true }
);

const Invoice: Model<IInvoice> =
    mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
