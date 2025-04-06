
import React from 'react';
import { useLanguage } from '../../lib/i18n';
import type { Equipment } from '../EquipmentTypes';
import { ThermometerIcon, Droplets, Fan, Power } from 'lucide-react';

interface MaintenanceCardProps {
  item: Equipment;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ item }) => {
  const { t } = useLanguage();

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'heater':
        return <ThermometerIcon className="h-5 w-5" />;
      case 'fan':
      case 'ventilation':
        return <Fan className="h-5 w-5" />;
      case 'water':
      case 'watering':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Power className="h-5 w-5" />;
    }
  };

  return (
    <div 
      className="flex justify-between items-center p-3 border rounded-md shadow-sm hover:bg-muted/10 transition-colors"
    >
      <div className="flex items-center">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          {getEquipmentIcon(item.type)}
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.location}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">
          {item.nextMaintenance && new Date(item.nextMaintenance).toLocaleDateString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {item.nextMaintenance && 
            Math.ceil((new Date(item.nextMaintenance).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} {t('daysLeft')}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCard;
