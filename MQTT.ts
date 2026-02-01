const EMMQTT_BOOL_TYPE_IS_TRUE = true
const EMMQTT_BOOL_TYPE_IS_FALSE = false
const EMMQTT_ERROR_TYPE_IS_SUCCE = 0
const EMMQTT_ERROR_TYPE_IS_ERR = 1
const EMMQTT_ERROR_TYPE_IS_WIFI_CONNECT_TIMEOUT = -1
const EMMQTT_ERROR_TYPE_IS_WIFI_CONNECT_FAILURE = -2
const EMMQTT_ERROR_TYPE_IS_MQTT_CONNECT_TIMEOUT = -4
const EMMQTT_ERROR_TYPE_IS_MQTT_CONNECT_FAILURE = -5
const EMMQTT_STR_TYPE_IS_NONE = ""


/**
 * mqtt implementation method.
 */
//% weight=10 color=#008B00 icon="\uf1eb" block="MQTT"
namespace MQTT {
    let rev: string;
    //serial
    let EMMQTT_SERIAL_INIT = EMMQTT_BOOL_TYPE_IS_FALSE
    let EMMQTT_SERIAL_TX = SerialPin.P2
    let EMMQTT_SERIAL_RX = SerialPin.P1
    let MQTT_SSID = EMMQTT_STR_TYPE_IS_NONE;
    let MQTT_SSIDPWD = EMMQTT_STR_TYPE_IS_NONE;
    let MQTT_CLIENT_ID = EMMQTT_STR_TYPE_IS_NONE;
    let MQTT_CLIENT_NAME = EMMQTT_STR_TYPE_IS_NONE;
    let MQTT_CLIENT_PASSWORD = EMMQTT_STR_TYPE_IS_NONE;
    let MQTT_SERVER_IP = EMMQTT_STR_TYPE_IS_NONE;
    let MQTT_SERVER_PORT = 1883;

    // Added: TLS scheme, default 2 (TLS without server certificate verification) — best for older ESP8266 connecting to HiveMQ
    let EMMQTT_SCHEME = 2  // 1: plain TCP, 2: TLS no-verify (recommended for HiveMQ 8883), 3: TLS verify server certificate

    let HTTP_RESPONSE_STR = EMMQTT_STR_TYPE_IS_NONE; 
    let HTTP_CONNECT_STATUS = EMMQTT_BOOL_TYPE_IS_FALSE;
    let MQTT_TOPIC: any = EMMQTT_STR_TYPE_IS_NONE
    let MQTT_MESSGE: any = EMMQTT_STR_TYPE_IS_NONE
    let HTTP_RESULT = EMMQTT_STR_TYPE_IS_NONE;
    
    let EMMQTT_ANSWER_CMD = EMMQTT_STR_TYPE_IS_NONE
    let EMMQTT_ANSWER_CONTENT = EMMQTT_STR_TYPE_IS_NONE
	// Aliyun credentials (productKey, deviceName, deviceSecret)
	let EMMQTT_ALIYUN_PRODUCTKEY = EMMQTT_STR_TYPE_IS_NONE
	let EMMQTT_ALIYUN_DEVICENAME = EMMQTT_STR_TYPE_IS_NONE
	let EMMQTT_ALIYUN_DEVICESECRET = EMMQTT_STR_TYPE_IS_NONE
    // animation
    let EMMQTT_WIFI_ICON = 1
    let EMMQTT_MQTT_ICON = 1

    const mqttSubscribeHandlers: { [topic: string]: (message: string) => void } = {}

    export class PacketaMqtt {
        public message: string;
    }

    //% advanced=true shim=Emmqtt::emmqttClearRxBuffer
    function emmqttClearRxBuffer(): void {
        return
    }

    //% advanced=true shim=Emmqtt::emmqttClearTxBuffer
    function emmqttClearTxBuffer(): void {
        return
    }

    function emmqttWriteString(text: string): void {
        serial.writeString(text)
    }

    function Em_mqtt_icon_display(): void {
        switch (EMMQTT_MQTT_ICON) {
            case 1: {
                basic.clearScreen()
                led.plot(4, 0)
                EMMQTT_MQTT_ICON += 1
            } break;
            case 2: {
                led.plot(2, 0)
                led.plot(2, 1)
                led.plot(3, 2)
                led.plot(4, 2)
                EMMQTT_MQTT_ICON += 1
            } break;
            case 3: {
                led.plot(0, 0)
                led.plot(0, 1)
                led.plot(0, 2)
                led.plot(1, 3)
                led.plot(2, 4)
                led.plot(3, 4)
                led.plot(4, 4)
                EMMQTT_MQTT_ICON = 1
            } break;
        }
    }

