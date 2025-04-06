
import React, { useState } from 'react';
import { useLanguage } from '../../lib/i18n';
import type { Equipment } from '../EquipmentTypes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import UpcomingMaintenance from './UpcomingMaintenance';
import MaintenanceCalendar from './MaintenanceCalendar';

interface MaintenanceScheduleProps {
  equipment: Equipment[];
}

const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ equipment }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleScheduleView = () => {
    setDate(new Date());
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-muted/30">
        <CardTitle>{t('maintenanceSchedule')}</CardTitle>
        <CardDescription>{t('upcomingMaintenance')}</CardDescription>
      </CardHeader>
      
      <CardContent className="py-4">
        <UpcomingMaintenance equipment={equipment} />
      </CardContent>
      
      <CardFooter className="bg-muted/20 border-t">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full hover:bg-primary/10" onClick={handleScheduleView}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {t('viewFullSchedule')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('maintenanceSchedule')}</DialogTitle>
              <DialogDescription>
                {t('viewAndPlanMaintenance')}
              </DialogDescription>
            </DialogHeader>
            
            <MaintenanceCalendar 
              equipment={equipment} 
              date={date} 
              setDate={setDate} 
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default MaintenanceSchedule;
