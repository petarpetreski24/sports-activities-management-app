import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import * as authApi from '../../api/auth';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authApi.confirmEmail(token)
        .then(() => setSuccess(true))
        .catch((err) => setError(err.response?.data?.error || 'Невалиден токен.'))
        .finally(() => setLoading(false));
    } else {
      setError('Нема токен.');
      setLoading(false);
    }
  }, [searchParams]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e3a5f 100%)', p: 2 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}>
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <Typography variant="h5" fontWeight={700} mb={3}>Потврда на email</Typography>
          {loading && <CircularProgress size={48} />}
          {success && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Alert severity="success" sx={{ borderRadius: 3 }}>Email адресата е потврдена!</Alert>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
            </motion.div>
          )}
          {!loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 3, borderRadius: 3 }}>
                Кон најава
              </Button>
            </motion.div>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}
