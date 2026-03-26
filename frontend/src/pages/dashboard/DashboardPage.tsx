import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, CardContent, Chip, Avatar,
  Alert, Rating, IconButton, alpha, Fab, Badge,
  Drawer, Divider, Button, useMediaQuery, useTheme,
  LinearProgress, Tooltip,
} from '@mui/material';
import {
  Event, Star, CheckCircle, Cancel, Place, NotificationsActive,
  PendingActions, Close, CalendarMonth, AutoAwesome,
  Notifications, EmojiEvents, Groups, EventBusy, WavingHand,
  TrendingUp, PieChart as PieChartIcon, ArrowForward,
  AccessTime, Bolt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { DashboardData, SportEvent, PendingApplication } from '../../types';
import * as dashboardApi from '../../api/dashboard';
import * as applicationsApi from '../../api/applications';
import * as eventsApi from '../../api/events';
import AnimatedPage from '../../components/AnimatedPage';
import AnimatedCard from '../../components/AnimatedCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../contexts/AuthContext';
import { getSportIcon } from '../../utils/sportIcons';
import dayjs from 'dayjs';
import 'dayjs/locale/mk';

dayjs.locale('mk');

const CHART_COLORS = ['#1a56db', '#059669', '#f59e0b', '#dc2626', '#8b5cf6', '#0891b2', '#ea580c', '#16a34a'];

// Compact event card for the dashboard
function EventCard({ event, onClick, index }: { event: SportEvent; onClick: () => void; index: number }) {
  const fillPercent = (event.currentParticipants / event.maxParticipants) * 100;

  return (
    <AnimatedCard
      delay={index * 0.08}
      onClick={onClick}
      variant="gradient"
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            {event.sportIcon && (
              <Box sx={{ color: 'primary.main', display: 'flex' }}>
                {getSportIcon(event.sportIcon, 18)}
              </Box>
            )}
            <Chip label={event.sportName} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
          </Box>
          <Chip
            label={event.status === 'Open' ? 'Отворен' : event.status}
            size="small"
            color={event.status === 'Open' ? 'success' : 'default'}
            sx={{ height: 22, fontSize: 11 }}
          />
        </Box>
        <Typography variant="subtitle1" gutterBottom noWrap fontWeight={600} sx={{ lineHeight: 1.3, fontSize: 14 }}>
          {event.title}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5} mb={0.3}>
          <Event sx={{ fontSize: 15 }} color="action" />
          <Typography variant="body2" color="text.secondary" fontSize={12}>
            {dayjs(event.eventDate).format('DD.MM.YYYY HH:mm')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <Place sx={{ fontSize: 15 }} color="action" />
          <Typography variant="body2" color="text.secondary" noWrap fontSize={12}>
            {event.locationAddress}
          </Typography>
        </Box>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
            <Typography variant="caption" fontWeight={500}>
              {event.currentParticipants}/{event.maxParticipants}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(fillPercent)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={fillPercent}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: alpha('#1a56db', 0.08),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: 'linear-gradient(90deg, #1a56db, #059669)',
              },
            }}
          />
        </Box>
      </CardContent>
    </AnimatedCard>
  );
}

// Custom tooltip for pie chart
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      backdropFilter: 'blur(8px)',
      p: 1.5,
      borderRadius: 2,
      border: `1px solid ${alpha('#1a56db', 0.1)}`,
      boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
    }}>
      <Typography variant="body2" fontWeight={600}>{payload[0].name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {payload[0].value} настани
      </Typography>
    </Box>
  );
}

