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
export { loginAdmin, loginDonor, getCurrentUser, logoutUser, authKeys } from './auth.api';

// Donations
export {
    getDonations, getDonationById, createDonation,
    getDonationTypes, getPaymentMethods, getDonationAmounts,
    donationKeys,
} from './donations.api';

// Beneficiaries
export {
    getBeneficiaries, getBeneficiaryById, createBeneficiary,
    updateBeneficiary, getBeneficiaryStats,
    beneficiaryKeys,
} from './beneficiaries.api';

// Dashboard
export {
    getDashboardStats, getRecentDonations, getProjectsSummary,
    getPrograms, getUpdates,
    dashboardKeys,
} from './dashboard.api';
