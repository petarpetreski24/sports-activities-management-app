import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem,
  Box, Container, Drawer, List, ListItemButton, ListItemText, ListItemIcon, Divider,
  Avatar, useMediaQuery, useTheme, Tooltip, alpha,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications as NotifIcon, Diversity3,
  Dashboard, Event, Add, Person, ExitToApp, AdminPanelSettings, EventNote,
  Close, DarkMode, LightMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import * as notificationsApi from '../api/notifications';

export default function Layout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {});
      const interval = setInterval(() => {
        notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname.startsWith('/admin') : location.pathname === path;

  const navLinks = [
    { label: 'Почетна', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Настани', path: '/events', icon: <Event /> },
    { label: 'Креирај', path: '/events/create', icon: <Add /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderRadius: 0 }}>
        <Toolbar sx={{ px: { xs: 1.5, md: 3 }, minHeight: { xs: 60, sm: 68 } }}>
          {isMobile && isAuthenticated && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha('#fff', 0.2)}, ${alpha('#fff', 0.1)})`,
                borderRadius: 2,
                p: 0.7,
                mr: 1.5,
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${alpha('#fff', 0.15)}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Diversity3 />
            </Box>
            <Typography variant="h6" component={RouterLink} to="/"
              sx={{
                flexGrow: isMobile ? 1 : 0,
                textDecoration: 'none',
                color: 'inherit',
                mr: 4,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}>
              EkipAY
            </Typography>
          </motion.div>

          {!isMobile && isAuthenticated && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  component={RouterLink}
                  to={link.path}
                  startIcon={link.icon}
                  sx={{
                    fontSize: '0.9rem',
                    borderRadius: 2,
                    px: 2,
                    position: 'relative',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: alpha('#fff', 0.08) },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 4,
                      left: '20%',
                      right: '20%',
                      height: 3,
                      borderRadius: 2,
                      background: isActive(link.path)
                        ? 'linear-gradient(90deg, #059669, #3b82f6)'
                        : 'transparent',
                      transition: 'all 0.3s ease',
                    },
                    color: isActive(link.path) ? '#fff' : alpha('#fff', 0.75),
                    fontWeight: isActive(link.path) ? 700 : 500,
                  }}
                >
                  {link.label}
                </Button>
              ))}
              {isAdmin && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin"
                  startIcon={<AdminPanelSettings />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    position: 'relative',
                    '&:hover': { bgcolor: alpha('#fff', 0.08) },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 4,
                      left: '20%',
                      right: '20%',
                      height: 3,
                      borderRadius: 2,
                      background: isActive('/admin')
                        ? 'linear-gradient(90deg, #059669, #3b82f6)'
                        : 'transparent',
                      transition: 'all 0.3s ease',
                    },
                    color: isActive('/admin') ? '#fff' : alpha('#fff', 0.75),
                    fontWeight: isActive('/admin') ? 700 : 500,
                  }}
                >
                  Админ
                </Button>
              )}
            </Box>
          )}

          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title={isDark ? 'Светла тема' : 'Темна тема'}>
                <IconButton
                  color="inherit"
                  onClick={toggleTheme}
                  sx={{ '&:hover': { bgcolor: alpha('#fff', 0.08) } }}
                >
                  {isDark ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
              <Button color="inherit" component={RouterLink} to="/login" sx={{ borderRadius: 2 }}>
                Најава
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  bgcolor: alpha('#fff', 0.15),
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#fff', 0.2)}`,
                  '&:hover': { bgcolor: alpha('#fff', 0.25) },
                  borderRadius: 2,
                }}
              >
                Регистрација
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={isDark ? 'Светла тема' : 'Темна тема'}>
                <IconButton
                  color="inherit"
                  onClick={toggleTheme}
                  sx={{ '&:hover': { bgcolor: alpha('#fff', 0.08) } }}
                >
                  {isDark ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Нотификации">
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/notifications')}
                  sx={{
                    position: 'relative',
                    '&:hover': { bgcolor: alpha('#fff', 0.08) },
                  }}
                >
                  <motion.div
                    key={unreadCount}
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                          fontWeight: 700,
                          animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.15)' },
                            '100%': { transform: 'scale(1)' },
                          },
                        },
                      }}
                    >
                      <NotifIcon />
                    </Badge>
                  </motion.div>
                </IconButton>
              </Tooltip>
              <Tooltip title="Профил">
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
                  <Avatar
                    src={user?.profilePhotoUrl}
                    sx={{
                      width: 38,
                      height: 38,
                      border: '2px solid',
                      borderColor: alpha('#fff', 0.4),
                      transition: 'all 0.2s',
                      boxShadow: `0 2px 12px ${alpha('#000', 0.2)}`,
                      '&:hover': { transform: 'scale(1.1)', borderColor: alpha('#fff', 0.7) },
                    }}
                  >
                    {user?.firstName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 3,
                    bgcolor: isDark ? alpha('#1e293b', 0.95) : alpha('#fff', 0.95),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#1a56db', 0.08)}`,
                    boxShadow: isDark
                      ? `0 20px 50px ${alpha('#000', 0.4)}`
                      : `0 20px 50px ${alpha('#1a56db', 0.12)}`,
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -6,
                      right: 16,
                      width: 12,
                      height: 12,
                      bgcolor: isDark ? alpha('#1e293b', 0.95) : alpha('#fff', 0.95),
                      transform: 'rotate(45deg)',
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#1a56db', 0.08)}`,
                      borderBottom: 'none',
                      borderRight: 'none',
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: alpha('#1a56db', 0.06) }}>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.firstName} {user?.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
                <MenuItem
                  onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                  sx={{
                    py: 1.5,
                    mx: 1,
                    borderRadius: 2,
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha('#1a56db', 0.06) },
                  }}
                >
                  <Person sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} /> Мој профил
                </MenuItem>
                <MenuItem
                  onClick={() => { setAnchorEl(null); navigate('/my-events'); }}
                  sx={{
                    py: 1.5,
                    mx: 1,
                    borderRadius: 2,
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha('#059669', 0.06) },
                  }}
                >
                  <EventNote sx={{ mr: 1.5, color: 'secondary.main', fontSize: 20 }} /> Мои настани
                </MenuItem>
                <Divider sx={{ mx: 1 }} />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    mx: 1,
                    borderRadius: 2,
                    my: 0.5,
                    color: 'error.main',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha('#dc2626', 0.06) },
                  }}
                >
                  <ExitToApp sx={{ mr: 1.5, fontSize: 20 }} /> Одјави се
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 20px 20px 0',
            overflow: 'hidden',
          },
        }}
      >
        {/* Gradient header strip */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #1a56db, #059669)' }} />

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1a56db, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Diversity3 sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={800}>EkipAY</Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small"><Close /></IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1, pt: 1, flex: 1 }}>
          {navLinks.map((link, i) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ListItemButton
                onClick={() => { setDrawerOpen(false); navigate(link.path); }}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.5,
                  py: 1.2,
                  bgcolor: isActive(link.path)
                    ? `linear-gradient(135deg, ${alpha('#1a56db', 0.08)}, ${alpha('#059669', 0.06)})`
                    : 'transparent',
                  borderLeft: isActive(link.path) ? `3px solid #1a56db` : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{
                  color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                  minWidth: 40,
                }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(link.path) ? 700 : 500,
                    color: isActive(link.path) ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </motion.div>
          ))}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.08 }}
            >
              <ListItemButton
                onClick={() => { setDrawerOpen(false); navigate('/admin'); }}
                sx={{ borderRadius: 2.5, py: 1.2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettings /></ListItemIcon>
                <ListItemText primary="Админ панел" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </motion.div>
          )}
        </List>

        {/* User info at bottom */}
        {user && (
          <Box sx={{ p: 2, borderTop: `1px solid ${alpha('#1a56db', 0.06)}` }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar src={user.profilePhotoUrl} sx={{ width: 40, height: 40 }}>
                {user.firstName?.[0]}
              </Avatar>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ position: 'relative' }}>
        <Box sx={{ height: 2, background: 'linear-gradient(90deg, #1a56db, #059669, #1a56db)' }} />
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha('#1e3a5f', 0.97)} 0%, ${alpha('#1a56db', 0.95)} 100%)`,
            backdropFilter: 'blur(20px)',
            color: alpha('#fff', 0.7),
            py: 2.5,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            EkipAY &copy; 2026
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
