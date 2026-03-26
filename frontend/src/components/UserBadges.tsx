import { useEffect, useState } from 'react';
import { Box, Typography, Tooltip, Skeleton } from '@mui/material';
import {
  EmojiEvents, Sports, MilitaryTech, Star, WorkspacePremium,
  Event, EventAvailable, Celebration, ThumbUp, Verified,
  RateReview, Chat, SportsScore, AutoAwesome, Explore,
  Nightlight,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as statsApi from '../api/stats';
import { Badge } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  emoji_events: <EmojiEvents />,
  sports: <Sports />,
  military_tech: <MilitaryTech />,
  star: <Star />,
  workspace_premium: <WorkspacePremium />,
  event: <Event />,
  event_available: <EventAvailable />,
  celebration: <Celebration />,
  thumb_up: <ThumbUp />,
  verified: <Verified />,
  rate_review: <RateReview />,
  chat: <Chat />,
  sports_score: <SportsScore />,
  auto_awesome: <AutoAwesome />,
  explore: <Explore />,
  nightlight: <Nightlight />,
};

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)', text: '#CD7F32', glow: 'rgba(205,127,50,0.3)' },
  silver: { bg: 'rgba(192,192,192,0.12)', border: 'rgba(192,192,192,0.3)', text: '#94a3b8', glow: 'rgba(192,192,192,0.3)' },
  gold: { bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.3)', text: '#f59e0b', glow: 'rgba(255,215,0,0.4)' },
  platinum: { bg: 'rgba(26,86,219,0.12)', border: 'rgba(26,86,219,0.3)', text: '#3b82f6', glow: 'rgba(26,86,219,0.4)' },
  diamond: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
};

// Random-ish placement offsets for a scattered look
const SCATTER_OFFSETS = [
  { rotate: -8, y: 4 }, { rotate: 5, y: -2 }, { rotate: -3, y: 6 },
  { rotate: 7, y: -4 }, { rotate: -5, y: 2 }, { rotate: 4, y: -6 },
  { rotate: -6, y: 3 }, { rotate: 8, y: -3 }, { rotate: -2, y: 5 },
  { rotate: 6, y: -1 }, { rotate: -4, y: 4 }, { rotate: 3, y: -5 },
  { rotate: -7, y: 1 }, { rotate: 5, y: -2 }, { rotate: -3, y: 6 },
  { rotate: 7, y: -4 }, { rotate: -5, y: 2 }, { rotate: 4, y: -6 },
];

interface Props {
  userId: number;
  compact?: boolean;
}

export default function UserBadges({ userId, compact = false }: Props) {
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
      <Box display="flex" gap={1.5} flexWrap="wrap" justifyContent="center">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={80} height={80} sx={{ borderRadius: 3 }} />)}
      </Box>
    );
  }

  if (badges.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" py={2} fontSize={14}>
        Сеуште нема беџови — учествувај на настани за да отклучиш!
      </Typography>
    );
  }

  return (
    <Box
      display="flex"
      gap={compact ? 1 : 2}
      flexWrap="wrap"
      justifyContent="center"
      sx={{ py: compact ? 0 : 1 }}
    >
      {badges.map((badge, i) => {
        const colors = LEVEL_COLORS[badge.level] || LEVEL_COLORS.bronze;
        const scatter = SCATTER_OFFSETS[i % SCATTER_OFFSETS.length];
        const icon = ICON_MAP[badge.icon] || <EmojiEvents />;

        return (
          <Tooltip
            key={badge.id}
            title={
              <Box textAlign="center">
                <Typography fontWeight={700} fontSize={13}>{badge.name}</Typography>
                <Typography fontSize={11} sx={{ opacity: 0.85 }}>{badge.description}</Typography>
              </Box>
            }
            arrow
          >
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: scatter.rotate * 2 }}
              animate={{ opacity: 1, scale: 1, rotate: scatter.rotate }}
              transition={{
                delay: 0.1 + i * 0.08,
                type: 'spring',
                stiffness: 260,
                damping: 15,
              }}
              whileHover={{
                scale: 1.2,
                rotate: 0,
                y: -8,
                transition: { type: 'spring', stiffness: 400 },
              }}
              style={{ cursor: 'default' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: compact ? 52 : 80,
                  height: compact ? 52 : 80,
                  borderRadius: 3,
                  bgcolor: colors.bg,
                  border: `1.5px solid ${colors.border}`,
                  boxShadow: `0 4px 20px ${colors.glow}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: colors.glow,
                    filter: 'blur(12px)',
                  },
                }}
              >
                <Box sx={{
                  color: colors.text,
                  fontSize: compact ? 22 : 30,
                  display: 'flex',
                  '& .MuiSvgIcon-root': { fontSize: 'inherit' },
                }}>
                  {icon}
                </Box>
                {!compact && (
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color: colors.text,
                      fontSize: 9,
                      mt: 0.3,
                      textAlign: 'center',
                      lineHeight: 1.1,
                      px: 0.5,
                    }}
                  >
                    {badge.name}
                  </Typography>
                )}
              </Box>
            </motion.div>
          </Tooltip>
        );
      })}
    </Box>
  );
}
