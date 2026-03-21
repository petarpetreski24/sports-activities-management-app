import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Chip, alpha, LinearProgress } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, CalendarMonth, Place, Groups,
} from '@mui/icons-material';
import { SportEvent, EVENT_STATUS_LABELS } from '../types';
import { getSportIcon } from '../utils/sportIcons';
import GradientButton from './GradientButton';
import GlassCard from './GlassCard';
import dayjs from 'dayjs';

const containerStyle = {
  width: '100%',
  height: '550px',
};

const defaultCenter = {
  lat: 41.9981,
  lng: 21.4254,
};

// Clean, modern map style
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcfce7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#93c5fd' }] },
];

interface EventsMapViewProps {
  events: SportEvent[];
}

export default function EventsMapView({ events }: EventsMapViewProps) {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);

  const center = events.length > 0
    ? {
        lat: events.reduce((sum, e) => sum + e.locationLat, 0) / events.length,
        lng: events.reduce((sum, e) => sum + e.locationLng, 0) / events.length,
      }
    : defaultCenter;

  const isGoogleMapsAvailable = typeof google !== 'undefined' && typeof google.maps !== 'undefined';

  if (!isGoogleMapsAvailable) {
    return (
      <GlassCard sx={{
        p: 4,
        textAlign: 'center',
      }}>
        <Map sx={{ fontSize: 48, color: alpha('#1a56db', 0.3), mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          Google Maps не е достапен. Поставете го VITE_GOOGLE_MAPS_API_KEY во .env датотеката.
        </Typography>
      </GlassCard>
    );
  }

  const fillPercent = (e: SportEvent) => Math.round((e.currentParticipants / e.maxParticipants) * 100);

  // Count sports for legend
  const sportCounts: Record<string, { count: number; icon?: string }> = {};
  events.forEach(e => {
    if (!sportCounts[e.sportName]) sportCounts[e.sportName] = { count: 0, icon: e.sportIcon };
    sportCounts[e.sportName].count++;
  });

  return (
    <GlassCard sx={{ overflow: 'hidden', p: 0 }}>
      {/* Header bar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha('#1a56db', 0.06)}`,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{
            width: 28, height: 28, borderRadius: 1,
            background: 'linear-gradient(135deg, #1a56db, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <Map sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Мапа на настани
          </Typography>
          <Chip
            label={`${events.length} настани`}
            size="small"
            sx={{
              height: 22, fontSize: 11, fontWeight: 600,
              background: 'linear-gradient(135deg, #1a56db, #059669)',
              color: '#fff',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Box>
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {Object.entries(sportCounts).slice(0, 5).map(([name, { count, icon }]) => (
            <Chip
              key={name}
              icon={icon ? <Box sx={{ display: 'flex', ml: 0.5 }}>{getSportIcon(icon, 14)}</Box> : undefined}
              label={`${name} (${count})`}
              size="small"
              variant="outlined"
              sx={{
                height: 22, fontSize: 10, fontWeight: 500,
                '& .MuiChip-label': { px: 0.5 },
                '& .MuiChip-icon': { ml: 0.5 },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={events.length > 0 ? 11 : 8}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: mapStyles,
        }}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            position={{ lat: event.locationLat, lng: event.locationLng }}
            onClick={() => {
              // Close first to force re-render at new position
              setSelectedEvent(null);
              setTimeout(() => setSelectedEvent(event), 0);
            }}
            title={event.title}
          />
        ))}
        {selectedEvent && (
          <InfoWindow
            position={{ lat: selectedEvent.locationLat, lng: selectedEvent.locationLng }}
            onCloseClick={() => setSelectedEvent(null)}
            options={{
              maxWidth: 300,
              pixelOffset: new google.maps.Size(0, -5),
            }}
          >
            <Box sx={{ p: 0.5, minWidth: 230 }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                {selectedEvent.sportIcon && (
                  <Box sx={{ color: '#1a56db', display: 'flex' }}>
                    {getSportIcon(selectedEvent.sportIcon, 18)}
                  </Box>
                )}
                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3, flex: 1 }}>
                  {selectedEvent.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                <Chip label={selectedEvent.sportName} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                <Chip
                  label={EVENT_STATUS_LABELS[selectedEvent.status] || selectedEvent.status}
                  size="small"
                  color={selectedEvent.status === 'Open' ? 'success' : 'default'}
                  sx={{ height: 22, fontSize: 11 }}
                />
              </Box>

              {/* Info rows with MUI icons */}
              <Box display="flex" alignItems="center" gap={0.5} mb={0.3}>
                <CalendarMonth sx={{ fontSize: 14, color: '#1a56db' }} />
                <Typography variant="caption" sx={{ color: '#555' }}>
                  {dayjs(selectedEvent.eventDate).format('DD.MM.YYYY HH:mm')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.3}>
                <Place sx={{ fontSize: 14, color: '#dc2626' }} />
                <Typography variant="caption" sx={{ color: '#555' }}>
                  {selectedEvent.locationAddress}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Groups sx={{ fontSize: 14, color: '#059669' }} />
                <Typography variant="caption" sx={{ color: '#555' }}>
                  {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} ({fillPercent(selectedEvent)}%)
                </Typography>
              </Box>

              {/* Progress bar */}
              <LinearProgress
                variant="determinate"
                value={fillPercent(selectedEvent)}
                sx={{
                  height: 4, borderRadius: 2, mb: 1.5,
                  bgcolor: alpha('#1a56db', 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #1a56db, #059669)',
                  },
                }}
              />

              <GradientButton
                size="small"
                onClick={() => navigate(`/events/${selectedEvent.id}`)}
                fullWidth
                sx={{ py: 0.5, fontSize: 12 }}
              >
                Детали
              </GradientButton>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    </GlassCard>
  );
}
