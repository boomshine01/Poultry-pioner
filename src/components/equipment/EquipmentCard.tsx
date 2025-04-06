
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n';
import type { Equipment } from '../EquipmentTypes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle, Power, Settings as SettingsIcon, ThermometerIcon, Droplets, Fan, AlertCircle, Clock } from 'lucide-react';

interface EquipmentCardProps {
  item: Equipment;
  onToggle: (id: string, status: 'on' | 'off') => Promise<void>;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, onToggle }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="h-3 w-3 mr-1" /> {t('active')}</Badge>;
      case 'off':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"><Power className="h-3 w-3 mr-1" /> {t('inactive')}</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><AlertCircle className="h-3 w-3 mr-1" /> {t('error')}</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><Clock className="h-3 w-3 mr-1" /> {t('scheduled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/equipment/${id}`);
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-xl">
              {getEquipmentIcon(item.type)}
              <span className="ml-2">{item.name}</span>
            </CardTitle>
            <CardDescription>{item.location}</CardDescription>
          </div>
          {getStatusBadge(item.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm space-y-2">
          {item.lastMaintenance && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('lastMaintenance')}:</span>
              <span className="font-medium">{new Date(item.lastMaintenance).toLocaleDateString()}</span>
            </div>
          )}
          {item.nextMaintenance && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('nextMaintenance')}:</span>
              <span className="font-medium">{new Date(item.nextMaintenance).toLocaleDateString()}</span>
            </div>
          )}
          {item.currentValue && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('currentValue')}:</span>
              <span className="font-medium">{item.currentValue} {item.unit}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t bg-muted/20">
        <div className="flex items-center space-x-2">
          <Switch 
            id={`toggle-${item.id}`}
            checked={item.status === 'on'}
            onCheckedChange={(checked) => onToggle(item.id, checked ? 'on' : 'off')}
            disabled={item.status === 'error'}
          />
          <Label htmlFor={`toggle-${item.id}`} className="cursor-pointer">
            {item.status === 'on' ? t('turnOff') : t('turnOn')}
          </Label>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleViewDetails(item.id)}
          className="hover:bg-primary/10"
        >
          <SettingsIcon className="h-4 w-4 mr-2" />
          {t('details')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
