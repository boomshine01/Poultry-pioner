import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useESP32 } from '@/lib/esp-service';
import { useLanguage } from '@/lib/i18n';

import { DeviceList, type ESPDevice } from '@/components/esp/DeviceList';
import { SensorDisplay, type SensorData } from '@/components/esp/SensorDisplay';
import { WifiSetup } from '@/components/esp/WifiSetup';
import { DeviceSetup } from '@/components/esp/DeviceSetup';
import { DeviceControls } from '@/components/esp/DeviceControls';
import {
  SMSConfigurationComponent,
  type SMSConfiguration
} from '@/components/esp/SMSConfiguration';

const ESPConnection: React.FC = () => {
  const [connectedDevices, setConnectedDevices] = useState<ESPDevice[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [smsConfig, setSmsConfig] = useState<SMSConfiguration>({
    enabled: false,
    phoneNumber: '',
    carrier: 'other',
    gatewayAddress: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();
  const {
    getConfiguredDevices,
    getSMSConfig,
    removeDevice,
    saveSMSConfig,
    ESP32Service
  } = useESP32();
  const { t } = useLanguage();

  // Initialise la liste et la config SMS
  useEffect(() => {
    const devices = getConfiguredDevices().map((d) => ({
      id: `esp-${Date.now().toString(36)}-${d.ip.replace(/\./g, '-')}`,
      name: d.name,
      ipAddress: d.ip,
      apiKey: d.apiKey,
      status: 'disconnected' as const,
      lastConnected: new Date()
    }));
    setConnectedDevices(devices);

    const saved = getSMSConfig();
    if (saved) setSmsConfig(saved);
  }, [getConfiguredDevices, getSMSConfig]);

  // Hook pour rafraîchir connexions + données
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    const sms = getSMSConfig();
    const updated = await Promise.all(
      connectedDevices.map(async (device) => {
        const esp = new ESP32Service(device.ipAddress, device.apiKey, sms);
        const ok = await esp.testConnection();
        const newDevice = {
          ...device,
          status: ok ? 'connected' : 'disconnected',
          lastConnected: new Date()
        };
        if (ok) {
          const data = await esp.getSensorData();
          if (data) {
            setSensorData({
              temperature: data.temperature,
              humidity: data.humidity,
              feedLevel: data.feedLevel,
              waterLevel: data.waterLevel,
              doorStatus: data.doorStatus,
              lastUpdated: new Date()
            });
          }
        }
        return newDevice;
      })
    );
    setConnectedDevices(updated);
    setIsRefreshing(false);
  }, [connectedDevices, ESP32Service, getSMSConfig]);

  // Intervalle de refresh automatique
  useEffect(() => {
    if (connectedDevices.length === 0) return;
    refreshAll();
    const id = setInterval(refreshAll, 30_000);
    return () => clearInterval(id);
  }, [connectedDevices.length, refreshAll]);

  const handleDeviceConnected = () => {
    const devices = getConfiguredDevices().map((d) => ({
      id: `esp-${Date.now().toString(36)}-${d.ip.replace(/\./g, '-')}`,
      name: d.name,
      ipAddress: d.ip,
      apiKey: d.apiKey,
      status: 'disconnected' as const,
      lastConnected: new Date()
    }));
    setConnectedDevices(devices);
  };

  const disconnectDevice = (device: ESPDevice) => {
    removeDevice(device.ipAddress);
    setConnectedDevices((prev) =>
      prev.filter((d) => d.id !== device.id)
    );
  };

  const handleSaveSMSConfig = (config: SMSConfiguration) => {
    saveSMSConfig(config);
    setSmsConfig(config);
    // On propage aux devices
    connectedDevices.forEach((device) => {
      const esp = new ESP32Service(device.ipAddress, device.apiKey, config);
      esp.setSMSConfig(config);
    });
  };

  // Contrôles (porte / mangeoire)
  const makeControl = useCallback(
    async (
      action: 'open' | 'close' | 'on' | 'off',
      method: keyof typeof ESP32Service.prototype,
      successMsgKey: string,
      errorMsgKey: string
    ) => {
      setIsRefreshing(true);
      try {
        const device = connectedDevices.find((d) => d.status === 'connected');
        if (!device) throw new Error('no device');
        const esp = new ESP32Service(
          device.ipAddress,
          device.apiKey,
          getSMSConfig()
        );
        // @ts-expect-error dynamic call
        const res = await esp[method](action);
        if (res.success) {
          toast({
            title: t('success'),
            description: t(successMsgKey)
          });
          await refreshAll();
        } else {
          throw new Error('fail');
        }
      } catch {
        toast({
          title: t('error'),
          description: t(errorMsgKey),
          variant: 'destructive'
        });
      } finally {
        setIsRefreshing(false);
      }
    },
    [connectedDevices, ESP32Service, getSMSConfig, refreshAll, t, toast]
  );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">{t('espConfiguration')}</h1>

      <Tabs defaultValue="devices">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="devices">{t('devices')}</TabsTrigger>
          <TabsTrigger value="setup">{t('setup')}</TabsTrigger>
          <TabsTrigger value="controls">{t('controls')}</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t('connectedDevices')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              {t('refreshData')}
            </Button>
          </div>

          <DeviceList
            devices={connectedDevices}
            onDisconnect={disconnectDevice}
          />

          {sensorData && (
            <SensorDisplay data={sensorData} onDoorControl={(_) => makeControl('open', 'controlDoor', 'doorOpened', 'unableToControlDoor')} />
          )}
        </TabsContent>

        <TabsContent value="setup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WifiSetup />
            <DeviceSetup onDeviceConnected={handleDeviceConnected} />
          </div>
        </TabsContent>

        <TabsContent value="controls">
          <DeviceControls
            onDoorControl={() =>
              makeControl('open', 'controlDoor', 'doorOpened', 'unableToControlDoor')
            }
            onFeederControl={() =>
              makeControl('on', 'controlFeeder', 'feederActivated', 'unableToControlFeeder')
            }
            apiKey={connectedDevices[0]?.apiKey}
          />
        </TabsContent>

        <TabsContent value="sms">
          <SMSConfigurationComponent
            smsConfig={smsConfig}
            onSaveConfig={handleSaveSMSConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ESPConnection;
