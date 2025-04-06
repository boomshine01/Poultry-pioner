
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { Database, EnvironmentData } from '../lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Monitoring: React.FC = () => {
  const { t } = useLanguage();
  const [envData, setEnvData] = useState<EnvironmentData[]>([]);
  const [chartPeriod, setChartPeriod] = useState('24');
  const [activeTab, setActiveTab] = useState('temperature');
  const isMobile = useIsMobile();
  const [exportFormat, setExportFormat] = useState('csv');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [chartPeriod]);

  const loadData = async () => {
    try {
      const data = await Database.getEnvironmentData(parseInt(chartPeriod));
      setEnvData(data);
    } catch (error) {
      console.error('Error loading environment data', error);
    }
  };

  // Format data for charts
  const formatChartData = () => {
    return envData.map(data => ({
      time: new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      fullTime: data.timestamp,
      temperature: data.temperature,
      humidity: data.humidity,
      co2: data.co2,
      feedLevel: data.feedLevel,
      waterLevel: data.waterLevel
    }));
  };

  // Export data function
  const handleExportData = () => {
    try {
      const formattedData = envData.map(data => ({
        timestamp: new Date(data.timestamp).toISOString(),
        temperature: data.temperature,
        humidity: data.humidity,
        co2: data.co2,
        feedLevel: data.feedLevel,
        waterLevel: data.waterLevel
      }));

      let exportedData: string = '';
      let fileName: string = `environment-data-${new Date().toISOString().slice(0, 10)}`;

      if (exportFormat === 'csv') {
        // Generate CSV
        const headers = Object.keys(formattedData[0]).join(',');
        const rows = formattedData.map(row => 
          Object.values(row).join(',')
        ).join('\n');
        exportedData = `${headers}\n${rows}`;
        fileName += '.csv';
      } else if (exportFormat === 'json') {
        // Generate JSON
        exportedData = JSON.stringify(formattedData, null, 2);
        fileName += '.json';
      } else {
        // Generate simple Excel compatible TSV
        const headers = Object.keys(formattedData[0]).join('\t');
        const rows = formattedData.map(row => 
          Object.values(row).join('\t')
        ).join('\n');
        exportedData = `${headers}\n${rows}`;
        fileName += '.xlsx';
      }

      // Create a blob and trigger download
      const blob = new Blob([exportedData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t("success"),
        description: `${t("dataExportedAs")} ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorExportingData"),
      });
    }
  };

  const chartData = formatChartData();

  return (
    <div className={`space-y-6 p-4 ${!isMobile ? 'ml-56' : ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('monitoring')}</h2>
        
        <Select value={chartPeriod} onValueChange={setChartPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 {t('hours')}</SelectItem>
            <SelectItem value="12">12 {t('hours')}</SelectItem>
            <SelectItem value="24">24 {t('hours')}</SelectItem>
            <SelectItem value="48">48 {t('hours')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Environment Monitoring Tabs */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="temperature">{t('temperature')}</TabsTrigger>
              <TabsTrigger value="humidity">{t('humidity')}</TabsTrigger>
              <TabsTrigger value="co2">{t('co2')}</TabsTrigger>
              <TabsTrigger value="consumption">{t('consumption')}</TabsTrigger>
            </TabsList>
          
            <TabsContent value="temperature" className="h-full mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    name={t('temperature')} 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="humidity" className="h-full mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    name={t('humidity')} 
                    stroke="#0EA5E9" 
                    fill="#BAE6FD" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="co2" className="h-full mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="co2" 
                    name={t('co2')} 
                    stroke="#4ADE80" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="consumption" className="h-full mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="feedLevel" 
                    name={t('feed')} 
                    fill="#FCD34D" 
                  />
                  <Bar 
                    dataKey="waterLevel" 
                    name={t('water')} 
                    fill="#0EA5E9" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80">
            {/* TabsContent moved inside the Tabs component above */}
          </div>
        </CardContent>
      </Card>
      
      {/* Current values */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {envData.length > 0 && (
          <>
            <Card className="bg-red-50 dark:bg-red-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">
                  {t('temperature')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900 dark:text-red-200">
                  {envData[envData.length - 1].temperature}°C
                </div>
                <p className="text-xs text-muted-foreground">
                  Min: {Math.min(...envData.map(d => d.temperature))}°C | 
                  Max: {Math.max(...envData.map(d => d.temperature))}°C
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {t('humidity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {envData[envData.length - 1].humidity}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Min: {Math.min(...envData.map(d => d.humidity))}% | 
                  Max: {Math.max(...envData.map(d => d.humidity))}%
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                  {t('co2')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {envData[envData.length - 1].co2} ppm
                </div>
                <p className="text-xs text-muted-foreground">
                  Min: {Math.min(...envData.map(d => d.co2))} ppm | 
                  Max: {Math.max(...envData.map(d => d.co2))} ppm
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Export and Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('exportData')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('exportDescription')}
            </p>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <Select defaultValue="csv" value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-full md:w-auto">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="w-full md:w-auto h-10" 
                onClick={handleExportData}
                disabled={envData.length === 0}
              >
                {t('export')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('alertSettings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="temp-alert">{t('temperatureAlert')}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="temp-alert"
                    type="number"
                    placeholder="Min"
                    defaultValue="18"
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    defaultValue="28"
                    className="w-20"
                  />
                  <span>°C</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="humidity-alert">{t('humidityAlert')}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="humidity-alert"
                    type="number"
                    placeholder="Min"
                    defaultValue="40"
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    defaultValue="70"
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring;
