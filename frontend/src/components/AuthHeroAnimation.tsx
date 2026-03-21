import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SportsSoccer, SportsBasketball, SportsTennis, SportsVolleyball,
  SportsHandball, FitnessCenter, Pool, DirectionsRun,
  Star, ChatBubble, Place, Group, Diversity3,
} from '@mui/icons-material';

// Simplified Macedonia map SVG path
const MACEDONIA_PATH = `M 120 60 L 155 45 L 195 38 L 230 42 L 268 35 L 310 45 L 345 55 L 370 70 L 385 95 L 390 125 L 380 155 L 365 175 L 340 190 L 310 200 L 275 210 L 240 215 L 200 212 L 165 205 L 135 192 L 110 175 L 95 150 L 88 125 L 92 95 L 105 75 Z`;

// Cities with approximate positions on the map
const CITIES = [
  { name: 'Скопје', x: 230, y: 80, size: 10 },
  { name: 'Битола', x: 175, y: 190, size: 7 },
  { name: 'Охрид', x: 120, y: 170, size: 7 },
  { name: 'Прилеп', x: 200, y: 165, size: 6 },
  { name: 'Тетово', x: 175, y: 65, size: 6 },
  { name: 'Куманово', x: 285, y: 55, size: 6 },
  { name: 'Штип', x: 310, y: 115, size: 6 },
  { name: 'Велес', x: 255, y: 110, size: 5 },
  { name: 'Струмица', x: 345, y: 175, size: 5 },
  { name: 'Гевгелија', x: 295, y: 205, size: 5 },
  { name: 'Кочани', x: 340, y: 100, size: 5 },
  { name: 'Струга', x: 105, y: 155, size: 5 },
];

const SPORT_ICONS = [
  SportsSoccer, SportsBasketball, SportsTennis, SportsVolleyball,
  SportsHandball, FitnessCenter, Pool, DirectionsRun,
];

const COMMENTS = [
  { text: 'Одличен настан! ⭐⭐⭐⭐⭐', author: 'Марко' },
  { text: 'Супер организација!', author: 'Ана' },
  { text: 'Најдобар турнир годинава!', author: 'Стефан' },
  { text: 'Неверојатна атмосфера!', author: 'Ивана' },
  { text: 'Одлични играчи, фер игра.', author: 'Дејан' },
  { text: 'Ве очекувам повторно! 🏆', author: 'Мила' },
  { text: 'Перфектна локација!', author: 'Борис' },
  { text: '10/10 би играл повторно!', author: 'Елена' },
  { text: 'Врвно ниво на натпревар!', author: 'Горан' },
  { text: 'Прекрасно искуство! 🎉', author: 'Тамара' },
];

const SPORT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

interface FloatingIcon {
  id: number;
  Icon: typeof SportsSoccer;
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
}

interface CommentBubble {
  id: number;
  comment: typeof COMMENTS[0];
  x: number;
  y: number;
}

