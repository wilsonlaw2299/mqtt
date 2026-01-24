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

    // 新增：TLS scheme，默认 2 (TLS 无服务器证书验证) —— 最适合旧 ESP8266 连接 HiveMQ
    let EMMQTT_SCHEME = 2  // 1: 普通 TCP, 2: TLS 无验证 (推荐 HiveMQ 8883), 3: TLS 验证服务器

    let HTTP_RESPONSE_STR = EMMQTT_STR_TYPE_IS_NONE;
    let HTTP_CONNECT_STATUS = EMMQTT_BOOL_TYPE_IS_FALSE;
    let MQTT_TOPIC: any = EMMQTT_STR_TYPE_IS_NONE
    let MQTT_MESSGE: any = EMMQTT_STR_TYPE_IS_NONE
    let HTTP_RESULT = EMMQTT_STR_TYPE_IS_NONE;
    
    let EMMQTT_ANSWER_CMD = EMMQTT_STR_TYPE_IS_NONE
    let EMMQTT_ANSWER_CONTENT = EMMQTT_STR_TYPE_IS_NONE
	//阿里云三要素
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
    //% block="WIFI连接 | 引脚设置: | 接收数据 TX: %receive| 发送数据 RX: %send | WIFI: | 名称: %SSID| 密码: %PASSWORD 启动连接"
    //% subcategory="WIFI连接"
    export function em_wifi_connect(/*serial*/receive: SerialPin, send: SerialPin,
        /*wifi*/SSID: string, PASSWORD: string
        ): void {
        EMMQTT_SERIAL_TX = send;
        EMMQTT_SERIAL_RX = receive;
        MQTT_SSID = SSID;
        MQTT_SSIDPWD = PASSWORD;
        emmqtt_serial_init();
        emqtt_connect_wifi();
        basic.pause(10000);  // 增加等待，确保 Wi-Fi 连接成功
    }

    // 新增：允许手动设置 TLS 模式（默认已是 2，HiveMQ 推荐）
    //% blockId=em_mqtt_set_tls_scheme
    //% block="MQTT 设置 TLS 模式 %scheme (1=普通TCP 1883, 2=TLS无验证 8883推荐, 3=TLS验证服务器 8883)"
    //% scheme.min=1 scheme.max=3 scheme.defl=2
    //% weight=104
    //% subcategory="MQTT模式"
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
    //% block="MQTT连接 | 服务器: %serverIp| 端口: %serverPort || 客户端ID: %clientId | 用户名: %username | 密码: %clientPwd"
    //% subcategory="MQTT模式"
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
     * 阿里云连接（保持原功能，如果不用可忽略）
     */
    //% weight=101
    //% blockId=em_mqtt_aliyun_connect
    //% block="MQTT模块连接阿里云服务初始设置 | 阿里云服务器: %serverIp| 端口: %serverPort| 产品key: %productKey|设备名称: %deviceName|设备秘钥: %deviceSecret  || 客户端ID: %clientId | 客户端用户名: %username | 客户端密码: %clientPwd"
    //% subcategory="ALIYUNMQTT模式"
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

    // 标准 MQTT 连接（使用 TLS scheme=2）
    function emmqtt_connect_mqtt(): void {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        // scheme 从变量读取，默认 2；keepalive 120 秒；clean session 1（新会话）
        serial.writeString("AT+MQTTUSERCFG=0," + EMMQTT_SCHEME + ",\"" + MQTT_CLIENT_ID + "\",\"" + MQTT_CLIENT_NAME + "\",\"" + MQTT_CLIENT_PASSWORD + "\",120,1,\"\"\r\n");
        basic.pause(2000);
        // 自动重连开启 (1)
        serial.writeString("AT+MQTTCONN=0,\"" + MQTT_SERVER_IP + "\"," + MQTT_SERVER_PORT + ",1\r\n");
        basic.pause(5000);
    }

    // 阿里云 MQTT 连接（同样应用 TLS scheme）
    function emmqtt_connect_aliyun_mqtt(): void {
        if (!EMMQTT_SERIAL_INIT) {
            emmqtt_serial_init()
        }
        // 这里假设阿里云也用相同配置（如果需要特殊签名，可再调整）
        serial.writeString("AT+MQTTUSERCFG=0," + EMMQTT_SCHEME + ",\"" + MQTT_CLIENT_ID + "\",\"" + MQTT_CLIENT_NAME + "\",\"" + MQTT_CLIENT_PASSWORD + "\",120,1,\"\"\r\n");
        basic.pause(2000);
        serial.writeString("AT+MQTTCONN=0,\"" + MQTT_SERVER_IP + "\"," + MQTT_SERVER_PORT + ",1\r\n");
        basic.pause(5000);
    }

    //% blockId=mqtt_publish_basic block="MQTT向话题(TOPIC) %topic 发送数据 %data"
    //% weight=100
    //% subcategory="MQTT模式"
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
    //% blockId=mqtt_subscribe block="MQTT订阅话题 %topic|QOS %qos"
    //% weight=101
    //% subcategory="MQTT模式"
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
    //% blockId=em_mqtt_get_topic_message block="MQTT获取主题 %topic 数据"
    //% weight=100
    //% subcategory="MQTT模式"
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