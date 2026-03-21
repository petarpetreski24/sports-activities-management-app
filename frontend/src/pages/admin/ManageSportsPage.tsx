import { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, IconButton, DialogTitle,
  DialogContent, DialogActions, Alert, Switch, Button, alpha,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import * as sportsApi from '../../api/sports';
import { Sport } from '../../types';
import AnimatedPage from '../../components/AnimatedPage';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import AnimatedDialog from '../../components/AnimatedDialog';
import GradientButton from '../../components/GradientButton';

export default function ManageSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; sport?: Sport }>({ open: false, mode: 'add' });
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('');

  const fetchSports = async () => {
    try { const res = await sportsApi.getAll(); setSports(res.data); }
    catch { setError('Грешка при вчитување.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSports(); }, []);

  const openAdd = () => { setFormName(''); setFormIcon(''); setDialog({ open: true, mode: 'add' }); };
  const openEdit = (sport: Sport) => { setFormName(sport.name); setFormIcon(sport.icon || ''); setDialog({ open: true, mode: 'edit', sport }); };

  const handleSave = async () => {
    try {
      if (dialog.mode === 'add') await sportsApi.create({ name: formName, icon: formIcon });
      else if (dialog.sport) await sportsApi.update(dialog.sport.id, { name: formName, icon: formIcon });
      setDialog({ open: false, mode: 'add' }); fetchSports();
    } catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
  };

  const toggleActive = async (sport: Sport) => {
    try { await sportsApi.update(sport.id, { name: sport.name, icon: sport.icon, isActive: !sport.isActive }); fetchSports(); }
    catch { setError('Грешка при ажурирање.'); }
  };

  if (loading) return <Box mt={4}><TableSkeleton rows={6} /></Box>;

  return (
    <AnimatedPage>
      <SectionHeader
        icon={<SportsSoccerIcon />}
        title="Управување со спортови"
        action={
          <GradientButton startIcon={<AddIcon />} onClick={openAdd} sx={{ borderRadius: 3 }}>
            Додади спорт
          </GradientButton>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassCard noPadding hoverEffect={false}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#1a56db', 0.04) }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Икона</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Име</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Активен</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Акции</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sports.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'table-row',
                      backgroundColor: i % 2 === 0 ? alpha('#1a56db', 0.02) : 'transparent',
                    }}
                  >
                    <TableCell>{s.id}</TableCell>
                    <TableCell sx={{ fontSize: 28 }}>{s.icon || '🏅'}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                    <TableCell><Switch checked={s.isActive !== false} onChange={() => toggleActive(s)} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(s)}
                        sx={{ bgcolor: alpha('#1a56db', 0.08), '&:hover': { bgcolor: alpha('#1a56db', 0.15) } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassCard>
      </motion.div>

      <AnimatedDialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          {dialog.mode === 'add'
            ? <><AddCircleIcon color="primary" /> Додади спорт</>
            : <><EditIcon color="primary" /> Уреди спорт</>
          }
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Име на спорт" value={formName}
            onChange={e => setFormName(e.target.value)} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Икона (емоџи)" value={formIcon}
            onChange={e => setFormIcon(e.target.value)}
            helperText="Пример: ⚽, 🏀, 🏐" />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog({ ...dialog, open: false })} sx={{ borderRadius: 2 }}>Откажи</Button>
          <GradientButton onClick={handleSave} disabled={!formName.trim()} sx={{ borderRadius: 2 }}>
            {dialog.mode === 'add' ? 'Додади' : 'Зачувај'}
          </GradientButton>
        </DialogActions>
      </AnimatedDialog>
    </AnimatedPage>
  );
}
