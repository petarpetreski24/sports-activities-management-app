import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, FormControl,
  InputLabel, Select, MenuItem, TablePagination, Alert, Avatar,
  Typography, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, alpha,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import * as adminApi from '../../api/admin';
import * as eventsApi from '../../api/events';
import * as sportsApi from '../../api/sports';
import { SportEvent, Sport, EVENT_STATUS_LABELS } from '../../types';
import AnimatedPage from '../../components/AnimatedPage';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import AnimatedDialog from '../../components/AnimatedDialog';
import GradientButton from '../../components/GradientButton';

export default function ManageEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sportFilter, setSportFilter] = useState<number | ''>('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: 'delete' | 'cancel'; eventId: number; eventTitle: string;
  }>({ open: false, type: 'delete', eventId: 0, eventTitle: '' });

  useEffect(() => {
    sportsApi.getAll().then(res => setSports(res.data)).catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsApi.search({
        keyword: keyword || undefined,
        sportIds: sportFilter ? [sportFilter] : undefined,
        statuses: statusFilter ? [statusFilter] : undefined,
        sortBy: 'date',
        page: page + 1,
        pageSize,
      });
      setEvents(res.data.items || res.data as any);
      setTotalCount(res.data.totalCount || 0);
    } catch { setError('Грешка при вчитување.'); }
    finally { setLoading(false); }
  }, [keyword, statusFilter, sportFilter, page, pageSize]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleAction = async () => {
    const { type, eventId } = confirmDialog;
    try {
      if (type === 'delete') await adminApi.deleteEvent(eventId);
      else if (type === 'cancel') await eventsApi.cancel(eventId);
      fetchEvents();
    } catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Full': return 'warning';
      case 'InProgress': return 'info';
      case 'Completed': return 'default';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <AnimatedPage>
      <SectionHeader icon={<EventIcon />} title="Управување со настани" subtitle={`Вкупно: ${totalCount}`} />
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard sx={{ p: 2, mb: 2 }} hoverEffect={false}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField size="small" label="Пребарај" value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(0); }} sx={{ minWidth: 200 }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Статус</InputLabel>
              <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} label="Статус">
                <MenuItem value="">Сите</MenuItem>
                {Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Спорт</InputLabel>
              <Select value={sportFilter} onChange={e => { setSportFilter(e.target.value as number | ''); setPage(0); }} label="Спорт">
                <MenuItem value="">Сите</MenuItem>
                {sports.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </GlassCard>
      </motion.div>

      {loading ? <TableSkeleton rows={8} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard noPadding hoverEffect={false}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#1a56db', 0.04) }}>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Настан</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Спорт</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Организатор</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Датум</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Учесници</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Акции</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((ev, i) => (
                    <TableRow key={ev.id} sx={{
                      bgcolor: i % 2 === 0 ? alpha('#1a56db', 0.02) : 'transparent',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: alpha('#1a56db', 0.05) },
                    }}>
                      <TableCell>{ev.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                          {ev.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={ev.sportName} size="small" sx={{ fontWeight: 600, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar src={ev.organizerPhotoUrl} sx={{ width: 24, height: 24, fontSize: 11 }}>
                            {ev.organizerName?.[0]}
                          </Avatar>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                            {ev.organizerName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{dayjs(ev.eventDate).format('DD.MM.YYYY HH:mm')}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {ev.currentParticipants}/{ev.maxParticipants}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={EVENT_STATUS_LABELS[ev.status] || ev.status}
                          size="small"
                          color={statusColor(ev.status) as any}
                          sx={{ fontWeight: 600, borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          <IconButton size="small"
                            onClick={() => navigate(`/events/${ev.id}`)}
                            sx={{ bgcolor: alpha('#1a56db', 0.08) }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small"
                            onClick={() => navigate(`/events/${ev.id}/edit`)}
                            sx={{ bgcolor: alpha('#059669', 0.08) }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {ev.status === 'Open' && (
                            <IconButton size="small" color="warning"
                              onClick={() => setConfirmDialog({ open: true, type: 'cancel', eventId: ev.id, eventTitle: ev.title })}
                              sx={{ bgcolor: alpha('#f59e0b', 0.08) }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" color="error"
                            onClick={() => setConfirmDialog({ open: true, type: 'delete', eventId: ev.id, eventTitle: ev.title })}
                            sx={{ bgcolor: alpha('#dc2626', 0.08) }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Нема настани.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination component="div" count={totalCount} page={page} rowsPerPage={pageSize}
                onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(parseInt(e.target.value)); setPage(0); }}
                labelRowsPerPage="По страница:" rowsPerPageOptions={[10, 20, 50]} />
            </TableContainer>
          </GlassCard>
        </motion.div>
      )}

      <AnimatedDialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmDialog.type === 'delete' ? 'Избриши настан' : 'Откажи настан'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'delete'
              ? <>Дали сте сигурни дека сакате да го избришете настанот <strong>{confirmDialog.eventTitle}</strong>? Ова дејство е неповратно.</>
              : <>Дали сте сигурни дека сакате да го откажете настанот <strong>{confirmDialog.eventTitle}</strong>?</>
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} sx={{ borderRadius: 2 }}>Откажи</Button>
          <GradientButton onClick={handleAction}
            gradientFrom={confirmDialog.type === 'delete' ? '#dc2626' : '#f59e0b'}
            gradientTo={confirmDialog.type === 'delete' ? '#ef4444' : '#fbbf24'}
            hoverFrom={confirmDialog.type === 'delete' ? '#b91c1c' : '#d97706'}
            hoverTo={confirmDialog.type === 'delete' ? '#dc2626' : '#f59e0b'}
            sx={{ borderRadius: 2 }}>
            {confirmDialog.type === 'delete' ? 'Избриши' : 'Откажи настан'}
          </GradientButton>
        </DialogActions>
      </AnimatedDialog>
    </AnimatedPage>
  );
}
