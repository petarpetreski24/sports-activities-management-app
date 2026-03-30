import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Avatar, Chip, ToggleButtonGroup, ToggleButton,
  alpha, useTheme, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PlaceIcon from '@mui/icons-material/Place';
import BoltIcon from '@mui/icons-material/Bolt';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as statsApi from '../api/stats';
import { LeaderboardData, HeatmapData } from '../types';
import AnimatedPage, { staggerContainer, fadeInUp } from '../components/AnimatedPage';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

// Realistic Macedonia outline — traced from actual map coordinates
// ViewBox: 0 0 600 340, country centered with padding
const MACEDONIA_PATH = `M 155 58 L 170 52 L 190 48 L 210 42 L 228 40 L 250 38 L 268 42 L 282 38 L 300 36 L 322 40 L 340 38 L 360 42 L 375 48 L 388 56 L 398 52 L 412 56 L 425 64 L 435 72 L 440 82 L 448 96 L 455 108 L 458 120 L 460 132 L 456 148 L 450 160 L 445 172 L 438 184 L 428 196 L 420 208 L 410 218 L 398 226 L 385 232 L 372 240 L 358 246 L 342 252 L 328 258 L 315 262 L 300 264 L 282 266 L 265 264 L 250 260 L 238 262 L 222 258 L 208 260 L 192 256 L 178 250 L 165 242 L 155 234 L 148 224 L 140 212 L 132 200 L 126 188 L 122 175 L 118 162 L 115 148 L 114 135 L 115 122 L 118 108 L 122 96 L 128 84 L 135 72 L 142 64 L 148 60 Z`;

// Cities positioned for 600x340 viewBox based on real geography
const MK_CITIES: Record<string, { x: number; y: number }> = {
  'Скопје': { x: 310, y: 100 },
  'Тетово': { x: 240, y: 85 },
  'Куманово': { x: 370, y: 80 },
  'Гостивар': { x: 218, y: 110 },
  'Кичево': { x: 195, y: 155 },
  'Велес': { x: 332, y: 145 },
  'Штип': { x: 395, y: 145 },
  'Прилеп': { x: 278, y: 198 },
  'Битола': { x: 248, y: 235 },
  'Охрид': { x: 170, y: 210 },
  'Струга': { x: 152, y: 190 },
  'Кавадарци': { x: 330, y: 188 },
  'Струмица': { x: 430, y: 198 },
};

// Convert lat/lng to SVG position (600x340 viewBox)
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  // Macedonia bounds: lat 40.85–42.38, lng 20.43–23.05
  const x = 114 + ((lng - 20.43) / (23.05 - 20.43)) * 346;
  const y = 36 + ((42.38 - lat) / (42.38 - 40.85)) * 232;
  return { x: Math.round(x), y: Math.round(y) };
}

const SPORT_COLORS: Record<string, string> = {
  'Фудбал': '#059669', 'Кошарка': '#f59e0b', 'Одбојка': '#1a56db',
  'Тенис': '#dc2626', 'Ракомет': '#8b5cf6', 'Пинг-понг': '#0891b2',
  'Пливање': '#0ea5e9', 'Трчање': '#ea580c', 'Велосипедизам': '#16a34a',
  'Бадминтон': '#d946ef',
};

