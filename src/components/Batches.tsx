
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { Database, BatchData, ChickenData } from '../lib/database';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ResourcesForm from './RessourcesForm';

const Batches: React.FC = () => {
  const { t } = useLanguage();
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [chickens, setChickens] = useState<ChickenData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      try {
        const batchData = await Database.getBatches();
        setBatches(batchData);
        
        if (batchData.length > 0) {
          setSelectedBatch(batchData[0].id);
          const chickenData = await Database.getChickensByBatch(batchData[0].id);
          setChickens(chickenData);
        }
      } catch (error) {
        console.error('Error loading batch data', error);
      }
    };
    
    loadData();
  }, []);

  const handleBatchSelect = async (batchId: string) => {
    setSelectedBatch(batchId);
    try {
      const chickenData = await Database.getChickensByBatch(batchId);
      setChickens(chickenData);
    } catch (error) {
      console.error('Error loading chickens for batch', error);
    }
  };

  const refreshBatchData = async () => {
    try {
      const batchData = await Database.getBatches();
      setBatches(batchData);
      
      if (selectedBatch) {
        const chickenData = await Database.getChickensByBatch(selectedBatch);
        setChickens(chickenData);
      }
    } catch (error) {
      console.error('Error refreshing batch data', error);
    }
  };

  const filteredChickens = chickens.filter(chicken => 
    chicken.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create weight data for the growth chart
  const getAgeGroups = () => {
    const ageData: {[key: number]: {count: number, totalWeight: number}} = {};
    
    chickens.forEach(chicken => {
      const age = chicken.age;
      if (!ageData[age]) {
        ageData[age] = { count: 0, totalWeight: 0 };
      }
      ageData[age].count += 1;
      ageData[age].totalWeight += chicken.weight;
    });
    
    const result = Object.entries(ageData).map(([age, data]) => ({
      age: Number(age),
      avgWeight: data.totalWeight / data.count
    }));
    
    return result.sort((a, b) => a.age - b.age);
  };

  const weightData = getAgeGroups();

  return (
    <div className={`space-y-6 ${!isMobile ? 'ml-56' : ''}`}>
      <h2 className="text-2xl font-bold">{t('batches')}</h2>
      
      {batches.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t('noBatches')}</p>
            <Button className="mt-4">{t('createBatch')}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Batch selector */}
          <Card>
            <CardHeader>
              <CardTitle>{t('selectBatch')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={selectedBatch || ''} 
                onValueChange={handleBatchSelect}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:flex">
                  {batches.map(batch => (
                    <TabsTrigger key={batch.id} value={batch.id} className="flex-1">
                      {batch.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          {selectedBatch && (
            <>
              {/* Resources Form */}
              <ResourcesForm 
                selectedBatch={selectedBatch}
                batches={batches} 
                onResourcesAdded={refreshBatchData}
              />
              
              {/* Batch Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('batchOverview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('startDate')}</h4>
                      <p className="text-lg font-medium">
                        {new Date(batches.find(b => b.id === selectedBatch)?.startDate || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('expectedEndDate')}</h4>
                      <p className="text-lg font-medium">
                        {new Date(batches.find(b => b.id === selectedBatch)?.expectedEndDate || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('chickenCount')}</h4>
                      <p className="text-lg font-medium">
                        {batches.find(b => b.id === selectedBatch)?.chickenCount}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('mortality')}</h4>
                      <p className="text-lg font-medium">
                        {batches.find(b => b.id === selectedBatch)?.currentMortality} 
                        ({((batches.find(b => b.id === selectedBatch)?.currentMortality || 0) / 
                        (batches.find(b => b.id === selectedBatch)?.chickenCount || 1) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('growthChart')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={weightData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="age" 
                          label={{ value: t('ageInDays'), position: 'insideBottomRight', offset: -10 }} 
                        />
                        <YAxis 
                          label={{ value: t('weightInKg'), angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="avgWeight"
                          stroke="#1E40AF"
                          name={t('averageWeight')}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Chicken List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle>{t('chickenList')}</CardTitle>
                    <div className="relative w-full sm:max-w-sm">
                      <Input
                        type="search"
                        placeholder={`${t('search')}...`}
                        className="w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    <div className="space-y-4">
                      {filteredChickens.slice(0, 10).map(chicken => (
                        <div key={chicken.id} className="border rounded-md p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('id')}</span>
                            <span>{chicken.id}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('age')}</span>
                            <span>{chicken.age} {t('days')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('weight')}</span>
                            <span>{chicken.weight.toFixed(2)} kg</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('lastUpdated')}</span>
                            <span className="text-muted-foreground text-sm">
                              {new Date(chicken.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('id')}</TableHead>
                          <TableHead>{t('age')}</TableHead>
                          <TableHead>{t('weight')}</TableHead>
                          <TableHead>{t('lastUpdated')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredChickens.slice(0, 10).map(chicken => (
                          <TableRow key={chicken.id}>
                            <TableCell>{chicken.id}</TableCell>
                            <TableCell>{chicken.age} {t('days')}</TableCell>
                            <TableCell>{chicken.weight.toFixed(2)} kg</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(chicken.lastUpdated).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {filteredChickens.length > 10 && (
                    <div className="p-4 text-center text-muted-foreground">
                      {t('showingResults', { shown: 10, total: filteredChickens.length })}
                    </div>
                  )}
                  
                  {filteredChickens.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      {t('noResults')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Batches;
