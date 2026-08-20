import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Settings from '@/models/Settings';
import Payment from '@/models/Payment';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const paymentType = searchParams.get('paymentType') || '';
        const clientId = searchParams.get('clientId') || '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (clientId) query.clientId = clientId;
        if (paymentType && paymentType !== 'all') query.paymentType = paymentType;
        if (search) {
            query.invoiceNumber = { $regex: search, $options: 'i' };
        }

        const invoices = await Invoice.find(query)
            .populate('clientId', 'clientName businessName phone email location')
            .populate('projectId', 'projectName projectAmount')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: invoices });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const {
            clientId,
            projectId,
            paymentType,
            invoiceDate,
            paymentMethod,
            items,
            gst,
            discount,
            status,
            notes,
            recordPayment,
        } = body;

        if (!clientId || !paymentType || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Client, Payment Type, and at least one Item are required.' },
                { status: 400 }
            );
        }

        // 1. Fetch settings for invoice prefix
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        const prefix = settings.invoicePrefix || 'NXL-INV-';

        // 2. Generate unique Invoice Number server-side
        const count = await Invoice.countDocuments();
        let invoiceNumber = `${prefix}${String(count + 1).padStart(3, '0')}`;

        // Verify uniqueness just in case
        let existing = await Invoice.findOne({ invoiceNumber });
        let attempts = 1;
        while (existing) {
            invoiceNumber = `${prefix}${String(count + 1 + attempts).padStart(3, '0')}`;
            existing = await Invoice.findOne({ invoiceNumber });
            attempts++;
        }

        // 3. Calculate Totals
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedItems = items.map((item: any) => {
            const qty = Number(item.quantity) || 1;
            const rate = Number(item.rate) || 0;
            return {
                description: item.description,
                quantity: qty,
                rate: rate,
                amount: qty * rate,
            };
        });

        const subtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);
        const gstVal = Number(gst) || 0;
        const discountVal = Number(discount) || 0;
        const total = Math.max(0, subtotal + gstVal - discountVal);

        const invoice = await Invoice.create({
            invoiceNumber,
            clientId,
            projectId: projectId || null,
            paymentType,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
            paymentMethod: paymentMethod || 'UPI',
            items: processedItems,
            subtotal,
            gst: gstVal,
            discount: discountVal,
            total,
            status: status || 'Paid',
            notes,
        });

        // 4. If recordPayment is requested and status is Paid, record actual Payment
        // Notice rule 16 & 38: Advance and Balance represent actual money received.
        // Complete Payment invoice is only recorded as a payment if specified.
        if (recordPayment && (status === 'Paid' || !status) && projectId) {
            let pType: 'Advance' | 'Balance' | 'Complete' | 'Other' = 'Other';
            if (paymentType.includes('Advance')) pType = 'Advance';
            else if (paymentType.includes('Balance')) pType = 'Balance';
            else if (paymentType.includes('Complete')) pType = 'Complete';

            await Payment.create({
                amount: total,
                paymentType: pType,
                paymentMethod: paymentMethod || 'UPI',
                date: invoiceDate ? new Date(invoiceDate) : new Date(),
                clientId,
                projectId,
                invoiceId: invoice._id,
                notes: `Recorded automatically from Invoice ${invoiceNumber}`,
            });
        }

        // Log Activity
        await Activity.create({
            clientId,
            type: 'Note',
            description: `Generated ${paymentType} invoice '${invoiceNumber}' for ₹${total.toLocaleString('en-IN')}.`,
            date: new Date(),
        });

        return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
