import { useEffect, useState, useCallback } from 'react';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, IconButton, FormControl,
  InputLabel, Select, MenuItem, TablePagination, Alert,
  DialogTitle, DialogContent, DialogContentText, DialogActions, alpha,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import * as adminApi from '../../api/admin';
import AnimatedPage from '../../components/AnimatedPage';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import AnimatedDialog from '../../components/AnimatedDialog';
import GradientButton from '../../components/GradientButton';

interface AdminUser {
  id: number; firstName: string; lastName: string; email: string;
  role: string; isActive: boolean; emailConfirmed: boolean;
  createdAt: string; eventsOrganized: number; eventsParticipated: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string; userId: number; userName: string }>({
    open: false, type: '', userId: 0, userName: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(search, roleFilter, page + 1, pageSize);
      setUsers(res.data.items); setTotalCount(res.data.totalCount);
    } catch { setError('Грешка при вчитување.'); }
    finally { setLoading(false); }
  }, [search, roleFilter, page, pageSize]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async () => {
    const { type, userId } = confirmDialog;
    try {
      if (type === 'deactivate') await adminApi.deactivateUser(userId);
      else if (type === 'delete') await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
    setConfirmDialog({ open: false, type: '', userId: 0, userName: '' });
  };

  return (
    <AnimatedPage>
      <SectionHeader icon={<PeopleIcon />} title="Управување со корисници" />
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard sx={{ p: 2, mb: 2 }} hoverEffect={false}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField size="small" label="Пребарај" value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 200 }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Улога</InputLabel>
              <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }} label="Улога">
                <MenuItem value="">Сите</MenuItem>
                <MenuItem value="User">Корисник</MenuItem>
                <MenuItem value="Admin">Админ</MenuItem>
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
                    <TableCell sx={{ fontWeight: 700 }}>Име</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Улога</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Настани</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Акции</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u, i) => (
                    <TableRow key={u.id} sx={{
                      bgcolor: i % 2 === 0 ? alpha('#1a56db', 0.02) : 'transparent',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: alpha('#1a56db', 0.05) },
                    }}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role === 'Admin' ? 'Админ' : 'Корисник'}
                          color={u.role === 'Admin' ? 'primary' : 'default'} size="small"
                          sx={{ fontWeight: 600, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={u.isActive ? 'Активен' : 'Деактивиран'}
                          color={u.isActive ? 'success' : 'error'} size="small"
                          sx={{ fontWeight: 600, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell>{u.eventsOrganized} орг. / {u.eventsParticipated} уч.</TableCell>
                      <TableCell align="right">
                        {u.isActive && u.role !== 'Admin' && (
                          <IconButton size="small" color="warning"
                            onClick={() => setConfirmDialog({ open: true, type: 'deactivate', userId: u.id, userName: `${u.firstName} ${u.lastName}` })}
                            sx={{ bgcolor: alpha('#f59e0b', 0.08), mr: 0.5 }}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        )}
                        {u.role !== 'Admin' && (
                          <IconButton size="small" color="error"
                            onClick={() => setConfirmDialog({ open: true, type: 'delete', userId: u.id, userName: `${u.firstName} ${u.lastName}` })}
                            sx={{ bgcolor: alpha('#dc2626', 0.08) }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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

      <AnimatedDialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmDialog.type === 'deactivate' ? 'Деактивирај' : 'Избриши'} корисник
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Дали сте сигурни за <strong>{confirmDialog.userName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} sx={{ borderRadius: 2 }}>Откажи</Button>
          <GradientButton onClick={handleAction}
            gradientFrom="#dc2626" gradientTo="#ef4444"
            hoverFrom="#b91c1c" hoverTo="#dc2626"
            sx={{ borderRadius: 2 }}>
            {confirmDialog.type === 'deactivate' ? 'Деактивирај' : 'Избриши'}
          </GradientButton>
        </DialogActions>
      </AnimatedDialog>
    </AnimatedPage>
  );
}
