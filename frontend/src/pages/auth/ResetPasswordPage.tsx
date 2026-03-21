import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import Diversity3 from '@mui/icons-material/Diversity3';
import * as authApi from '../../api/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{ newPassword: string; confirm: string }>();

  const onSubmit = async (data: { newPassword: string }) => {
    try {
      await authApi.resetPassword({ token: searchParams.get('token') || '', newPassword: data.newPassword });
      navigate('/login');
    } catch (err: any) { setError(err.response?.data?.error || 'Грешка.'); }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e3a5f 100%)', p: 2 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}>
        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #1a56db, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Diversity3 sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" textAlign="center" fontWeight={700} mb={3}>Нова лозинка</Typography>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField fullWidth label="Нова лозинка" type="password" margin="normal"
              {...register('newPassword', { required: 'Задолжително', minLength: { value: 8, message: 'Мин. 8 карактери' } })}
              error={!!errors.newPassword} helperText={errors.newPassword?.message} />
            <TextField fullWidth label="Потврди лозинка" type="password" margin="normal"
              {...register('confirm', { validate: v => v === watch('newPassword') || 'Не се совпаѓаат' })}
              error={!!errors.confirm} helperText={errors.confirm?.message} />
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}
              sx={{ mt: 2, py: 1.5, background: 'linear-gradient(135deg, #1a56db, #059669)' }}>Промени лозинка</Button>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
}