    function emmqtt_serial_init(): void {
        let item = null;
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        serial.redirect(
            EMMQTT_SERIAL_TX,
            EMMQTT_SERIAL_RX,
            BaudRate.BaudRate9600
        )
        serial.setTxBufferSize(128);
        serial.setRxBufferSize(128);
        item = serial.readString()
        EMMQTT_SERIAL_INIT = EMMQTT_BOOL_TYPE_IS_TRUE
        emmqttClearRxBuffer();
        emmqttClearTxBuffer();
    }

    /**
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param receive to receive ,eg: SerialPin.P1
     * @param send to send ,eg: SerialPin.P2
    */
    //% weight=103
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=em_mqtt_setup
    //% block="Wi‑Fi connect | Pins: RX %receive | TX %send | SSID: %SSID | Password: %PASSWORD | Start"
    //% subcategory="Wi‑Fi"
    export function em_wifi_connect(/*serial*/receive: SerialPin, send: SerialPin,
        /*wifi*/SSID: string, PASSWORD: string
        ): void {
        EMMQTT_SERIAL_TX = send;
        EMMQTT_SERIAL_RX = receive;
        MQTT_SSID = SSID;
        MQTT_SSIDPWD = PASSWORD;
        emmqtt_serial_init();
        emqtt_connect_wifi();
        basic.pause(10000);  // add wait to ensure Wi‑Fi connects successfully
    }

    // Added: allow manual TLS scheme setting (default is 2, recommended for HiveMQ)
    //% blockId=em_mqtt_set_tls_scheme
    //% block="MQTT set TLS scheme %scheme (1=TCP 1883, 2=TLS no-verify (8883 recommended), 3=TLS verify server 8883)"
    //% scheme.min=1 scheme.max=3 scheme.defl=2
    //% weight=104
    //% subcategory="MQTT mode"
    export function em_mqtt_set_tls_scheme(scheme: number): void {
        EMMQTT_SCHEME = scheme;
    }

    /**
     * 
     * @param serverIp to serverIp ,eg: "yourServerIp"
     * @param serverPort to serverPort ,eg: 1883 
     * @param clientId to clientId ,eg: "car"
     * @param username to username ,eg: "microbit"
     * @param clientPwd to clientPwd ,eg: "Ab12345678"
    */
    //% weight=102
    //% blockId=em_mqtt_connect
    //% block="MQTT connect | Server: %serverIp | Port: %serverPort || Client ID: %clientId | Username: %username | Password: %clientPwd"
    //% subcategory="MQTT mode"
    export function em_mqtt_connect(/*mqtt*/ serverIp: string, serverPort: number, clientId?: string, username?: string, clientPwd?: string
        ): void {
        MQTT_CLIENT_ID = clientId || "default_client";
        MQTT_CLIENT_NAME = username || "";
        MQTT_CLIENT_PASSWORD = clientPwd || "";
        MQTT_SERVER_IP = serverIp;
        MQTT_SERVER_PORT = serverPort;
        emmqtt_connect_iot("mqtt");
    }

    /**
     * Aliyun connection (preserves original behavior; ignore if unused)
     */
    //% weight=101
    //% blockId=em_mqtt_aliyun_connect
    //% block="MQTT module Aliyun setup | Aliyun Server: %serverIp | Port: %serverPort | Product key: %productKey | Device name: %deviceName | Device secret: %deviceSecret || Client ID: %clientId | Client username: %username | Client password: %clientPwd"
    //% subcategory="ALIYUN MQTT mode"
    export function em_mqtt_aliyun_connect(/*mqtt*/ serverIp: string, serverPort: number, productKey: string, deviceName: string, deviceSecret: string, clientId?: string, username?: string, clientPwd?: string
        ): void {
        MQTT_CLIENT_ID = clientId || "default_client";
        MQTT_CLIENT_NAME = username || "";
        MQTT_CLIENT_PASSWORD = clientPwd || "";
        MQTT_SERVER_IP = serverIp;
        MQTT_SERVER_PORT = serverPort;
		
		EMMQTT_ALIYUN_PRODUCTKEY = productKey;
		EMMQTT_ALIYUN_DEVICENAME = deviceName;
		EMMQTT_ALIYUN_DEVICESECRET = deviceSecret;
        emmqtt_connect_iot("aliyun");
    }

