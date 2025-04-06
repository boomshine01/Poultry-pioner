
import { create } from 'zustand';
import { Database, SyncQueueItem } from './database';

interface ConnectivityState {
  isOnline: boolean;
  lastSynced: Date | null;
  isSyncing: boolean;
  syncError: string | null;
  pendingSyncCount: number;
  setOnline: (online: boolean) => void;
  sync: () => Promise<boolean>;
  getPendingSyncCount: () => Promise<number>;
}

export const useConnectivity = create<ConnectivityState>((set, get) => ({
  isOnline: navigator.onLine,
  lastSynced: null,
  isSyncing: false,
  syncError: null,
  pendingSyncCount: 0,
  
  setOnline: (online) => set({ isOnline: online }),
  
  sync: async () => {
    if (!get().isOnline) {
      set({ syncError: 'Cannot sync while offline' });
      return false;
    }
    
    set({ isSyncing: true, syncError: null });
    
    try {
      // Get pending sync items
      const queue = await Database.getSyncQueue();
      const pendingItems = queue.filter(item => !item.synced);
      
      if (pendingItems.length === 0) {
        set({ isSyncing: false, lastSynced: new Date(), pendingSyncCount: 0 });
        return true;
      }
      
      // Mock API call to sync data
      const success = await mockApiSync(pendingItems);
      
      if (success) {
        // Mark items as synced
        await Database.markSynced(pendingItems.map(item => item.id));
        set({ 
          isSyncing: false, 
          lastSynced: new Date(), 
          pendingSyncCount: 0 
        });
        return true;
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      set({ 
        isSyncing: false, 
        syncError: error instanceof Error ? error.message : 'Unknown error during sync'
      });
      return false;
    }
  },
  
  getPendingSyncCount: async () => {
    const queue = await Database.getSyncQueue();
    const count = queue.filter(item => !item.synced).length;
    set({ pendingSyncCount: count });
    return count;
  }
}));

// Mock API sync function
const mockApiSync = async (items: SyncQueueItem[]): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate success (95% of the time)
  return Math.random() > 0.05;
};

// Set up event listeners for online/offline events
export const initConnectivity = () => {
  const { setOnline, sync, getPendingSyncCount } = useConnectivity.getState();
  
  window.addEventListener('online', () => {
    setOnline(true);
    // Attempt to sync when coming back online
    sync();
  });
  
  window.addEventListener('offline', () => {
    setOnline(false);
  });
  
  // Initial check
  setOnline(navigator.onLine);
  getPendingSyncCount();
};
