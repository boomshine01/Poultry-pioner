
import React from 'react';
import { useLanguage } from '../../lib/i18n';
import type { Equipment } from '../EquipmentTypes';
import { Calendar } from '@/components/ui/calendar';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MaintenanceEvent {
  id: string;
  name: string;
  date: Date;
  equipment: Equipment;
}

interface MaintenanceCalendarProps {
  equipment: Equipment[];
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({ 
  equipment, 
  date, 
  setDate 
}) => {
  const { t } = useLanguage();

  // Equipment with maintenance dates for the calendar view
  const maintenanceEvents = equipment
    .filter(item => item.nextMaintenance)
    .map(item => ({
      id: item.id,
      name: item.name,
      date: new Date(item.nextMaintenance as Date),
      equipment: item
    }));

  const renderCalendarDayContent = (day: Date) => {
    const events = maintenanceEvents.filter(
      event => event.date.getDate() === day.getDate() && 
               event.date.getMonth() === day.getMonth() && 
               event.date.getFullYear() === day.getFullYear()
    );
    
    if (events.length) {
      return <div className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-1 left-1/2 transform -translate-x-1/2"></div>;
    }
    
    return null;
  };

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className={cn("p-3 pointer-events-auto")}
        components={{
          DayContent: ({ date }) => (
            <div className="relative">
              <div>{date.getDate()}</div>
              {renderCalendarDayContent(date)}
            </div>
          )
        }}
      />
      
      <div className="mt-4">
        <h4 className="font-medium text-sm mb-2">{t('scheduledMaintenanceForDate')}</h4>
        <div className="space-y-2">
          {date && maintenanceEvents
            .filter(event => 
              event.date.getDate() === date.getDate() && 
              event.date.getMonth() === date.getMonth() && 
              event.date.getFullYear() === date.getFullYear()
            )
            .map(event => (
              <div key={event.id} className="p-2 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.equipment.location}
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="grid gap-2">
                      <div className="text-sm font-medium">{t('maintenanceDetails')}</div>
                      <div className="text-sm">{t('time')}: {format(event.date, 'HH:mm')}</div>
                      <div className="text-sm">{t('date')}: {format(event.date, 'PP')}</div>
                      {event.equipment.lastMaintenance && (
                        <div className="text-sm">{t('lastMaintenance')}: {format(new Date(event.equipment.lastMaintenance), 'PP')}</div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))
          }
          
          {date && maintenanceEvents
            .filter(event => 
              event.date.getDate() === date.getDate() && 
              event.date.getMonth() === date.getMonth() && 
              event.date.getFullYear() === date.getFullYear()
            ).length === 0 && (
              <div className="text-center py-6 text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                {t('noMaintenanceScheduled')}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
