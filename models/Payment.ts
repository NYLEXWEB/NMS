import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
    amount: number;
    paymentType: 'Advance' | 'Balance' | 'Complete' | 'Other';
    paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';
    date: Date;
    clientId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    invoiceId?: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        amount: { type: Number, required: true, min: 0 },
        paymentType: {
            type: String,
            enum: ['Advance', 'Balance', 'Complete', 'Other'],
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['UPI', 'Bank Transfer', 'Cash', 'Other'],
            default: 'UPI',
        },
        date: { type: Date, default: Date.now },
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
        notes: { type: String },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> =
    mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
