
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n';
import { Database } from '../lib/database';
import type { Equipment as EquipmentType } from './EquipmentTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import EquipmentHeader from './equipment/EquipmentHeader';
import EquipmentGrid from './equipment/EquipmentGrid';
import MaintenanceSchedule from './equipment/MaintenanceSchedule';

const Equipment: React.FC = () => {
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const data = await Database.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment data', error);
    }
  };

  const toggleEquipment = async (id: string, status: 'on' | 'off') => {
    try {
      await Database.updateEquipmentStatus(id, status);
      // Update local state
      setEquipment(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
    } catch (error) {
      console.error('Error toggling equipment', error);
    }
  };

  return (
    <div className={`space-y-6 p-6 ${!isMobile ? 'ml-56' : ''}`}>
      <EquipmentHeader />
      <EquipmentGrid equipment={equipment} onToggleEquipment={toggleEquipment} />
      <MaintenanceSchedule equipment={equipment} />
    </div>
  );
};

export default Equipment;
