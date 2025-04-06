
import React, { useState } from 'react';
import { Settings, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/lib/i18n';

interface DeviceControlsProps {
  onDoorControl: (action: 'open' | 'close') => void;
  onFeederControl: (action: 'on' | 'off') => void;
  wifiSSID?: string;
  wifiPassword?: string;
  apiKey?: string;
}

export const DeviceControls: React.FC<DeviceControlsProps> = ({ 
  onDoorControl, 
  onFeederControl,
  wifiSSID = '',
  wifiPassword = '',
  apiKey = '' 
}) => {
  const { t } = useLanguage();
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2" size={18} />
            {t('deviceControls')}
          </CardTitle>
          <CardDescription>
            {t('controlESPDevices')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('doorControl')}</h3>
            <div className="flex items-center justify-between">
              <span>{t('automaticDoorControl')}</span>
              <Switch id="door-auto" defaultChecked={true} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="door-open-time">{t('openingTime')}</Label>
                <Input 
                  id="door-open-time" 
                  type="time" 
                  defaultValue="07:00" 
                />
              </div>
              <div>
                <Label htmlFor="door-close-time">{t('closingTime')}</Label>
                <Input 
                  id="door-close-time" 
                  type="time" 
                  defaultValue="19:00" 
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onDoorControl('open')}>
                {t('openDoor')}
              </Button>
              <Button variant="outline" onClick={() => onDoorControl('close')}>
                {t('closeDoor')}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t space-y-4">
            <h3 className="text-lg font-medium">{t('feederControl')}</h3>
            <div className="flex items-center justify-between">
              <span>{t('automaticFeeding')}</span>
              <Switch id="feeder-auto" defaultChecked={true} />
            </div>
            <div className="space-y-2">
              <Label>{t('feedingTimes')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input type="time" defaultValue="08:00" />
                <Input type="time" defaultValue="14:00" />
                <Input type="time" defaultValue="18:00" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onFeederControl('on')}>
                {t('activateFeeder')}
              </Button>
              <Button variant="outline" onClick={() => onFeederControl('off')}>
                {t('deactivateFeeder')}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button className="w-full">
              {t('applySettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="mr-2" size={18} />
            ESP32 {t('codeExample')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
{`
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "${wifiSSID || "WIFI_SSID"}";
const char* password = "${wifiPassword || "WIFI_PASSWORD"}";

// API configuration
String apiKey = "${apiKey || "YOUR_API_KEY"}";
const int serverPort = 80;

// Pins configuration
const int TEMPERATURE_SENSOR_PIN = 36;
const int HUMIDITY_SENSOR_PIN = 39;
const int WATER_LEVEL_SENSOR_PIN = 34;
const int FEED_LEVEL_SENSOR_PIN = 35;
const int DOOR_MOTOR_PIN1 = 25;
const int DOOR_MOTOR_PIN2 = 26;
const int DOOR_SENSOR_PIN = 27;
const int FEEDER_MOTOR_PIN = 32;

// Server to handle incoming requests
WiFiServer server(serverPort);

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(DOOR_MOTOR_PIN1, OUTPUT);
  pinMode(DOOR_MOTOR_PIN2, OUTPUT);
  pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP);
  pinMode(FEEDER_MOTOR_PIN, OUTPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("Connected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Start server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  // Check for clients
  WiFiClient client = server.available();
  
  if (client) {
    Serial.println("New client connected");
    String currentLine = "";
    String header = "";
    
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        header += c;
        
        if (c == '\\n') {
          if (currentLine.length() == 0) {
            // Headers ended, send response
            
            // Check if this is a valid API request
            if (header.indexOf("Authorization: Bearer " + apiKey) >= 0) {
              // Parse request
              if (header.indexOf("GET /api/ping") >= 0) {
                sendJsonResponse(client, true, "Pong");
              } 
              else if (header.indexOf("GET /api/sensors") >= 0) {
                sendSensorData(client);
              }
              else if (header.indexOf("POST /api/door") >= 0) {
                String action = "";
                if (header.indexOf("action\\":\\"open") >= 0) {
                  action = "open";
                  openDoor();
                } else if (header.indexOf("action\\":\\"close") >= 0) {
                  action = "close";
                  closeDoor();
                }
                sendJsonResponse(client, true, "Door " + action + " command sent");
              }
              else if (header.indexOf("POST /api/feeder") >= 0) {
                String action = "";
                if (header.indexOf("action\\":\\"on") >= 0) {
                  action = "on";
                  activateFeeder();
                } else if (header.indexOf("action\\":\\"off") >= 0) {
                  action = "off";
                  deactivateFeeder();
                }
                sendJsonResponse(client, true, "Feeder " + action + " command sent");
              }
              else {
                sendJsonResponse(client, false, "Invalid endpoint");
              }
            } else {
              client.println("HTTP/1.1 401 Unauthorized");
              client.println("Content-Type: application/json");
              client.println("Connection: close");
              client.println();
              client.println("{\\"success\\":false,\\"message\\":\\"Unauthorized\\"}");
            }
            
            break;
          } else {
            currentLine = "";
          }
        } else if (c != '\\r') {
          currentLine += c;
        }
      }
    }
    
    client.stop();
    Serial.println("Client disconnected");
  }
}

// Send JSON response
void sendJsonResponse(WiFiClient client, bool success, String message) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();
  client.print("{\\"success\\":");
  client.print(success ? "true" : "false");
  client.print(",\\"message\\":\\"");
  client.print(message);
  client.println("\\"}");
}

// Send sensor data
void sendSensorData(WiFiClient client) {
  float temperature = readTemperature();
  float humidity = readHumidity();
  int feedLevel = readFeedLevel();
  int waterLevel = readWaterLevel();
  String doorStatus = isDoorOpen() ? "open" : "closed";
  
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();
  
  client.print("{\\"success\\":true,\\"data\\":{");
  client.print("\\"temperature\\":");
  client.print(temperature);
  client.print(",\\"humidity\\":");
  client.print(humidity);
  client.print(",\\"feedLevel\\":");
  client.print(feedLevel);
  client.print(",\\"waterLevel\\":");
  client.print(waterLevel);
  client.print(",\\"doorStatus\\":\\"");
  client.print(doorStatus);
  client.println("\\"}}");
}

// Sensor readings
float readTemperature() {
  // Replace with actual sensor reading code
  int rawValue = analogRead(TEMPERATURE_SENSOR_PIN);
  return map(rawValue, 0, 4095, 10, 40); // Mock data
}

float readHumidity() {
  // Replace with actual sensor reading code
  int rawValue = analogRead(HUMIDITY_SENSOR_PIN);
  return map(rawValue, 0, 4095, 20, 90); // Mock data
}

int readFeedLevel() {
  // Replace with actual sensor reading code
  int rawValue = analogRead(FEED_LEVEL_SENSOR_PIN);
  return map(rawValue, 0, 4095, 0, 100); // Mock data
}

int readWaterLevel() {
  // Replace with actual sensor reading code
  int rawValue = analogRead(WATER_LEVEL_SENSOR_PIN);
  return map(rawValue, 0, 4095, 0, 100); // Mock data
}

bool isDoorOpen() {
  // Replace with actual sensor reading code
  return !digitalRead(DOOR_SENSOR_PIN); // Assuming LOW when door is open
}

// Actuator controls
void openDoor() {
  if (!isDoorOpen()) {
    digitalWrite(DOOR_MOTOR_PIN1, HIGH);
    digitalWrite(DOOR_MOTOR_PIN2, LOW);
    delay(2000); // Time to open door
    digitalWrite(DOOR_MOTOR_PIN1, LOW);
    digitalWrite(DOOR_MOTOR_PIN2, LOW);
  }
}

void closeDoor() {
  if (isDoorOpen()) {
    digitalWrite(DOOR_MOTOR_PIN1, LOW);
    digitalWrite(DOOR_MOTOR_PIN2, HIGH);
    delay(2000); // Time to close door
    digitalWrite(DOOR_MOTOR_PIN1, LOW);
    digitalWrite(DOOR_MOTOR_PIN2, LOW);
  }
}

void activateFeeder() {
  digitalWrite(FEEDER_MOTOR_PIN, HIGH);
}

void deactivateFeeder() {
  digitalWrite(FEEDER_MOTOR_PIN, LOW);
}
`}
          </pre>
        </CardContent>
      </Card>
    </>
  );
};
