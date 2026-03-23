import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, alpha, Container, Grid } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import {
  Diversity3, SportsSoccer, SportsBasketball, SportsTennis,
  Groups, EmojiEvents, Place, Speed, Star, TrendingUp,
  CalendarMonth, Shield, KeyboardArrowDown,
} from '@mui/icons-material';
import GradientButton from '../components/GradientButton';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: 'easeOut' as const },
};

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {inView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value.toLocaleString()}{suffix}
        </motion.span>
      ) : '0'}
    </motion.span>
  );
}

const STATS = [
  { icon: <Groups sx={{ fontSize: 32 }} />, value: 5000, suffix: '+', label: 'Активни играчи', color: '#3b82f6' },
  { icon: <EmojiEvents sx={{ fontSize: 32 }} />, value: 1200, suffix: '+', label: 'Организирани настани', color: '#22c55e' },
  { icon: <Place sx={{ fontSize: 32 }} />, value: 30, suffix: '+', label: 'Градови', color: '#f59e0b' },
  { icon: <Star sx={{ fontSize: 32 }} />, value: 15, suffix: '', label: 'Спортови', color: '#8b5cf6' },
];

const FEATURES = [
  {
    icon: <CalendarMonth sx={{ fontSize: 28 }} />,
    title: 'Организирај настани',
    desc: 'Креирај спортски настани за твојот град, избери спорт, локација и време — останатото е на заедницата.',
    color: '#3b82f6',
  },
  {
    icon: <Groups sx={{ fontSize: 28 }} />,
    title: 'Најди тим',
    desc: 'Пребарувај настани по спорт, локација и ниво. Аплицирај и играј со нови луѓе секој ден.',
    color: '#22c55e',
  },
  {
    icon: <Star sx={{ fontSize: 28 }} />,
    title: 'Оцени и биди оценет',
    desc: 'По секој настан, оцени ги играчите и организаторот. Градете репутација базирана на фер игра.',
    color: '#f59e0b',
  },
  {
    icon: <Place sx={{ fontSize: 28 }} />,
    title: 'Мапа на настани',
    desc: 'Погледни ги сите достапни настани на интерактивна мапа. Филтрирај по спорт и оддалеченост.',
    color: '#8b5cf6',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 28 }} />,
    title: 'Следи го прогресот',
    desc: 'Детален dashboard со статистики, графици и преглед на твоите активности низ времето.',
    color: '#ec4899',
  },
  {
    icon: <Shield sx={{ fontSize: 28 }} />,
    title: 'Безбедна заедница',
    desc: 'Систем за пријавување, модерирање и оценување обезбедува позитивна атмосфера за сите.',
    color: '#06b6d4',
  },
];

