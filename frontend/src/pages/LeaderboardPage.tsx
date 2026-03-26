import { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Chip, ToggleButtonGroup, ToggleButton,
  alpha, useTheme,
} from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as statsApi from '../api/stats';
import { LeaderboardData } from '../types';
import AnimatedPage, { staggerContainer, fadeInUp } from '../components/AnimatedPage';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [period, setPeriod] = useState<string>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    statsApi.getLeaderboard(period).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  const periodLabel = period === 'weekly' ? 'Неделен' : period === 'monthly' ? 'Месечен' : 'Сите времиња';

  const renderLeaderboard = (
    title: string,
    icon: React.ReactNode,
    entries: LeaderboardData['mostActivePlayers'],
    valueLabel: string,
    showRating: boolean = false,
  ) => (
    <GlassCard hoverEffect={false} sx={{ flex: 1, minWidth: 300 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {icon}
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
      </Box>
      {entries.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={3}>Нема податоци за овој период</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {entries.map((entry, i) => (
            <motion.div key={entry.userId} variants={fadeInUp}>
              <Box
                display="flex" alignItems="center" gap={1.5}
                onClick={() => navigate(`/users/${entry.userId}`)}
                sx={{
                  py: 1.25, px: 1.5, borderRadius: 2, cursor: 'pointer',
                  bgcolor: i < 3 ? alpha(MEDAL_COLORS[i], 0.08) : 'transparent',
                  border: i < 3 ? `1px solid ${alpha(MEDAL_COLORS[i], 0.2)}` : '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                <Typography
                  fontWeight={800} fontSize={16} sx={{ width: 28, textAlign: 'center' }}
                  color={i < 3 ? MEDAL_COLORS[i] : 'text.secondary'}
                >
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}.`}
                </Typography>
                <Avatar src={entry.photoUrl} sx={{ width: 36, height: 36 }}>
                  {entry.name?.[0]}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography fontWeight={600} noWrap fontSize={14}>{entry.name}</Typography>
                  {showRating && entry.rating && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary">{entry.rating.toFixed(1)}</Typography>
                    </Box>
                  )}
                </Box>
                <Chip
                  label={`${entry.eventCount} ${valueLabel}`}
                  size="small"
                  sx={{
                    fontWeight: 700, borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
            </motion.div>
          ))}
        </Box>
      )}
    </GlassCard>
  );

  return (
    <AnimatedPage>
      <SectionHeader
        icon={<LeaderboardIcon />}
        title="Ранг листа"
        subtitle={periodLabel + ' преглед'}
        action={
          <ToggleButtonGroup
            value={period} exclusive size="small"
            onChange={(_, v) => v && setPeriod(v)}
            sx={{ '& .MuiToggleButton-root': { borderRadius: 2, fontWeight: 600, textTransform: 'none' } }}
          >
            <ToggleButton value="weekly">Неделен</ToggleButton>
            <ToggleButton value="monthly">Месечен</ToggleButton>
            <ToggleButton value="alltime">Сите</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {/* Weekly Insights */}
      {data?.weeklyInsights && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
            {[
              {
                label: 'Нови настани',
                value: data.weeklyInsights.newEvents,
                trend: data.weeklyInsights.eventsTrend,
                icon: <EventIcon />,
                color: '#1a56db',
              },
              {
                label: 'Нови корисници',
                value: data.weeklyInsights.newUsers,
                icon: <PeopleIcon />,
                color: '#059669',
              },
              {
                label: 'Апликации',
                value: data.weeklyInsights.totalApplications,
                icon: <EmojiEventsIcon />,
                color: '#f59e0b',
              },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} style={{ flex: 1, minWidth: 180 }}>
                <GlassCard hoverEffect={false}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2.5, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.6)})`,
                      color: '#fff',
                    }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                        {stat.trend !== undefined && stat.trend !== 0 && (
                          <Chip
                            icon={stat.trend > 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                            label={`${stat.trend > 0 ? '+' : ''}${stat.trend}%`}
                            size="small"
                            sx={{
                              height: 20, fontSize: 11, fontWeight: 700,
                              bgcolor: alpha(stat.trend > 0 ? '#059669' : '#dc2626', 0.1),
                              color: stat.trend > 0 ? '#059669' : '#dc2626',
                              '& .MuiChip-icon': { color: 'inherit' },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </GlassCard>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      )}

      {/* Trending Sports */}
      {data?.trendingSports && data.trendingSports.length > 0 && (
        <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Трендинг спортови оваа недела</Typography>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {data.trendingSports.map((sport, i) => (
              <Chip
                key={i}
                label={`${sport.sportName} (${sport.count})`}
                sx={{
                  fontWeight: 600, fontSize: 14, py: 2.5, borderRadius: 2,
                  bgcolor: alpha(['#1a56db', '#059669', '#f59e0b', '#dc2626', '#8b5cf6'][i % 5], 0.1),
                  color: ['#1a56db', '#059669', '#f59e0b', '#dc2626', '#8b5cf6'][i % 5],
                  border: `1px solid ${alpha(['#1a56db', '#059669', '#f59e0b', '#dc2626', '#8b5cf6'][i % 5], 0.2)}`,
                }}
              />
            ))}
          </Box>
        </GlassCard>
      )}

      {/* Leaderboards */}
      {!loading && data && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <Box display="flex" gap={2} flexWrap="wrap">
            {renderLeaderboard('Најактивни играчи', <EmojiEventsIcon sx={{ color: '#f59e0b' }} />, data.mostActivePlayers, 'настани')}
            {renderLeaderboard('Топ организатори', <StarIcon sx={{ color: '#1a56db' }} />, data.topOrganizers, 'настани', true)}
            {renderLeaderboard('Топ учесници', <StarIcon sx={{ color: '#059669' }} />, data.topParticipants, 'настани', true)}
          </Box>
        </motion.div>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <Typography color="text.secondary">Се вчитува...</Typography>
        </Box>
      )}
    </AnimatedPage>
  );
}
