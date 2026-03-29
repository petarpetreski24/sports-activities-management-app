import { useEffect, useState, useCallback } from 'react';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, FormControl,
  InputLabel, Select, MenuItem, TablePagination, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, alpha,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { motion } from 'framer-motion';
import * as reportsApi from '../../api/reports';
import { ReportDto } from '../../api/reports';
import AnimatedPage from '../../components/AnimatedPage';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
// AnimatedDialog removed — causes remount/flicker on typing; use plain Dialog
import GradientButton from '../../components/GradientButton';
import dayjs from 'dayjs';

const REPORT_STATUS_LABELS: Record<string, string> = {
  Pending: 'Чека',
  Reviewed: 'Прегледано',
  Resolved: 'Решено',
  Dismissed: 'Отфрлено',
};

const REPORT_REASON_LABELS: Record<string, string> = {
  InappropriateBehavior: 'Несоодветно однесување',
  Spam: 'Спам',
  Harassment: 'Вознемирување',
  FakeProfile: 'Лажен профил',
  NoShow: 'Недоаѓање',
  Other: 'Друго',
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  Pending: 'warning',
  Reviewed: 'info',
  Resolved: 'success',
  Dismissed: 'default',
};

export default function ManageReportsPage() {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolveDialog, setResolveDialog] = useState<{ open: boolean; reportId: number }>({ open: false, reportId: 0 });
  const [resolveStatus, setResolveStatus] = useState('Resolved');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll(statusFilter, page + 1, pageSize);
      setReports(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch { setError('Грешка при вчитување.'); }
    finally { setLoading(false); }
  }, [statusFilter, page, pageSize]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleResolve = async () => {
    try {
      await reportsApi.resolve(resolveDialog.reportId, { status: resolveStatus, adminNotes: adminNotes || undefined });
      fetchReports();
    } catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
    setResolveDialog({ open: false, reportId: 0 });
    setResolveStatus('Resolved');
    setAdminNotes('');
  };

  return (
    <AnimatedPage>
      <SectionHeader icon={<ReportProblemIcon />} title="Управување со пријави" />
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard sx={{ p: 2, mb: 2 }} hoverEffect={false}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Статус</InputLabel>
              <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} label="Статус">
                <MenuItem value="">Сите</MenuItem>
                <MenuItem value="Pending">Чека</MenuItem>
                <MenuItem value="Reviewed">Прегледано</MenuItem>
                <MenuItem value="Resolved">Решено</MenuItem>
                <MenuItem value="Dismissed">Отфрлено</MenuItem>
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
                    <TableCell sx={{ fontWeight: 700 }}>Пријавувач</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Пријавен</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Причина</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Датум</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Акции</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((r, i) => (
                    <TableRow key={r.id} sx={{
                      bgcolor: i % 2 === 0 ? alpha('#1a56db', 0.02) : 'transparent',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: alpha('#1a56db', 0.05) },
                    }}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{r.reporterName}</TableCell>
                      <TableCell>
                        {r.reportedUserName && <Box>Корисник: {r.reportedUserName}</Box>}
                        {r.reportedEventTitle && <Box>Настан: {r.reportedEventTitle}</Box>}
                        {r.reportedCommentId && <Box>Коментар #{r.reportedCommentId}</Box>}
                      </TableCell>
                      <TableCell>
                        <Chip label={REPORT_REASON_LABELS[r.reason] || r.reason} size="small"
                          sx={{ fontWeight: 600, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={REPORT_STATUS_LABELS[r.status] || r.status}
                          color={STATUS_COLORS[r.status] || 'default'} size="small"
                          sx={{ fontWeight: 600, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell>{dayjs(r.createdAt).format('DD.MM.YYYY HH:mm')}</TableCell>
                      <TableCell align="right">
                        {(r.status === 'Pending' || r.status === 'Reviewed') && (
                          <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}
                            onClick={() => setResolveDialog({ open: true, reportId: r.id })}>
                            Реши
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination component="div" count={totalCount} page={page} rowsPerPage={pageSize}
                onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(parseInt(e.target.value)); setPage(0); }}
                labelRowsPerPage="По страница:" rowsPerPageOptions={[10, 20, 50]} />
            </TableContainer>
          </GlassCard>
        </motion.div>
      )}

      <Dialog open={resolveDialog.open} onClose={() => setResolveDialog({ ...resolveDialog, open: false })}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Реши пријава</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Статус</InputLabel>
            <Select value={resolveStatus} onChange={e => setResolveStatus(e.target.value)} label="Статус">
              <MenuItem value="Reviewed">Прегледано</MenuItem>
              <MenuItem value="Resolved">Решено</MenuItem>
              <MenuItem value="Dismissed">Отфрлено</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth multiline rows={3} label="Админ белешки (опционално)" value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResolveDialog({ ...resolveDialog, open: false })} sx={{ borderRadius: 2 }}>Откажи</Button>
          <GradientButton onClick={handleResolve}
            gradientFrom="#1a56db" gradientTo="#059669"
            hoverFrom="#1e3a5f" hoverTo="#064e3b"
            sx={{ borderRadius: 2 }}>
            Зачувај
          </GradientButton>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
