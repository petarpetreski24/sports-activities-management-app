import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { AppThemeProvider } from './contexts/ThemeContext';
import GoogleMapsProvider from './components/GoogleMapsProvider';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={3000}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <GoogleMapsProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </GoogleMapsProvider>
          </LocalizationProvider>
        </SnackbarProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
