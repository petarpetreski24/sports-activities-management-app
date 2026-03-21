import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, TextField, Grid, Alert, Avatar,
  Divider, FormControl, InputLabel,
  Select, MenuItem, Chip, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import PlaceIcon from '@mui/icons-material/Place';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import * as usersApi from '../../api/users';
import * as sportsApi from '../../api/sports';
import { Sport, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../../types';
import LocationPicker from '../../components/LocationPicker';
import AnimatedPage from '../../components/AnimatedPage';
import { ProfileSkeleton } from '../../components/LoadingSkeleton';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import GradientButton from '../../components/GradientButton';

interface ProfileForm {
  firstName: string; lastName: string; phone: string;
  bio: string; locationCity: string; locationLat: number; locationLng: number;
}

interface FavSport { sportId: number; sportName: string; skillLevel: string }

const sectionIconSx = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${alpha('#1a56db', 0.12)}, ${alpha('#059669', 0.12)})`,
  color: '#1a56db',
  flexShrink: 0,
  '& .MuiSvgIcon-root': { fontSize: 18 },
};

const stagger = (index: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 + index * 0.1, duration: 0.45, ease: 'easeOut' as const },
});

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [favSports, setFavSports] = useState<FavSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSportId, setNewSportId] = useState<number | ''>('');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName || '', lastName: user?.lastName || '',
      phone: user?.phone || '', bio: user?.bio || '',
      locationCity: user?.locationCity || '',
      locationLat: user?.locationLat || 0, locationLng: user?.locationLng || 0,
    }
  });

  useEffect(() => {
    Promise.all([sportsApi.getAll(), usersApi.getFavoriteSports()])
      .then(([sRes, fRes]) => { setSports(sRes.data); setFavSports(fRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: ProfileForm) => {
    try { await usersApi.updateProfile(data); await refreshUser(); navigate('/profile'); }
    catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try { await usersApi.uploadPhoto(formData); await refreshUser(); }
    catch { setError('Грешка при прикачување.'); }
  };

  const addFavSport = async () => {
    if (!newSportId) return;
    try {
      await usersApi.addFavoriteSport(newSportId as number, newSkillLevel);
      const res = await usersApi.getFavoriteSports();
      setFavSports(res.data); setNewSportId('');
    } catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
  };

  const removeFavSport = async (sportId: number) => {
    try { await usersApi.removeFavoriteSport(sportId); setFavSports(prev => prev.filter(f => f.sportId !== sportId)); }
    catch { setError('Грешка при бришење.'); }
  };

  if (loading) return <Box mt={4}><ProfileSkeleton /></Box>;

  return (
    <AnimatedPage>
      <Box maxWidth={700} mx="auto">
        <SectionHeader icon={<EditIcon />} title="Уреди профил" subtitle="Ажурирајте ги вашите лични информации" />

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        {/* Photo Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="gradient" hoverEffect={false} sx={{ mb: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" py={2}>
              <Box
                component="label"
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover .camera-overlay': { opacity: 1 },
                }}
              >
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar
                    src={user?.profilePhotoUrl ? `http://localhost:5000${user.profilePhotoUrl}` : undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: 42,
                      border: `3px dashed ${alpha('#1a56db', 0.3)}`,
                      bgcolor: alpha('#1a56db', 0.04),
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                </motion.div>
                <Box
                  className="camera-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    bgcolor: alpha('#000', 0.45),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                  }}
                >
                  <PhotoCameraIcon sx={{ color: '#fff', fontSize: 32 }} />
                </Box>
                <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Кликнете за промена на слика
              </Typography>
            </Box>
          </GlassCard>
        </motion.div>

        {/* Main form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard variant="gradient" hoverEffect={false} sx={{ mb: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Section 1: Лични информации */}
              <motion.div {...stagger(0)}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box sx={sectionIconSx}><PersonIcon /></Box>
                  <Typography variant="subtitle1" fontWeight={700}>Лични информации</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField fullWidth label="Име" {...register('firstName', { required: 'Задолжително' })}
                      error={!!errors.firstName} helperText={errors.firstName?.message} />
                  </Grid>
                  <Grid size={6}>
                    <TextField fullWidth label="Презиме" {...register('lastName', { required: 'Задолжително' })}
                      error={!!errors.lastName} helperText={errors.lastName?.message} />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Телефон" {...register('phone')} />
                  </Grid>
                </Grid>
              </motion.div>

              <Divider sx={{ my: 3 }} />

              {/* Section 2: За мене */}
              <motion.div {...stagger(1)}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box sx={sectionIconSx}><InfoIcon /></Box>
                  <Typography variant="subtitle1" fontWeight={700}>За мене</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField fullWidth multiline rows={3} label="Биографија" {...register('bio')} />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Град" {...register('locationCity')} />
                  </Grid>
                </Grid>
              </motion.div>

              <Divider sx={{ my: 3 }} />

              {/* Section 3: Локација */}
              <motion.div {...stagger(2)}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box sx={sectionIconSx}><PlaceIcon /></Box>
                  <Typography variant="subtitle1" fontWeight={700}>Локација</Typography>
                </Box>
                <LocationPicker
                  value={{ lat: watch('locationLat') || 41.9981, lng: watch('locationLng') || 21.4254, address: watch('locationCity') || '' }}
                  onChange={(lat, lng, address) => {
                    setValue('locationLat', lat); setValue('locationLng', lng);
                    setValue('locationCity', address.split(',')[0]?.trim() || address);
                  }}
                  label="Моја локација"
                />
              </motion.div>

              <Divider sx={{ my: 3 }} />

              {/* Submit */}
              <motion.div {...stagger(3)}>
                <GradientButton fullWidth type="submit" disabled={isSubmitting} size="large" sx={{ py: 1.5 }}>
                  {isSubmitting ? 'Се зачувува...' : 'Зачувај'}
                </GradientButton>
              </motion.div>

            </form>
          </GlassCard>
        </motion.div>

        {/* Favorite sports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader
            icon={<SportsScoreIcon />}
            title="Омилени спортови"
            count={favSports.length}
          />
          <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
            <Box display="flex" flexWrap="wrap" gap={1} mb={favSports.length > 0 ? 2 : 0}>
              {favSports.map((fs, i) => (
                <motion.div key={fs.sportId} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Chip
                    label={`${fs.sportName} - ${SKILL_LEVEL_LABELS[fs.skillLevel] || fs.skillLevel}`}
                    onDelete={() => removeFavSport(fs.sportId)}
                    deleteIcon={<DeleteIcon />}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 500,
                      bgcolor: alpha('#1a56db', 0.06),
                      border: `1px solid ${alpha('#1a56db', 0.12)}`,
                      '& .MuiChip-deleteIcon': { color: alpha('#ef4444', 0.6), '&:hover': { color: '#ef4444' } },
                    }}
                  />
                </motion.div>
              ))}
            </Box>

            {favSports.length > 0 && <Divider sx={{ my: 2 }} />}

            {/* Add sport form */}
            <GlassCard sx={{ p: 2, bgcolor: alpha('#f8fafc', 0.6) }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <AddIcon sx={{ fontSize: 18, color: '#1a56db' }} />
                <Typography variant="subtitle2" fontWeight={600}>Додади спорт</Typography>
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid size={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Спорт</InputLabel>
                    <Select value={newSportId} onChange={e => setNewSportId(e.target.value as number)} label="Спорт">
                      {sports.filter(s => !favSports.some(f => f.sportId === s.id)).map(s => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ниво</InputLabel>
                    <Select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} label="Ниво">
                      {SKILL_LEVELS.map(l => <MenuItem key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={3}>
                  <GradientButton fullWidth onClick={addFavSport} disabled={!newSportId} size="medium" sx={{ borderRadius: 3 }}>
                    Додади
                  </GradientButton>
                </Grid>
              </Grid>
            </GlassCard>
          </GlassCard>
        </motion.div>
      </Box>
    </AnimatedPage>
  );
}
