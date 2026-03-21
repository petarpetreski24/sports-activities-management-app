import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1a56db', light: '#3b82f6', dark: '#1e3a5f' },
    secondary: { main: '#059669', light: '#34d399', dark: '#064e3b' },
    background: { default: '#f0f4f8', paper: '#ffffff' },
    error: { main: '#dc2626' },
    warning: { main: '#f59e0b' },
    info: { main: '#0891b2' },
    success: { main: '#16a34a' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none' as const,
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha('#1a56db', 0.06)}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha('#1a56db', 0.92)} 0%, ${alpha('#1e3a5f', 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
          boxShadow: `0 4px 30px ${alpha('#1a56db', 0.15)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha('#1a56db', 0.15)}`,
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid',
          borderColor: alpha('#1a56db', 0.15),
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: `linear-gradient(135deg, ${alpha('#1a56db', 0.06)}, ${alpha('#059669', 0.04)})`,
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            color: alpha('#1e3a5f', 0.7),
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none' as const,
          fontWeight: 600,
          minHeight: 40,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: '#fff',
            background: 'linear-gradient(135deg, #1a56db, #059669)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          display: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
          textTransform: 'none' as const,
          fontWeight: 600,
          border: `1px solid ${alpha('#1a56db', 0.15)}`,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #1a56db, #059669)',
            color: '#fff',
            borderColor: 'transparent',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3a5f, #064e3b)',
            },
          },
        },
      },
    },
  },
});

export default theme;
