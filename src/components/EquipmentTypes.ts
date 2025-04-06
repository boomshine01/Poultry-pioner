
export interface Equipment {
    id: string;
    name: string;
    type: 'door' | 'ventilation' | 'feeding' | 'watering' | 'heater' | 'fan' | 'water';
    status: 'on' | 'off' | 'error';
    autoMode: boolean;
    schedule?: {
      start: string;
      end: string;
    }[];
    lastUpdated: Date;
    location?: string;
    currentValue?: string;
    targetValue?: string;
    unit?: string;
    lastMaintenance?: Date;
    nextMaintenance?: Date;
    pressure?: string;
    flow?: string;
  }
  