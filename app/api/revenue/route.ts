import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Project from '@/models/Project';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Fetch all payments
        const payments = await Payment.find().sort({ date: -1 });

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        let thisYearRevenue = 0;

        const byType: Record<string, number> = {
            Advance: 0,
            Balance: 0,
            Complete: 0,
            Other: 0,
        };

        const byMethod: Record<string, number> = {
            UPI: 0,
            'Bank Transfer': 0,
            Cash: 0,
            Other: 0,
        };

        // Monthly breakdown structure for 12 months of current year
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const monthlyRevenue = monthNames.map((name) => ({ name, revenue: 0 }));

        payments.forEach((payment) => {
            const amt = payment.amount || 0;
            totalRevenue += amt;

            const pDate = new Date(payment.date);
            if (pDate.getFullYear() === currentYear) {
                thisYearRevenue += amt;
                const m = pDate.getMonth();
                monthlyRevenue[m].revenue += amt;

                if (m === currentMonth) {
                    thisMonthRevenue += amt;
                }
            }

            // Breakdown by Type
            const typeKey = payment.paymentType || 'Other';
            byType[typeKey] = (byType[typeKey] || 0) + amt;

            // Breakdown by Method
            const methodKey = payment.paymentMethod || 'UPI';
            byMethod[methodKey] = (byMethod[methodKey] || 0) + amt;
        });

        // 2. Calculate Pending Payments across projects
        const projects = await Project.find({ status: { $ne: 'Completed' } });
        const allProjects = await Project.find();

        // Group total payments by project
        const projectPaymentsMap: Record<string, number> = {};
        payments.forEach((p) => {
            const pIdStr = p.projectId.toString();
            projectPaymentsMap[pIdStr] = (projectPaymentsMap[pIdStr] || 0) + p.amount;
        });

        let totalPendingAmount = 0;
        const projectPendingList: any[] = [];

        allProjects.forEach((proj) => {
            const projIdStr = proj._id.toString();
            const totalPaid = projectPaymentsMap[projIdStr] || 0;
            const pending = Math.max(0, proj.projectAmount - totalPaid);
            if (pending > 0) {
                totalPendingAmount += pending;
                projectPendingList.push({
                    projectId: proj._id,
                    projectName: proj.projectName,
                    projectAmount: proj.projectAmount,
                    totalPaid,
                    pendingAmount: pending,
                    status: proj.status,
                });
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue,
                thisMonthRevenue,
                thisYearRevenue,
                totalPendingAmount,
                byType: [
                    { name: 'Advance Payment', amount: byType.Advance || 0 },
                    { name: 'Balance Payment', amount: byType.Balance || 0 },
                    { name: 'Complete / Other', amount: (byType.Complete || 0) + (byType.Other || 0) },
                ],
                byMethod: [
                    { name: 'UPI', amount: byMethod.UPI || 0 },
                    { name: 'Bank Transfer', amount: byMethod['Bank Transfer'] || 0 },
                    { name: 'Cash', amount: byMethod.Cash || 0 },
                    { name: 'Other', amount: byMethod.Other || 0 },
                ],
                monthlyRevenue,
                pendingProjects: projectPendingList,
                recentPayments: payments.slice(0, 10),
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to calculate revenue stats' },
            { status: 500 }
        );
    }
}
