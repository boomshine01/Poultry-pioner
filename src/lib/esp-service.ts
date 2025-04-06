
import type { EnvironmentData, Equipment } from '../lib/database';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './i18n';

interface ESP32Response {
  success: boolean;
  message: string;
  data?: any;
}

interface ESP32SensorData {
  temperature: number;
  humidity: number;
  feedLevel: number;
  waterLevel: number;
  doorStatus: 'open' | 'closed';
}

// Cette classe gère la communication avec l'ESP32
export class ESP32Service {
  private baseUrl: string;
  private apiKey: string;

  constructor(ipAddress: string, apiKey: string) {
    this.baseUrl = `http://${ipAddress}/api`;
    this.apiKey = apiKey;
  }

  // Méthode pour tester la connexion avec l'ESP32
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Erreur de connexion à l\'ESP32:', error);
      return false;
    }
  }

  // Méthode pour récupérer les données des capteurs
  async getSensorData(): Promise<ESP32SensorData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sensors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data as ESP32SensorData;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
    }
  }

  // Méthode pour contrôler la porte
  async controlDoor(action: 'open' | 'close'): Promise<ESP32Response> {
    try {
      const response = await fetch(`${this.baseUrl}/door`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du contrôle de la porte:', error);
      return { success: false, message: 'Erreur de communication' };
    }
  }

  // Méthode pour contrôler le distributeur d'aliments
  async controlFeeder(action: 'on' | 'off'): Promise<ESP32Response> {
    try {
      const response = await fetch(`${this.baseUrl}/feeder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du contrôle du distributeur:', error);
      return { success: false, message: 'Erreur de communication' };
    }
  }

  // Méthode pour configurer les horaires automatiques
  async setSchedule(type: 'door' | 'feeder', schedule: {start: string, end: string}[]): Promise<ESP32Response> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, schedule })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la configuration des horaires:', error);
      return { success: false, message: 'Erreur de communication' };
    }
  }

  // Méthode pour synchroniser les données entre l'ESP32 et l'application
  async syncData(equipments: Equipment[]): Promise<ESP32Response> {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipments })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return { success: false, message: 'Erreur de synchronisation' };
    }
  }
}

// Hook pour utiliser le service ESP32
export function useESP32() {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Récupérer les appareils configurés du localStorage
  const getConfiguredDevices = () => {
    const storedDevices = localStorage.getItem('esp32-devices');
    if (storedDevices) {
      try {
        return JSON.parse(storedDevices);
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  // Sauvegarder un appareil dans le localStorage
  const saveDevice = (device: {name: string, ip: string, apiKey: string}) => {
    const devices = getConfiguredDevices();
    const existingDeviceIndex = devices.findIndex((d: any) => d.ip === device.ip);
    
    if (existingDeviceIndex >= 0) {
      devices[existingDeviceIndex] = device;
    } else {
      devices.push(device);
    }
    
    localStorage.setItem('esp32-devices', JSON.stringify(devices));
    toast({
      title: t('deviceSaved'),
      description: t('deviceConfigurationSaved')
    });
    
    return devices;
  };
  
  // Supprimer un appareil du localStorage
  const removeDevice = (ip: string) => {
    const devices = getConfiguredDevices();
    const filteredDevices = devices.filter((d: any) => d.ip !== ip);
    localStorage.setItem('esp32-devices', JSON.stringify(filteredDevices));
    
    toast({
      title: t('deviceRemoved'),
      description: t('deviceSuccessfullyRemoved')
    });
    
    return filteredDevices;
  };
  
  // Tester la connexion avec un ESP32
  const testConnection = async (ip: string, apiKey: string) => {
    const esp32 = new ESP32Service(ip, apiKey);
    const isConnected = await esp32.testConnection();
    
    if (isConnected) {
      toast({
        title: t('connectionSuccess'),
        description: t('connectedToESP')
      });
    } else {
      toast({
        title: t('connectionError'),
        description: t('unableToConnectESP'),
        variant: "destructive"
      });
    }
    
    return isConnected;
  };
  
  return {
    getConfiguredDevices,
    saveDevice,
    removeDevice,
    testConnection,
    ESP32Service
  };
}
