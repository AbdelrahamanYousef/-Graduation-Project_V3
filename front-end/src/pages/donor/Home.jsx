import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { paths } from '../../constants/paths';
import DonationCategoriesSection from '../../components/donor/DonationCategoriesSection';
import RecommendationSection from '../../components/donor/RecommendationSection';
import HomeHero from './HomeHero';
import HomeImpactStats from './HomeImpactStats';
import HomePrograms from './HomePrograms';
import HomeUrgentCases from './HomeUrgentCases';
import HomeZakatCta from './HomeZakatCta';
import HomeTestimonials from './HomeTestimonials';
import HomeLatestUpdates from './HomeLatestUpdates';
import HomeCta from './HomeCta';

function Home() {
    const { isDark, language } = useTheme();
    const navigate = useNavigate();

    const { state } = useAdminData();
    const dashboardStats = state.dashboardStats || {};

    const programs = state.programs?.filter(p => !p.status || p.status === 'active') || [];
    
    const highlightedProjects = state.projects?.filter(p => p.isHighlighted) || [];
    const highlightedPrograms = state.programs?.filter(p => p.isHighlighted) || [];
    const mappedHighlightedPrograms = highlightedPrograms.map(p => {
        const progProjects = state.projects?.filter(proj => proj.programId === p.id) || [];
        const raised = progProjects.reduce((sum, proj) => sum + Number(proj.raised || 0), 0);
        const goal = progProjects.reduce((sum, proj) => sum + Number(proj.goal || 0), 0) || 100000;
        const donorsCount = progProjects.reduce((sum, proj) => sum + Number(proj.donors || proj.donorsCount || 0), 0);
        return {
            id: p.id,
            title: p.name,
            description: p.description || 'برنامج تنموي شامل لدعم الفئات الأكثر احتياجاً.',
            imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
            raised,
            goal,
            donorsCount,
            status: p.status || 'active',
            category: p.name,
            isProgram: true
        };
    });
    const featuredProjectsList = [
        ...highlightedProjects.map(p => ({ ...p, isProgram: false, category: p.program })),
        ...mappedHighlightedPrograms
    ];

    const impactStats = {
        totalDonations: dashboardStats.totalDonations || 0,
        beneficiaries: dashboardStats.beneficiaries || 0,
        projects: dashboardStats.totalProjects || 0,
        donors: dashboardStats.totalDonors || new Set(state.donations?.map(d => d.donor || d.donorName)).size || 0,
    };

    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    const heroSlides = useMemo(() => {
        return (state.content?.heroSlides || []).filter(s => s.active !== false);
    }, [state.content?.heroSlides]);
    const currentSlide = heroSlides[heroIndex] || {};
    const hasMultipleSlides = heroSlides.length > 1;

    useEffect(() => {
        if (!hasMultipleSlides) return;
        const timer = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [hasMultipleSlides, heroSlides.length]);

    const activeVerses = useMemo(() => {
        return (state.content?.quranicVerses || []).filter(v => v.active);
    }, [state.content?.quranicVerses]);

    useEffect(() => {
        if (state.content?.islamicDisplayMode !== 'rotating' || activeVerses.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentVerseIndex(prev => (prev + 1) % activeVerses.length);
        }, (state.content?.islamicRotationInterval || 5) * 1000);
        return () => clearInterval(interval);
    }, [state.content?.islamicDisplayMode, state.content?.islamicRotationInterval, activeVerses.length]);

    const displayStats = useMemo(() => {
        const config = state.content?.statsConfig;
        if (config?.override) {
            return [
                { icon: 'fa-solid fa-coins', value: config.totalDonations || 0, label: t('home.totalDonations') },
                { icon: 'fa-solid fa-users', value: config.beneficiaries || 0, label: t('home.beneficiaries') },
                { icon: 'fa-solid fa-folder-open', value: config.projects || 0, label: t('home.projects') },
                { icon: 'fa-solid fa-calendar-days', value: config.years || 0, label: 'سنوات العطاء' },
            ];
        }
        return [
            { icon: 'fa-solid fa-coins', value: impactStats.totalDonations || 0, label: t('home.totalDonations') },
            { icon: 'fa-solid fa-users', value: impactStats.beneficiaries || 0, label: t('home.beneficiaries') },
            { icon: 'fa-solid fa-folder-open', value: impactStats.projects || 0, label: t('home.projects') },
            { icon: 'fa-solid fa-heart', value: impactStats.donors || 0, label: t('home.donors') },
        ];
    }, [state.content?.statsConfig, impactStats]);

    const [announcementVisible, setAnnouncementVisible] = useState(false);

    useEffect(() => {
        const checkVisibility = () => {
            const list = state.content?.announcements || [];
            const today = new Date().toISOString().split('T')[0];
            const active = list.find(a => {
                if (!a.active) return false;
                if (a.startDate && a.startDate > today) return false;
                if (a.endDate && a.endDate < today) return false;
                return true;
            });

            if (active) {
                const dismissedId = sessionStorage.getItem('dismissed_announcement_id');
                const dismissedText = sessionStorage.getItem('dismissed_announcement_text');
                const isDismissed = dismissedId === String(active.id) || dismissedText === active.text;
                setAnnouncementVisible(!isDismissed);
            } else {
                setAnnouncementVisible(false);
            }
        };

        checkVisibility();

        const handleAnnouncementChange = () => {
            checkVisibility();
        };

        window.addEventListener('announcement_change', handleAnnouncementChange);
        return () => {
            window.removeEventListener('announcement_change', handleAnnouncementChange);
        };
    }, [state.content?.announcements]);

    return (
        <div className="overflow-x-hidden">

            <HomeHero
                currentSlide={currentSlide}
                heroSlides={heroSlides}
                heroIndex={heroIndex}
                setHeroIndex={setHeroIndex}
                isDark={isDark}
                announcementVisible={announcementVisible}
                activeVerses={activeVerses}
                currentVerseIndex={currentVerseIndex}
                islamicDisplayMode={state.content?.islamicDisplayMode}
                heroBanner={state.content?.heroBanner}
            />

            <HomeImpactStats
                displayStats={displayStats}
                isDark={isDark}
            />

            <HomePrograms
                programs={programs}
                isDark={isDark}
            />

            <HomeUrgentCases
                featuredProjectsList={featuredProjectsList}
                isDark={isDark}
                setDonateProject={(p) => navigate(`${paths.donor.donate}?project=${p.id}`)}
                navigate={navigate}
            />

            <DonationCategoriesSection />

            <RecommendationSection />

            <HomeZakatCta isDark={isDark} />

            <HomeTestimonials
                testimonials={state.content?.testimonials}
                isDark={isDark}
            />

            <HomeLatestUpdates
                blogPosts={state.blogPosts}
                isDark={isDark}
            />

            <HomeCta isDark={isDark} />

        </div>
    );
}

export default Home;
