
import React from 'react';
import { useLanguage } from '../../lib/i18n';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EquipmentHeader: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold tracking-tight">{t('equipment')}</h2>
      <Button onClick={() => navigate('/esp-connection')}>
        <Power className="h-4 w-4 mr-2" />
        {t('manageConnections')}
      </Button>
    </div>
  );
};

export default EquipmentHeader;
