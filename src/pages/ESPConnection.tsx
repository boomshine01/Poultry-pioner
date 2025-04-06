
import React, { useState, useEffect } from 'react';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useESP32 } from '@/lib/esp-service';
import { useLanguage } from '@/lib/i18n';

// Import the new component files
import { DeviceList, type ESPDevice } from '@/components/esp/DeviceList';
import { SensorDisplay, type SensorData } from '@/components/esp/SensorDisplay';
import { WifiSetup } from '@/components/esp/WifiSetup';
import { DeviceSetup } from '@/components/esp/DeviceSetup';
import { DeviceControls } from '@/components/esp/DeviceControls';
import { SMSConfigurationComponent, type SMSConfiguration } from '@/components/esp/SMSConfiguration';

const ESPConnection = () => {
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<ESPDevice[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [smsConfig, setSmsConfig] = useState<SMSConfiguration>({
    enabled: false,
    phoneNumber: '',
    carrier: 'other',
    gatewayAddress: ''
  });
  
  const { toast } = useToast();
  const { getConfiguredDevices, getSMSConfig, removeDevice, saveSMSConfig, ESP32Service } = useESP32();
  const { t } = useLanguage();

  useEffect(() => {
    const devices = getConfiguredDevices().map((device: any) => ({
      id: `esp-${Date.now().toString(36)}-${device.ip.replace(/\./g, '-')}`,
      name: device.name,
      ipAddress: device.ip,
      apiKey: device.apiKey,
      status: 'disconnected',
      lastConnected: new Date()
    }));
    
    setConnectedDevices(devices);

    const savedSmsConfig = getSMSConfig();
    if (savedSmsConfig) {
      setSmsConfig(savedSmsConfig);
    }
  }, []);

  useEffect(() => {
    const checkConnections = async () => {
      const updatedDevices = [...connectedDevices];
      
      for (const device of updatedDevices) {
        if (device.apiKey) {
          const smsSettings = getSMSConfig();
          const esp32 = new ESP32Service(device.ipAddress, device.apiKey, smsSettings);
          const isConnected = await esp32.testConnection();
          
          device.status = isConnected ? 'connected' : 'disconnected';
          device.lastConnected = new Date();
          
          if (isConnected) {
            const data = await esp32.getSensorData();
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
        }
      }
      
      setConnectedDevices(updatedDevices);
    };
    
    checkConnections();
    
    const interval = setInterval(checkConnections, 30000);
    
    return () => clearInterval(interval);
  }, [connectedDevices.length]);

  const handleDeviceConnected = () => {
    // Refresh device list
    const devices = getConfiguredDevices().map((device: any) => ({
      id: `esp-${Date.now().toString(36)}-${device.ip.replace(/\./g, '-')}`,
      name: device.name,
      ipAddress: device.ip,
      apiKey: device.apiKey,
      status: 'disconnected',
      lastConnected: new Date()
    }));
    
    setConnectedDevices(devices);
  };

  const disconnectDevice = (device: ESPDevice) => {
    removeDevice(device.ipAddress);
    
    setConnectedDevices(prev => 
      prev.filter(d => d.id !== device.id)
    );
  };

  const refreshSensorData = async () => {
    setIsRefreshing(true);
    
    try {
      const connectedDevice = connectedDevices.find(device => device.status === 'connected');
      
      if (connectedDevice && connectedDevice.apiKey) {
        const smsSettings = getSMSConfig();
        const esp32 = new ESP32Service(connectedDevice.ipAddress, connectedDevice.apiKey, smsSettings);
        const data = await esp32.getSensorData();
        
        if (data) {
          setSensorData({
            temperature: data.temperature,
            humidity: data.humidity,
            feedLevel: data.feedLevel,
            waterLevel: data.waterLevel,
            doorStatus: data.doorStatus,
            lastUpdated: new Date()
          });
          
          toast({
            title: t("dataRefreshed"),
            description: t("sensorDataUpdated")
          });
        } else {
          toast({
            title: t("error"),
            description: t("unableToGetSensorData"),
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: t("noConnectedDevices"),
          description: t("connectDeviceFirst"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorRefreshingData"),
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const controlDoor = async (action: 'open' | 'close') => {
    try {
      const connectedDevice = connectedDevices.find(device => device.status === 'connected');
      
      if (connectedDevice && connectedDevice.apiKey) {
        const smsSettings = getSMSConfig();
        const esp32 = new ESP32Service(connectedDevice.ipAddress, connectedDevice.apiKey, smsSettings);
        const response = await esp32.controlDoor(action);
        
        if (response.success) {
          toast({
            title: t("success"),
            description: action === 'open' ? t("doorOpened") : t("doorClosed")
          });
          
          await refreshSensorData();
        } else {
          toast({
            title: t("error"),
            description: t("unableToControlDoor"),
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: t("noConnectedDevices"),
          description: t("connectDeviceFirst"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorControllingDoor"),
        variant: "destructive"
      });
    }
  };

  const controlFeeder = async (action: 'on' | 'off') => {
    try {
      const connectedDevice = connectedDevices.find(device => device.status === 'connected');
      
      if (connectedDevice && connectedDevice.apiKey) {
        const smsSettings = getSMSConfig();
        const esp32 = new ESP32Service(connectedDevice.ipAddress, connectedDevice.apiKey, smsSettings);
        const response = await esp32.controlFeeder(action);
        
        if (response.success) {
          toast({
            title: t("success"),
            description: action === 'on' ? t("feederActivated") : t("feederDeactivated")
          });
          
          await refreshSensorData();
        } else {
          toast({
            title: t("error"),
            description: t("unableToControlFeeder"),
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: t("noConnectedDevices"),
          description: t("connectDeviceFirst"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorControllingFeeder"),
        variant: "destructive"
      });
    }
  };

  const handleSaveSMSConfig = (config: SMSConfiguration) => {
    saveSMSConfig(config);
    setSmsConfig(config);
    
    for (const device of connectedDevices) {
      if (device.apiKey) {
        const esp32 = new ESP32Service(device.ipAddress, device.apiKey);
        esp32.setSMSConfig(config);
      }
    }
  };

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
            <h2 className="text-xl font-semibold">{t('connectedDevices')}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshSensorData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('refreshData')}
            </Button>
          </div>
          
          <DeviceList 
            devices={connectedDevices} 
            onDisconnect={disconnectDevice} 
          />
          
          {sensorData && (
            <SensorDisplay 
              data={sensorData} 
              onDoorControl={controlDoor} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="setup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WifiSetup 
              initialSSID={wifiSSID} 
              initialPassword={wifiPassword} 
            />
            
            <DeviceSetup 
              onDeviceConnected={handleDeviceConnected} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="controls">
          <DeviceControls 
            onDoorControl={controlDoor}
            onFeederControl={controlFeeder}
            wifiSSID={wifiSSID}
            wifiPassword={wifiPassword}
            apiKey={connectedDevices[0]?.apiKey}
          />
        </TabsContent>
        
        <TabsContent value="sms">
          <SMSConfigurationComponent 
            smsConfig={smsConfig}
            onSaveConfig={handleSaveSMSConfig}
            phoneNumber={smsConfig.phoneNumber}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ESPConnection;
