
import React from 'react';
import type { Equipment } from '../EquipmentTypes';
import EquipmentCard from './EquipmentCard';

interface EquipmentGridProps {
  equipment: Equipment[];
  onToggleEquipment: (id: string, status: 'on' | 'off') => Promise<void>;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipment, onToggleEquipment }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map(item => (
        <EquipmentCard 
          key={item.id} 
          item={item} 
          onToggle={onToggleEquipment} 
        />
      ))}
    </div>
  );
};

export default EquipmentGrid;
