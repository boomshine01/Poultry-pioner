import { Equipment } from '../components/EquipmentTypes';

// Mock implementation of SQLite database functionality
// In a real implementation, we would use a package like expo-sqlite or react-native-sqlite-storage

export interface ChickenData {
  id: string;
  batchId: string;
  age: number;
  weight: number;
  vaccines: string[];
  lastUpdated: Date;
}

export interface BatchData {
  id: string;
  name: string;
  startDate: Date;
  chickenCount: number;
  currentMortality: number;
  expectedEndDate: Date;
}

export interface EnvironmentData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  feedLevel: number;
  waterLevel: number;
}

// Re-export Equipment type
export type { Equipment };

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: 'chicken' | 'batch' | 'equipment' | 'environment';
  data: any;
  timestamp: Date;
  synced: boolean;
}

// Simulated database with initial mock data
const db = {
  chickens: Array(50).fill(null).map((_, index) => ({
    id: `c${index + 1}`,
    batchId: 'batch1',
    age: Math.floor(Math.random() * 30) + 1,
    weight: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
    vaccines: ['Newcastle', 'Infectious Bronchitis'],
    lastUpdated: new Date(Date.now() - Math.random() * 86400000)
  } as ChickenData)),
  
  batches: [
    {
      id: 'batch1',
      name: 'Lot Printemps 2023',
      startDate: new Date('2023-03-15'),
      chickenCount: 50,
      currentMortality: 2,
      expectedEndDate: new Date('2023-05-15')
    }
  ] as BatchData[],
  
  environmentData: Array(24).fill(null).map((_, index) => ({
    timestamp: new Date(Date.now() - (23 - index) * 3600000),
    temperature: Math.round((Math.random() * 5 + 22) * 10) / 10,
    humidity: Math.round(Math.random() * 30 + 50),
    co2: Math.round(Math.random() * 300 + 400),
    feedLevel: Math.round(Math.random() * 100),
    waterLevel: Math.round(Math.random() * 100)
  } as EnvironmentData)),
  
  equipment: [
    {
      id: 'door1',
      name: 'Porte principale',
      type: 'door',
      status: 'on',
      autoMode: true,
      schedule: [
        { start: '07:00', end: '19:00' }
      ],
      lastUpdated: new Date(),
      location: 'Entrée principale',
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'vent1',
      name: 'Ventilation Est',
      type: 'ventilation',
      status: 'on',
      autoMode: true,
      lastUpdated: new Date(),
      location: 'Mur Est',
      lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'feed1',
      name: 'Distributeur #1',
      type: 'feeding',
      status: 'off',
      autoMode: true,
      schedule: [
        { start: '08:00', end: '08:30' },
        { start: '14:00', end: '14:30' },
        { start: '18:00', end: '18:30' }
      ],
      lastUpdated: new Date(),
      location: 'Zone centrale',
      lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'water1',
      name: 'Abreuvoir automatique',
      type: 'watering',
      status: 'on',
      autoMode: true,
      lastUpdated: new Date(),
      location: 'Zone Sud',
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ] as Equipment[],
  
  syncQueue: [] as SyncQueueItem[]
};

// Database methods
export const Database = {
  // Chicken methods
  getChickens: () => Promise.resolve([...db.chickens]),
  getChickensByBatch: (batchId: string) => 
    Promise.resolve(db.chickens.filter(c => c.batchId === batchId)),
  getChicken: (id: string) => 
    Promise.resolve(db.chickens.find(c => c.id === id)),
  updateChicken: (chicken: ChickenData) => {
    const index = db.chickens.findIndex(c => c.id === chicken.id);
    if (index >= 0) {
      db.chickens[index] = { ...chicken, lastUpdated: new Date() };
      // Add to sync queue
      db.syncQueue.push({
        id: `sync_${Date.now()}`,
        action: 'update',
        entity: 'chicken',
        data: db.chickens[index],
        timestamp: new Date(),
        synced: false
      });
      return Promise.resolve(db.chickens[index]);
    }
    return Promise.reject(new Error('Chicken not found'));
  },
  
  // Batch methods
  getBatches: () => Promise.resolve([...db.batches]),
  getBatch: (id: string) => 
    Promise.resolve(db.batches.find(b => b.id === id)),
  
  // Environment methods
  getEnvironmentData: (hours: number = 24) => 
    Promise.resolve(db.environmentData.slice(-hours)),
  getCurrentEnvironment: () => 
    Promise.resolve(db.environmentData[db.environmentData.length - 1]),
  
  // Equipment methods
  getEquipment: () => Promise.resolve([...db.equipment]),
  getEquipmentById: (id: string) => 
    Promise.resolve(db.equipment.find(e => e.id === id)),
  updateEquipmentStatus: (id: string, status: 'on' | 'off') => {
    const index = db.equipment.findIndex(e => e.id === id);
    if (index >= 0) {
      db.equipment[index] = { 
        ...db.equipment[index], 
        status, 
        lastUpdated: new Date() 
      };
      // Add to sync queue
      db.syncQueue.push({
        id: `sync_${Date.now()}`,
        action: 'update',
        entity: 'equipment',
        data: db.equipment[index],
        timestamp: new Date(),
        synced: false
      });
      return Promise.resolve(db.equipment[index]);
    }
    return Promise.reject(new Error('Equipment not found'));
  },
  
  // Sync methods
  getSyncQueue: () => Promise.resolve([...db.syncQueue]),
  markSynced: (ids: string[]) => {
    ids.forEach(id => {
      const item = db.syncQueue.find(item => item.id === id);
      if (item) item.synced = true;
    });
    return Promise.resolve(true);
  },
  
  // Statistics
  getStatistics: () => {
    const chickens = db.chickens;
    const totalChickens = chickens.length;
    const avgWeight = chickens.reduce((sum, c) => sum + c.weight, 0) / totalChickens;
    
    const env = db.environmentData;
    const currentTemp = env[env.length - 1].temperature;
    const currentHumidity = env[env.length - 1].humidity;
    const currentCO2 = env[env.length - 1].co2;
    
    return Promise.resolve({
      totalChickens,
      avgWeight,
      currentTemp,
      currentHumidity,
      currentCO2,
      feedLevel: env[env.length - 1].feedLevel,
      waterLevel: env[env.length - 1].waterLevel,
      mortalityRate: (db.batches[0].currentMortality / db.batches[0].chickenCount) * 100
    });
  },
  
  // Export data
  exportData: () => {
    const exportedData = {
      chickens: db.chickens,
      batches: db.batches,
      environment: db.environmentData.slice(-24),
      equipment: db.equipment
    };
    
    return Promise.resolve(exportedData);
  }
};
