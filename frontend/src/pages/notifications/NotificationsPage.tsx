import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItem, ListItemText, ListItemIcon, ListItemButton,
  IconButton, Alert, Divider, alpha,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion, AnimatePresence } from 'framer-motion';
import * as notificationsApi from '../../api/notifications';
import AnimatedPage from '../../components/AnimatedPage';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import EmptyState from '../../components/EmptyState';
import GradientButton from '../../components/GradientButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/mk';

dayjs.extend(relativeTime);
dayjs.locale('mk');

interface NotificationItem {
  id: number; type: string; title: string; message: string;
  referenceEventId?: number; isRead: boolean; createdAt: string;
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const notifications = allNotifications.slice(0, visibleCount);
  const hasMore = visibleCount < allNotifications.length;

  const fetchNotifications = () => {
    notificationsApi.getAll()
      .then(res => setAllNotifications(res.data))
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { }
  };

  const handleClick = (n: NotificationItem) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.referenceEventId) navigate(`/events/${n.referenceEventId}`);
  };

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <AnimatedPage>
      <Box maxWidth={700} mx="auto">
        <SectionHeader
          icon={<NotificationsIcon />}
          title="Нотификации"
          count={unreadCount}
          action={
            <Box display="flex" gap={1} alignItems="center">
              {unreadCount > 0 && (
                <GradientButton startIcon={<DoneAllIcon />} onClick={markAllAsRead} size="small">
                  Означи сите
                </GradientButton>
              )}
              <IconButton onClick={() => navigate('/notifications/preferences')} title="Поставки"
                sx={{ bgcolor: alpha('#1a56db', 0.08), '&:hover': { bgcolor: alpha('#1a56db', 0.15) } }}>
                <SettingsIcon />
              </IconButton>
            </Box>
          }
        />

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        {loading ? null : allNotifications.length === 0 ? (
          <EmptyState
            icon={<NotificationsOffIcon />}
            title="Нема нотификации"
            description="Немате нотификации. Кога ќе се случи нешто ново, ќе ве известиме овде."
          />
        ) : (
          <>
            <GlassCard noPadding>
              <List disablePadding>
                <AnimatePresence>
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i, 10) * 0.04 }}
                    >
                      {i > 0 && <Divider />}
                      <ListItem
                        disablePadding
                        secondaryAction={
                          !n.isRead ? (
                            <IconButton size="small" onClick={() => markAsRead(n.id)} title="Означи"
                              sx={{ bgcolor: alpha('#1a56db', 0.08) }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          ) : undefined
                        }
                      >
                        <ListItemButton
                          onClick={() => handleClick(n)}
                          sx={{
                            borderLeft: n.isRead
                              ? '3px solid transparent'
                              : '3px solid',
                            borderImage: n.isRead
                              ? undefined
                              : 'linear-gradient(180deg, #1a56db, #059669) 1',
                            bgcolor: n.isRead ? 'transparent' : alpha('#1a56db', 0.04),
                            transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: alpha('#1a56db', 0.06) },
                          }}
                        >
                          <ListItemIcon>
                            <Box sx={{
                              width: 40, height: 40, borderRadius: 2,
                              bgcolor: n.isRead ? alpha('#888', 0.1) : alpha('#1a56db', 0.1),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <NotificationsIcon color={n.isRead ? 'disabled' : 'primary'} fontSize="small" />
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography fontWeight={n.isRead ? 400 : 700} variant="body2">{n.title}</Typography>}
                            secondary={
                              <>
                                {n.message}
                                <br />
                                <Typography variant="caption" color="text.secondary">{dayjs(n.createdAt).fromNow()}</Typography>
                              </>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            </GlassCard>

            {hasMore && (
              <Box textAlign="center" mt={2}>
                <GradientButton
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  variant="outlined"
                  sx={{
                    background: 'transparent',
                    border: `1px solid ${alpha('#1a56db', 0.2)}`,
                    color: '#1a56db',
                    '&:hover': { background: alpha('#1a56db', 0.06), border: `1px solid ${alpha('#1a56db', 0.3)}` },
                  }}
                >
                  Прикажи постари ({allNotifications.length - visibleCount} преостанати)
                </GradientButton>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={1}>
              Прикажани {notifications.length} од {allNotifications.length} нотификации
            </Typography>
          </>
        )}
      </Box>
    </AnimatedPage>
  );
}
