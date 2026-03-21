import { useEffect, useState } from 'react';
import {
  Box, Typography, Switch, FormControlLabel, Alert, Divider, alpha,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import ChatIcon from '@mui/icons-material/Chat';
import { motion } from 'framer-motion';
import { NotificationPreference } from '../../types';
import * as notificationsApi from '../../api/notifications';
import AnimatedPage from '../../components/AnimatedPage';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { ReactNode } from 'react';

const PREF_LABELS: { key: keyof NotificationPreference; label: string; icon: ReactNode; color: string }[] = [
  { key: 'emailOnApplication', label: 'Е-пошта за нова пријава на настан', icon: <EmailIcon sx={{ fontSize: 18 }} />, color: '#1a56db' },
  { key: 'emailOnApproval', label: 'Е-пошта кога пријавата е одобрена/одбиена', icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, color: '#059669' },
  { key: 'emailOnEventUpdate', label: 'Е-пошта кога настанот е ажуриран', icon: <RefreshIcon sx={{ fontSize: 18 }} />, color: '#7c3aed' },
  { key: 'emailOnEventReminder', label: 'Е-пошта потсетник пред настан', icon: <AccessAlarmIcon sx={{ fontSize: 18 }} />, color: '#f59e0b' },
  { key: 'emailOnNewComment', label: 'Е-пошта за нов коментар', icon: <ChatIcon sx={{ fontSize: 18 }} />, color: '#ef4444' },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationsApi.getPreferences()
      .then(res => setPreferences(res.data))
      .catch(() => {
        setPreferences({
          emailOnApplication: true, emailOnApproval: true, emailOnEventUpdate: true,
          emailOnEventReminder: true, emailOnNewComment: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof NotificationPreference) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: !preferences[key] });
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true); setError('');
    try { await notificationsApi.updatePreferences(preferences); setSuccess(true); }
    catch { setError('Грешка при зачувување.'); }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <AnimatedPage>
      <Box maxWidth={600} mx="auto">
        <SectionHeader
          icon={<SettingsIcon />}
          title="Поставки за нотификации"
          subtitle="Изберете кои нотификации сакате да ги примате."
        />

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>Поставките се зачувани!</Alert>
        </motion.div>}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="gradient">
            {preferences && PREF_LABELS.map(({ key, label, icon, color }, i) => (
              <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                {i > 0 && <Divider sx={{ my: 1 }} />}
                <Box display="flex" alignItems="center" gap={2} sx={{ my: 0.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: alpha(color, 0.12),
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences[key]}
                        onChange={() => handleToggle(key)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#059669',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#059669',
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2">{label}</Typography>}
                    sx={{ flex: 1, ml: 0 }}
                    labelPlacement="start"
                  />
                </Box>
              </motion.div>
            ))}
            <Box mt={3}>
              <GradientButton onClick={handleSave} disabled={saving}>
                {saving ? 'Зачувување...' : 'Зачувај поставки'}
              </GradientButton>
            </Box>
          </GlassCard>
        </motion.div>
      </Box>
    </AnimatedPage>
  );
}
