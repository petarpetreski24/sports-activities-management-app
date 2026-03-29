import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, TextField, Button, Alert, Typography, FormControl, InputLabel,
  Select, MenuItem, Autocomplete, Chip, Avatar, alpha, CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import * as adminApi from '../../api/admin';
import * as sportsApi from '../../api/sports';
import { Sport, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../../types';
import AnimatedPage from '../../components/AnimatedPage';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';

interface UserOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string;
}

export default function AdminCreateEventPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [sportId, setSportId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(dayjs().add(1, 'day').hour(18).minute(0).format('YYYY-MM-DDTHH:mm'));
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLat, setLocationLat] = useState(41.9981);
  const [locationLng, setLocationLng] = useState(21.4254);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [minSkillLevel, setMinSkillLevel] = useState('');
  const [organizer, setOrganizer] = useState<UserOption | null>(null);
  const [confirmedParticipants, setConfirmedParticipants] = useState<UserOption[]>([]);

  useEffect(() => {
    sportsApi.getAll().then(res => setSports(res.data.filter(s => s.isActive))).catch(() => {});
  }, []);

  // Load users with search
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) return;
    setLoadingUsers(true);
    try {
      const res = await adminApi.getUsers(query, undefined, 1, 30);
      setAllUsers(res.data.items.map(u => ({
        id: u.id, firstName: u.firstName, lastName: u.lastName,
        email: u.email, profilePhotoUrl: u.profilePhotoUrl,
      })));
    } catch {}
    setLoadingUsers(false);
  }, []);

  // Load initial users
  useEffect(() => {
    adminApi.getUsers(undefined, undefined, 1, 50).then(res => {
      setAllUsers(res.data.items.map((u: any) => ({
        id: u.id, firstName: u.firstName, lastName: u.lastName,
        email: u.email, profilePhotoUrl: u.profilePhotoUrl,
      })));
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!organizer) { setError('Изберете организатор.'); return; }
    if (!sportId) { setError('Изберете спорт.'); return; }
    if (!title.trim()) { setError('Внесете наслов.'); return; }
    if (!locationAddress.trim()) { setError('Внесете локација.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await adminApi.adminCreateEvent({
        organizerId: organizer.id,
        sportId,
        title: title.trim(),
        description: description.trim() || undefined,
        eventDate: new Date(eventDate).toISOString(),
        durationMinutes,
        locationAddress: locationAddress.trim(),
        locationLat,
        locationLng,
        maxParticipants,
        minSkillLevel: minSkillLevel || undefined,
        confirmedParticipantIds: confirmedParticipants.map(p => p.id),
      });
      setSuccess(`Настанот "${title}" е креиран! (ID: ${res.data.id})`);
      setTimeout(() => navigate(`/events/${res.data.id}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при креирање.');
    }
    setSubmitting(false);
  };

  const availableForParticipants = allUsers.filter(
    u => u.id !== organizer?.id && !confirmedParticipants.some(p => p.id === u.id)
  );

  return (
    <AnimatedPage>
      <SectionHeader icon={<AddCircleOutlineIcon />} title="Админ — Креирај настан" subtitle="Креирај настан за било кој организатор со потврдени учесници" />

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Left: Event Details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard hoverEffect={false}>
              <Typography variant="h6" fontWeight={700} mb={2}>Детали за настанот</Typography>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <TextField fullWidth label="Наслов *" value={title} onChange={e => setTitle(e.target.value)} />

                <FormControl fullWidth>
                  <InputLabel>Спорт *</InputLabel>
                  <Select value={sportId || ''} onChange={e => setSportId(Number(e.target.value))} label="Спорт *">
                    {sports.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField fullWidth multiline rows={3} label="Опис" value={description} onChange={e => setDescription(e.target.value)} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth type="datetime-local" label="Датум и време *"
                      value={eventDate} onChange={e => setEventDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth type="number" label="Времетраење (мин)" value={durationMinutes}
                      onChange={e => setDurationMinutes(parseInt(e.target.value) || 60)}
                    />
                  </Grid>
                </Grid>

                <TextField fullWidth label="Локација *" value={locationAddress} onChange={e => setLocationAddress(e.target.value)} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth type="number" label="Lat" value={locationLat}
                      onChange={e => setLocationLat(parseFloat(e.target.value) || 0)}
                      slotProps={{ htmlInput: { step: 0.0001 } }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth type="number" label="Lng" value={locationLng}
                      onChange={e => setLocationLng(parseFloat(e.target.value) || 0)}
                      slotProps={{ htmlInput: { step: 0.0001 } }} />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth type="number" label="Макс. учесници *" value={maxParticipants}
                      onChange={e => setMaxParticipants(parseInt(e.target.value) || 2)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Мин. ниво</InputLabel>
                      <Select value={minSkillLevel} onChange={e => setMinSkillLevel(e.target.value)} label="Мин. ниво">
                        <MenuItem value="">Без ограничување</MenuItem>
                        {SKILL_LEVELS.map(lvl => (
                          <MenuItem key={lvl} value={lvl}>{SKILL_LEVEL_LABELS[lvl]}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Right: Organizer & Participants */}
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                <PersonAddIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Организатор *
              </Typography>
              <Autocomplete
                options={allUsers}
                value={organizer}
                onChange={(_, val) => setOrganizer(val)}
                onInputChange={(_, val) => searchUsers(val)}
                getOptionLabel={o => `${o.firstName} ${o.lastName} (${o.email})`}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                loading={loadingUsers}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={option.profilePhotoUrl} sx={{ width: 28, height: 28, fontSize: 12 }}>
                      {option.firstName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{option.firstName} {option.lastName}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                    </Box>
                  </Box>
                )}
                renderInput={params => (
                  <TextField {...params} label="Пребарај корисник" placeholder="Име, презиме или email..."
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingUsers ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }
                    }}
                  />
                )}
              />
              {organizer && (
                <Box display="flex" alignItems="center" gap={1.5} mt={2} p={1.5} borderRadius={2}
                  sx={{ bgcolor: alpha('#059669', 0.08), border: `1px solid ${alpha('#059669', 0.2)}` }}>
                  <Avatar src={organizer.profilePhotoUrl} sx={{ width: 36, height: 36 }}>
                    {organizer.firstName[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700} fontSize={14}>{organizer.firstName} {organizer.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{organizer.email}</Typography>
                  </Box>
                  <CheckCircleIcon sx={{ ml: 'auto', color: '#059669' }} />
                </Box>
              )}
            </GlassCard>

            <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={1}>
                <PersonAddIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Потврдени учесници
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Овие корисници ќе бидат автоматски додадени како потврдени. Останатите места се слободни за пријавување преку платформата.
              </Typography>

              <Autocomplete
                multiple
                options={availableForParticipants}
                value={confirmedParticipants}
                onChange={(_, val) => setConfirmedParticipants(val)}
                onInputChange={(_, val) => searchUsers(val)}
                getOptionLabel={o => `${o.firstName} ${o.lastName}`}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                loading={loadingUsers}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        avatar={<Avatar src={option.profilePhotoUrl} sx={{ width: 24, height: 24 }}>{option.firstName[0]}</Avatar>}
                        label={`${option.firstName} ${option.lastName}`}
                        size="small"
                        {...tagProps}
                        sx={{ fontWeight: 600 }}
                      />
                    );
                  })
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={option.profilePhotoUrl} sx={{ width: 24, height: 24, fontSize: 11 }}>
                      {option.firstName[0]}
                    </Avatar>
                    <Typography variant="body2">{option.firstName} {option.lastName}</Typography>
                  </Box>
                )}
                renderInput={params => (
                  <TextField {...params} label="Додај учесници" placeholder="Пребарај..."
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingUsers ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }
                    }}
                  />
                )}
              />

              {confirmedParticipants.length > 0 && (
                <Box mt={2} display="flex" gap={0.5} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary">
                    {confirmedParticipants.length} потврдени · {Math.max(0, maxParticipants - confirmedParticipants.length)} слободни места
                  </Typography>
                </Box>
              )}
            </GlassCard>

            {/* Submit */}
            <GradientButton
              fullWidth size="large" onClick={handleSubmit} disabled={submitting}
              sx={{ py: 2, borderRadius: 3, fontSize: 16 }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Креирај настан'}
            </GradientButton>
          </motion.div>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
