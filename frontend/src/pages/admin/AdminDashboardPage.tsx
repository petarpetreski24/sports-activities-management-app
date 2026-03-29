import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Grid, Alert, Typography, alpha, useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import StarRateIcon from '@mui/icons-material/StarRate';
import CommentIcon from '@mui/icons-material/Comment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { motion } from 'framer-motion';
import * as adminApi from '../../api/admin';
import * as eventsApi from '../../api/events';
import { AdminStats, SportEvent } from '../../types';
import AnimatedPage from '../../components/AnimatedPage';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import StatCard from '../../components/StatCard';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import dayjs from 'dayjs';

export default function AdminDashboardPage() {
  const theme = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allEvents, setAllEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      eventsApi.search({ page: 1, pageSize: 100, sortBy: 'date' }),
    ])
      .then(([statsRes, eventsRes]) => {
        setStats(statsRes.data);
        setAllEvents(eventsRes.data.items || eventsRes.data as any);
      })
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
  }, []);

  // Build 7-day events data
  const weekData = useMemo(() => {
    const days: { label: string; date: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const count = allEvents.filter(ev =>
        dayjs(ev.eventDate).format('YYYY-MM-DD') === dateStr && ev.status !== 'Cancelled'
      ).length;
      days.push({
        label: i === 0 ? 'Денес' : i === 1 ? 'Утре' : d.format('ddd DD'),
        date: dateStr,
        count,
      });
    }
    return days;
  }, [allEvents]);

  const maxDayCount = Math.max(...weekData.map(d => d.count), 1);

  if (loading) return <Box mt={4}><CardSkeleton count={8} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  const cards = [
    { label: 'Вкупно корисници', value: stats.totalUsers, icon: <PeopleIcon />, color: '#1a56db' },
    { label: 'Нови корисници (месец)', value: stats.newUsersThisMonth, icon: <TrendingUpIcon />, color: '#059669' },
    { label: 'Вкупно настани', value: stats.totalEvents, icon: <EventIcon />, color: '#e65100' },
    { label: 'Активни настани', value: stats.activeEvents, icon: <CalendarMonthIcon />, color: '#7c3aed' },
    { label: 'Нови настани (месец)', value: stats.newEventsThisMonth, icon: <EventNoteIcon />, color: '#0891b2' },
    { label: 'Спортови', value: stats.totalSports, icon: <SportsScoreIcon />, color: '#dc2626' },
    { label: 'Коментари', value: stats.totalComments, icon: <CommentIcon />, color: '#92400e' },
    { label: 'Оценки', value: stats.totalRatings, icon: <StarRateIcon />, color: '#475569' },
  ];

  const BAR_COLORS = ['#1a56db', '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed', '#4f46e5'];

  return (
    <AnimatedPage>
      <SectionHeader icon={<AdminPanelSettingsIcon />} title="Админ панел" subtitle="Преглед и управување на платформата" />

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cards.map((c, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
            <StatCard label={c.label} value={c.value} icon={c.icon} color={c.color} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 7-Day Events Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SectionHeader icon={<CalendarMonthIcon />} title="Настани — наредни 7 дена" />
            <GlassCard>
              <Box display="flex" alignItems="flex-end" gap={1.5} sx={{ height: 180 }}>
                {weekData.map((day, i) => {
                  const heightPct = day.count > 0 ? Math.max((day.count / maxDayCount) * 100, 12) : 4;
                  const isToday = i === 0;
                  return (
                    <Box
                      key={day.date}
                      flex={1}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="flex-end"
                      height="100%"
                    >
                      {/* Count label */}
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        fontSize={day.count > 0 ? 14 : 12}
                        color={day.count > 0 ? 'text.primary' : 'text.secondary'}
                        sx={{ mb: 0.5 }}
                      >
                        {day.count}
                      </Typography>
                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: 'easeOut' as const }}
                        style={{
                          width: '100%',
                          maxWidth: 48,
                          borderRadius: 8,
                          background: day.count > 0
                            ? `linear-gradient(180deg, ${BAR_COLORS[i]}, ${alpha(BAR_COLORS[i], 0.5)})`
                            : alpha(theme.palette.text.disabled, 0.1),
                          boxShadow: day.count > 0 ? `0 4px 12px ${alpha(BAR_COLORS[i], 0.3)}` : 'none',
                          border: isToday ? `2px solid ${alpha('#f59e0b', 0.6)}` : 'none',
                        }}
                      />
                      {/* Day label */}
                      <Typography
                        variant="caption"
                        fontWeight={isToday ? 800 : 600}
                        color={isToday ? 'primary.main' : 'text.secondary'}
                        sx={{ mt: 1, fontSize: 11, textAlign: 'center', lineHeight: 1.2 }}
                      >
                        {day.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              {/* Total summary */}
              <Box display="flex" justifyContent="center" mt={2} pt={2} borderTop={`1px solid ${alpha(theme.palette.divider, 0.3)}`}>
                <Typography variant="body2" color="text.secondary">
                  Вкупно <Typography component="span" fontWeight={800} color="text.primary">
                    {weekData.reduce((s, d) => s + d.count, 0)}
                  </Typography> настани во наредните 7 дена
                </Typography>
              </Box>
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Top Sports */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <SectionHeader icon={<SportsScoreIcon />} title="Топ спортови" />
            <GlassCard>
              {stats.topSports.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">Нема податоци.</Typography>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {stats.topSports.map((sport, i) => {
                    const maxCount = stats.topSports[0]?.count || 1;
                    const percent = (sport.count / maxCount) * 100;
                    const colors = ['#1a56db', '#059669', '#f59e0b', '#dc2626', '#8b5cf6'];
                    const color = colors[i % colors.length];
                    return (
                      <Box key={sport.sportName}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" fontWeight={600}>{sport.sportName}</Typography>
                          <Typography variant="body2" color="text.secondary">{sport.count} настани</Typography>
                        </Box>
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: alpha(color, 0.1), overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' as const }}
                            style={{
                              height: '100%', borderRadius: 4,
                              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <SectionHeader icon={<AdminPanelSettingsIcon />} title="Управување" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth size="large" startIcon={<PeopleIcon />}
            {...{ component: RouterLink, to: '/admin/users' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Управувај корисници
          </GradientButton>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth size="large" startIcon={<SportsScoreIcon />}
            gradientFrom="#059669" gradientTo="#34d399" hoverFrom="#047857" hoverTo="#2dd4bf"
            {...{ component: RouterLink, to: '/admin/sports' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Управувај спортови
          </GradientButton>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth size="large" startIcon={<EventIcon />}
            gradientFrom="#7c3aed" gradientTo="#a78bfa" hoverFrom="#6d28d9" hoverTo="#7c3aed"
            {...{ component: RouterLink, to: '/admin/events' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Управувај настани
          </GradientButton>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth size="large" startIcon={<ReportProblemIcon />}
            gradientFrom="#dc2626" gradientTo="#f87171" hoverFrom="#b91c1c" hoverTo="#dc2626"
            {...{ component: RouterLink, to: '/admin/reports' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Пријави
          </GradientButton>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth size="large" startIcon={<AddCircleOutlineIcon />}
            gradientFrom="#0891b2" gradientTo="#22d3ee" hoverFrom="#0e7490" hoverTo="#06b6d4"
            {...{ component: RouterLink, to: '/admin/events/create' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Креирај настан
          </GradientButton>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
