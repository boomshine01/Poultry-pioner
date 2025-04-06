
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLanguage } from '../lib/i18n';
import { Database } from '../lib/database';
import type { Equipment } from '../lib/database';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ThermometerIcon, 
  Droplets, 
  Fan, 
  Power, 
  ArrowLeftIcon,
  CheckCircle, 
  AlertCircle, 
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (id) {
      loadEquipment(id);
    }
  }, [id]);

  const loadEquipment = async (equipmentId: string) => {
    try {
      setLoading(true);
      const data = await Database.getEquipmentById(equipmentId);
      if (data) {
        setEquipment(data);
      } else {
        toast({
          title: t('error'),
          description: t('equipmentNotFound'),
          variant: "destructive"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading equipment data', error);
      toast({
        title: t('error'),
        description: t('errorLoadingEquipment'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = async (status: 'on' | 'off') => {
    if (!equipment) return;
    
    try {
      await Database.updateEquipmentStatus(equipment.id, status);
      setEquipment(prev => prev ? { ...prev, status } : null);
      toast({
        title: status === 'on' ? t('equipmentTurnedOn') : t('equipmentTurnedOff'),
        description: `${equipment.name} ${status === 'on' ? t('isNowActive') : t('isNowInactive')}`,
      });
    } catch (error) {
      console.error('Error toggling equipment', error);
      toast({
        title: t('error'),
        description: t('errorTogglingEquipment'),
        variant: "destructive"
      });
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'heater':
        return <ThermometerIcon className="h-5 w-5" />;
      case 'fan':
      case 'ventilation':
        return <Fan className="h-5 w-5" />;
      case 'water':
      case 'watering':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Power className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="h-3 w-3 mr-1" /> {t('active')}</Badge>;
      case 'off':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"><Power className="h-3 w-3 mr-1" /> {t('inactive')}</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><AlertCircle className="h-3 w-3 mr-1" /> {t('error')}</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><Clock className="h-3 w-3 mr-1" /> {t('scheduled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout currentTab="equipment" onTabChange={() => navigate('/')}>
        <div className="ml-56 flex justify-center items-center h-full">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full max-w-lg bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout currentTab="equipment" onTabChange={() => navigate('/')}>
        <div className="ml-56 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('equipmentNotFound')}</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('backToDashboard')}
          </Button>
        </div>
      </Layout>
    );
  }

  const renderSpecificControls = () => {
    switch (equipment.type) {
      case 'heater':
        return (
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('targetTemperature')}:</span>
              <span>{equipment.targetValue || '25'} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('currentTemperature')}:</span>
              <span>{equipment.currentValue || '22'} °C</span>
            </div>
            <div className="space-y-1 pt-2">
              <Label htmlFor="temp-setting">{t('setTemperature')}</Label>
              <div className="flex space-x-2">
                <Input 
                  id="temp-setting"
                  type="number" 
                  defaultValue={equipment.targetValue || '25'} 
                  className="w-20"
                />
                <span className="flex items-center">°C</span>
                <Button size="sm">{t('set')}</Button>
              </div>
            </div>
          </div>
        );
      case 'fan':
      case 'ventilation':
        return (
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('fanSpeed')}:</span>
              <span>{equipment.currentValue || '50'}%</span>
            </div>
            <div className="space-y-1 pt-2">
              <Label htmlFor="speed-setting">{t('setFanSpeed')}</Label>
              <div className="flex space-x-2">
                <Select defaultValue={equipment.currentValue || '50'}>
                  <SelectTrigger id="speed-setting" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">{t('set')}</Button>
              </div>
            </div>
          </div>
        );
      case 'water':
      case 'watering':
        return (
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('waterLevel')}:</span>
              <span>{equipment.currentValue || '75'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('waterPressure')}:</span>
              <span>{equipment.pressure || '2.5'} bar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('waterFlow')}:</span>
              <span>{equipment.flow || '3.2'} L/min</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('status')}:</span>
              <span>{equipment.status}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentTab="equipment" onTabChange={() => navigate('/')}>
      <div className="ml-56 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
          <h2 className="text-2xl font-bold">{equipment.name}</h2>
          {getStatusBadge(equipment.status)}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="general">{t('general')}</TabsTrigger>
            <TabsTrigger value="controls">{t('controls')}</TabsTrigger>
            <TabsTrigger value="maintenance">{t('maintenance')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t('generalInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('name')}</Label>
                      <div className="font-medium">{equipment.name}</div>
                    </div>
                    <div>
                      <Label>{t('type')}</Label>
                      <div className="font-medium flex items-center">
                        {getEquipmentIcon(equipment.type)}
                        <span className="ml-2">{t(equipment.type)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('location')}</Label>
                      <div className="font-medium">{equipment.location || t('notSpecified')}</div>
                    </div>
                    <div>
                      <Label>{t('lastUpdated')}</Label>
                      <div className="font-medium">
                        {equipment.lastUpdated ? new Date(equipment.lastUpdated).toLocaleString() : t('never')}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{t('autoMode')}</Label>
                    <div className="flex items-center mt-1">
                      <Switch 
                        id="automode-toggle"
                        checked={equipment.autoMode}
                        disabled
                      />
                      <Label htmlFor="automode-toggle" className="ml-2">
                        {equipment.autoMode ? t('enabled') : t('disabled')}
                      </Label>
                    </div>
                  </div>
                  
                  {equipment.schedule && equipment.schedule.length > 0 && (
                    <div>
                      <Label>{t('schedule')}</Label>
                      <div className="space-y-2 mt-1">
                        {equipment.schedule.map((time, idx) => (
                          <div key={idx} className="flex space-x-2 items-center">
                            <Clock className="h-4 w-4" />
                            <span>{time.start} - {time.end}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="controls">
            <Card>
              <CardHeader>
                <CardTitle>{t('controlPanel')}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSpecificControls()}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="toggle-status"
                    checked={equipment.status === 'on'}
                    onCheckedChange={(checked) => toggleEquipment(checked ? 'on' : 'off')}
                    disabled={equipment.status === 'error'}
                  />
                  <Label htmlFor="toggle-status">
                    {equipment.status === 'on' ? t('turnOff') : t('turnOn')}
                  </Label>
                </div>
                
                <Button variant="outline" size="sm">
                  {t('resetToDefaults')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>{t('maintenanceInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('lastMaintenance')}</Label>
                      <div className="font-medium">
                        {equipment.lastMaintenance ? 
                          new Date(equipment.lastMaintenance).toLocaleDateString() : 
                          t('noMaintenanceRecorded')}
                      </div>
                    </div>
                    <div>
                      <Label>{t('nextMaintenance')}</Label>
                      <div className="font-medium">
                        {equipment.nextMaintenance ? 
                          new Date(equipment.nextMaintenance).toLocaleDateString() : 
                          t('notScheduled')}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{t('scheduleMaintenance')}</Label>
                    <div className="flex space-x-2 items-center mt-2">
                      <Input 
                        type="date" 
                        className="w-auto"
                        defaultValue={equipment.nextMaintenance ? 
                          new Date(equipment.nextMaintenance).toISOString().split('T')[0] : 
                          undefined}
                      />
                      <Button>{t('schedule')}</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{t('maintenanceNotes')}</Label>
                    <div className="border rounded-md p-3 mt-1 text-sm text-muted-foreground">
                      {t('noMaintenanceNotes')}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {t('recordMaintenance')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EquipmentDetail;
