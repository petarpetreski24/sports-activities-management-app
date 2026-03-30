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

// Macedonia SVG outline for heatmap background
// Macedonia outline scaled for 520x280 viewBox
const MACEDONIA_PATH = `M 182 50 L 200 46 L 222 44 L 245 46 L 272 42 L 296 46 L 318 50 L 338 46 L 358 50 L 374 58 L 390 70 L 400 82 L 408 96 L 414 112 L 418 128 L 416 144 L 410 160 L 402 174 L 392 184 L 378 196 L 362 204 L 345 210 L 326 216 L 306 224 L 290 228 L 272 230 L 252 228 L 232 226 L 214 228 L 195 226 L 175 218 L 158 210 L 144 198 L 128 184 L 118 170 L 110 154 L 105 138 L 102 122 L 105 106 L 110 92 L 118 78 L 132 66 L 144 58 L 162 52 Z`;

// Major cities with approximate positions within the SVG viewBox (520x280)
const MK_CITIES: Record<string, { x: number; y: number }> = {
  'Скопје': { x: 272, y: 95 },
  'Битола': { x: 215, y: 205 },
  'Тетово': { x: 210, y: 75 },
  'Куманово': { x: 325, y: 70 },
  'Прилеп': { x: 242, y: 175 },
  'Охрид': { x: 160, y: 185 },
  'Велес': { x: 292, y: 128 },
  'Штип': { x: 345, y: 128 },
  'Струмица': { x: 378, y: 172 },
  'Кавадарци': { x: 292, y: 163 },
  'Гостивар': { x: 190, y: 98 },
  'Кичево': { x: 175, y: 140 },
  'Струга': { x: 142, y: 168 },
};

// Convert lat/lng to approximate SVG position (520x280 viewBox)
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  // Macedonia bounds: lat 40.85-42.35, lng 20.45-23.05
  const x = 100 + ((lng - 20.45) / (23.05 - 20.45)) * 320;
  const y = 45 + ((42.35 - lat) / (42.35 - 40.85)) * 200;
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
    // Group events by rounded location
    const groups: Record<string, { x: number; y: number; count: number; sport: string; active: number }> = {};
    heatmap.events.forEach(ev => {
      const pos = geoToSvg(ev.lat, ev.lng);
      const key = `${Math.round(pos.x / 10) * 10},${Math.round(pos.y / 10) * 10}`;
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

          <Box sx={{ position: 'relative', width: '100%', aspectRatio: '520/280', overflow: 'hidden', px: 1 }}>
            <svg viewBox="0 0 520 280" style={{ width: '100%', height: '100%' }}>
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
                // Use log scale so large values don't dominate
                const logCount = Math.log2(dot.count + 1);
                const logMax = Math.log2((heatDots[0]?.count || 1) + 1);
                const intensity = Math.min(logCount / logMax, 1);
                const radius = 6 + intensity * 12; // 6–18 range (was 4–22, much smaller max)
                const color = SPORT_COLORS[dot.sport] || '#1a56db';
                return (
                  <g key={i}>
                    {/* Outer glow — subtle */}
                    <motion.circle
                      cx={dot.x}
                      cy={dot.y}
                      r={radius * 1.6}
                      fill={alpha(color, 0.06 + intensity * 0.08)}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5, type: 'spring' }}
                    />
                    {/* Pulsing ring for active spots */}
                    {dot.active > 0 && (
                      <motion.circle
                        cx={dot.x}
                        cy={dot.y}
                        r={radius}
                        fill="none"
                        stroke={alpha(color, 0.25)}
                        strokeWidth="0.8"
                        animate={{ r: [radius, radius * 1.4], opacity: [0.4, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' as const }}
                      />
                    )}
                    {/* Core dot */}
                    <motion.circle
                      cx={dot.x}
                      cy={dot.y}
                      r={radius * 0.55}
                      fill={color}
                      filter="url(#glow)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 200 }}
                    />
                    {/* Count label */}
                    {dot.count > 0 && (
                      <text
                        x={dot.x}
                        y={dot.y + 3.5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={Math.max(8, Math.min(12, 7 + intensity * 4))}
                        fontWeight="800"
                        fontFamily="sans-serif"
                      >
                        {dot.count}
                      </text>
                    )}
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
