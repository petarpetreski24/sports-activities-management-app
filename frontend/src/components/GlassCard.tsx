import { ReactNode } from 'react';
import { Paper, PaperProps, alpha } from '@mui/material';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'light' | 'gradient';
  hoverEffect?: boolean;
  noPadding?: boolean;
  accentColor?: string;
  sx?: PaperProps['sx'];
  onClick?: () => void;
}

export default function GlassCard({
  children,
  variant = 'light',
  hoverEffect = true,
  noPadding = false,
  accentColor,
  sx,
  onClick,
}: GlassCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        position: 'relative',
        bgcolor: alpha('#fff', 0.72),
        backdropFilter: 'blur(16px)',
        border: `1px solid ${alpha('#1a56db', 0.08)}`,
        borderRadius: 2.5,
        boxShadow: `0 4px 24px ${alpha('#1a56db', 0.04)}`,
        overflow: 'hidden',
        p: noPadding ? 0 : 3,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(hoverEffect && {
          '&:hover': {
            boxShadow: `0 12px 40px ${alpha('#1a56db', 0.08)}`,
            borderColor: alpha('#1a56db', 0.15),
            transform: 'translateY(-2px)',
          },
        }),
        ...(variant === 'gradient' && {
          boxShadow: accentColor
            ? `0 -3px 0 0 ${accentColor}, 0 4px 24px ${alpha('#1a56db', 0.04)}`
            : `0 4px 24px ${alpha('#1a56db', 0.06)}, inset 0 1px 0 0 ${alpha('#1a56db', 0.12)}`,
        }),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
