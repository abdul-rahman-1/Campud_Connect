#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <ADS1X15.h>

// Wi-Fi Credentials
const char* ssid = "IU_WIFI";
const char* password = "";

// Initialize WebServer on port 80
WebServer server(80);

// Initialize ADS1115 at I2C address 0x48
ADS1115 ADS(0x48);

// Variable to store the unique MAC address for identification
String macAddress = "";

void setup() {
    Serial.begin(115200);

    // Initialize I2C with SDA on 32 and SCL on 33
    Wire.begin(32, 33);

    // Initialize the ADS1115
    if (!ADS.begin()) {
        Serial.println("ADS1115 not connected!");
        while (1); // Halt if not connected
    }

    // Set gain to ±6.144V range
    ADS.setGain(0);

    // Connect to Wi-Fi
    Serial.print("Connecting to Wi-Fi");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    macAddress = WiFi.macAddress();

    Serial.println("\n--- Connected! ---");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("MAC Address: ");
    Serial.println(macAddress);

    // Define API endpoint
    server.on("/data", handleDataRequest);

    // Start server
    server.begin();
    Serial.println("HTTP server started");
}

void loop() {
    // Handle incoming client requests
    server.handleClient();
}

// Function to read sensor and return JSON response
void handleDataRequest() {
    int16_t raw = ADS.readADC(0);
    float voltage = ADS.toVoltage(raw);

    // Sensor calibration:
    // 0.5V = 0 MPa
    // 4.5V = 1.2 MPa
    float pressure = (voltage - 0.5) * (1.2 / 4.0);

    if (pressure < 0) {
        pressure = 0;
    }

    // Build JSON response
    String jsonResponse = "{";
    jsonResponse += "\"mac_address\": \"" + macAddress + "\", ";
    jsonResponse += "\"voltage_V\": " + String(voltage, 3) + ", ";
    jsonResponse += "\"pressure_MPa\": " + String(pressure, 3);
    jsonResponse += "}";

    // Send response
    server.send(200, "application/json", jsonResponse);
}