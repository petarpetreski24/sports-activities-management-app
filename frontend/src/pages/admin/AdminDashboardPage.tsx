import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Alert, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, alpha, Avatar,
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      eventsApi.search({ page: 1, pageSize: 10, sortBy: 'date' }),
    ])
      .then(([statsRes, eventsRes]) => {
        setStats(statsRes.data);
        const upcoming = (eventsRes.data.items || eventsRes.data)
          .filter((e: SportEvent) => dayjs(e.eventDate).isAfter(dayjs()) && e.status !== 'Cancelled');
        setUpcomingEvents(upcoming.slice(0, 8));
      })
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
  }, []);

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
        {/* Upcoming Events */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SectionHeader icon={<CalendarMonthIcon />} title="Претстојни настани" count={upcomingEvents.length} />
            <GlassCard noPadding>
              {upcomingEvents.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Typography color="text.secondary">Нема претстојни настани.</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Настан</TableCell>
                        <TableCell>Спорт</TableCell>
                        <TableCell>Датум</TableCell>
                        <TableCell>Учесници</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingEvents.map(ev => (
                        <TableRow
                          key={ev.id}
                          hover
                          sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                          onClick={() => navigate(`/events/${ev.id}`)}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                src={ev.organizerPhotoUrl}
                                sx={{ width: 28, height: 28, fontSize: 12 }}
                              >
                                {ev.organizerName?.[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                                {ev.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={ev.sportName} size="small" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {dayjs(ev.eventDate).format('DD.MM HH:mm')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(ev.eventDate).fromNow()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {ev.currentParticipants}/{ev.maxParticipants}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ev.status === 'Open' ? 'Отворен' : ev.status === 'Full' ? 'Полн' : ev.status}
                              size="small"
                              color={ev.status === 'Open' ? 'success' : ev.status === 'Full' ? 'warning' : 'default'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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
                        <Box
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(color, 0.1),
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              borderRadius: 4,
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
            fullWidth
            size="large"
            startIcon={<PeopleIcon />}
            {...{ component: RouterLink, to: '/admin/users' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Управувај корисници
          </GradientButton>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth
            size="large"
            startIcon={<SportsScoreIcon />}
            gradientFrom="#059669"
            gradientTo="#34d399"
            hoverFrom="#047857"
            hoverTo="#2dd4bf"
            {...{ component: RouterLink, to: '/admin/sports' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Управувај спортови
          </GradientButton>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GradientButton
            fullWidth
            size="large"
            startIcon={<EventIcon />}
            gradientFrom="#7c3aed"
            gradientTo="#a78bfa"
            hoverFrom="#6d28d9"
            hoverTo="#7c3aed"
            {...{ component: RouterLink, to: '/admin/events' } as any}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Управувај настани
          </GradientButton>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
