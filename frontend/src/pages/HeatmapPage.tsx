import { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, alpha, useTheme, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PlaceIcon from '@mui/icons-material/Place';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as statsApi from '../api/stats';
import { HeatmapData, HeatmapEvent } from '../types';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';

const SPORT_COLORS: Record<string, string> = {
  'Фудбал': '#059669',
  'Кошарка': '#f59e0b',
  'Одбојка': '#1a56db',
  'Тенис': '#dc2626',
  'Ракомет': '#8b5cf6',
  'Пинг-понг': '#0891b2',
  'Пливање': '#0ea5e9',
  'Трчање': '#ea580c',
  'Велосипедизам': '#16a34a',
  'Бадминтон': '#d946ef',
};

export default function HeatmapPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    statsApi.getHeatmap().then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredEvents = data?.events.filter(e => {
    if (sportFilter && e.sportName !== sportFilter) return false;
    if (statusFilter === 'active' && e.status !== 'Open' && e.status !== 'Full') return false;
    if (statusFilter === 'lastminute' && !e.isLastMinute) return false;
    return true;
  }) ?? [];

  const upcomingEvents = filteredEvents
    .filter(e => new Date(e.eventDate) > new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 30);

  return (
    <AnimatedPage>
      <SectionHeader
        icon={<MapIcon />}
        title="Мапа на активности"
        subtitle={`${data?.totalEvents ?? 0} вкупно настани · ${data?.activeEvents ?? 0} активни`}
      />

      {/* Filters */}
      <GlassCard hoverEffect={false} sx={{ mb: 2, p: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Спорт</InputLabel>
            <Select value={sportFilter} onChange={e => setSportFilter(e.target.value)} label="Спорт">
              <MenuItem value="">Сите спортови</MenuItem>
              {data?.sportDistribution.map(s => (
                <MenuItem key={s.sportName} value={s.sportName}>{s.sportName} ({s.count})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Статус">
              <MenuItem value="">Сите</MenuItem>
              <MenuItem value="active">Активни</MenuItem>
              <MenuItem value="lastminute">Итен повик</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </GlassCard>

      {/* Sport Distribution */}
      {data?.sportDistribution && (
        <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            <WhatshotIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#f59e0b' }} />
            Дистрибуција по спорт
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {data.sportDistribution.map((sport, i) => {
              const maxCount = data.sportDistribution[0]?.count || 1;
              const pct = (sport.count / maxCount) * 100;
              const color = SPORT_COLORS[sport.sportName] || '#6b7280';
              return (
                <Box key={sport.sportName} display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 110 }}>{sport.sportName}</Typography>
                  <Box flex={1} sx={{ bgcolor: alpha(color, 0.1), borderRadius: 1, height: 24, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                      }}
                    >
                      {pct > 20 && (
                        <Typography variant="caption" fontWeight={700} color="#fff">{sport.count}</Typography>
                      )}
                    </motion.div>
                  </Box>
                  {pct <= 20 && <Typography variant="caption" fontWeight={700}>{sport.count}</Typography>}
                </Box>
              );
            })}
          </Box>
        </GlassCard>
      )}

      {/* Hot Zones */}
      {data?.cityStats && data.cityStats.length > 0 && (
        <GlassCard hoverEffect={false} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            <PlaceIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#dc2626' }} />
            Жешки зони
          </Typography>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {data.cityStats.slice(0, 10).map((zone, i) => (
              <GlassCard key={i} hoverEffect sx={{ minWidth: 140, textAlign: 'center', p: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%', mx: 'auto', mb: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha('#dc2626', 0.1 + (data.cityStats[0].count > 0 ? zone.count / data.cityStats[0].count * 0.5 : 0))}, ${alpha('#f59e0b', 0.1)})`,
                  border: `2px solid ${alpha('#dc2626', 0.2)}`,
                }}>
                  <Typography fontWeight={800} fontSize={18}>{zone.count}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{zone.activeCount} активни</Typography>
                <br />
                <Chip label={zone.topSport} size="small" sx={{ mt: 0.5, fontSize: 11, fontWeight: 600 }} />
              </GlassCard>
            ))}
          </Box>
        </GlassCard>
      )}

      {/* Upcoming Events List */}
      <GlassCard hoverEffect={false}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Претстојни настани ({upcomingEvents.length})
        </Typography>
        {upcomingEvents.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>Нема настани</Typography>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Box display="flex" flexDirection="column" gap={0.75}>
              {upcomingEvents.map(ev => {
                const color = SPORT_COLORS[ev.sportName] || '#6b7280';
                return (
                  <motion.div key={ev.id} variants={fadeInUp}>
                    <Box
                      display="flex" alignItems="center" gap={1.5}
                      onClick={() => navigate(`/events/${ev.id}`)}
                      sx={{
                        py: 1.25, px: 1.5, borderRadius: 2, cursor: 'pointer',
                        bgcolor: ev.isLastMinute ? alpha('#dc2626', 0.06) : 'transparent',
                        border: ev.isLastMinute ? `1px solid ${alpha('#dc2626', 0.15)}` : '1px solid transparent',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                      }}
                    >
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: color, flexShrink: 0,
                      }} />
                      <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography fontWeight={600} fontSize={14} noWrap>{ev.title}</Typography>
                          {ev.isLastMinute && (
                            <Chip label="ИТНО" size="small" sx={{
                              height: 18, fontSize: 10, fontWeight: 800,
                              bgcolor: alpha('#dc2626', 0.1), color: '#dc2626',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.6 },
                              },
                            }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {ev.sportName} · {dayjs(ev.eventDate).format('DD.MM HH:mm')} · {ev.locationAddress}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${ev.currentParticipants}/${ev.maxParticipants}`}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 2, fontSize: 12 }}
                      />
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </motion.div>
        )}
      </GlassCard>
    </AnimatedPage>
  );
}
