import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Button, Typography, Chip, alpha } from '@mui/material';
import { Directions, Place, NearMe } from '@mui/icons-material';
import { useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '300px',
};

interface EventMapProps {
  lat: number;
  lng: number;
  address: string;
  title?: string;
  userLat?: number;
  userLng?: number;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

export default function EventMap({ lat, lng, address, title, userLat, userLng }: EventMapProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Only calculate distance when both user location and event location are valid
  const hasUserLocation = userLat != null && userLng != null && userLat !== 0 && userLng !== 0;
  const hasEventLocation = lat != null && lng != null && lat !== 0 && lng !== 0;
  const distance = hasUserLocation && hasEventLocation
    ? calculateDistance(userLat!, userLng!, lat, lng)
    : null;

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const isGoogleMapsAvailable = typeof google !== 'undefined' && typeof google.maps !== 'undefined';

  if (!isGoogleMapsAvailable) {
    return (
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Place color="error" />
          <Typography variant="body1" fontWeight={500}>{address}</Typography>
        </Box>
        {distance !== null && (
          <Chip
            icon={<NearMe sx={{ fontSize: 14 }} />}
            label={distance < 1 ? `${Math.round(distance * 1000)} м од вас` : `${distance.toFixed(1)} км од вас`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 1.5, fontWeight: 600 }}
          />
        )}
        <Button
          variant="contained"
          startIcon={<Directions />}
          onClick={handleGetDirections}
          size="small"
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1a56db, #059669)',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Направи рута
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcfce7' }] },
          ],
        }}
      >
        <Marker
          position={{ lat, lng }}
          onClick={() => setShowInfo(true)}
        />
        {showInfo && (
          <InfoWindow
            position={{ lat, lng }}
            onCloseClick={() => setShowInfo(false)}
          >
            <Box sx={{ p: 0.5 }}>
              {title && <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>}
              <Typography variant="body2">{address}</Typography>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Actions bar below map */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          borderTop: `1px solid ${alpha('#1a56db', 0.06)}`,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          startIcon={<Directions />}
          onClick={handleGetDirections}
          size="small"
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1a56db, #059669)',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3a5f, #064e3b)',
            },
          }}
        >
          Направи рута
        </Button>
        {distance !== null && (
          <Chip
            icon={<NearMe sx={{ fontSize: 14 }} />}
            label={distance < 1 ? `${Math.round(distance * 1000)} м од вас` : `${distance.toFixed(1)} км од вас`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
        {!hasUserLocation && (
          <Typography variant="caption" color="text.secondary">
            Поставете локација во профилот за да видите растојание
          </Typography>
        )}
      </Box>
    </Box>
  );
}
