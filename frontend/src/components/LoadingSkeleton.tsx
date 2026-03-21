import { Box, Skeleton, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const shimmerSx = {
  '&::after': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, transparent, ${alpha('#1a56db', 0.04)}, transparent)`,
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  position: 'relative' as const,
  overflow: 'hidden',
};

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Box display="flex" gap={2.5} flexWrap="wrap">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          style={{ flex: '1 1 300px', minWidth: 280 }}
        >
          <GlassCard hoverEffect={false} sx={shimmerSx}>
            <Skeleton variant="text" width="60%" height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="80%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="40%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 1.5, borderRadius: 2 }} />
          </GlassCard>
        </motion.div>
      ))}
    </Box>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <GlassCard hoverEffect={false} sx={shimmerSx}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2, borderRadius: 1 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 2 }} />
      ))}
    </GlassCard>
  );
}

export function ProfileSkeleton() {
  return (
    <GlassCard hoverEffect={false} sx={shimmerSx}>
      <Box display="flex" gap={3}>
        <Skeleton variant="circular" width={120} height={120} />
        <Box flex={1}>
          <Skeleton variant="text" width="40%" height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="60%" sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="30%" sx={{ borderRadius: 1 }} />
          <Box display="flex" gap={2} mt={2}>
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
}
