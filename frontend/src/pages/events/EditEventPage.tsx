import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Typography, TextField, FormControl, InputLabel, Select,
  MenuItem, Grid, Alert, Divider, alpha,
} from '@mui/material';
import {
  Edit, SportsSoccer, Schedule, Place, Group,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Sport, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../../types';
import * as sportsApi from '../../api/sports';
import * as eventsApi from '../../api/events';
import LocationPicker from '../../components/LocationPicker';
import AnimatedPage from '../../components/AnimatedPage';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import dayjs from 'dayjs';

interface FormData {
  sportId: number; title: string; description: string; eventDate: string;
  durationMinutes: number; locationAddress: string; locationLat: number;
  locationLng: number; maxParticipants: number; minSkillLevel: string;
}

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

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>();

  const locationLat = watch('locationLat');
  const locationLng = watch('locationLng');
  const locationAddress = watch('locationAddress');

  useEffect(() => {
    Promise.all([sportsApi.getAll(), eventsApi.getById(parseInt(id!))]).then(([sportsRes, eventRes]) => {
      setSports(sportsRes.data);
      const e = eventRes.data;
      reset({
        sportId: e.sportId, title: e.title, description: e.description,
        eventDate: dayjs(e.eventDate).format('YYYY-MM-DDTHH:mm'),
        durationMinutes: e.durationMinutes, locationAddress: e.locationAddress,
        locationLat: e.locationLat, locationLng: e.locationLng,
        maxParticipants: e.maxParticipants, minSkillLevel: e.minSkillLevel || '',
      });
    }).catch(() => setError('Грешка при вчитување.')).finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: FormData) => {
    try {
      await eventsApi.update(parseInt(id!), { ...data, minSkillLevel: data.minSkillLevel || undefined });
      navigate(`/events/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при ажурирање.');
    }
  };

  if (loading) return <Box mt={4}><CardSkeleton count={1} /></Box>;

  return (
    <AnimatedPage>
      <Box maxWidth={700} mx="auto">
        <SectionHeader icon={<Edit />} title="Уреди настан" subtitle="Променете ги деталите на настанот" />

        <GlassCard variant="gradient" hoverEffect={false}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Section 1: Основни информации */}
            <motion.div {...stagger(0)}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={sectionIconSx}><SportsSoccer /></Box>
                <Typography variant="subtitle1" fontWeight={700}>Основни информации</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Controller name="sportId" control={control} rules={{ required: 'Изберете спорт' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.sportId}>
                        <InputLabel>Спорт</InputLabel>
                        <Select {...field} label="Спорт">
                          {sports.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Наслов" {...register('title', { required: 'Задолжително' })} error={!!errors.title} helperText={errors.title?.message} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth multiline rows={4} label="Опис" {...register('description', { required: 'Задолжително' })} />
                </Grid>
              </Grid>
            </motion.div>

            <Divider sx={{ my: 3 }} />

            {/* Section 2: Датум и време */}
            <motion.div {...stagger(1)}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={sectionIconSx}><Schedule /></Box>
                <Typography variant="subtitle1" fontWeight={700}>Датум и време</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField fullWidth label="Датум и време" type="datetime-local" InputLabelProps={{ shrink: true }} {...register('eventDate', { required: 'Задолжително' })} />
                </Grid>
                <Grid size={6}>
                  <TextField fullWidth label="Времетраење (мин)" type="number" {...register('durationMinutes', { required: true, valueAsNumber: true })} />
                </Grid>
              </Grid>
            </motion.div>

            <Divider sx={{ my: 3 }} />

            {/* Section 3: Локација */}
            <motion.div {...stagger(2)}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={sectionIconSx}><Place /></Box>
                <Typography variant="subtitle1" fontWeight={700}>Локација</Typography>
              </Box>
              <LocationPicker
                value={locationLat ? { lat: locationLat, lng: locationLng, address: locationAddress } : undefined}
                onChange={(lat, lng, address) => { setValue('locationLat', lat); setValue('locationLng', lng); setValue('locationAddress', address); }}
                label="Локација на настанот"
              />
            </motion.div>

            <Divider sx={{ my: 3 }} />

            {/* Section 4: Учесници */}
            <motion.div {...stagger(3)}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={sectionIconSx}><Group /></Box>
                <Typography variant="subtitle1" fontWeight={700}>Учесници</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField fullWidth label="Макс. учесници" type="number" {...register('maxParticipants', { valueAsNumber: true })} />
                </Grid>
                <Grid size={6}>
                  <Controller name="minSkillLevel" control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Мин. ниво</InputLabel>
                        <Select {...field} label="Мин. ниво">
                          <MenuItem value="">Без</MenuItem>
                          {SKILL_LEVELS.map(l => <MenuItem key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )} />
                </Grid>
              </Grid>
            </motion.div>

            <Divider sx={{ my: 3 }} />

            {/* Submit */}
            <motion.div {...stagger(4)}>
              <GradientButton fullWidth type="submit" disabled={isSubmitting} size="large" sx={{ py: 1.5 }}>
                {isSubmitting ? 'Се зачувува...' : 'Зачувај промени'}
              </GradientButton>
            </motion.div>

          </form>
        </GlassCard>
      </Box>
    </AnimatedPage>
  );
}
