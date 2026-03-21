import { ReactNode } from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <GlassCard
        hoverEffect={false}
        sx={{
          py: 6,
          px: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha('#1a56db', 0.03)}, ${alpha('#059669', 0.03)})`,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha('#1a56db', 0.1)}, ${alpha('#059669', 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              color: '#1a56db',
              '& .MuiSvgIcon-root': { fontSize: 36 },
            }}
          >
            {icon}
          </Box>
        </motion.div>
        <Typography variant="h6" fontWeight={700} mb={1}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3} maxWidth={400} mx="auto">
          {description}
        </Typography>
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="contained"
              onClick={action.onClick}
              sx={{
                background: 'linear-gradient(135deg, #1a56db, #059669)',
                '&:hover': { background: 'linear-gradient(135deg, #1e3a5f, #064e3b)' },
                px: 4,
                py: 1.2,
              }}
            >
              {action.label}
            </Button>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
