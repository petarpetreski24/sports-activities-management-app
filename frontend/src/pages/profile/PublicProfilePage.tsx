import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Avatar, Grid, Chip, Rating, Alert, alpha,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import PlaceIcon from '@mui/icons-material/Place';
import { motion } from 'framer-motion';
import * as usersApi from '../../api/users';
import { getSportIcon } from '../../utils/sportIcons';
import { SKILL_LEVEL_LABELS, UserPublic } from '../../types';
import AnimatedPage from '../../components/AnimatedPage';
import { ProfileSkeleton } from '../../components/LoadingSkeleton';
import GlassCard from '../../components/GlassCard';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';

const SKILL_COLORS: Record<string, string> = {
  Beginner: '#3b82f6',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
  Professional: '#8b5cf6',
};

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.getPublicProfile(parseInt(id!))
      .then(res => setProfile(res.data))
      .catch(() => setError('Корисникот не е пронајден.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box mt={4}><ProfileSkeleton /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return null;

  return (
    <AnimatedPage>
      <Box maxWidth={800} mx="auto">
        <SectionHeader
          icon={<PersonIcon />}
          title="Профил"
        />

        {/* Hero section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard variant="gradient" hoverEffect={false} noPadding sx={{ mb: 5 }}>
            <Box
              sx={{
                height: 200,
                background: `linear-gradient(135deg, ${alpha('#1a56db', 0.06)}, ${alpha('#059669', 0.04)})`,
                position: 'relative',
              }}
            />
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ position: 'relative', mt: '-70px', pb: 3 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Avatar
                  src={profile.profilePhotoUrl ? `http://localhost:5000${profile.profilePhotoUrl}` : undefined}
                  sx={{
                    width: 140,
                    height: 140,
                    fontSize: 48,
                    border: '4px solid transparent',
                    background: 'linear-gradient(white,white), linear-gradient(135deg, #1a56db, #059669)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    boxShadow: `0 8px 32px ${alpha('#1a56db', 0.18)}`,
                  }}
                >
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </Avatar>
              </motion.div>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 1.5 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              {profile.locationCity && (
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <PlaceIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography color="text.secondary">{profile.locationCity}</Typography>
                </Box>
              )}
              {profile.bio && (
                <Typography
                  color="text.secondary"
                  sx={{ mt: 1.5, px: 4, textAlign: 'center', maxWidth: 600, lineHeight: 1.7 }}
                >
                  {profile.bio}
                </Typography>
              )}
            </Box>
          </GlassCard>
        </motion.div>

        {/* Stats bar */}
        <Box display="flex" gap={2} mb={3}>
          <StatCard
            label="Оцена како организатор"
            value={profile.avgRatingAsOrganizer || 0}
            decimals={1}
            icon={<StarIcon />}
            color="#059669"
            delay={0.2}
          />
          <StatCard
            label="Оцена како учесник"
            value={profile.avgRatingAsParticipant || 0}
            decimals={1}
            icon={<EmojiEventsIcon />}
            color="#1a56db"
            delay={0.3}
          />
        </Box>

        {/* Favorite sports */}
        {profile.favoriteSports && profile.favoriteSports.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SectionHeader
              icon={<SportsScoreIcon />}
              title="Спортови"
              count={profile.favoriteSports.length}
            />
            <Grid container spacing={2}>
              {profile.favoriteSports.map((fs, i) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                  >
                    <GlassCard sx={{ textAlign: 'center', py: 2.5, px: 1.5 }}>
                      {fs.sportIcon && (
                        <Box sx={{ mb: 1, color: '#1a56db', display: 'flex', justifyContent: 'center' }}>
                          {getSportIcon(fs.sportIcon, 36)}
                        </Box>
                      )}
                      <Typography fontWeight={700} fontSize={14} noWrap>
                        {fs.sportName}
                      </Typography>
                      <Chip
                        label={SKILL_LEVEL_LABELS[fs.skillLevel] || fs.skillLevel}
                        size="small"
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          fontSize: 11,
                          bgcolor: alpha(SKILL_COLORS[fs.skillLevel] || '#059669', 0.1),
                          color: SKILL_COLORS[fs.skillLevel] || '#059669',
                        }}
                      />
                      {fs.avgRating != null ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={1}>
                          <Rating value={fs.avgRating} precision={0.5} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            ({fs.avgRating.toFixed(1)})
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Нема оценки
                        </Typography>
                      )}
                    </GlassCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Box>
    </AnimatedPage>
  );
}
