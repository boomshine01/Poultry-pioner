
import React, { useState } from 'react';
import { Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/lib/i18n';

interface WifiSetupProps {
  initialSSID?: string;
  initialPassword?: string;
}

export const WifiSetup: React.FC<WifiSetupProps> = ({ initialSSID = '', initialPassword = '' }) => {
  const [wifiSSID, setWifiSSID] = useState(initialSSID);
  const [wifiPassword, setWifiPassword] = useState(initialPassword);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const configureWifi = async () => {
    if (!wifiSSID || !wifiPassword) {
      toast({
        title: t("error"),
        description: t("enterWifiCredentials"),
        variant: "destructive"
      });
      return;
    }

    setIsConfiguring(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: t("configurationSuccess"),
        description: t("wifiConfiguredOnESP"),
      });
    } catch (error) {
      toast({
        title: t("configurationError"),
        description: t("unableToConfigureWifi"),
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wifi className="mr-2" size={18} />
          {t('wifiConfiguration')}
        </CardTitle>
        <CardDescription>
          {t('configureWifiForESP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wifi-ssid">SSID WiFi</Label>
          <Input 
            id="wifi-ssid" 
            value={wifiSSID}
            onChange={(e) => setWifiSSID(e.target.value)}
            placeholder={t('wifiNetworkName')} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wifi-password">{t('wifiPassword')}</Label>
          <Input 
            id="wifi-password" 
            type="password"
            value={wifiPassword}
            onChange={(e) => setWifiPassword(e.target.value)}
            placeholder={t('password')} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={configureWifi}
          disabled={isConfiguring}
        >
          {isConfiguring ? t('configuring') : t('configure')}
        </Button>
      </CardFooter>
    </Card>
  );
};
