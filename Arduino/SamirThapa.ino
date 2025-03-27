#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// GPS Module RX pin to NodeMCU D1
// GPS Module TX pin to NodeMCU D2
const int RXPin = 4, TXPin = 5;
SoftwareSerial neo6m(RXPin, TXPin);
TinyGPSPlus gps;

// RFID pins
#define SS_PIN D4    // Slave select pin for RFID
#define RST_PIN D0   // Reset pin for RFID

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

// Wi-Fi credentials
const char* ssid = "HCK Connect";
const char* password = "#erald77";

// Backend server URL
const char* serverUrlGPS = "http://192.168.1.73:8000/gps";  // GPS endpoint
const char* serverUrlRFID = "http://192.168.1.73:8000/rfid";  // RFID endpoint

unsigned long lastGPSSendTime = 0;
unsigned long gpsInterval = 5000;

void setup() {
  Serial.begin(115200);
  Serial.println();
  
  neo6m.begin(9600); // Buad rate for GPS
  
  // Initialize RFID reader
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("RFID Reader Initialized");
  
  // Connect to Wi-Fi
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read GPS data
  smartdelay_gps(1000);
  
  // If GPS location is valid and it's time to send GPS data
  if (gps.location.isValid() && millis() - lastGPSSendTime >= gpsInterval) {
    String latitude = String(gps.location.lat(), 6);
    String longitude = String(gps.location.lng(), 6); 
    Serial.print("LAT:  ");
    Serial.println(latitude);  
    Serial.print("LONG: ");
    Serial.println(longitude);

    // Send GPS data to backend
    sendGPSDataToBackend(latitude, longitude);
    lastGPSSendTime = millis();  // Update the last send time
  }

  // RFID Card Scanning
  if (mfrc522.PICC_IsNewCardPresent()) {
    if (mfrc522.PICC_ReadCardSerial()) {
      String rfidData = getRFIDData();
      Serial.print("RFID Tag: ");
      Serial.println(rfidData);
      
      // Send RFID data to backend immediately
      sendRFIDDataToBackend(rfidData);
      
      mfrc522.PICC_HaltA();  // Halt the RFID reader
    }
  }
}

// Function to send GPS data to the backend server
void sendGPSDataToBackend(String latitude, String longitude) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;

    // Prepare JSON payload with GPS data
    String payload = "{\"latitude\": \"" + latitude + 
                     "\", \"longitude\": \"" + longitude + "\"}";

    // Send POST request to the server
    http.begin(client, serverUrlGPS);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(payload);

    // Handle server response
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.println("Error sending data: " + String(httpResponseCode));
    }

    http.end(); 
  } else {
    Serial.println("Wi-Fi disconnected, reconnecting...");
    WiFi.begin(ssid, password);
  }
}

// Function to send RFID data to the backend server
void sendRFIDDataToBackend(String rfidData) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;

    // Prepare JSON payload with RFID data
    String payload = "{\"rfid\": \"" + rfidData + "\"}";

    // Send POST request to the server
    http.begin(client, serverUrlRFID);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(payload);

    // Handle server response
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.println("Error sending data: " + String(httpResponseCode));
    }

    http.end();  
  } else {
    Serial.println("Wi-Fi disconnected, reconnecting...");
    WiFi.begin(ssid, password);
  }
}

// Function to read RFID data
String getRFIDData() {
  String rfid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfid += String(mfrc522.uid.uidByte[i], HEX);
  }
  return rfid;
}

void smartdelay_gps(unsigned long ms) {
  unsigned long start = millis();
  do {
    while (neo6m.available()) {
      gps.encode(neo6m.read());
    }
  } while (millis() - start < ms);
}
