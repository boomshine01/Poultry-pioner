
import React from 'react';
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/lib/i18n';

export interface ESPDevice {
  id: string;
  name: string;
  ipAddress: string;
  status: 'connected' | 'disconnected';
  lastConnected: Date;
  apiKey?: string;
}

interface DeviceListProps {
  devices: ESPDevice[];
  onDisconnect: (device: ESPDevice) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, onDisconnect }) => {
  const { t } = useLanguage();

  if (devices.length === 0) {
    return (
      <div className="col-span-2 text-center py-8 text-gray-500">
        {t('noConnectedDevices')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {devices.map(device => (
        <Card key={device.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <div className={`flex items-center ${device.status === 'connected' ? 'text-green-500' : 'text-gray-400'}`}>
                {device.status === 'connected' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span className="ml-1 text-xs">{device.status}</span>
              </div>
            </div>
            <CardDescription>ID: {device.id}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm">
              <div><strong>IP:</strong> {device.ipAddress}</div>
              <div>
                <strong>{t('lastConnection')}:</strong>{' '}
                {device.lastConnected.toLocaleString()}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => onDisconnect(device)}
              className="w-full"
            >
              {t('removeDevice')}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
