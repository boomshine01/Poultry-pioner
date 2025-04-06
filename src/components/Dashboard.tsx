
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { Database } from '../lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, ArrowDown, ArrowUp, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardStats {
  totalChickens: number;
  avgWeight: number;
  currentTemp: number;
  currentHumidity: number;
  currentCO2: number;
  feedLevel: number;
  waterLevel: number;
  mortalityRate: number;
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [envData, setEnvData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load dashboard data
    const loadData = async () => {
      try {
        const statistics = await Database.getStatistics();
        setStats(statistics as DashboardStats);
        
        const envData = await Database.getEnvironmentData(24);
        
        // Transform data for charts
        const chartData = envData.map(data => ({
          time: new Date(data.timestamp).getHours() + ':00',
          temperature: data.temperature,
          humidity: data.humidity,
          co2: data.co2
        }));
        
        setEnvData(chartData);
        
        // Generate mock alerts
        const mockAlerts = [];
        if (statistics.currentTemp > 27) {
          mockAlerts.push('Temperature élevée détectée');
        }
        if (statistics.feedLevel < 20) {
          mockAlerts.push('Niveau d\'aliments bas');
        }
        
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error loading dashboard data', error);
      }
    };
    
    loadData();
  }, []);
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-gray-500">{t('loading')}...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${!isMobile ? 'ml-56' : ''}`}>
      <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
      
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalChickens')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChickens}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.mortalityRate.toFixed(1)}% {t('mortality')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('averageWeight')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWeight.toFixed(2)} kg</div>
            <p className="text-xs text-farm-green flex items-center mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              +0.12 kg / week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('feed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.feedLevel}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${stats.feedLevel < 20 ? 'bg-farm-red' : 'bg-farm-green'}`} 
                style={{ width: `${stats.feedLevel}%` }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('water')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waterLevel}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="h-2.5 rounded-full bg-farm-blue" 
                style={{ width: `${stats.waterLevel}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Environment Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('monitoring')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={envData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EF4444"
                  name={t('temperature')}
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#0EA5E9" 
                  name={t('humidity')}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="co2"
                  stroke="#4ADE80"
                  name={t('co2')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Environment Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{t('temperature')}</p>
                <h3 className="text-2xl font-bold text-red-900 dark:text-red-200">{stats.currentTemp}°C</h3>
              </div>
              <Thermometer className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('humidity')}</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.currentHumidity}%</h3>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">{t('co2')}</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.currentCO2} ppm</h3>
              </div>
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-farm-yellow bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-300">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
              {t('alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-farm-yellow" />
                  <p className="ml-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">{alert}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
