import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DonorLayout, AdminLayout } from '../components/layouts';
import AdminGuard from '../components/layouts/AdminGuard';
import { paths } from '../constants/paths';

// ─── Lazy: Donor Pages ──────────────────────────────────────
const Home = lazy(() => import('../pages/donor/Home'));
const Projects = lazy(() => import('../pages/donor/Projects'));
const ProjectDetails = lazy(() => import('../pages/donor/ProjectDetails'));
const Donate = lazy(() => import('../pages/donor/Donate'));
const DonateItem = lazy(() => import('../pages/donor/DonateItem'));
const Confirmation = lazy(() => import('../pages/donor/Confirmation'));
const Blog = lazy(() => import('../pages/donor/Blog'));
const BlogDetail = lazy(() => import('../pages/donor/BlogDetail'));
const Programs = lazy(() => import('../pages/donor/Programs'));
const ProgramDetail = lazy(() => import('../pages/donor/ProgramDetail'));
const About = lazy(() => import('../pages/donor/About'));
const Transparency = lazy(() => import('../pages/donor/Transparency'));
const Account = lazy(() => import('../pages/donor/Account'));
const Campaigns = lazy(() => import('../pages/donor/Campaigns'));
const CampaignDetail = lazy(() => import('../pages/donor/CampaignDetail'));
const ZakatCalculator = lazy(() => import('../pages/donor/ZakatCalculator'));
const Volunteer = lazy(() => import('../pages/donor/Volunteer'));
const SpecialRequests = lazy(() => import('../pages/donor/SpecialRequests'));
const Contact = lazy(() => import('../pages/donor/Contact'));
const Login = lazy(() => import('../pages/donor/Login'));
const FullPageChat = lazy(() => import('../pages/donor/FullPageChat'));

// ─── Lazy: Admin Pages ──────────────────────────────────────
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminPrograms = lazy(() => import('../pages/admin/AdminPrograms'));
const AdminProjects = lazy(() => import('../pages/admin/AdminProjects'));
const AdminDonations = lazy(() => import('../pages/admin/AdminDonations'));
const AdminBeneficiaries = lazy(() => import('../pages/admin/AdminBeneficiaries'));
const AdminFinance = lazy(() => import('../pages/admin/AdminFinance'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminCMS = lazy(() => import('../pages/admin/AdminCMS'));
const AdminBlog = lazy(() => import('../pages/admin/AdminBlog'));
const AdminContactMessages = lazy(() => import('../pages/admin/AdminContactMessages'));
const AdminVolunteers = lazy(() => import('../pages/admin/AdminVolunteers'));
const AdminSpecialRequests = lazy(() => import('../pages/admin/AdminSpecialRequests'));
const AdminCampaigns = lazy(() => import('../pages/admin/AdminCampaigns'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));

// ─── Placeholder for unimplemented pages ────────────────────
function DonorPlaceholder({ title, icon }) {
    return (
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-12) var(--space-4)'
        }}>
            <span style={{ fontSize: '64px' }}>{icon || '🚧'}</span>
            <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-neutral-800)' }}>{title}</h1>
            <p style={{ color: 'var(--color-neutral-500)', maxWidth: '400px' }}>هذه الصفحة قيد التطوير وستكون متاحة قريباً</p>
        </div>
    );
}

/**
 * AppRoutes — All route definitions for the Nour Charity app.
 * Extracted from App.jsx for clean separation.
 */
export default function AppRoutes() {
    return (
        <Routes>
            {/* Donor Routes */}
            <Route path="/" element={<DonorLayout><Home /></DonorLayout>} />
            <Route path="/campaigns" element={<DonorLayout><Campaigns /></DonorLayout>} />
            <Route path="/campaigns/:id" element={<DonorLayout><CampaignDetail /></DonorLayout>} />
            <Route path="/projects" element={<DonorLayout><Projects /></DonorLayout>} />
            <Route path={paths.projectDetailsRoute} element={<DonorLayout><ProjectDetails /></DonorLayout>} />
            <Route path="/donate" element={<DonorLayout><Donate /></DonorLayout>} />
<Route path="/donate/:categoryId/:itemId" element={<DonorLayout><DonateItem /></DonorLayout>} />
            <Route path="/confirmation" element={<DonorLayout><Confirmation /></DonorLayout>} />
            <Route path="/programs" element={<DonorLayout><Programs /></DonorLayout>} />
            <Route path="/programs/:id" element={<DonorLayout><ProgramDetail /></DonorLayout>} />
            <Route path="/zakat" element={<DonorLayout><ZakatCalculator /></DonorLayout>} />
            <Route path="/volunteer" element={<DonorLayout><Volunteer /></DonorLayout>} />
            <Route path="/special-requests" element={<DonorLayout><SpecialRequests /></DonorLayout>} />
            <Route path="/transparency" element={<DonorLayout><Transparency /></DonorLayout>} />
            <Route path="/about" element={<DonorLayout><About /></DonorLayout>} />
            <Route path="/contact" element={<DonorLayout><Contact /></DonorLayout>} />
            <Route path="/account" element={<DonorLayout><Account /></DonorLayout>} />
            <Route path="/blog" element={<DonorLayout><Blog /></DonorLayout>} />
            <Route path="/blog/:id" element={<DonorLayout><BlogDetail /></DonorLayout>} />
            <Route path="/gallery" element={<Navigate to="/blog?tab=gallery" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<FullPageChat />} />
            <Route path="/updates" element={<DonorLayout><DonorPlaceholder title="آخر التحديثات" icon="🔔" /></DonorLayout>} />
            <Route path="/faq" element={<DonorLayout><DonorPlaceholder title="الأسئلة الشائعة" icon="❓" /></DonorLayout>} />
            <Route path="/privacy" element={<DonorLayout><DonorPlaceholder title="سياسة الخصوصية" icon="🔒" /></DonorLayout>} />
            <Route path="/terms" element={<DonorLayout><DonorPlaceholder title="الشروط والأحكام" icon="📜" /></DonorLayout>} />

            {/* Admin Login (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (protected) */}
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<Dashboard />} />
                <Route path="programs" element={<AdminPrograms />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="campaigns" element={<AdminCampaigns />} />
                <Route path="donations" element={<AdminDonations />} />
                <Route path="beneficiaries" element={<AdminBeneficiaries />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="cms" element={<AdminCMS />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="gallery" element={<Navigate to="/admin/blog?tab=gallery" replace />} />
                <Route path="messages" element={<AdminContactMessages />} />
                <Route path="volunteers" element={<AdminVolunteers />} />
                <Route path="special-requests" element={<AdminSpecialRequests />} />
                <Route path="users" element={<AdminUsers />} />
            </Route>
        </Routes>
    );
}
