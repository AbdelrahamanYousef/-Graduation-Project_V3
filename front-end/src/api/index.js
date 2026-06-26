/**
 * API Layer — Central barrel export
 *
 * Usage in components:
 *   import { getDonations, donationKeys } from '@/api';
 *   import { loginAdmin } from '@/api';
 */
export { default as apiClient } from './client';
export { default as queryClient } from './queryClient';

// Auth
export {
    loginAdmin, loginDonor, register, verifyEmail, resendVerification,
    sendDonorOtp, verifyDonorOtp,
    getCurrentUser, refreshToken, logoutUser, authKeys,
} from './auth.api';

// Programs
export {
    getPrograms, getProgramById, createProgram, updateProgram, deleteProgram,
    toggleProgramHighlight,
    programKeys,
} from './programs.api';

// Projects
export {
    getProjects, getFeaturedProjects, getProjectById,
    createProject, updateProject, toggleProjectFeatured, toggleProjectHighlight, deleteProject,
    projectKeys,
} from './projects.api';

// Donations
export {
    getDonations, getDonationById, createDonation, getDonationStats,
    getDonationTypes, getPaymentMethods, getDonationAmounts, refundDonation,
    donationKeys,
} from './donations.api';

// Beneficiaries
export {
    getBeneficiaries, getBeneficiaryById, createBeneficiary,
    updateBeneficiary, deleteBeneficiary, getBeneficiaryStats,
    beneficiaryKeys,
} from './beneficiaries.api';

// Dashboard
export {
    getDashboardStats, getRecentDonations, getProjectsSummary,
    getRecentActivity, getPendingTasks, completeTask,
    dashboardKeys,
} from './dashboard.api';

// Notifications
export {
    getNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications,
    notificationKeys,
} from './notifications.api';

// Volunteers
export {
    applyAsVolunteer, getVolunteers, getVolunteerById, approveVolunteer, rejectVolunteer,
    volunteerKeys,
} from './volunteers.api';

// Special Requests
export {
    submitSpecialRequest, getSpecialRequests, getSpecialRequestById,
    approveSpecialRequest, rejectSpecialRequest,
    specialRequestKeys,
} from './specialRequests.api';

// Contact
export {
    submitContactMessage, getContactMessages, updateContactStatus,
    contactKeys,
} from './contact.api';

// Settings
export {
    getSettings, updateSettings,
} from './settings.api';

// Finance
export {
    getFinanceOverview, getBudgets, getDisbursements, createDisbursement,
    approveDisbursement, rejectDisbursement, completeDisbursement,
} from './finance.api';

// Reports
export {
    getQuickStats, getReports, getReportById, generateReport,
    reportKeys,
} from './reports.api';

// Donor Account
export {
    getDonorProfile, updateDonorProfile, getDonorDonations, getDonorStats,
} from './donorAccount.api';
