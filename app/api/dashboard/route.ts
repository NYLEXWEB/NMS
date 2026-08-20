import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Client metrics
        const totalClients = await Client.countDocuments();
        const interestedClients = await Client.countDocuments({ status: 'Interested' });

        // Follow-ups due (today or past date)
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const followUpsDueCount = await Client.countDocuments({
            nextFollowUpDate: { $ne: null, $lte: endOfToday },
        });

        const upcomingFollowUps = await Client.find({
            nextFollowUpDate: { $ne: null, $lte: endOfToday },
        })
            .sort({ nextFollowUpDate: 1 })
            .limit(5);

        // 2. Project metrics
        const activeProjectsCount = await Client.countDocuments
            ? await Project.countDocuments({ status: { $ne: 'Completed' } })
            : 0;
        const completedProjectsCount = await Project.countDocuments({ status: 'Completed' });

        const activeProjects = await Project.find({ status: { $ne: 'Completed' } })
            .populate('clientId', 'clientName businessName')
            .sort({ updatedAt: -1 })
            .limit(5);

        // 3. Payments & Revenue metrics
        const payments = await Payment.find();
        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const projects = await Project.find();
        const projectPaymentsMap: Record<string, number> = {};
        payments.forEach((p) => {
            const pIdStr = p.projectId.toString();
            projectPaymentsMap[pIdStr] = (projectPaymentsMap[pIdStr] || 0) + p.amount;
        });

        let pendingPaymentsTotal = 0;
        projects.forEach((proj) => {
            const pIdStr = proj._id.toString();
            const paid = projectPaymentsMap[pIdStr] || 0;
            const pending = Math.max(0, proj.projectAmount - paid);
            if (pending > 0) {
                pendingPaymentsTotal += pending;
            }
        });

        // 4. Recent Invoices
        const recentInvoices = await Invoice.find()
            .populate('clientId', 'clientName businessName')
            .sort({ createdAt: -1 })
            .limit(5);

        // 5. Recent Activity
        const recentActivities = await Activity.find()
            .populate('clientId', 'clientName businessName')
            .sort({ date: -1 })
            .limit(8);

        return NextResponse.json({
            success: true,
            data: {
                metrics: {
                    totalClients,
                    interestedClients,
                    followUpsDue: followUpsDueCount,
                    activeProjects: activeProjectsCount,
                    completedProjects: completedProjectsCount,
                    pendingPayments: pendingPaymentsTotal,
                    totalRevenue,
                },
                upcomingFollowUps,
                recentActivities,
                recentInvoices,
                activeProjects,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
