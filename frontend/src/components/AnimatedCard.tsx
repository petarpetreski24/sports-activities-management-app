import { motion } from 'framer-motion';
import { CardProps } from '@mui/material';
import { ReactNode } from 'react';
import GlassCard from './GlassCard';

interface AnimatedCardProps {
  delay?: number;
  hoverScale?: number;
  children: ReactNode;
  sx?: CardProps['sx'];
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: 'light' | 'gradient';
  accentColor?: string;
}

export default function AnimatedCard({
  delay = 0,
  hoverScale = 1.02,
  children,
  sx,
  onClick,
  style,
  variant = 'light',
  accentColor,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      onClick={onClick}
    >
      <GlassCard
        variant={variant}
        accentColor={accentColor}
        hoverEffect={false}
        noPadding
        sx={{
          height: '100%',
          ...sx,
        }}
      >
        {children}
      </GlassCard>
    </motion.div>
  );
}
