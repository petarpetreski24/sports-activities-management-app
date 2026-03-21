import { Button, ButtonProps } from '@mui/material';
import { forwardRef } from 'react';

interface GradientButtonProps extends Omit<ButtonProps, 'component'> {
  gradientFrom?: string;
  gradientTo?: string;
  hoverFrom?: string;
  hoverTo?: string;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      gradientFrom = '#1a56db',
      gradientTo = '#059669',
      hoverFrom = '#1e3a5f',
      hoverTo = '#064e3b',
      children,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant="contained"
        {...rest}
        sx={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          color: '#fff',
          fontWeight: 600,
          boxShadow: `0 4px 15px rgba(26,86,219,0.25)`,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${hoverFrom}, ${hoverTo})`,
            boxShadow: `0 6px 20px rgba(26,86,219,0.3)`,
            transform: 'scale(1.02)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #94a3b8, #94a3b8)',
            color: '#fff',
          },
          ...sx,
        }}
      >
        {children}
      </Button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
export default GradientButton;
