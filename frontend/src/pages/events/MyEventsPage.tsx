import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, CardContent, CardActions,
  Chip, Grid, Alert, ToggleButtonGroup, ToggleButton, alpha,
} from '@mui/material';
import {
  EventNote, EventBusy, CalendarMonth, Place, Groups,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import * as eventsApi from '../../api/events';
import { SportEvent, EVENT_STATUS_LABELS } from '../../types';
import { getSportIcon } from '../../utils/sportIcons';
import AnimatedPage from '../../components/AnimatedPage';
import AnimatedCard from '../../components/AnimatedCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';
import GradientButton from '../../components/GradientButton';

const statusColor = (s: string) => {
  switch (s) {
    case 'Open': return 'success';
    case 'Full': return 'warning';
    case 'InProgress': return 'info';
    case 'Completed': return 'default';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

const statusBorderColor = (s: string) => {
  switch (s) {
    case 'Open': return '#16a34a';
    case 'Full': return '#f59e0b';
    case 'Completed': return '#9ca3af';
    case 'Cancelled': return '#ef4444';
    default: return '#9ca3af';
  }
};

export default function MyEventsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [organized, setOrganized] = useState<SportEvent[]>([]);
  const [participating, setParticipating] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    Promise.all([eventsApi.getMyOrganized(), eventsApi.getMyParticipating()])
      .then(([orgRes, partRes]) => { setOrganized(orgRes.data); setParticipating(partRes.data); })
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box mt={4}><CardSkeleton count={6} /></Box>;

  const allEvents = tab === 0 ? organized : participating;
  const events = allEvents.filter(ev => {
    if (timeFilter === 'upcoming') return dayjs(ev.eventDate).isAfter(dayjs()) && ev.status !== 'Completed' && ev.status !== 'Cancelled';
    if (timeFilter === 'past') return dayjs(ev.eventDate).isBefore(dayjs()) || ev.status === 'Completed' || ev.status === 'Cancelled';
    return true;
  });

  return (
    <AnimatedPage>
      <SectionHeader icon={<EventNote />} title="Мои настани" />
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 2,
            minHeight: 40,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 36,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              px: 2.5,
              mr: 1,
              border: `1px solid ${alpha('#1a56db', 0.12)}`,
              '&.Mui-selected': {
                color: '#fff',
                background: 'linear-gradient(135deg, #1a56db, #059669)',
                border: '1px solid transparent',
              },
            },
          }}
        >
          <Tab label={`Организирани (${organized.length})`} />
          <Tab label={`Учествувам (${participating.length})`} />
        </Tabs>
      </motion.div>

      {/* Time filter */}
      <Box mb={2.5}>
        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={(_, v) => v && setTimeFilter(v)}
          size="small"
          sx={{
            gap: 0.5,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none !important',
              borderRadius: '8px !important',
            },
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 13,
              px: 2.5,
              py: 0.75,
              borderRadius: '8px !important',
              border: `1px solid ${alpha('#1a56db', 0.12)} !important`,
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha('#1a56db', 0.04),
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #1a56db, #059669)',
                color: '#fff',
                fontWeight: 700,
                border: '1px solid transparent !important',
                boxShadow: `0 2px 8px ${alpha('#1a56db', 0.25)}`,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e3a5f, #064e3b)',
                },
              },
            },
          }}
        >
          <ToggleButton value="all">Сите</ToggleButton>
          <ToggleButton value="upcoming">Претстојни</ToggleButton>
          <ToggleButton value="past">Минати</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {events.length === 0 ? (
        <EmptyState
          icon={<EventBusy />}
          title={tab === 0 ? 'Немате организирано настани' : 'Не учествувате во настани'}
          description={tab === 0 ? 'Креирајте ваш прв настан и поканете учесници.' : 'Пребарајте настани и приклучете се.'}
          action={{ label: 'Креирај настан', onClick: () => navigate('/events/create') }}
        />
      ) : (
        <Grid container spacing={2}>
          {events.map((ev, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ev.id}>
              <AnimatedCard
                delay={i * 0.06}
                sx={{
                  borderLeft: `3px solid ${statusBorderColor(ev.status)}`,
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {ev.sportIcon && (
                        <Box sx={{ color: 'primary.main', display: 'flex' }}>
                          {getSportIcon(ev.sportIcon, 18)}
                        </Box>
                      )}
                      <Typography variant="subtitle1" noWrap sx={{ flex: 1 }} fontWeight={600}>{ev.title}</Typography>
                    </Box>
                    <Chip label={EVENT_STATUS_LABELS[ev.status] || ev.status} color={statusColor(ev.status) as any} size="small" />
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.3}>
                    <CalendarMonth sx={{ fontSize: 16, color: 'action.active' }} />
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      {dayjs(ev.eventDate).format('DD.MM.YYYY HH:mm')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.3}>
                    <Place sx={{ fontSize: 16, color: 'action.active' }} />
                    <Typography variant="body2" color="text.secondary" noWrap fontSize={13}>{ev.locationAddress}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Groups sx={{ fontSize: 16, color: 'action.active' }} />
                    <Typography variant="body2" fontWeight={500} fontSize={13}>
                      {ev.currentParticipants}/{ev.maxParticipants} учесници
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
                  <GradientButton size="small" onClick={() => navigate(`/events/${ev.id}`)} sx={{ borderRadius: 2 }}>
                    Детали
                  </GradientButton>
                  {tab === 0 && ev.status === 'Open' && (
                    <GradientButton
                      size="small"
                      onClick={() => navigate(`/events/${ev.id}/edit`)}
                      sx={{ borderRadius: 2 }}
                      gradientFrom="#059669"
                      gradientTo="#1a56db"
                      hoverFrom="#064e3b"
                      hoverTo="#1e3a5f"
                    >
                      Уреди
                    </GradientButton>
                  )}
                </CardActions>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      )}
    </AnimatedPage>
  );
}
