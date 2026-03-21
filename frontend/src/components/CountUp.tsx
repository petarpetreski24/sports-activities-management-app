import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Typography, TypographyProps } from '@mui/material';

interface CountUpProps extends Omit<TypographyProps, 'children'> {
  value: number;
  duration?: number;
  decimals?: number;
}

export default function CountUp({ value, duration = 1.5, decimals = 0, ...props }: CountUpProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const display = useTransform(springValue, (v) => v.toFixed(decimals));
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return unsubscribe;
  }, [display]);

  return (
    <Typography {...props}>{displayValue}</Typography>
  );
}
