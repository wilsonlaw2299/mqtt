# EMmqtt

EMmqtt (esp8266-mqtt) is a serial-to-Wi-Fi IoT module developed by emakefun based on Espressif's ESP8266 Wi‑Fi chipset. The module uses AT commands to configure wireless networking and is fully compatible with Espressif's official AT instruction set [V3.0.0](https://www.espressif.com/sites/default/files/documentation/4a-esp8266_at_instruction_set_cn.pdf). Additional MQTT commands have been added and wrapped into graphical blocks for Scratch/Mixly/MakeCode to support Arduino and micro:bit, making it easy to send and receive IoT messages and enabling simple remote control.

![image](image/index.png)

## Hardware Specifications

- Operating voltage: 5V
- UART baud rate: 9600 bps
- Wireless frequency: 2.4 GHz
- Connector: PH2.0-4Pin (G V TX RX)
- Wireless modes: IEEE 802.11 b/g/n
- SRAM: 160 KB
- External Flash: 4 MB
- Sleep current (typ): <240 mA
- Module size: 4 × 2.1 cm
- Mounting: M4 screws and nuts

## Module Features

- Built-in low-power 32‑bit CPU (can be used as an application processor)
- Built‑in TCP/IP protocol stack
- Security: WPA/WPA2/WPA2‑PSK
- Compatible with Espressif's official AT command set
- Supports standard MQTT and serial(TTL)→Wi‑Fi applications

## MQTT AT Command Extensions

### AT+MQTTUSERCFG — Configure MQTT user properties
Set command:
```
AT+MQTTUSERCFG=<LinkID>,<scheme>,<"client_id">,<"username">,<"password">,<cert_key_ID>,<CA_ID>,<"path">
```

Description:
Configure MQTT user properties.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- scheme: transport scheme
	- 1: MQTT over TCP
	- 2: MQTT over TLS (no certificate verification)
	- 3: MQTT over TLS (verify server certificate)
	- 4: MQTT over TLS (provide client certificate)
	- 5: MQTT over TLS (verify server certificate and provide client certificate)
	- 6: MQTT over WebSocket (based on TCP)
	- 7: MQTT over WebSocket Secure (based on TLS, no certificate verify)
	- 8: MQTT over WebSocket Secure (based on TLS, verify server certificate)
	- 9: MQTT over WebSocket Secure (based on TLS, provide client certificate)
	- 10: MQTT over WebSocket Secure (based on TLS, verify server certificate and provide client certificate)
- client_id: MQTT client ID (identifies client), max 256 bytes
- username: MQTT login username, max 64 bytes
- password: MQTT login password, max 64 bytes
- cert_key_ID: certificate ID (currently supports one cert set, use 0)
- CA_ID: CA ID (currently supports one CA set, use 0)
- path: resource path, max 32 bytes

### AT+MQTTCLIENTID — Set MQTT client ID
Set command:

```
AT+MQTTCLIENTID=<LinkID>,<"client_id">
```

Description:
Set the MQTT client ID; this overrides the `client_id` value from `AT+MQTTUSERCFG`. Use this to set a longer client ID if required.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- client_id: MQTT client ID, max 256 bytes

### AT+MQTTUSERNAME — Set MQTT login username
Set command:

```
AT+MQTTUSERNAME=<LinkID>,<"username">
```

Description:
Set the MQTT login username; this overrides the `username` value from `AT+MQTTUSERCFG`.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- username: MQTT username, max 256 bytes

### AT+MQTTPASSWORD — Set MQTT login password
Set command:

```
AT+MQTTPASSWORD=<LinkID>,<"password">
```

Description:
Set the MQTT login password; this overrides the `password` value from `AT+MQTTUSERCFG`.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- password: MQTT password, max 256 bytes

### AT+MQTTCONNCFG — Configure MQTT connection properties
Set command:

```
AT+MQTTCONNCFG=<LinkID>,<keepalive>,<disable_clean_session>,<"lwt_topic">,<"lwt_msg">,<lwt_qos>,<lwt_retain>
```

Description:
Configure MQTT connection options.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- keepalive: MQTT PING timeout in seconds, range [60, 7200], default 120
- disable_clean_session: clean session flag (0 or 1), default 0
- lwt_topic: Last Will topic, max 64 bytes
- lwt_msg: Last Will message, max 64 bytes
- lwt_qos: Last Will QoS (0, 1, 2), default 0
- lwt_retain: Last Will retain flag (0 or 1), default 0

### AT+MQTTCONN — Connect to MQTT broker
Set command:

```
AT+MQTTCONN=<LinkID>,<"host">,<port>,<reconnect>
```

Description:
Connect to the specified MQTT broker.

Response:

OK or ERROR

Query command:

#### AT+MQTTCONN?

Description:
Query the MQTT broker connection status.

Response:

```
AT+MQTTCONN:<LinkID>,<state>,<scheme>,<"host">,<port>,<"path">,<reconnect>
```

Parameters:

- LinkID: currently only 0 is supported
- host: MQTT broker hostname (max 128 bytes)
- port: MQTT broker port (max 65535)
- path: resource path (max 32 bytes)
- reconnect: whether to auto‑reconnect (1 uses more memory)
- state: connection status:
	- 0: not initialized
	- 1: MQTTUSERCFG set
	- 2: MQTTCONNCFG set
	- 3: disconnected
	- 4: connected
	- 5: connected but not subscribed
	- 6: connected and subscribed
- scheme: same scheme values as `AT+MQTTUSERCFG`

### AT+ALIYUN_MQTTCONN — Connect to Aliyun MQTT broker
Set command:

```
AT+ALIYUN_MQTTCONN=<"host">,<port>,<"ProductKey">,<"DeviceName">,<"DeviceSecret">
```

Description:
Connect to a specified Alibaba Cloud (Aliyun) MQTT broker.

Parameters:

- host: Aliyun MQTT broker hostname. See Aliyun domain format: [here](https://help.aliyun.com/document_detail/147356.html?spm=a2c4g.11186623.6.587.253b4006W32crS)
- port: MQTT broker port (max 65535), default 1883
- ProductKey: ProductKey assigned to the product on the IoT platform
- DeviceName: DeviceName (unique within the product) used for identification and authentication
- DeviceSecret: DeviceSecret used for authentication (paired with DeviceName)

Response:

OK or ERROR

### AT+MQTTPUB — Publish a message
Set command:

```
AT+MQTTPUB=<LinkID>,<"topic">,<"data">,<qos>,<retain>
```

Description:
Publish a string message (`data`) to a topic on the specified LinkID. For binary payloads use `AT+MQTTPUBRAW`.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- topic: topic to publish (max 64 bytes)
- data: message payload (must not contain \0); ensure the full AT command does not exceed the AT command length limit
- qos: QoS level (0, 1, 2), default 0
- retain: retain flag

### AT+MQTTPUBRAW — Publish binary data
Set command:

```
AT+MQTTPUBRAW=<LinkID>,<"topic">,<length>,<qos>,<retain>
```

Description:
Publish binary data of specified `length` to `topic` on the given LinkID.

Response:

OK or ERROR

After sending the command the module waits for `length` bytes of payload. Response will be:

- `+MQTTPUB:FAIL` or
- `+MQTTPUB:OK`

Parameters:

- LinkID: currently only 0 is supported
- topic: topic to publish (max 64 bytes)
- length: payload length (limited by available memory)
- qos: QoS level (0, 1, 2), default 0
- retain: retain flag

Note: If the AT port does not receive the specified `length` bytes, the module will wait; any data received during that time is treated as normal data.

### AT+MQTTSUB — Subscribe to a topic
Set command:

```
AT+MQTTSUB=<LinkID>,<"topic">,<qos>
```

Description:
Subscribe to a topic on the specified LinkID. This command may be used multiple times to subscribe to different topics.

Response:

OK or ERROR

When a subscribed message arrives, the module prints:

```
+MQTTSUBRECV:<LinkID>,<"topic">,<data_length>,data
```

If the topic is already subscribed, the log will print `ALREADY SUBSCRIBE`.

Query command:

#### AT+MQTTSUB?

Description:
List all subscribed topics for the MQTT connection.

Response example:

```
+MQTTSUB:<LinkID>,<state>,<"topic1">,<qos>
+MQTTSUB:<LinkID>,<state>,<"topic2">,<qos>
+MQTTSUB:<LinkID>,<state>,<"topic3">,<qos>
...
OK
```

Parameters:

- LinkID: currently only 0 is supported
- state: MQTT connection state (same values as `AT+MQTTCONN?`)
- topic*: subscribed topic
- qos: QoS for the subscription

### AT+MQTTUNSUB — Unsubscribe from a topic
Set command:

```
AT+MQTTUNSUB=<LinkID>,<"topic">
```

Description:
Unsubscribe a topic on the specified LinkID. Can be used multiple times for different topics.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported
- topic: topic to unsubscribe (max 64 bytes)

If the topic was not subscribed, the log will print `NO UNSUBSCRIBE`.

### AT+MQTTCLEAN — Close MQTT client connection
Set command:

```
AT+MQTTCLEAN=<LinkID>
```

Description:
Close the MQTT client for the specified LinkID and free internal resources.

Response:

OK or ERROR

Parameters:

- LinkID: currently only 0 is supported


### micro:bit MakeCode blocks
- Initialization block
![image](image/init.png)

In the initialization block set the TX (transmit) and RX (receive) pins, the Wi‑Fi SSID and password, and the MQTT server IP and port (default 1883). Click the `+` to configure additional options.

- Aliyun (Alibaba Cloud) connection block
![image](image/aliyun introduction.png)

Enter the Aliyun domain, `ProductKey`, `DeviceName`, and `DeviceSecret` obtained from the Aliyun IoT console. More details: [Aliyun device setup](https://help.aliyun.com/document_detail/73729.html?spm=a2c4g.11186623.6.591.52a8209fIv26gP)

- Subscribe block

![image](image/sub.png)

Use this block to subscribe to a topic and set how messages are received. The `topic` field is the topic name to subscribe to and `QoS` sets the requested delivery guarantee:

- QoS 0: At most once delivery (fire and forget).
- QoS 1: At least once delivery (may receive duplicates).
- QoS 2: Exactly once delivery.

- Publish block

![image](image/pub.png)

Use this block to publish a message to a topic; specify the topic and the message payload.

- Receive block

![image](image/rec.png)

Receive messages published to any topic you have subscribed to.

- HTTP mode configuration block

![image](image/http.png)

Set the HTTP server hostname (or IP) and port (default 80).

- HTTP GET request block

![image](image/get_method.png)

Send an HTTP GET request.


### MQTT mode demo

![image](image/last.png)

Description: Configure the module pins (e.g. P1 and P2) as TX/RX, set Wi‑Fi credentials and connect. Connect to the MQTT server (port 1883), subscribe to topic `test` with at least-once delivery, and on micro:bit button A publish `"hello world"` to `testtopic`. The micro:bit will also display messages received from the `test` topic.

### HTTP mode demo

![image](image/http_example.png)

Description: Configure TX/RX pins and Wi‑Fi, connect to an HTTP server (port 80). On micro:bit button A the module sends a GET request `test` and displays the response on the micro:bit LED matrix.


### Aliyun MQTT mode demo
![image](image/aliyun.jpg)

Description: Configure the module pins (e.g. P1 and P2) as TX/RX, set Wi‑Fi credentials and connect. Connect to the Aliyun MQTT server (port 1883). On micro:bit button A the module publishes "helloworld" to topic `/a1gVfAJo2pv/emakefun/user/update`. You can view the sent message and status in Aliyun Log Service. The module also receives messages from `/a1gVfAJo2pv/emakefun/user/get` and displays them on the micro:bit.
	