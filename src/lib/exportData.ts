
import { Database } from './database';

export const generateCSV = (data: any[]): string => {
  if (!data || data.length === 0) return '';
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Prepare CSV content
  const csvContent = [
    headers.join(','), // Headers row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        
        // Handle different data types
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        
        return String(value);
      }).join(',')
    ) // Data rows
  ].join('\n');
  
  return csvContent;
};

export const downloadCSV = (csvContent: string, fileName: string): void => {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a link to download the file
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  // Add the link to the document
  document.body.appendChild(link);
  
  // Click the link to trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportChickensData = async (): Promise<void> => {
  try {
    const chickens = await Database.getChickens();
    const csvContent = generateCSV(chickens);
    downloadCSV(csvContent, 'chicken-data.csv');
  } catch (error) {
    console.error('Error exporting chickens data:', error);
    throw error;
  }
};

export const exportBatchesData = async (): Promise<void> => {
  try {
    const batches = await Database.getBatches();
    const csvContent = generateCSV(batches);
    downloadCSV(csvContent, 'batch-data.csv');
  } catch (error) {
    console.error('Error exporting batches data:', error);
    throw error;
  }
};

export const exportEnvironmentData = async (): Promise<void> => {
  try {
    const environment = await Database.getEnvironmentData(24);
    const csvContent = generateCSV(environment);
    downloadCSV(csvContent, 'environment-data.csv');
  } catch (error) {
    console.error('Error exporting environment data:', error);
    throw error;
  }
};

export const exportEquipmentData = async (): Promise<void> => {
  try {
    const equipment = await Database.getEquipment();
    const csvContent = generateCSV(equipment);
    downloadCSV(csvContent, 'equipment-data.csv');
  } catch (error) {
    console.error('Error exporting equipment data:', error);
    throw error;
  }
};

export const exportAllData = async (): Promise<void> => {
  try {
    const data = await Database.exportData();
    
    // Export each data type separately
    downloadCSV(generateCSV(data.chickens), 'chickens.csv');
    downloadCSV(generateCSV(data.batches), 'batches.csv');
    downloadCSV(generateCSV(data.environment), 'environment.csv');
    downloadCSV(generateCSV(data.equipment), 'equipment.csv');
  } catch (error) {
    console.error('Error exporting all data:', error);
    throw error;
  }
};
