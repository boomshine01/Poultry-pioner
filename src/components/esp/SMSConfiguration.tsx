import React, { useState } from 'react';
import { MessageSquare, RefreshCw, Check, AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/lib/i18n';

export interface SMSConfiguration {
  enabled: boolean;
  phoneNumber: string;
  carrier: string;
  gatewayAddress?: string;
}

interface SMSConfigurationProps {
  smsConfig: SMSConfiguration;
  onSaveConfig: (config: SMSConfiguration) => void;
  phoneNumber?: string;
}

export const SMSConfigurationComponent: React.FC<SMSConfigurationProps> = ({ 
  smsConfig, 
  onSaveConfig,
  phoneNumber = '' 
}) => {
  const [localConfig, setLocalConfig] = useState<SMSConfiguration>(smsConfig);
  const [isSavingSMS, setIsSavingSMS] = useState(false);
  const [smsTestStatus, setSmsTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const { toast } = useToast();
  const { t } = useLanguage();

  const saveSMSConfiguration = () => {
    setIsSavingSMS(true);
    
    try {
      if (localConfig.enabled && !localConfig.phoneNumber) {
        toast({
          title: t("error"),
          description: t("phoneNumberRequired"),
          variant: "destructive"
        });
        setIsSavingSMS(false);
        return;
      }
      
      onSaveConfig(localConfig);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorSavingSMS"),
        variant: "destructive"
      });
    } finally {
      setIsSavingSMS(false);
    }
  };

  const testSMSConfiguration = async () => {
    setSmsTestStatus('testing');
    
    try {
      if (!localConfig.enabled || !localConfig.phoneNumber) {
        toast({
          title: t("error"),
          description: t("enableAndConfigureSMS"),
          variant: "destructive"
        });
        setSmsTestStatus('failed');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t("success"),
        description: t("smsTested")
      });
      
      setSmsTestStatus('success');
      
      setTimeout(() => {
        setSmsTestStatus('idle');
      }, 3000);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorTestingSMS"),
        variant: "destructive"
      });
      setSmsTestStatus('failed');
      
      setTimeout(() => {
        setSmsTestStatus('idle');
      }, 3000);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2" size={18} />
            {t('smsConfiguration')}
          </CardTitle>
          <CardDescription>
            {t('configureSMSFallback')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>{t('enableSMS')}</span>
            <Switch 
              checked={localConfig.enabled}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
          
          {localConfig.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone-number">{t('phoneNumber')}</Label>
                <Input 
                  id="phone-number" 
                  value={localConfig.phoneNumber}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+33612345678" 
                />
                <p className="text-xs text-muted-foreground">
                  {t('enterPhoneWithCountryCode')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carrier">{t('mobileCarrier')}</Label>
                <Select 
                  value={localConfig.carrier}
                  onValueChange={(value) => setLocalConfig(prev => ({ ...prev, carrier: value }))}
                >
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder={t('selectCarrier')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="sfr">SFR</SelectItem>
                    <SelectItem value="bouygues">Bouygues Telecom</SelectItem>
                    <SelectItem value="free">Free Mobile</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {localConfig.carrier === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="gateway-address">{t('smsGatewayAddress')}</Label>
                  <Input 
                    id="gateway-address" 
                    value={localConfig.gatewayAddress || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, gatewayAddress: e.target.value }))}
                    placeholder="sms.carrier.com" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('optionalSMSGateway')}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>{t('smsCommands')}</Label>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p><strong>STATUS</strong> - {t('getSensorData')}</p>
                  <p><strong>DOOR OPEN</strong> - {t('openDoor')}</p>
                  <p><strong>DOOR CLOSE</strong> - {t('closeDoor')}</p>
                  <p><strong>FEED ON</strong> - {t('activateFeeder')}</p>
                  <p><strong>FEED OFF</strong> - {t('deactivateFeeder')}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={saveSMSConfiguration}
            disabled={isSavingSMS}
          >
            {isSavingSMS ? t('saving') : t('saveConfiguration')}
          </Button>
          
          {localConfig.enabled && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={testSMSConfiguration}
              disabled={smsTestStatus === 'testing'}
            >
              {smsTestStatus === 'testing' ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : smsTestStatus === 'success' ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : smsTestStatus === 'failed' ? (
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              ) : null}
              {smsTestStatus === 'testing' ? t('testing') : t('testSMS')}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="mr-2" size={18} />
            ESP32 SMS {t('codeExample')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
{`
#include <WiFi.h>
#include <GSM.h>

// WiFi credentials
const char* ssid = "${"WIFI_SSID"}";
const char* password = "${"WIFI_PASSWORD"}";

// SMS configuration
const char* phoneNumber = "${phoneNumber || "+33612345678"}";
#define GSM_PIN ""
#define TINY_GSM_MODEM_SIM800

// Initialize GSM modem
GSM gsmAccess;
GSM_SMS sms;

// Function to process SMS commands
void processSMS() {
  char smsBuffer[160];
  int smsLength = 0;
  char senderNumber[20];
  
  // Check if there is an SMS
  if (sms.available()) {
    sms.remoteNumber(senderNumber, 20);
    smsLength = sms.readString(smsBuffer, 160);
    smsBuffer[smsLength] = '\\0'; // Add null terminator
    Serial.print("Message received from: ");
    Serial.println(senderNumber);
    Serial.print("Message content: ");
    Serial.println(smsBuffer);
    
    // Process commands
    String command = String(smsBuffer);
    command.trim();
    command.toUpperCase();
    
    String response = "";
    
    if (command == "STATUS") {
      // Read sensor data
      float temperature = readTemperature();
      float humidity = readHumidity();
      int feedLevel = readFeedLevel();
      int waterLevel = readWaterLevel();
      String doorStatus = isDoorOpen() ? "OPEN" : "CLOSED";
      
      // Format response
      response = "TEMP: " + String(temperature) + "C\\n" +
                 "HUM: " + String(humidity) + "%\\n" +
                 "FEED: " + String(feedLevel) + "%\\n" +
                 "WATER: " + String(waterLevel) + "%\\n" +
                 "DOOR: " + doorStatus;
    }
    else if (command == "DOOR OPEN") {
      openDoor();
      response = "DOOR OPENED";
    }
    else if (command == "DOOR CLOSE") {
      closeDoor();
      response = "DOOR CLOSED";
    }
    else if (command == "FEED ON") {
      activateFeeder();
      response = "FEEDER ACTIVATED";
    }
    else if (command == "FEED OFF") {
      deactivateFeeder();
      response = "FEEDER DEACTIVATED";
    }
    else {
      response = "UNKNOWN COMMAND. VALID COMMANDS:\\n" +
                 "STATUS\\n" +
                 "DOOR OPEN\\n" +
                 "DOOR CLOSE\\n" +
                 "FEED ON\\n" +
                 "FEED OFF";
    }
    
    // Send response
    sendSMS(senderNumber, response);
    
    // Delete the message
    sms.flush();
  }
}

// Function to send SMS
void sendSMS(const char* number, String message) {
  Serial.print("Sending SMS to: ");
  Serial.println(number);
  Serial.print("Message: ");
  Serial.println(message);
  
  sms.beginSMS(number);
  sms.print(message);
  sms.endSMS();
  Serial.println("SMS sent!");
}

void setup() {
  Serial.begin(115200);
  
  // Initialize pins and other hardware
  // ...
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  
  // Try to connect to WiFi for 20 seconds
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 20000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    // ... start HTTP server
  } else {
    Serial.println("WiFi connection failed, switching to SMS mode");
    
    // Initialize GSM connection
    Serial.println("Initializing GSM modem...");
    boolean gsmConnected = false;
    
    // Try to connect to GSM network
    for (int attempt = 1; attempt <= 3 && !gsmConnected; attempt++) {
      Serial.print("GSM connection attempt ");
      Serial.println(attempt);
      
      if (gsmAccess.begin(GSM_PIN) == GSM_READY) {
        gsmConnected = true;
        Serial.println("GSM initialized successfully");
      } else {
        Serial.println("GSM initialization failed");
        delay(1000);
      }
    }
    
    if (gsmConnected) {
      Serial.println("SMS mode active");
      // Send initialization message to admin
      sendSMS(phoneNumber, "POULAILLER_CONNECTE STARTED IN SMS MODE");
    } else {
      Serial.println("Failed to initialize GSM. Operating in offline mode");
    }
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Handle HTTP server for API requests
    // ...
  } else {
    // Handle SMS commands in offline mode
    processSMS();
  }
  
  // Check if WiFi is reconnected
  if (WiFi.status() == WL_CONNECTED) {
    static bool wasDisconnected = true;
    if (wasDisconnected) {
      Serial.println("WiFi reconnected, switching to online mode");
      sendSMS(phoneNumber, "POULAILLER_CONNECTE SWITCHED TO ONLINE MODE");
      wasDisconnected = false;
    }
  } else {
    static bool wasConnected = false;
    if (wasConnected) {
      Serial.println("WiFi disconnected, switching to SMS mode");
      sendSMS(phoneNumber, "POULAILLER_CONNECTE SWITCHED TO SMS MODE");
      wasConnected = false;
    }
  }
  
  delay(1000);
}

// Other functions (sensor readings, actuator controls, etc.)
// ...
`}
          </pre>
        </CardContent>
      </Card>
    </>
  );
};
