import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert, Link, alpha, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Diversity3 from '@mui/icons-material/Diversity3';
import * as authApi from '../../api/auth';
import AuthHeroAnimation from '../../components/AuthHeroAnimation';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const onSubmit = async (data: { email: string }) => {
    try { await authApi.forgotPassword(data.email); setSuccess(true); }
    catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
  };

  const darkInputSx = {
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': { borderColor: alpha('#fff', 0.2) },
      '&:hover fieldset': { borderColor: alpha('#fff', 0.4) },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    },
    '& .MuiInputLabel-root': { color: alpha('#fff', 0.8) },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
    '& .MuiFormHelperText-root': { color: alpha('#fff', 0.5) },
  };

  return (
    <Box
      display="flex"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Left: Animated Hero */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)',
          }}
        >
          <AuthHeroAnimation />
        </Box>
      )}

      {/* Right: Forgot Password Form */}
      <Box
        sx={{
          width: isMobile ? '100%' : 520,
          minWidth: isMobile ? undefined : 440,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          background: isMobile
            ? 'linear-gradient(135deg, #1a56db 0%, #1e3a5f 100%)'
            : `linear-gradient(180deg, ${alpha('#0f172a', 0.95)}, ${alpha('#1e293b', 0.98)})`,
          borderLeft: isMobile ? 'none' : `1px solid ${alpha('#1a56db', 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {!isMobile && (
          <Box
            component={motion.div}
            animate={{ opacity: [0.03, 0.08, 0.03] }}
            // @ts-ignore
            transition={{ duration: 6, repeat: Infinity }}
            sx={{
              position: 'absolute', top: -100, right: -100, width: 400, height: 400,
              borderRadius: '50%', background: 'radial-gradient(circle, #1a56db, transparent)',
            }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: isMobile ? 'background.paper' : alpha('#fff', 0.04),
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              border: isMobile ? 'none' : `1px solid ${alpha('#fff', 0.08)}`,
              boxShadow: isMobile ? '0 25px 50px rgba(0,0,0,0.2)' : `0 25px 50px ${alpha('#000', 0.3)}`,
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, borderRadius: 3,
                background: 'linear-gradient(135deg, #1a56db, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
                boxShadow: '0 8px 32px rgba(26,86,219,0.3)',
              }}
            >
              <Diversity3 sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography
              variant="h5"
              textAlign="center"
              fontWeight={700}
              mb={2}
              sx={{ color: isMobile ? 'text.primary' : 'white' }}
            >
              Заборавена лозинка
            </Typography>
            {success ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert severity="success" sx={{ borderRadius: 3 }}>Проверете го вашиот email за линк за ресетирање.</Alert>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                <Typography
                  variant="body2"
                  mb={2}
                  sx={{ color: isMobile ? 'text.secondary' : alpha('#fff', 0.6) }}
                >
                  Внесете ја вашата email адреса.
                </Typography>
                <TextField fullWidth label="Email" {...register('email', { required: 'Задолжително' })}
                  error={!!errors.email} helperText={errors.email?.message} sx={isMobile ? undefined : darkInputSx} />
                <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}
                  sx={{
                    mt: 2, py: 1.5,
                    background: 'linear-gradient(135deg, #1a56db, #059669)',
                    '&:hover': { background: 'linear-gradient(135deg, #1e3a5f, #064e3b)' },
                    fontWeight: 600,
                  }}>
                  Испрати
                </Button>
              </form>
            )}
            <Box textAlign="center" mt={2}>
              <Link
                component={RouterLink}
                to="/login"
                fontWeight={600}
                sx={{ color: isMobile ? undefined : alpha('#fff', 0.6), '&:hover': { color: isMobile ? undefined : 'white' } }}
              >
                ← Назад кон најава
              </Link>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
