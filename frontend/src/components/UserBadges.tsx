import { useEffect, useState } from 'react';
import { Box, Typography, Tooltip, alpha, useTheme, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import * as statsApi from '../api/stats';
import { Badge } from '../types';

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: '#CD7F3220', border: '#CD7F3240', text: '#CD7F32' },
  silver: { bg: '#C0C0C020', border: '#C0C0C040', text: '#94a3b8' },
  gold: { bg: '#FFD70020', border: '#FFD70040', text: '#f59e0b' },
  platinum: { bg: '#1a56db20', border: '#1a56db40', text: '#1a56db' },
  diamond: { bg: '#8b5cf620', border: '#8b5cf640', text: '#8b5cf6' },
};

interface Props {
  userId: number;
  compact?: boolean;
}

export default function UserBadges({ userId, compact = false }: Props) {
  const theme = useTheme();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getUserBadges(userId).then(res => {
      setBadges(res.data.badges);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" gap={1} flexWrap="wrap">
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={compact ? 36 : 80} height={compact ? 36 : 72} />)}
      </Box>
    );
  }

  if (badges.length === 0) return null;

  return (
    <Box display="flex" gap={compact ? 0.5 : 1} flexWrap="wrap">
      {badges.map((badge, i) => {
        const colors = LEVEL_COLORS[badge.level] || LEVEL_COLORS.bronze;
        return (
          <Tooltip key={badge.id} title={`${badge.name} — ${badge.description}`} arrow>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
            >
              {compact ? (
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1.5, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  bgcolor: colors.bg, border: `1px solid ${colors.border}`,
                  fontSize: 16, cursor: 'default',
                }}>
                  <span className="material-icons" style={{ fontSize: 18, color: colors.text }}>
                    {badge.icon}
                  </span>
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  p: 1, borderRadius: 2, minWidth: 72,
                  bgcolor: colors.bg, border: `1px solid ${colors.border}`,
                  cursor: 'default', transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}>
                  <span className="material-icons" style={{ fontSize: 24, color: colors.text }}>
                    {badge.icon}
                  </span>
                  <Typography variant="caption" fontWeight={700} sx={{ color: colors.text, fontSize: 10, mt: 0.5, textAlign: 'center' }}>
                    {badge.name}
                  </Typography>
                </Box>
              )}
            </motion.div>
          </Tooltip>
        );
      })}
    </Box>
  );
}
