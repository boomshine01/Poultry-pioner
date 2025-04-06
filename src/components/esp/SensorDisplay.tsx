
import React from 'react';
import { Thermometer, Droplet, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/lib/i18n';

export interface SensorData {
  temperature: number;
  humidity: number;
  feedLevel: number;
  waterLevel: number;
  doorStatus: 'open' | 'closed';
  lastUpdated: Date;
}

interface SensorDisplayProps {
  data: SensorData;
  onDoorControl: (action: 'open' | 'close') => void;
}

export const SensorDisplay: React.FC<SensorDisplayProps> = ({ data, onDoorControl }) => {
  const { t } = useLanguage();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">{t('sensorData')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-red-800 dark:text-red-300">
              <Thermometer className="h-4 w-4 mr-2" />
              {t('temperature')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-200">
              {data.temperature}°C
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-800 dark:text-blue-300">
              <Droplet className="h-4 w-4 mr-2" />
              {t('waterLevel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {data.waterLevel}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-yellow-800 dark:text-yellow-300">
              <Utensils className="h-4 w-4 mr-2" />
              {t('feedLevel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
              {data.feedLevel}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('doorStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">
                {data.doorStatus === 'open' ? t('doorOpen') : t('doorClosed')}
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant={data.doorStatus === 'open' ? 'default' : 'outline'} 
                  onClick={() => onDoorControl('open')}
                  disabled={data.doorStatus === 'open'}
                >
                  {t('openDoor')}
                </Button>
                <Button 
                  size="sm" 
                  variant={data.doorStatus === 'closed' ? 'default' : 'outline'}
                  onClick={() => onDoorControl('close')}
                  disabled={data.doorStatus === 'closed'}
                >
                  {t('closeDoor')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="col-span-1 md:col-span-3 text-xs text-gray-500 text-right">
          {t('lastUpdated')}: {data.lastUpdated.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
