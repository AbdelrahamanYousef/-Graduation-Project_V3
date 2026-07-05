import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import { getTransparencyStats } from '../../api/transparency.api';
import { formatNumber } from '../../i18n';
import { HeroBanner } from '../../components/common';
import { Info, Heart, Target, Users } from 'lucide-react';
import { paths } from '../../constants/paths';
import AboutVisionMission from './AboutVisionMission';
import AboutValues from './AboutValues';
import AboutJourney from './AboutJourney';
import AboutTeam from './AboutTeam';
import AboutLegal from './AboutLegal';

function About() {
    const { isDark, language } = useTheme();
    const { state } = useAdminData();
    const aboutUs = state.content?.aboutUs || {};
    const isRtl = language === 'ar';

    const [beneficiaryCount, setBeneficiaryCount] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchBeneficiaries() {
            try {
                const transData = await getTransparencyStats();
                if (isMounted && transData?.financialData?.beneficiaries !== undefined) {
                    setBeneficiaryCount(transData.financialData.beneficiaries);
                }
            } catch (err) {
                console.warn('Could not fetch transparency stats in AboutUs:', err);
            }
        }
        fetchBeneficiaries();
        return () => {
            isMounted = false;
        };
    }, []);

    const yearsOfGiving = new Date().getFullYear() - 2010;
    const projectsCount = state.projects?.length || 0;
    const totalBeneficiaries = beneficiaryCount !== null
        ? beneficiaryCount
        : (state.beneficiaries?.length || 0);

    const formattedBeneficiaries = totalBeneficiaries > 0 ? `${formatNumber(totalBeneficiaries)}+` : "0";

    return (
        <div className="pb-12">
            <HeroBanner 
                themeVariant="programs"
                badgeText="من نحن"
                headline="عن جمعية نور"
                highlightedWord="نور"
                subtext="مؤسسة خيرية تهدف للتنمية المستدامة، وبناء مجتمع متكافل من خلال مشاريع تنموية وإغاثية شفافة."
                primaryCtaText="تواصل معنا"
                primaryCtaLink={paths.donor.contact}
                secondaryCtaText="تبرع الآن"
                secondaryCtaLink={paths.donor.donate}
                stats={[
                    { number: `${yearsOfGiving}+`, label: "سنوات من العطاء" },
                    { number: formattedBeneficiaries, label: "مستفيد" },
                    { number: `${projectsCount}+`, label: "مشروع تنموي" }
                ]}
                floatingIcons={[
                    <Info key="info" size={24} />,
                    <Heart key="heart" size={24} />,
                    <Target key="target" size={24} />,
                    <Users key="users" size={24} />
                ]}
            />
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-16 relative z-[2]">
                <AboutVisionMission isDark={isDark} aboutUs={aboutUs} />
                <AboutValues isDark={isDark} aboutUs={aboutUs} />
                <AboutJourney isDark={isDark} isRtl={isRtl} />
                <AboutTeam isDark={isDark} />
                <AboutLegal isDark={isDark} />
            </div>
        </div>
    );
}

export default About;
