import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert, Link, alpha, Divider, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Diversity3, KeyboardArrowDown } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import AuthHeroAnimation from '../../components/AuthHeroAnimation';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle email confirmation redirect
  useEffect(() => {
    const emailConfirmed = searchParams.get('emailConfirmed');
    if (emailConfirmed === 'true') {
      setSuccessMsg('Email адресата е успешно потврдена! Сега можете да се најавите.');
      setSearchParams({}, { replace: true });
    } else if (emailConfirmed === 'false') {
      setError('Невалиден или истечен линк за потврда. Обидете се повторно.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Неуспешна најава. Проверете ги вашите податоци.');
    }
  };

  const scrollToForm = () => {
    document.getElementById('login-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─── MOBILE LAYOUT: vertical scroll (hero top → form bottom) ────────
  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh', overflowY: 'auto', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        {/* Hero section - full viewport height */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            px: 2,
          }}
        >
          <AuthHeroAnimation />

          {/* Scroll down indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            style={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              cursor: 'pointer',
            }}
            onClick={scrollToForm}
          >
            <Box textAlign="center">
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontWeight: 600, letterSpacing: 1 }}>
                Најави се
              </Typography>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <KeyboardArrowDown sx={{ color: alpha('#fff', 0.5), fontSize: 28, display: 'block', mx: 'auto' }} />
              </motion.div>
            </Box>
          </motion.div>
        </Box>

        {/* Login form section */}
        <Box
          id="login-form-section"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: `linear-gradient(180deg, ${alpha('#0f172a', 0.98)}, ${alpha('#1e293b', 1)})`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: 420 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: 'background.paper',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Box
                  sx={{
                    width: 64, height: 64, borderRadius: 3,
                    background: 'linear-gradient(135deg, #1a56db, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                    boxShadow: '0 8px 32px rgba(26,86,219,0.3)',
                  }}
                >
                  <Diversity3 sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </motion.div>

              <Typography variant="h5" textAlign="center" fontWeight={700} mb={0.5}>
                Добредојдовте назад
              </Typography>
              <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
                Најавете се за да продолжите
              </Typography>

              {successMsg && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  fullWidth label="Email" margin="normal"
                  {...register('email', { required: 'Email е задолжителен' })}
                  error={!!errors.email} helperText={errors.email?.message}
                />
                <TextField
                  fullWidth label="Лозинка" type="password" margin="normal"
                  {...register('password', { required: 'Лозинката е задолжителна' })}
                  error={!!errors.password} helperText={errors.password?.message}
                />
                <Button
                  fullWidth variant="contained" type="submit" disabled={isSubmitting} size="large"
                  sx={{
                    mt: 2, mb: 2, py: 1.5,
                    background: 'linear-gradient(135deg, #1a56db, #059669)',
                    '&:hover': { background: 'linear-gradient(135deg, #1e3a5f, #064e3b)' },
                    fontWeight: 600, fontSize: '1rem',
                  }}
                >
                  {isSubmitting ? 'Се најавува...' : 'Најави се'}
                </Button>
              </form>

              <Divider sx={{ my: 2 }} />

              <Box textAlign="center">
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Заборавена лозинка?
                </Link>
                <Typography variant="body2" mt={1.5}>
                  Немате сметка?{' '}
                  <Link component={RouterLink} to="/register" fontWeight={600}>
                    Регистрирајте се
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    );
  }

  // ─── DESKTOP LAYOUT: side by side ────────
  return (
    <Box
      display="flex"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Left: Animated Hero */}
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

      {/* Right: Login Form */}
      <Box
        sx={{
          width: 520,
          minWidth: 440,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: `linear-gradient(180deg, ${alpha('#0f172a', 0.95)}, ${alpha('#1e293b', 0.98)})`,
          borderLeft: `1px solid ${alpha('#1a56db', 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background accents */}
        <Box
          component={motion.div}
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          // @ts-ignore
          transition={{ duration: 6, repeat: Infinity }}
          sx={{
            position: 'absolute',
            top: -100, right: -100,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, #1a56db, transparent)',
          }}
        />
        <Box
          component={motion.div}
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          // @ts-ignore
          transition={{ duration: 8, repeat: Infinity, delay: 3 }}
          sx={{
            position: 'absolute',
            bottom: -80, left: -80,
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, #059669, transparent)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: alpha('#fff', 0.04),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#fff', 0.08)}`,
              boxShadow: `0 25px 50px ${alpha('#000', 0.3)}`,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: 3,
                  background: 'linear-gradient(135deg, #1a56db, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2,
                  boxShadow: '0 8px 32px rgba(26,86,219,0.3)',
                }}
              >
                <Diversity3 sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </motion.div>

            <Typography variant="h5" textAlign="center" fontWeight={700} mb={0.5} sx={{ color: 'white' }}>
              Добредојдовте назад
            </Typography>
            <Typography variant="body2" textAlign="center" mb={3} sx={{ color: alpha('#fff', 0.6) }}>
              Најавете се за да продолжите
            </Typography>

            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <TextField
                  fullWidth label="Email" margin="normal"
                  {...register('email', { required: 'Email е задолжителен' })}
                  error={!!errors.email} helperText={errors.email?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: alpha('#fff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#fff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.8) },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                    '& .MuiFormHelperText-root': { color: alpha('#fff', 0.5) },
                  }}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <TextField
                  fullWidth label="Лозинка" type="password" margin="normal"
                  {...register('password', { required: 'Лозинката е задолжителна' })}
                  error={!!errors.password} helperText={errors.password?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: alpha('#fff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#fff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.8) },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                    '& .MuiFormHelperText-root': { color: alpha('#fff', 0.5) },
                  }}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Button
                  fullWidth variant="contained" type="submit" disabled={isSubmitting} size="large"
                  sx={{
                    mt: 2, mb: 2, py: 1.5,
                    background: 'linear-gradient(135deg, #1a56db, #059669)',
                    '&:hover': { background: 'linear-gradient(135deg, #1e3a5f, #064e3b)' },
                    fontWeight: 600, fontSize: '1rem',
                  }}
                >
                  {isSubmitting ? 'Се најавува...' : 'Најави се'}
                </Button>
              </motion.div>
            </form>

            <Divider sx={{ my: 2, borderColor: alpha('#fff', 0.08) }} />

            <Box textAlign="center">
              <Link
                component={RouterLink} to="/forgot-password" variant="body2"
                sx={{ color: alpha('#fff', 0.6), '&:hover': { color: 'white' } }}
              >
                Заборавена лозинка?
              </Link>
              <Typography variant="body2" mt={1.5} sx={{ color: alpha('#fff', 0.5) }}>
                Немате сметка?{' '}
                <Link
                  component={RouterLink} to="/register" fontWeight={600}
                  sx={{ color: '#1a56db', '&:hover': { color: '#3b82f6' } }}
                >
                  Регистрирајте се
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
