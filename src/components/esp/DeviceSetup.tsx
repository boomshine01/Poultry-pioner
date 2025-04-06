
import React, { useState } from 'react';
import { Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/lib/i18n';
import { useESP32 } from '@/lib/esp-service';

interface DeviceSetupProps {
  onDeviceConnected: () => void;
}

export const DeviceSetup: React.FC<DeviceSetupProps> = ({ onDeviceConnected }) => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceIP, setDeviceIP] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { testConnection, saveDevice } = useESP32();
  const { t } = useLanguage();

  const connectDevice = async () => {
    if (!deviceName || !deviceIP || !apiKey) {
      toast({
        title: t("error"),
        description: t("enterDeviceDetails"),
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const isConnected = await testConnection(deviceIP, apiKey);
      
      if (isConnected) {
        saveDevice({
          name: deviceName,
          ip: deviceIP,
          apiKey: apiKey
        });
        
        setDeviceName('');
        setDeviceIP('');
        setApiKey('');
        onDeviceConnected();
      }
    } catch (error) {
      toast({
        title: t("connectionError"),
        description: t("unableToConnectDevice"),
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const generateApiKey = () => {
    const newApiKey = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    setApiKey(newApiKey);
    
    toast({
      title: t("apiKeyGenerated"),
      description: t("newApiKeyGenerated")
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2" size={18} />
          {t('addDevice')}
        </CardTitle>
        <CardDescription>
          {t('connectNewESPDevice')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="device-name">{t('deviceName')}</Label>
          <Input 
            id="device-name" 
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="ESP32 Main" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="device-ip">IP {t('address')}</Label>
          <Input 
            id="device-ip" 
            value={deviceIP}
            onChange={(e) => setDeviceIP(e.target.value)}
            placeholder="192.168.1.x" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <Input 
              id="api-key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('noGeneratedKey')} 
            />
            <Button onClick={generateApiKey} variant="outline">
              {t('generate')}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={connectDevice}
          disabled={isConnecting}
        >
          {isConnecting ? t('connecting') : t('connect')}
        </Button>
      </CardFooter>
    </Card>
  );
};
