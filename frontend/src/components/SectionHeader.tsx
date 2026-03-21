import { ReactNode } from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  count?: number;
}

export default function SectionHeader({ icon, title, subtitle, action, count }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2.5}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #1a56db, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha('#1a56db', 0.25)}`,
              color: 'white',
              '& .MuiSvgIcon-root': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {title}
              </Typography>
              {count !== undefined && count > 0 && (
                <Chip
                  label={count}
                  size="small"
                  sx={{
                    height: 22,
                    minWidth: 22,
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1a56db, #059669)',
                    color: 'white',
                    '& .MuiChip-label': { px: 0.8 },
                  }}
                />
              )}
            </Box>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </motion.div>
  );
}
