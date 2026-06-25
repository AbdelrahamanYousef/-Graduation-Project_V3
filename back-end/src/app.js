const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const programRoutes = require('./modules/programs/programs.routes');
const projectRoutes = require('./modules/projects/projects.routes');
const donationRoutes = require('./modules/donations/donations.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const beneficiaryRoutes = require('./modules/beneficiaries/beneficiaries.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const reportRoutes = require('./modules/reports/reports.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const volunteerRoutes = require('./modules/volunteers/volunteers.routes');
const contactRoutes = require('./modules/contact/contact.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const userRoutes = require('./modules/users/users.routes');
const accountRoutes = require('./modules/account/account.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const reconciliationRoutes = require('./modules/reconciliation/reconciliation.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const specialRequestRoutes = require('./modules/special-requests/specialRequests.routes');
const campaignRoutes = require('./modules/campaigns/campaigns.routes');

const app = express();

// ─── Global Middleware ──────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

// ─── API Routes ─────────────────────────────────────
const api = express.Router();

api.use('/auth', authRoutes);
api.use('/programs', programRoutes);
api.use('/projects', projectRoutes);
api.use('/donations', donationRoutes);
api.use('/payments', paymentRoutes);
api.use('/beneficiaries', beneficiaryRoutes);
api.use('/finance', financeRoutes);
api.use('/reports', reportRoutes);
api.use('/dashboard', dashboardRoutes);
api.use('/notifications', notificationRoutes);
api.use('/volunteers', volunteerRoutes);
api.use('/contact', contactRoutes);
api.use('/settings', settingsRoutes);
api.use('/users', userRoutes);
api.use('/donor', accountRoutes);
api.use('/audit-logs', auditRoutes);
api.use('/reconciliation', reconciliationRoutes);
api.use('/upload', uploadRoutes);
api.use('/ai', aiRoutes);
api.use('/special-requests', specialRequestRoutes);
api.use('/campaigns', campaignRoutes);

app.use('/api', api);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { status: 404, message: 'Route not found', code: 'NOT_FOUND' } });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
