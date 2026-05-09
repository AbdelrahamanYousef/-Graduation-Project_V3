import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Tab,
    Tabs,
    Divider,
    Switch,
    FormControlLabel,
    InputAdornment,
    Select,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip
} from '@mui/material';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../components/common';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`cms-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function AdminCMS() {
    const { state, dispatch } = useAdminData();
    const toast = useToast();
    const [tab, setTab] = useState(0);

    const [formData, setFormData] = useState(state.content);
    const [themeData, setThemeData] = useState(state.settings);

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleThemeChange = (field, value) => {
        setThemeData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (section, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[section]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [section]: newArray };
        });
    };

    // For top-level content keys (not nested in a section)
    const handleTopLevelChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddArrayItem = (section, defaultItem) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], { id: Date.now(), ...defaultItem }]
        }));
    };

    const handleDeleteArrayItem = (section, id) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id)
        }));
    };

    const handleSave = () => {
        dispatch(adminActions.updateContent(formData));
        dispatch({ type: 'UPDATE_SETTINGS', payload: themeData });
        toast.success('تم تحديث المحتوى والإعدادات بنجاح');
    };

    return (
        <Box>
            <AdminPageHeader
                title="إدارة المحتوى"
                subtitle="التحكم في النصوص والإعلانات المعروضة في واجهة المتبرع"
            />

            <Paper sx={{ mb: 4, borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="cms tabs">
                        <Tab label="الصفحة الرئيسية" />
                        <Tab label="الآيات والرسائل" />
                        <Tab label="الإعلانات" />
                        <Tab label="من نحن وآراء المتبرعين" />
                        <Tab label="إحصائيات المنصة" />
                        <Tab label="المظهر (Theme)" />
                        <Tab label="إعدادات الزكاة" />
                    </Tabs>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    {/* Homepage Tab */}
                    <TabPanel value={tab} index={0}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            واجهة البداية (Hero Banner)
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="العنوان الرئيسي"
                                    value={formData.heroBanner.title}
                                    onChange={(e) => handleChange('heroBanner', 'title', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="النص الفرعي"
                                    value={formData.heroBanner.subtitle}
                                    onChange={(e) => handleChange('heroBanner', 'subtitle', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Islamic Content Tab */}
                    <TabPanel value={tab} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">المحتوى الإسلامي (آيات وأحاديث)</Typography>
                            <Button variant="outlined" startIcon={<i className="fa-solid fa-plus" />} onClick={() => handleAddArrayItem('quranicVerses', { text: '', reference: '', active: true, type: 'quran' })}>
                                إضافة جديد
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth label="طريقة العرض" value={formData.islamicDisplayMode || 'rotating'} onChange={(e) => handleTopLevelChange('islamicDisplayMode', e.target.value)}>
                                    <MenuItem value="rotating">متناوب (تدوير)</MenuItem>
                                    <MenuItem value="stacked">قائمة متتالية</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField type="number" fullWidth label="مدة التناوب (ثواني)" value={formData.islamicRotationInterval || 5} onChange={(e) => handleTopLevelChange('islamicRotationInterval', Number(e.target.value))} disabled={formData.islamicDisplayMode !== 'rotating'} />
                            </Grid>
                            {formData.quranicVerses?.map((verse, index) => (
                                <Grid item xs={12} key={verse.id}>
                                    <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                        <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, left: 8 }} onClick={() => handleDeleteArrayItem('quranicVerses', verse.id)}>
                                            <i className="fa-solid fa-trash" style={{ fontSize: 14 }} />
                                        </IconButton>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField fullWidth multiline rows={2} label="النص" value={verse.text} onChange={(e) => handleArrayChange('quranicVerses', index, 'text', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField fullWidth label="المرجع (مثال: سورة البقرة)" value={verse.reference} onChange={(e) => handleArrayChange('quranicVerses', index, 'reference', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField select fullWidth label="النوع" value={verse.type || 'quran'} onChange={(e) => handleArrayChange('quranicVerses', index, 'type', e.target.value)}>
                                                    <MenuItem value="quran">قرآن كريم</MenuItem>
                                                    <MenuItem value="hadith">حديث شريف</MenuItem>
                                                    <MenuItem value="quote">مأثورات</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControlLabel control={<Switch checked={verse.active} onChange={(e) => handleArrayChange('quranicVerses', index, 'active', e.target.checked)} />} label="نشط" />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>

                    {/* Announcements Tab */}
                    <TabPanel value={tab} index={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">شريط الإعلانات والحملات</Typography>
                            <Button variant="outlined" startIcon={<i className="fa-solid fa-plus" />} onClick={() => handleAddArrayItem('announcements', { title: '', text: '', type: 'info', active: true, startDate: '', endDate: '' })}>
                                إضافة إعلان
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            {formData.announcements?.map((ann, index) => (
                                <Grid item xs={12} key={ann.id}>
                                    <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                        <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, left: 8 }} onClick={() => handleDeleteArrayItem('announcements', ann.id)}>
                                            <i className="fa-solid fa-trash" style={{ fontSize: 14 }} />
                                        </IconButton>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8}>
                                                <TextField fullWidth label="نص الإعلان" value={ann.text} onChange={(e) => handleArrayChange('announcements', index, 'text', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField select fullWidth label="النوع" value={ann.type || 'info'} onChange={(e) => handleArrayChange('announcements', index, 'type', e.target.value)}>
                                                    <MenuItem value="urgent">عاجل (أحمر)</MenuItem>
                                                    <MenuItem value="info">معلومة (أزرق)</MenuItem>
                                                    <MenuItem value="success">نجاح (أخضر)</MenuItem>
                                                    <MenuItem value="seasonal">موسمي (ذهبي)</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="تاريخ البدء" value={ann.startDate || ''} onChange={(e) => handleArrayChange('announcements', index, 'startDate', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="تاريخ الانتهاء" value={ann.endDate || ''} onChange={(e) => handleArrayChange('announcements', index, 'endDate', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <FormControlLabel control={<Switch checked={ann.active} onChange={(e) => handleArrayChange('announcements', index, 'active', e.target.checked)} />} label="مفعّل" />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>

                    {/* About Us & Testimonials Tab */}
                    <TabPanel value={tab} index={3}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>من نحن</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12}><TextField multiline rows={2} fullWidth label="قصتنا" value={formData.aboutUs?.story || ''} onChange={(e) => handleChange('aboutUs', 'story', e.target.value)} /></Grid>
                            <Grid item xs={12} md={4}><TextField multiline rows={2} fullWidth label="رؤيتنا" value={formData.aboutUs?.vision || ''} onChange={(e) => handleChange('aboutUs', 'vision', e.target.value)} /></Grid>
                            <Grid item xs={12} md={4}><TextField multiline rows={2} fullWidth label="رسالتنا" value={formData.aboutUs?.mission || ''} onChange={(e) => handleChange('aboutUs', 'mission', e.target.value)} /></Grid>
                            <Grid item xs={12} md={4}><TextField multiline rows={2} fullWidth label="قيمنا" value={formData.aboutUs?.values || ''} onChange={(e) => handleChange('aboutUs', 'values', e.target.value)} /></Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">آراء المتبرعين والمستفيدين</Typography>
                            <Button variant="outlined" startIcon={<i className="fa-solid fa-plus" />} onClick={() => handleAddArrayItem('testimonials', { name: '', role: '', content: '', avatar: '' })}>إضافة رأي</Button>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            {formData.testimonials?.map((test, index) => (
                                <Grid item xs={12} md={6} key={test.id}>
                                    <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                        <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, left: 8 }} onClick={() => handleDeleteArrayItem('testimonials', test.id)}>
                                            <i className="fa-solid fa-trash" style={{ fontSize: 14 }} />
                                        </IconButton>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}><TextField fullWidth label="الاسم" value={test.name} onChange={(e) => handleArrayChange('testimonials', index, 'name', e.target.value)} /></Grid>
                                            <Grid item xs={12}><TextField fullWidth label="الصفة (مثال: متبرع دائم)" value={test.role} onChange={(e) => handleArrayChange('testimonials', index, 'role', e.target.value)} /></Grid>
                                            <Grid item xs={12}><TextField multiline rows={2} fullWidth label="النص" value={test.content} onChange={(e) => handleArrayChange('testimonials', index, 'content', e.target.value)} /></Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>

                    {/* Stats Override Tab */}
                    <TabPanel value={tab} index={4}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">إحصائيات المنصة (الرئيسية)</Typography>
                            <FormControlLabel control={<Switch checked={formData.statsConfig?.override || false} onChange={(e) => handleChange('statsConfig', 'override', e.target.checked)} />} label="استخدام أرقام يدوية (بدل الحساب التلقائي)" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}><TextField type="number" fullWidth label="إجمالي التبرعات المكتوبة" value={formData.statsConfig?.totalDonations || 0} onChange={(e) => handleChange('statsConfig', 'totalDonations', Number(e.target.value))} disabled={!formData.statsConfig?.override} /></Grid>
                            <Grid item xs={12} md={6}><TextField type="number" fullWidth label="عدد المستفيدين المكتوب" value={formData.statsConfig?.beneficiaries || 0} onChange={(e) => handleChange('statsConfig', 'beneficiaries', Number(e.target.value))} disabled={!formData.statsConfig?.override} /></Grid>
                            <Grid item xs={12} md={6}><TextField type="number" fullWidth label="عدد المشاريع المكتوب" value={formData.statsConfig?.projects || 0} onChange={(e) => handleChange('statsConfig', 'projects', Number(e.target.value))} disabled={!formData.statsConfig?.override} /></Grid>
                            <Grid item xs={12} md={6}><TextField type="number" fullWidth label="سنوات العطاء" value={formData.statsConfig?.years || 0} onChange={(e) => handleChange('statsConfig', 'years', Number(e.target.value))} disabled={!formData.statsConfig?.override} /></Grid>
                        </Grid>
                    </TabPanel>

                    {/* Theme Settings Tab */}
                    <TabPanel value={tab} index={5}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>المظهر العام والألوان</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField type="color" fullWidth label="اللون الرئيسي (Primary Color)" value={themeData.primaryColor || '#00b16a'} onChange={(e) => handleThemeChange('primaryColor', e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField type="color" fullWidth label="اللون الثانوي (Secondary Color)" value={themeData.secondaryColor || '#f39c12'} onChange={(e) => handleThemeChange('secondaryColor', e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth label="حجم الخط" value={themeData.fontSize || 'normal'} onChange={(e) => handleThemeChange('fontSize', e.target.value)}>
                                    <MenuItem value="small">صغير</MenuItem>
                                    <MenuItem value="normal">متوسط (افتراضي)</MenuItem>
                                    <MenuItem value="large">كبير</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth label="انحناء الحواف (Border Radius)" value={themeData.borderRadius || 'medium'} onChange={(e) => handleThemeChange('borderRadius', e.target.value)}>
                                    <MenuItem value="none">بدون انحناء</MenuItem>
                                    <MenuItem value="small">صغير</MenuItem>
                                    <MenuItem value="medium">متوسط</MenuItem>
                                    <MenuItem value="large">دائري</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField select fullWidth label="شكل واجهة البداية (Hero Style)" value={themeData.heroStyle || 'gradient'} onChange={(e) => handleThemeChange('heroStyle', e.target.value)}>
                                    <MenuItem value="gradient">تدرج لوني</MenuItem>
                                    <MenuItem value="image">صورة خلفية كاملة</MenuItem>
                                    <MenuItem value="split">مقسم (نص وصورة)</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Zakat Tab */}
                    <TabPanel value={tab} index={6}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            إعدادات حساب الزكاة
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="سعر جرام الذهب (عيار 24)"
                                    value={formData.zakatConfig.goldPrice}
                                    onChange={(e) => handleChange('zakatConfig', 'goldPrice', Number(e.target.value))}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">ج.م</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="سعر جرام الفضة"
                                    value={formData.zakatConfig.silverPrice}
                                    onChange={(e) => handleChange('zakatConfig', 'silverPrice', Number(e.target.value))}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">ج.م</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" size="large" onClick={handleSave} sx={{ px: 4 }}>
                    حفظ التغييرات
                </Button>
            </Box>
        </Box>
    );
}
