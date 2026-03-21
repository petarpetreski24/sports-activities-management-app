import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Grid, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import StarRateIcon from '@mui/icons-material/StarRate';
import CommentIcon from '@mui/icons-material/Comment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import * as adminApi from '../../api/admin';
import { AdminStats } from '../../types';
import AnimatedPage from '../../components/AnimatedPage';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import StatCard from '../../components/StatCard';
import GradientButton from '../../components/GradientButton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box mt={4}><CardSkeleton count={8} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  const cards = [
    { label: 'Вкупно корисници', value: stats.totalUsers, icon: <PeopleIcon />, color: '#1a56db' },
    { label: 'Нови корисници', value: stats.newUsersThisMonth, icon: <PeopleIcon />, color: '#059669' },
    { label: 'Вкупно настани', value: stats.totalEvents, icon: <EventIcon />, color: '#e65100' },
    { label: 'Активни настани', value: stats.activeEvents, icon: <EventIcon />, color: '#7c3aed' },
    { label: 'Нови настани', value: stats.newEventsThisMonth, icon: <EventIcon />, color: '#0891b2' },
    { label: 'Спортови', value: stats.totalSports, icon: <SportsScoreIcon />, color: '#dc2626' },
    { label: 'Коментари', value: stats.totalComments, icon: <CommentIcon />, color: '#92400e' },
    { label: 'Оценки', value: stats.totalRatings, icon: <StarRateIcon />, color: '#475569' },
  ];

  return (
    <AnimatedPage>
      <SectionHeader icon={<AdminPanelSettingsIcon />} title="Админ панел" />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cards.map((c, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <StatCard
              label={c.label}
              value={c.value}
              icon={c.icon}
              color={c.color}
              delay={i * 0.06}
            />
          </Grid>
        ))}
      </Grid>

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
      </Grid>
    </AnimatedPage>
  );
}
