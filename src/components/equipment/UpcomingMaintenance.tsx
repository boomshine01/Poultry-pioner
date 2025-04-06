
import React from 'react';
import { useLanguage } from '../../lib/i18n';
import type { Equipment } from '../EquipmentTypes';
import MaintenanceCard from './MaintenanceCard';

interface UpcomingMaintenanceProps {
  equipment: Equipment[];
}

const UpcomingMaintenance: React.FC<UpcomingMaintenanceProps> = ({ equipment }) => {
  const { t } = useLanguage();

  const upcomingMaintenance = equipment
    .filter(item => item.nextMaintenance && new Date(item.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => {
      if (a.nextMaintenance && b.nextMaintenance) {
        return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
      }
      return 0;
    })
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {upcomingMaintenance.map(item => (
        <MaintenanceCard key={`maint-${item.id}`} item={item} />
      ))}
      
      {upcomingMaintenance.length === 0 && (
        <div className="text-center py-6 text-muted-foreground bg-muted/10 rounded-md border border-dashed">
          {t('noUpcomingMaintenance')}
        </div>
      )}
    </div>
  );
};

export default UpcomingMaintenance;
