import { Dialog, DialogProps } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';

const MotionDiv = motion.div;

interface AnimatedDialogProps extends DialogProps {
  animationType?: 'scale' | 'slide' | 'fade';
}

const animations = {
  scale: {
    initial: { opacity: 0, scale: 0.85, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.85, y: 20 },
  },
  slide: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 60 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

const AnimatedPaperComponent = forwardRef<HTMLDivElement, any>(
  ({ animationType = 'scale', ...props }, ref) => {
    const anim = animations[animationType as keyof typeof animations] || animations.scale;
    return (
      <MotionDiv
        ref={ref}
        initial={anim.initial}
        animate={anim.animate}
        exit={anim.exit}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        {...props}
      />
    );
  }
);

export default function AnimatedDialog({ animationType = 'scale', children, ...props }: AnimatedDialogProps) {
  return (
    <AnimatePresence>
      {props.open && (
        <Dialog
          {...props}
          PaperComponent={(paperProps) => (
            <AnimatedPaperComponent animationType={animationType} {...paperProps} />
          )}
        >
          {children}
        </Dialog>
      )}
    </AnimatePresence>
  );
}