export default function AuthHeroAnimation() {
  const [activeCity, setActiveCity] = useState(0);
  const [commentBubbles, setCommentBubbles] = useState<CommentBubble[]>([]);
  const [connectionLines, setConnectionLines] = useState<{ from: number; to: number; id: number }[]>([]);

  // Generate floating sport icons
  const floatingIcons = useMemo<FloatingIcon[]>(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      Icon: SPORT_ICONS[i % SPORT_ICONS.length],
      x: 30 + Math.random() * 420,
      y: 30 + Math.random() * 260,
      color: SPORT_COLORS[i % SPORT_COLORS.length],
      delay: i * 0.4,
      duration: 3 + Math.random() * 4,
    })),
  []);

  // Cycle through cities with pulsing dots
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCity(prev => (prev + 1) % CITIES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Pop comment bubbles periodically
  useEffect(() => {
    let commentId = 0;
    const interval = setInterval(() => {
      const comment = COMMENTS[commentId % COMMENTS.length];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const newBubble: CommentBubble = {
        id: commentId++,
        comment,
        x: Math.min(Math.max(city.x - 40, 20), 320),
        y: Math.max(city.y - 50, 20),
      };
      setCommentBubbles(prev => [...prev.slice(-2), newBubble]);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Create connection lines between cities
  useEffect(() => {
    let lineId = 0;
    const interval = setInterval(() => {
      const from = Math.floor(Math.random() * CITIES.length);
      let to = Math.floor(Math.random() * CITIES.length);
      while (to === from) to = Math.floor(Math.random() * CITIES.length);
      setConnectionLines(prev => [...prev.slice(-3), { from, to, id: lineId++ }]);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Animated gradient background */}
      <Box
        component={motion.div}
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(26,86,219,0.15) 0%, transparent 60%)',
            'radial-gradient(ellipse at 80% 30%, rgba(5,150,105,0.15) 0%, transparent 60%)',
            'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.1) 0%, transparent 60%)',
            'radial-gradient(ellipse at 20% 50%, rgba(26,86,219,0.15) 0%, transparent 60%)',
          ],
        }}
        // @ts-ignore
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        sx={{ position: 'absolute', inset: 0 }}
      />

      {/* Particle field */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Box
          key={`p-${i}`}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -80 - Math.random() * 120],
            x: [0, (Math.random() - 0.5) * 60],
          }}
          // @ts-ignore
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
          sx={{
            position: 'absolute',
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            borderRadius: '50%',
            bgcolor: ['#1a56db', '#059669', '#f59e0b', '#ef4444'][i % 4],
            left: `${5 + Math.random() * 90}%`,
            top: `${20 + Math.random() * 70}%`,
          }}
        />
      ))}

      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 10, marginBottom: 16 }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
          <Box
            component={motion.div}
            animate={{ rotate: [0, 10, -10, 0] }}
            // @ts-ignore
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            sx={{
              width: 48, height: 48, borderRadius: 3,
              background: 'linear-gradient(135deg, #1a56db, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(26,86,219,0.3)',
            }}
          >
            <Diversity3 sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="white" sx={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            TeamUp
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: alpha('#fff', 0.8), fontWeight: 500 }}>
          Најди тим. Играј. Победи.
        </Typography>
      </motion.div>

      {/* Map container */}
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 480 }, maxWidth: 480, height: { xs: 200, sm: 260 }, mx: 'auto', zIndex: 5 }}>
        <svg viewBox="60 20 360 220" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          {/* Map outline glow */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a56db" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a56db" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Map fill */}
          <motion.path
            d={MACEDONIA_PATH}
            fill="url(#mapGrad)"
            stroke={alpha('#1a56db', 0.4)}
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            filter="url(#glow)"
          />

          {/* Connection lines */}
          <AnimatePresence>
            {connectionLines.map(line => (
              <motion.line
                key={line.id}
                x1={CITIES[line.from].x}
                y1={CITIES[line.from].y}
                x2={CITIES[line.to].x}
                y2={CITIES[line.to].y}
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeDasharray="4 4"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 0.6, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            ))}
          </AnimatePresence>

          {/* City dots */}
          {CITIES.map((city, i) => (
            <g key={city.name}>
              {/* Pulse ring */}
              <motion.circle
                cx={city.x}
                cy={city.y}
                r={city.size}
                fill="none"
                stroke={i === activeCity ? '#059669' : '#1a56db'}
                strokeWidth="1"
                initial={{ opacity: 0, r: city.size * 0.5 }}
                animate={{
                  opacity: i === activeCity ? [0, 0.8, 0] : [0, 0.3, 0],
                  r: i === activeCity ? [city.size * 0.5, city.size * 2.5] : [city.size * 0.5, city.size * 1.5],
                }}
                transition={{
                  duration: i === activeCity ? 1.5 : 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
              {/* Dot */}
              <motion.circle
                cx={city.x}
                cy={city.y}
                r={city.size * 0.4}
                fill={i === activeCity ? '#22c55e' : '#1a56db'}
                initial={{ scale: 0 }}
                animate={{ scale: i === activeCity ? 1.4 : 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                style={{ filter: i === activeCity ? 'drop-shadow(0 0 6px rgba(34,197,94,0.8))' : 'none' }}
              />
              {/* City name */}
              {i === activeCity && (
                <motion.text
                  x={city.x}
                  y={city.y - city.size - 6}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                  initial={{ opacity: 0, y: city.y - city.size }}
                  animate={{ opacity: 1, y: city.y - city.size - 6 }}
                  transition={{ duration: 0.3 }}
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                >
                  {city.name}
                </motion.text>
              )}
            </g>
          ))}
        </svg>

        {/* Floating sport icons */}
        {floatingIcons.map(icon => {
          const IconComp = icon.Icon;
          return (
            <Box
              key={icon.id}
              component={motion.div}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.7, 0.7, 0],
                scale: [0, 1, 1, 0.5],
                y: [0, -20, -40, -60],
                x: [0, (Math.random() - 0.5) * 30],
              }}
              // @ts-ignore
              transition={{
                duration: icon.duration,
                repeat: Infinity,
                delay: icon.delay,
                ease: 'easeInOut',
              }}
              sx={{
                position: 'absolute',
                left: icon.x,
                top: icon.y,
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha(icon.color, 0.15),
                backdropFilter: 'blur(4px)',
                border: `1px solid ${alpha(icon.color, 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComp sx={{ fontSize: 20, color: icon.color }} />
            </Box>
          );
        })}
      </Box>

      {/* Comment Bubbles */}
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 480 }, maxWidth: 480, height: 60, mx: 'auto', zIndex: 10, mt: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {commentBubbles.slice(-3).map((bubble, idx) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'absolute',
                left: `${idx * 34 + 1}%`,
                top: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: alpha('#fff', 0.1),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${alpha('#fff', 0.15)}`,
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  maxWidth: 220,
                }}
              >
                <ChatBubble sx={{ fontSize: 14, color: alpha('#fff', 0.6) }} />
                <Box>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontSize: 10, display: 'block' }}>
                    {bubble.comment.author}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: 11.5, lineHeight: 1.3 }}>
                    {bubble.comment.text}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Stats ticker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        style={{ position: 'relative', zIndex: 10, marginTop: 16 }}
      >
        <Box display="flex" gap={4} justifyContent="center">
          {[
            { icon: <Group sx={{ fontSize: 18 }} />, label: '5,000+', sub: 'Играчи' },
            { icon: <Star sx={{ fontSize: 18 }} />, label: '1,200+', sub: 'Настани' },
            { icon: <Place sx={{ fontSize: 18 }} />, label: '30+', sub: 'Градови' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + i * 0.2 }}
            >
              <Box textAlign="center" sx={{ color: alpha('#fff', 0.8) }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  {stat.icon}
                  <Typography variant="h6" fontWeight={800} color="white">{stat.label}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>{stat.sub}</Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}
