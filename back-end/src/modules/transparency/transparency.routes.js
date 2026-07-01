const { Router } = require('express');
const prisma = require('../../lib/prisma');
const { authAdmin } = require('../../middleware/auth');

const router = Router();

// GET /api/transparency - Get all stats and auditors
router.get('/', async (req, res, next) => {
    try {
        // 1. Get total successful donations
        const revenue = await prisma.donation.aggregate({
            where: { status: 'SUCCESS' },
            _sum: { amount: true }
        });
        const totalDonations = Number(revenue._sum.amount || 0);

        // 2. Fetch all disbursements sum
        const disbursements = await prisma.disbursement.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const dbDisbursements = Number(disbursements._sum.amount || 0);

        // 3. Fetch all programs to calculate program expenses
        const programs = await prisma.program.findMany({
            where: { deletedAt: null },
            include: {
                beneficiaries: {
                    select: {
                        disbursements: {
                            where: { status: 'COMPLETED' },
                            select: { amount: true }
                        }
                    }
                }
            }
        });

        let totalDbProgramExpenses = 0;
        const rawProgramBreakdown = programs.map(p => {
            let spent = 0;
            p.beneficiaries.forEach(b => {
                b.disbursements.forEach(d => {
                    spent += Number(d.amount);
                });
            });
            
            totalDbProgramExpenses += spent;
            return {
                name: p.name,
                amount: spent,
                color: p.color
            };
        });

        // 4. Compute dynamic expenses based on actual disbursements
        const programExpenses = dbDisbursements;
        const adminExpenses = Math.round(dbDisbursements * 0.09); // 9% admin cost
        const fundraisingExpenses = Math.round(dbDisbursements * 0.03); // 3% fundraising cost
        const totalSpent = programExpenses + adminExpenses + fundraisingExpenses;

        // 5. Calculate percentages for program breakdown
        const programBreakdown = rawProgramBreakdown.map(item => {
            const percentage = totalDbProgramExpenses > 0 ? Math.round((item.amount / totalDbProgramExpenses) * 100) : 0;
            return {
                ...item,
                percentage
            };
        }).sort((a, b) => b.amount - a.amount); // Sort by highest spent first

        // 6. Get beneficiaries count
        const beneficiaries = await prisma.beneficiary.count({
            where: { deletedAt: null }
        });

        // 7. Get auditors count
        const auditorsList = await prisma.auditReport.findMany({
            orderBy: { year: 'desc' }
        });

        res.json({
            financialData: {
                totalDonations,
                totalSpent,
                programExpenses,
                adminExpenses,
                fundraisingExpenses,
                beneficiaries
            },
            programBreakdown,
            auditors: auditorsList
        });
    } catch (e) {
        next(e);
    }
});

// Admin endpoints for external audit reports
// GET /api/transparency/auditors
router.get('/auditors', async (req, res, next) => {
    try {
        const list = await prisma.auditReport.findMany({
            orderBy: { year: 'desc' }
        });
        res.json(list);
    } catch (e) {
        next(e);
    }
});

// POST /api/transparency/auditors (Admin only)
router.post('/auditors', authAdmin, async (req, res, next) => {
    try {
        const { year, firm, status, fileUrl } = req.body;
        const report = await prisma.auditReport.create({
            data: { year, firm, status, fileUrl }
        });
        res.json(report);
    } catch (e) {
        next(e);
    }
});

// PUT /api/transparency/auditors/:id (Admin only)
router.put('/auditors/:id', authAdmin, async (req, res, next) => {
    try {
        const { year, firm, status, fileUrl } = req.body;
        const report = await prisma.auditReport.update({
            where: { id: req.params.id },
            data: { year, firm, status, fileUrl }
        });
        res.json(report);
    } catch (e) {
        next(e);
    }
});

// DELETE /api/transparency/auditors/:id (Admin only)
router.delete('/auditors/:id', authAdmin, async (req, res, next) => {
    try {
        await prisma.auditReport.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
