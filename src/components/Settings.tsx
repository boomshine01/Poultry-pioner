
import React from 'react';
import { useLanguage } from '../lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-6 ${!isMobile ? 'ml-56' : ''}`}>
      <h2 className="text-2xl font-bold">{t('settings')}</h2>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="sync">{t('dataSync')}</TabsTrigger>
          <TabsTrigger value="system">{t('system')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">{t('darkMode')}</Label>
                <Switch id="dark-mode" />
              </div>
              
              <div className="space-y-2">
                <Label>{t('language')}</Label>
                <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('fontSize')}</Label>
                <Slider defaultValue={[2]} max={4} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>{t('small')}</div>
                  <div>{t('medium')}</div>
                  <div>{t('large')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('units')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('temperatureUnit')}</Label>
                <Select defaultValue="celsius">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('weightUnit')}</Label>
                <Select defaultValue="kg">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    <SelectItem value="lb">Livres (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('alertPreferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="temp-alerts">{t('temperatureAlerts')}</Label>
                <Switch id="temp-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="humidity-alerts">{t('humidityAlerts')}</Label>
                <Switch id="humidity-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="feed-alerts">{t('feedLevelAlerts')}</Label>
                <Switch id="feed-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="water-alerts">{t('waterLevelAlerts')}</Label>
                <Switch id="water-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="health-alerts">{t('healthAlerts')}</Label>
                <Switch id="health-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationMethods')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="app-notif">{t('inAppNotifications')}</Label>
                <Switch id="app-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif">{t('emailNotifications')}</Label>
                <Switch id="email-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notif">{t('smsNotifications')}</Label>
                <Switch id="sms-notif" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" placeholder="your@email.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneNumber')}</Label>
                <Input id="phone" placeholder="+00 000 000 000" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('syncSettings')}</CardTitle>
              <CardDescription>
                {t('syncSettingsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync">{t('autoSync')}</Label>
                <Switch id="auto-sync" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>{t('syncFrequency')}</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {t('minutes')}</SelectItem>
                    <SelectItem value="15">15 {t('minutes')}</SelectItem>
                    <SelectItem value="30">30 {t('minutes')}</SelectItem>
                    <SelectItem value="60">60 {t('minutes')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-wifi">{t('syncOnlyOnWifi')}</Label>
                <Switch id="sync-wifi" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>{t('dataRetentionPeriod')}</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 {t('days')}</SelectItem>
                    <SelectItem value="30">30 {t('days')}</SelectItem>
                    <SelectItem value="90">90 {t('days')}</SelectItem>
                    <SelectItem value="365">365 {t('days')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="w-full">
                {t('syncNow')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('systemSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="debug-mode">{t('debugMode')}</Label>
                <Switch id="debug-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">{t('sendAnalytics')}</Label>
                <Switch id="analytics" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>{t('serverAddress')}</Label>
                <Input placeholder="https://api.example.com" defaultValue="https://farm-api.example.com" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-update">{t('automaticUpdates')}</Label>
                <Switch id="auto-update" defaultChecked />
              </div>
              
              <div className="pt-2">
                <Button variant="destructive" className="w-full">
                  {t('resetApplication')}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('aboutApp')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('version')}:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('database')}:</span>
                  <span className="font-medium">SQLite 3.36.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('device')}:</span>
                  <span className="font-medium">{navigator.userAgent.includes("Android") ? "Android" : navigator.userAgent.includes("iPhone") ? "iOS" : "Web"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('lastUpdated')}:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
