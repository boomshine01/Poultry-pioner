
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { BatchData } from '../lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Droplet, CirclePlus, CircleMinus } from 'lucide-react';

interface ResourcesFormProps {
  selectedBatch: string | null;
  batches: BatchData[];
  onResourcesAdded?: () => void;
}

const ResourcesForm: React.FC<ResourcesFormProps> = ({ selectedBatch, batches, onResourcesAdded }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [chickenCount, setChickenCount] = useState<number>(0);
  const [waterLevel, setWaterLevel] = useState<number>(0);
  const [feedLevel, setFeedLevel] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial values based on current batch
  useEffect(() => {
    if (selectedBatch) {
      const currentBatch = batches.find(b => b.id === selectedBatch);
      if (currentBatch) {
        setChickenCount(currentBatch.chickenCount);
      }
    }
  }, [selectedBatch, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBatch) {
      toast({
        title: t('error'),
        description: t('noBatchSelected'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save resources to Supabase
      const { error } = await supabase
        .from('resources')
        .insert({
          batch_id: selectedBatch,
          chicken_count: chickenCount,
          water_level: waterLevel,
          feed_level: feedLevel
        });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('resourcesAdded'),
      });

      // Notify parent component that resources were added
      if (onResourcesAdded) {
        onResourcesAdded();
      }

    } catch (error) {
      console.error('Error adding resources:', error);
      toast({
        title: t('error'),
        description: t('errorAddingResources'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to create number input with +/- buttons
  const NumberInput = ({ 
    value, 
    onChange, 
    label, 
    icon,
    min = 0,
    max = 100
  }: { 
    value: number, 
    onChange: (value: number) => void, 
    label: string,
    icon: React.ReactNode,
    min?: number,
    max?: number
  }) => (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()}>{label}</Label>
      <div className="flex items-center space-x-2">
        {icon}
        <Button 
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <CircleMinus className="size-4" />
        </Button>
        <Input
          id={label.toLowerCase()}
          type="number"
          value={value}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) {
              onChange(Math.min(max, Math.max(min, val)));
            }
          }}
          className="w-20 text-center"
          min={min}
          max={max}
        />
        <Button 
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <CirclePlus className="size-4" />
        </Button>
      </div>
    </div>
  );

  if (!selectedBatch) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('resourcesManagement')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <NumberInput 
            value={chickenCount} 
            onChange={setChickenCount} 
            label={t('chickenCount')}
            icon={<span className="text-xl mr-2">🐔</span>}
            min={0}
            max={10000}
          />
          
          <NumberInput 
            value={waterLevel} 
            onChange={setWaterLevel} 
            label={t('waterLevel')}
            icon={<Droplet className="mr-2 text-blue-500" />}
            min={0}
            max={100}
          />
          
          <NumberInput 
            value={feedLevel} 
            onChange={setFeedLevel} 
            label={t('feedLevel')}
            icon={<span className="text-xl mr-2">🌾</span>}
            min={0}
            max={100}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('updating') : t('updateResources')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResourcesForm;