const SPORTS_SHOWCASE = [
  { icon: <SportsSoccer />, name: 'Фудбал', color: '#22c55e' },
  { icon: <SportsBasketball />, name: 'Кошарка', color: '#f59e0b' },
  { icon: <SportsTennis />, name: 'Тенис', color: '#3b82f6' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#0a0f1a', color: 'white', overflowX: 'hidden' }}>

      {/* ─── HERO SECTION ─── */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          px: 2,
          overflow: 'hidden',
        }}
      >
        {/* Gradient orbs */}
        <Box
          component={motion.div}
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          // @ts-ignore
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute', top: '-20%', left: '-10%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, #1a56db, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <Box
          component={motion.div}
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          // @ts-ignore
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          sx={{
            position: 'absolute', bottom: '-15%', right: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, #059669, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Floating sport icons */}
        {SPORTS_SHOWCASE.map((sport, i) => (
          <Box
            key={i}
            component={motion.div}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            // @ts-ignore
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
            sx={{
              position: 'absolute',
              top: `${20 + i * 25}%`,
              left: i % 2 === 0 ? `${8 + i * 3}%` : undefined,
              right: i % 2 !== 0 ? `${8 + i * 3}%` : undefined,
              width: 56, height: 56, borderRadius: 3,
              bgcolor: alpha(sport.color, 0.12),
              border: `1px solid ${alpha(sport.color, 0.2)}`,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center', justifyContent: 'center',
              color: sport.color,
              '& .MuiSvgIcon-root': { fontSize: 28 },
            }}
          >
            {sport.icon}
          </Box>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Box
            sx={{
              width: 80, height: 80, borderRadius: 4, mx: 'auto', mb: 3,
              background: 'linear-gradient(135deg, #1a56db, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 16px 48px rgba(26,86,219,0.4)',
            }}
          >
            <Diversity3 sx={{ fontSize: 42, color: 'white' }} />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h1"
            fontWeight={900}
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              mb: 2,
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EkipAY
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: alpha('#fff', 0.6),
              fontWeight: 400,
              maxWidth: 520,
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              lineHeight: 1.6,
            }}
          >
            Организирај. Играј. Победи.
            <br />
            <Typography component="span" sx={{ color: alpha('#fff', 0.4), fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
              Платформа за организирање спортски активности низ Македонија.
            </Typography>
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            <GradientButton
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 5, py: 1.8, fontSize: '1.05rem', fontWeight: 700,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(26,86,219,0.35)',
              }}
            >
              Придружи се
            </GradientButton>
            <GradientButton
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 5, py: 1.8, fontSize: '1.05rem', fontWeight: 600,
                borderRadius: 3,
                background: 'transparent',
                border: `1px solid ${alpha('#fff', 0.2)}`,
                color: 'white',
                boxShadow: 'none',
                '&:hover': {
                  background: alpha('#fff', 0.06),
                  border: `1px solid ${alpha('#fff', 0.35)}`,
                  boxShadow: 'none',
                },
              }}
            >
              Најави се
            </GradientButton>
          </Box>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ position: 'absolute', bottom: 32 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <KeyboardArrowDown sx={{ color: alpha('#fff', 0.3), fontSize: 32 }} />
          </motion.div>
        </motion.div>
      </Box>

      {/* ─── STATS SECTION ─── */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: `linear-gradient(180deg, ${alpha('#0a0f1a', 1)}, ${alpha('#111827', 1)})` }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {STATS.map((stat, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.15 }}>
                  <Box
                    textAlign="center"
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 4,
                      bgcolor: alpha('#fff', 0.03),
                      border: `1px solid ${alpha('#fff', 0.06)}`,
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.06),
                        borderColor: alpha(stat.color, 0.3),
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' }, color: 'white' }}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.5), fontWeight: 500, mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── FEATURES SECTION ─── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#111827' }}>
        <Container maxWidth="lg">
          <motion.div {...fadeUp}>
            <Typography
              variant="h3"
              textAlign="center"
              fontWeight={800}
              sx={{ mb: 1, fontSize: { xs: '1.8rem', sm: '2.4rem' } }}
            >
              Сè што ти треба
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ color: alpha('#fff', 0.5), mb: { xs: 5, md: 7 }, maxWidth: 500, mx: 'auto' }}
            >
              Една платформа за целосно искуство — од организирање до оценување.
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {FEATURES.map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: 4,
                      bgcolor: alpha('#fff', 0.03),
                      border: `1px solid ${alpha('#fff', 0.06)}`,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.05),
                        borderColor: alpha(f.color, 0.25),
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 40px ${alpha(f.color, 0.08)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: 3, mb: 2,
                        bgcolor: alpha(f.color, 0.12),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: f.color,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} mb={1} sx={{ fontSize: '1.05rem' }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.5), lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── HOW IT WORKS ─── */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: `linear-gradient(180deg, #111827, #0a0f1a)` }}>
        <Container maxWidth="md">
          <motion.div {...fadeUp}>
            <Typography
              variant="h3"
              textAlign="center"
              fontWeight={800}
              sx={{ mb: 1, fontSize: { xs: '1.8rem', sm: '2.4rem' } }}
            >
              Како функционира?
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ color: alpha('#fff', 0.5), mb: { xs: 5, md: 7 } }}
            >
              Три чекори до терен.
            </Typography>
          </motion.div>

          <Box display="flex" flexDirection="column" gap={4}>
            {[
              { step: '01', title: 'Регистрирај се', desc: 'Креирај профил, додади ги твоите омилени спортови и постави го твоето ниво.', color: '#3b82f6' },
              { step: '02', title: 'Најди или креирај настан', desc: 'Пребарај ги настаните на мапата или организирај свој — избери спорт, време и локација.', color: '#22c55e' },
              { step: '03', title: 'Играј и оценувај', desc: 'По настанот, оцени ги играчите и организаторот. Следи го твојот прогрес на dashboard-от.', color: '#f59e0b' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: 4,
                    bgcolor: alpha('#fff', 0.02),
                    border: `1px solid ${alpha('#fff', 0.06)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.04),
                      borderColor: alpha(item.color, 0.2),
                    },
                  }}
                >
                  <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.8rem' },
                      color: alpha(item.color, 0.25),
                      flexShrink: 0,
                      minWidth: { xs: 50, sm: 70 },
                      textAlign: 'center',
                    }}
                  >
                    {item.step}
                  </Typography>
                  <Box>
                    <Typography variant="h6" fontWeight={700} mb={0.5} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.5), lineHeight: 1.7 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── CTA SECTION ─── */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#0a0f1a',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(26,86,219,0.12) 0%, transparent 70%)',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              variant="h3"
              fontWeight={800}
              mb={2}
              sx={{ fontSize: { xs: '1.8rem', sm: '2.4rem' } }}
            >
              Подготвен си?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: alpha('#fff', 0.5), mb: 4, lineHeight: 1.7 }}
            >
              Илјадници играчи веќе го користат EkipAY за организирање спортски активности.
              Стани дел од заедницата.
            </Typography>
            <GradientButton
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 6, py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 3,
                boxShadow: '0 8px 40px rgba(26,86,219,0.4)',
              }}
            >
              Започни бесплатно
            </GradientButton>
          </motion.div>
        </Container>
      </Box>

      {/* ─── FOOTER ─── */}
      <Box sx={{ py: 4, borderTop: `1px solid ${alpha('#fff', 0.06)}`, bgcolor: '#0a0f1a' }}>
        <Container>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Diversity3 sx={{ color: alpha('#fff', 0.4), fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.3) }}>
                EkipAY &copy; {new Date().getFullYear()}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.2) }}>
              Организирај. Играј. Победи.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