export default function CommunityPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [period, setPeriod] = useState<string>('weekly');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'organizers'>('overview');

  useEffect(() => {
    Promise.all([
      statsApi.getLeaderboard(period),
      statsApi.getHeatmap(),
    ]).then(([lb, hm]) => {
      setLeaderboard(lb.data);
      setHeatmap(hm.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  // Compute heatmap dots from events
  const heatDots = useMemo(() => {
    if (!heatmap?.events) return [];
    // Group events by location — finer grid (nearest 6px) to avoid over-merging
    const groups: Record<string, { x: number; y: number; count: number; sport: string; active: number }> = {};
    heatmap.events.forEach(ev => {
      const pos = geoToSvg(ev.lat, ev.lng);
      const key = `${Math.round(pos.x / 6) * 6},${Math.round(pos.y / 6) * 6}`;
      if (!groups[key]) groups[key] = { x: pos.x, y: pos.y, count: 0, sport: ev.sportName, active: 0 };
      groups[key].count++;
      if (ev.status === 'Open' || ev.status === 'Full') groups[key].active++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [heatmap]);

  const renderLeaderboard = (
    entries: LeaderboardData['mostActivePlayers'],
    showRating: boolean = false,
  ) => (
    <Box display="flex" flexDirection="column" gap={0.75}>
      {entries.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={3}>Нема податоци</Typography>
      ) : entries.slice(0, 5).map((entry, i) => (
        <motion.div
          key={entry.userId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
        >
          <Box
            display="flex" alignItems="center" gap={1.5}
            onClick={() => navigate(`/users/${entry.userId}`)}
            sx={{
              py: 1, px: 1.5, borderRadius: 2, cursor: 'pointer',
              bgcolor: i === 0 ? alpha('#FFD700', 0.08) : 'transparent',
              border: i < 3 ? `1px solid ${alpha(MEDAL_COLORS[i], 0.2)}` : '1px solid transparent',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), transform: 'translateX(4px)' },
            }}
          >
            <Typography
              fontWeight={800} fontSize={16} sx={{ width: 28, textAlign: 'center' }}
              color={i < 3 ? MEDAL_COLORS[i] : 'text.secondary'}
            >
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}.`}
            </Typography>
            <Avatar src={entry.photoUrl} sx={{ width: 32, height: 32, fontSize: 13 }}>
              {entry.name?.[0]}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={600} noWrap fontSize={13}>{entry.name}</Typography>
              {showRating && entry.rating != null && (
                <Box display="flex" alignItems="center" gap={0.3}>
                  <StarIcon sx={{ fontSize: 12, color: '#f59e0b' }} />
                  <Typography variant="caption" color="text.secondary" fontSize={11}>{entry.rating.toFixed(1)}</Typography>
                </Box>
              )}
            </Box>
            <Chip
              label={entry.eventCount}
              size="small"
              sx={{
                fontWeight: 800, borderRadius: 1.5, minWidth: 32,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            />
          </Box>
        </motion.div>
      ))}
    </Box>
  );

  if (loading) return (
    <AnimatedPage>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <WhatshotIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
        </motion.div>
      </Box>
    </AnimatedPage>
  );

  return (
    <AnimatedPage>
      <SectionHeader
        icon={<WhatshotIcon />}
        title="Заедница"
        subtitle={`${heatmap?.totalEvents ?? 0} настани · ${heatmap?.activeEvents ?? 0} активни`}
        action={
          <ToggleButtonGroup
            value={period} exclusive size="small"
            onChange={(_, v) => v && setPeriod(v)}
            sx={{ '& .MuiToggleButton-root': { borderRadius: 2, fontWeight: 600, textTransform: 'none', px: 2 } }}
          >
            <ToggleButton value="weekly">7д</ToggleButton>
            <ToggleButton value="monthly">30д</ToggleButton>
            <ToggleButton value="alltime">Сите</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {/* ═══ INSIGHT CARDS ═══ */}
      {leaderboard?.weeklyInsights && (
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {[
            { label: 'Нови настани', value: leaderboard.weeklyInsights.newEvents, trend: leaderboard.weeklyInsights.eventsTrend, icon: <EventIcon />, color: '#1a56db' },
            { label: 'Нови корисници', value: leaderboard.weeklyInsights.newUsers, icon: <PeopleIcon />, color: '#059669' },
            { label: 'Апликации', value: leaderboard.weeklyInsights.totalApplications, icon: <BoltIcon />, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ flex: 1, minWidth: 160 }}
            >
              <GlassCard hoverEffect>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2.5, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.5)})`,
                      color: '#fff', boxShadow: `0 4px 15px ${alpha(stat.color, 0.3)}`,
                    }}>
                      {stat.icon}
                    </Box>
                  </motion.div>
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
      )}

      {/* ═══ MACEDONIA HEATMAP ═══ */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <GlassCard hoverEffect={false} sx={{ mb: 3, p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="h6" fontWeight={800}>
              <PlaceIcon sx={{ mr: 0.5, verticalAlign: 'middle', color: '#dc2626' }} />
              Мапа на активности — Македонија
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {heatmap?.totalEvents ?? 0} настани на {heatDots.length} локации
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', width: '100%', aspectRatio: '600/340', overflow: 'hidden' }}>
            <svg viewBox="0 0 600 340" style={{ width: '100%', height: '100%' }}>
              {/* Glow background */}
              <defs>
                <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={alpha('#1a56db', 0.15)} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Macedonia outline */}
              <path
                d={MACEDONIA_PATH}
                fill={isDark ? alpha('#1a56db', 0.06) : alpha('#1a56db', 0.04)}
                stroke={isDark ? alpha('#1a56db', 0.25) : alpha('#1a56db', 0.2)}
                strokeWidth="1.5"
              />

              {/* Grid pattern inside country */}
              <path
                d={MACEDONIA_PATH}
                fill="url(#heatGlow)"
              />

              {/* City labels */}
              {Object.entries(MK_CITIES).map(([city, pos]) => (
                <g key={city}>
                  <circle cx={pos.x} cy={pos.y} r="2" fill={alpha('#94a3b8', 0.4)} />
                  <text
                    x={pos.x} y={pos.y - 6}
                    textAnchor="middle"
                    fill={isDark ? alpha('#94a3b8', 0.6) : alpha('#64748b', 0.7)}
                    fontSize="7"
                    fontWeight="500"
                    fontFamily="sans-serif"
                  >
                    {city}
                  </text>
                </g>
              ))}

              {/* Heatmap dots */}
              {heatDots.map((dot, i) => {
                const radius = Math.min(8 + Math.sqrt(dot.count) * 3, 18);
                const color = SPORT_COLORS[dot.sport] || '#1a56db';
                return (
                  <g key={i}>
                    {/* Soft glow */}
                    <circle
                      cx={dot.x} cy={dot.y} r={radius + 4}
                      fill={alpha(color, 0.12)}
                    />
                    {/* Main circle */}
                    <motion.circle
                      cx={dot.x} cy={dot.y} r={radius}
                      fill={alpha(color, 0.7)}
                      stroke={color} strokeWidth="1.5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.04, type: 'spring', stiffness: 200, damping: 15 }}
                    />
                    {/* Pulse for active */}
                    {dot.active > 0 && (
                      <motion.circle
                        cx={dot.x} cy={dot.y} r={radius}
                        fill="none" stroke={color} strokeWidth="1"
                        animate={{ r: [radius, radius + 6], opacity: [0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const }}
                      />
                    )}
                    {/* Count */}
                    <text
                      x={dot.x} y={dot.y + 4}
                      textAnchor="middle" fill="#fff"
                      fontSize={dot.count >= 10 ? 10 : 9}
                      fontWeight="800" fontFamily="sans-serif"
                    >
                      {dot.count}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Box>

          {/* Sport legend */}
          <Box display="flex" gap={1.5} flexWrap="wrap" px={2.5} py={2}>
            {heatmap?.sportDistribution.slice(0, 6).map((sport) => {
              const color = SPORT_COLORS[sport.sportName] || '#6b7280';
              return (
                <Box key={sport.sportName} display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                  <Typography variant="caption" fontWeight={600} fontSize={12} color="text.secondary">
                    {sport.sportName} {sport.count}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </GlassCard>
      </motion.div>

      {/* ═══ TRENDING SPORTS BAR CHART ═══ */}
      {leaderboard?.trendingSports && leaderboard.trendingSports.length > 0 && (
        <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={2}>
            <WhatshotIcon sx={{ mr: 0.5, verticalAlign: 'middle', color: '#f59e0b' }} />
            Трендинг спортови
          </Typography>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {leaderboard.trendingSports.map((sport, i) => {
              const maxCount = leaderboard.trendingSports[0]?.count || 1;
              const pct = (sport.count / maxCount) * 100;
              const color = SPORT_COLORS[sport.sportName] || '#6b7280';
              return (
                <Box key={sport.sportName} display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100, fontSize: 13 }}>
                    {sport.sportName}
                  </Typography>
                  <Box flex={1} sx={{ bgcolor: alpha(color, 0.08), borderRadius: 1.5, height: 28, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' as const }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10,
                      }}
                    >
                      {pct > 25 && (
                        <Typography variant="caption" fontWeight={800} color="#fff" fontSize={12}>{sport.count}</Typography>
                      )}
                    </motion.div>
                  </Box>
                  {pct <= 25 && <Typography variant="caption" fontWeight={800} fontSize={12}>{sport.count}</Typography>}
                </Box>
              );
            })}
          </Box>
        </GlassCard>
      )}

      {/* ═══ LEADERBOARDS ═══ */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        {/* Most Active */}
        <Box flex={1} minWidth={280}>
          <GlassCard hoverEffect={false}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
              <Typography variant="h6" fontWeight={800}>Најактивни</Typography>
            </Box>
            {leaderboard && renderLeaderboard(leaderboard.mostActivePlayers)}
          </GlassCard>
        </Box>

        {/* Top Organizers */}
        <Box flex={1} minWidth={280}>
          <GlassCard hoverEffect={false}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <StarIcon sx={{ color: '#1a56db' }} />
              <Typography variant="h6" fontWeight={800}>Топ организатори</Typography>
            </Box>
            {leaderboard && renderLeaderboard(leaderboard.topOrganizers, true)}
          </GlassCard>
        </Box>

        {/* Top Participants */}
        <Box flex={1} minWidth={280}>
          <GlassCard hoverEffect={false}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <StarIcon sx={{ color: '#059669' }} />
              <Typography variant="h6" fontWeight={800}>Топ учесници</Typography>
            </Box>
            {leaderboard && renderLeaderboard(leaderboard.topParticipants, true)}
          </GlassCard>
        </Box>
      </Box>
    </AnimatedPage>
  );
}
