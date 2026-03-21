import { ReactNode } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from './CountUp';
import GlassCard from './GlassCard';

interface StatCardProps {
  label: string;
  value: number;
  decimals?: number;
  icon: ReactNode;
  color: string;
  delay?: number;
}

export default function StatCard({ label, value, decimals = 0, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      style={{ flex: 1 }}
    >
      <GlassCard sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <motion.div whileHover={{ rotate: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 20px ${alpha(color, 0.25)}`,
                color: 'white',
                '& .MuiSvgIcon-root': { fontSize: 26 },
              }}
            >
              {icon}
            </Box>
          </motion.div>
          <Box>
            <CountUp
              value={value}
              decimals={decimals}
              variant="h4"
              fontWeight={800}
              sx={{ lineHeight: 1.1 }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.25 }}>
              {label}
            </Typography>
          </Box>
        </Box>
      </GlassCard>
    </motion.div>
  );
}