    function emmqtt_connect_iot(type: string): void {
        if (type == "mqtt") {
            emmqtt_connect_mqtt();
        } else if (type == "aliyun") {
            emmqtt_connect_aliyun_mqtt();
        }
    }

    // Standard MQTT connection (uses TLS scheme=2)
    function emmqtt_connect_mqtt(): void {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        // scheme read from variable (default 2); keepalive 120s; clean session 1 (new session)
        serial.writeString("AT+MQTTUSERCFG=0," + EMMQTT_SCHEME + ",\"" + MQTT_CLIENT_ID + "\",\"" + MQTT_CLIENT_NAME + "\",\"" + MQTT_CLIENT_PASSWORD + "\",120,1,\"\"\r\n");
        basic.pause(2000);
        // auto reconnect enabled (1)
        serial.writeString("AT+MQTTCONN=0,\"" + MQTT_SERVER_IP + "\"," + MQTT_SERVER_PORT + ",1\r\n");
        basic.pause(5000);
    }

    // Aliyun MQTT connection (also uses TLS scheme)
    function emmqtt_connect_aliyun_mqtt(): void {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        // Assume Aliyun uses the same configuration (adjust if special signing is needed)
        serial.writeString("AT+MQTTUSERCFG=0," + EMMQTT_SCHEME + ",\"" + MQTT_CLIENT_ID + "\",\"" + MQTT_CLIENT_NAME + "\",\"" + MQTT_CLIENT_PASSWORD + "\",120,1,\"\"\r\n");
        basic.pause(2000);
        serial.writeString("AT+MQTTCONN=0,\"" + MQTT_SERVER_IP + "\"," + MQTT_SERVER_PORT + ",1\r\n");
        basic.pause(5000);
    }

    //% blockId=mqtt_publish_basic block="MQTT publish to topic %topic data %data"
    //% weight=100
    //% subcategory="MQTT mode"
    export function em_mqtt_publish_basic(topic: string, data: any): void {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        topic = topic.replace(",", "");
        serial.writeString("AT+MQTTPUB=0,\"" + topic + "\",\"" + data + "\",1,0\r\n");
        basic.pause(200);
    }

    /**
     * Set MQTT subscribe
     */
    //% blockId=mqtt_subscribe block="MQTT subscribe topic %topic | QOS %qos"
    //% weight=101
    //% subcategory="MQTT mode"
    export function em_mqtt_subscribe(topic: string, qos: number): void {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        topic = topic.replace(",", "");
        serial.writeString("AT+MQTTSUB=0,\"" + topic + "\"," + qos + "\r\n");
        basic.pause(500);
    }

    /**
     * MQTT message handler
     */
    //% blockId=em_mqtt_get_topic_message block="MQTT get topic %topic data"
    //% weight=100
    //% subcategory="MQTT mode"
    export function em_mqtt_get_topic_message(topic: string,  handler: (message: string) => void) {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        mqttSubscribeHandlers[topic] = handler;
    }

    function emqtt_connect_wifi(): void {
		atReset();
        serial.writeString("AT+CWMODE=3\r\n");
        basic.pause(100);
        serial.writeString("AT+CWJAP=\"" + MQTT_SSID + "\",\"" + MQTT_SSIDPWD + "\"\r\n");
        basic.pause(7000);
    }
	
	function atReset(): void {
		for (let i = 0; i < 3; i++) {
			serial.writeString("AT\r\n");
			basic.pause(1000);
		}
        serial.writeString("AT+CWQAP\r\n");
		serial.writeString("AT+RST\r\n");
		serial.writeString("ATE0\r\n");
		serial.writeString("AT+CWAUTOCONN=0\r\n");
		serial.writeString("AT+CWMODE=1\r\n");
		basic.pause(200);
		serial.writeString("AT+CIPMUX=1\r\n");
		serial.writeString("AT+CIPDINFO=1\r\n");
		serial.writeString("AT+CWAUTOCONN=0\r\n");
		serial.writeString("AT+CWDHCP=1,1\r\n");
		basic.pause(200);
	}
}