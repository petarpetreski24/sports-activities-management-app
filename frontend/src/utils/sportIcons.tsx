import {
  SportsSoccer, SportsBasketball, SportsTennis, SportsVolleyball,
  SportsHandball, FitnessCenter, Pool, DirectionsRun, DirectionsBike,
  SportsKabaddi, SportsGolf, SportsHockey, SportsMartialArts,
  SportsRugby, SportsCricket, Skateboarding, Snowboarding, Hiking,
  SportsScore,
} from '@mui/icons-material';
import { ReactElement } from 'react';

const ICON_MAP: Record<string, typeof SportsSoccer> = {
  sports_soccer: SportsSoccer,
  sports_basketball: SportsBasketball,
  sports_tennis: SportsTennis,
  sports_volleyball: SportsVolleyball,
  sports_handball: SportsHandball,
  fitness_center: FitnessCenter,
  pool: Pool,
  directions_run: DirectionsRun,
  directions_bike: DirectionsBike,
  sports_kabaddi: SportsKabaddi,
  sports_golf: SportsGolf,
  sports_hockey: SportsHockey,
  sports_martial_arts: SportsMartialArts,
  sports_rugby: SportsRugby,
  sports_cricket: SportsCricket,
  skateboarding: Skateboarding,
  snowboarding: Snowboarding,
  hiking: Hiking,
  sports_score: SportsScore,
};

export function getSportIcon(iconName?: string, fontSize: number = 20): ReactElement | null {
  if (!iconName) return null;
  const IconComp = ICON_MAP[iconName];
  if (!IconComp) return null;
  return <IconComp sx={{ fontSize }} />;
}