// Custom tooltip for area chart
function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      backdropFilter: 'blur(8px)',
      p: 1.5,
      borderRadius: 2,
      border: `1px solid ${alpha('#1a56db', 0.1)}`,
      boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
    }}>
      <Typography variant="body2" fontWeight={600}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">
        {payload[0].value} настани
      </Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastMinuteEvents, setLastMinuteEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingOpen, setPendingOpen] = useState(false);

  const loadDashboard = () => {
    dashboardApi.getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
    eventsApi.getLastMinute()
      .then(({ data }) => setLastMinuteEvents(data))
      .catch(() => {});
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleApprove = async (app: PendingApplication) => {
    try { await applicationsApi.approve(app.eventId, app.applicationId); loadDashboard(); } catch { }
  };

  const handleReject = async (app: PendingApplication) => {
    try { await applicationsApi.reject(app.eventId, app.applicationId); loadDashboard(); } catch { }
  };

  // Compute chart data from events
  const sportDistribution = useMemo(() => {
    if (!data) return [];
    const allEvents = [...data.upcomingEvents, ...data.suggestedEvents];
    const counts: Record<string, number> = {};
    allEvents.forEach(e => {
      counts[e.sportName] = (counts[e.sportName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data]);

  const monthlyActivity = useMemo(() => {
    if (!data) return [];
    const allEvents = [...data.upcomingEvents, ...data.suggestedEvents];
    const months: Record<string, number> = {};
    // Show 6 months range
    for (let i = -2; i <= 3; i++) {
      const m = dayjs().add(i, 'month');
      const key = m.format('MMM');
      months[key] = 0;
    }
    allEvents.forEach(e => {
      const key = dayjs(e.eventDate).format('MMM');
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([name, events]) => ({ name, events }));
  }, [data]);

  // Calendar data - upcoming event dates
  const calendarDays = useMemo(() => {
    if (!data) return [];
    const today = dayjs();
    const days: { date: dayjs.Dayjs; events: SportEvent[]; isToday: boolean }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = today.add(i, 'day');
      const dayEvents = data.upcomingEvents.filter(e =>
        dayjs(e.eventDate).isSame(d, 'day')
      );
      days.push({ date: d, events: dayEvents, isToday: i === 0 });
    }
    return days;
  }, [data]);

  if (loading) return <Box mt={4}><CardSkeleton count={6} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const pendingCount = data.pendingApplications.length;
  const todayFormatted = dayjs().format('dddd, D MMMM YYYY');

  return (
    <AnimatedPage>
      {/* Hero Greeting */}
      <Box mb={3}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Typography variant="h4" fontWeight={700}>
              Добредојде, {user?.firstName || 'корисник'}
            </Typography>
            <motion.div
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', originX: 0.7, originY: 0.7 }}
            >
              <WavingHand sx={{ fontSize: 32, color: '#f59e0b' }} />
            </motion.div>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Еве го твојот преглед за денес &middot; {todayFormatted}
          </Typography>
        </motion.div>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Учества" value={data.stats.totalEventsParticipated} icon={<EmojiEvents />} color="#1a56db" delay={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Организирани" value={data.stats.totalEventsOrganized} icon={<Groups />} color="#059669" delay={0.1} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Просечна оценка" value={data.stats.avgRating || 0} decimals={1} icon={<Star />} color="#f59e0b" delay={0.2} />
        </Grid>
      </Grid>

      {/* Charts + Calendar Row */}
      <Grid container spacing={2} mb={3}>
        {/* Sport Distribution Donut */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard sx={{ p: 2.5, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <PieChartIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Спортови</Typography>
              </Box>
              {sportDistribution.length > 0 ? (
                <>
                  <Box sx={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={sportDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {sportDistribution.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                    {sportDistribution.map((s, i) => (
                      <Chip
                        key={s.name}
                        label={`${s.name} (${s.value})`}
                        size="small"
                        sx={{
                          height: 22, fontSize: 11,
                          bgcolor: alpha(CHART_COLORS[i % CHART_COLORS.length], 0.1),
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    ))}
                  </Box>
                </>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">Нема податоци</Typography>
                </Box>
              )}
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Monthly Activity Area Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard sx={{ p: 2.5, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #059669, #16a34a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <TrendingUp sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Активност</Typography>
              </Box>
              {monthlyActivity.some(m => m.events > 0) ? (
                <Box sx={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <AreaChart data={monthlyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1a56db" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#1a56db', 0.08)} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#888', fontSize: 11 }}
                        axisLine={{ stroke: alpha('#1a56db', 0.1) }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#888', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip content={<AreaTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#1a56db"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                        dot={{ fill: '#1a56db', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#1a56db', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">Нема активност</Typography>
                </Box>
              )}
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Mini Calendar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard sx={{ p: 2.5, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <CalendarMonth sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Календар</Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                }}
              >
                {calendarDays.map((day, i) => {
                  const hasEvents = day.events.length > 0;
                  return (
                    <Tooltip
                      key={i}
                      title={hasEvents ? day.events.map(e => e.title).join(', ') : ''}
                      arrow
                      disableHoverListener={!hasEvents}
                    >
                      <Box
                        sx={{
                          aspectRatio: '1',
                          borderRadius: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: hasEvents ? 'pointer' : 'default',
                          position: 'relative',
                          bgcolor: day.isToday
                            ? alpha('#1a56db', 0.12)
                            : hasEvents
                              ? alpha('#059669', 0.08)
                              : alpha('#000', 0.02),
                          border: day.isToday
                            ? `2px solid ${alpha('#1a56db', 0.4)}`
                            : '2px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': hasEvents ? {
                            bgcolor: alpha('#059669', 0.15),
                            transform: 'scale(1.08)',
                          } : {},
                        }}
                        onClick={hasEvents ? () => navigate(`/events/${day.events[0].id}`) : undefined}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 9,
                            color: 'text.secondary',
                            lineHeight: 1,
                            textTransform: 'uppercase',
                          }}
                        >
                          {day.date.format('dd')}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={day.isToday || hasEvents ? 700 : 400}
                          sx={{
                            color: day.isToday ? '#1a56db' : hasEvents ? '#059669' : 'text.primary',
                            lineHeight: 1.2,
                          }}
                        >
                          {day.date.format('D')}
                        </Typography>
                        {hasEvents && (
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              bgcolor: '#059669',
                              position: 'absolute',
                              bottom: 3,
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
              {data.upcomingEvents.length > 0 && (
                <Box mt={2}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Следно:
                  </Typography>
                  {data.upcomingEvents.slice(0, 2).map(ev => (
                    <Box
                      key={ev.id}
                      display="flex" alignItems="center" gap={1} mt={0.8}
                      sx={{
                        cursor: 'pointer',
                        '&:hover .event-title': { color: '#1a56db' },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => navigate(`/events/${ev.id}`)}
                    >
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1a56db, #059669)',
                        flexShrink: 0,
                      }} />
                      <Box flex={1} minWidth={0}>
                        <Typography
                          className="event-title"
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          fontSize={12}
                          sx={{ transition: 'color 0.2s' }}
                        >
                          {ev.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.3}>
                          <AccessTime sx={{ fontSize: 10, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary" fontSize={10}>
                            {dayjs(ev.eventDate).format('DD MMM, HH:mm')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Last Minute Events */}
      {lastMinuteEvents.length > 0 && (
        <Box mb={3}>
          <SectionHeader
            icon={<Bolt />}
            title="Итен повик"
            count={lastMinuteEvents.length}
            action={
              <GradientButton
                size="small"
                onClick={() => navigate('/events')}
                sx={{ px: 2 }}
                gradientFrom="#dc2626"
                gradientTo="#f59e0b"
                hoverFrom="#b91c1c"
                hoverTo="#d97706"
              >
                Сите <ArrowForward sx={{ ml: 0.5, fontSize: 16 }} />
              </GradientButton>
            }
          />
          <Grid container spacing={2}>
            {lastMinuteEvents.slice(0, isMd ? 4 : 6).map((event, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{
                    position: 'absolute', top: 8, right: 8, zIndex: 1,
                    px: 1, py: 0.25, borderRadius: 1,
                    bgcolor: alpha('#dc2626', 0.9), color: '#fff',
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.05em',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
                  }}>
                    ИТНО
                  </Box>
                  <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} index={i} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upcoming Events */}
      {data.upcomingEvents.length > 0 && (
        <Box mb={3}>
          <SectionHeader
            icon={<CalendarMonth />}
            title="Претстојни настани"
            count={data.upcomingEvents.length}
            action={
              <GradientButton size="small" onClick={() => navigate('/my-events')} sx={{ px: 2 }}>
                Сите <ArrowForward sx={{ ml: 0.5, fontSize: 16 }} />
              </GradientButton>
            }
          />
          <Grid container spacing={2}>
            {data.upcomingEvents.slice(0, isMd ? 4 : 6).map((event, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} index={i} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Suggested Events */}
      {data.suggestedEvents.length > 0 && (
        <Box mb={3}>
          <SectionHeader
            icon={<AutoAwesome />}
            title="Предложени настани"
            count={data.suggestedEvents.length}
            action={
              <GradientButton
                size="small"
                onClick={() => navigate('/events')}
                sx={{ px: 2 }}
                gradientFrom="#059669"
                gradientTo="#1a56db"
              >
                Пребарај <ArrowForward sx={{ ml: 0.5, fontSize: 16 }} />
              </GradientButton>
            }
          />
          <Grid container spacing={2}>
            {data.suggestedEvents.slice(0, isMd ? 4 : 6).map((event, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} index={i} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recent Notifications */}
      {data.recentNotifications && data.recentNotifications.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Box mb={3}>
            <SectionHeader
              icon={<Notifications />}
              title="Последни известувања"
              count={data.recentNotifications.length}
              action={
                <GradientButton
                  size="small"
                  onClick={() => navigate('/notifications')}
                  sx={{ px: 2 }}
                  gradientFrom="#dc2626"
                  gradientTo="#f59e0b"
                  hoverFrom="#b91c1c"
                  hoverTo="#d97706"
                >
                  Сите
                </GradientButton>
              }
            />
            <Box display="flex" flexDirection="column" gap={1}>
              {data.recentNotifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <GlassCard
                    onClick={notif.referenceEventId ? () => navigate(`/events/${notif.referenceEventId}`) : undefined}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderLeft: '3px solid',
                      borderLeftColor: notif.isRead ? 'transparent' : '#1a56db',
                      cursor: notif.referenceEventId ? 'pointer' : 'default',
                      '&:hover': notif.referenceEventId
                        ? { borderLeftColor: '#1a56db', bgcolor: alpha('#1a56db', 0.04) }
                        : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: notif.isRead ? alpha('#888', 0.1) : alpha('#1a56db', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <NotificationsActive color={notif.isRead ? 'disabled' : 'primary'} sx={{ fontSize: 18 }} />
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={notif.isRead ? 400 : 600} variant="body2" noWrap fontSize={13}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {notif.message}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: 11 }}>
                      {dayjs(notif.createdAt).format('DD.MM')}
                    </Typography>
                  </GlassCard>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Empty State */}
      {data.upcomingEvents.length === 0 && data.suggestedEvents.length === 0 && (
        <EmptyState
          icon={<EventBusy />}
          title="Нема претстојни настани"
          description="Моментално немате претстојни или предложени настани. Пребарајте настани за да најдете нешто интересно!"
          action={{
            label: 'Пребарај настани',
            onClick: () => navigate('/events'),
          }}
        />
      )}

      {/* Floating Action Button for Pending Applications */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}
        >
          <Badge
            badgeContent={pendingCount}
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 14,
                fontWeight: 700,
                minWidth: 24,
                height: 24,
                borderRadius: 12,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' },
                },
              },
            }}
          >
            <Fab
              color="warning"
              onClick={() => setPendingOpen(true)}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706, #c2410c)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 40px rgba(245, 158, 11, 0.55), 0 0 20px rgba(245, 158, 11, 0.3)',
                },
                transition: 'all 0.2s',
              }}
            >
              <PendingActions sx={{ fontSize: 28 }} />
            </Fab>
          </Badge>
        </motion.div>
      )}

      {/* Pending Applications Drawer */}
      <Drawer
        anchor="right"
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, borderRadius: { xs: 0, sm: '20px 0 0 20px' } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <PendingActions />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>Пријави</Typography>
                <Typography variant="caption" color="text.secondary">{pendingCount} чекаат одобрување</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setPendingOpen(false)}><Close /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <AnimatePresence>
            {data.pendingApplications.map((app, i) => (
              <motion.div
                key={app.applicationId}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: alpha('#f59e0b', 0.25),
                    bgcolor: alpha('#f59e0b', 0.03),
                    '&:hover': {
                      borderColor: alpha('#f59e0b', 0.5),
                      bgcolor: alpha('#f59e0b', 0.06),
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <Avatar
                      src={app.userPhotoUrl}
                      sx={{
                        width: 48,
                        height: 48,
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        '&:hover': { borderColor: '#f59e0b' },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => { setPendingOpen(false); navigate(`/users/${app.userId}`); }}
                    >
                      {app.userName[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        fontWeight={600}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline', color: 'primary.main' },
                        }}
                        onClick={() => { setPendingOpen(false); navigate(`/users/${app.userId}`); }}
                      >
                        {app.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">за: {app.eventTitle}</Typography>
                      {app.userAvgRating != null && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
                          <Rating value={app.userAvgRating} readOnly size="small" />
                          <Typography variant="caption">({app.userAvgRating.toFixed(1)})</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(app)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Одобри
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleReject(app)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Одбиј
                    </Button>
                  </Box>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {pendingCount === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">Нема пријави кои чекаат.</Typography>
            </Box>
          )}
        </Box>
      </Drawer>
    </AnimatedPage>
  );
}
