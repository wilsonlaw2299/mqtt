# EMmqtt

esp8266‑mqtt is an ESP8266‑based serial-to‑Wi‑Fi IoT module by emakefun. The module uses AT commands (compatible with Espressif's AT instruction set — V3.0.0) and adds MQTT extensions. It is packaged as blocks for Scratch, Mixly and MakeCode and supports Arduino and micro:bit — making it easy to send and receive IoT messages and control devices remotely.

![image](image/index.png)

## Hardware specifications
- Operating voltage: 5 V
- Serial interface rate: 9600 bps
- Wireless frequency: 2.4 GHz
- Connector: PH2.0‑4Pin (G V RX TX)
- Wireless modes: IEEE 802.11 b/g/n
- SRAM: 160 KB
- External Flash: 4 MB
- Low power support: < 240 mA
- Module dimensions: 4 × 2.1 cm
- Mounting: M4 screw and nut

## Key features

- 内置低功率 32 位 CPU：可以兼作应用处理器
- 内置协议：TCP/IP 协议栈
- 加密类型：WPA WPA2/WPA2–PSK
- 支持乐鑫官方AT标准指令集
- 支持连接标准MQTT协议和TTL串口到无线的应用

## MQTT — Extended AT commands

### AT+MQTTUSERCFG — Configure MQTT user properties
Command:
AT+MQTTUSERCFG=<LinkID>,<scheme>,<"client_id">,<"username">,<"password">,<cert_key_ID>,<CA_ID>,<"path">

Purpose:
Set MQTT user configuration.

Response:

OK or ERROR

Parameters:

LinkID: 当前只支持 0
scheme:
1: MQTT over TCP
2: MQTT over TLS(no certificate verify)
3: MQTT over TLS(verify server certificate)
4: MQTT over TLS(provide client certificate)
5: MQTT over TLS(verify server certificate and provide client certificate)
6: MQTT over WebSocket(based on TCP)
7: MQTT over WebSocket Secure(based on TLS, no certificate verify)
8: MQTT over WebSocket Secure(based on TLS, verify server certificate)
9: MQTT over WebSocket Secure(based on TLS, provide client certificate)
10: MQTT over WebSocket Secure(based on TLS, verify server certificate and provide client certificate)
client_id: 对应 MQTT client ID, 用于标志 client 身份, 最长 256 字节
- username: MQTT broker username, max 64 bytes
- password: MQTT broker password, max 64 bytes
- cert_key_ID: certificate ID (currently supports one cert set — use 0)
- CA_ID: CA ID (currently supports one CA — use 0)
path: 资源路径, 最长 32 字节

### AT+MQTTCLIENTID — Configure MQTT client ID
Command:

AT+MQTTCLIENTID=<LinkID><"client_id">

Purpose:
Set client ID (overrides client_id from AT+MQTTUSERCFG).
用户可通过 AT+MQTTCLIENTID 设置较长的 clientID.

响应:

OK或ERROR

参数说明:

LinkID: 当前只支持 0
client_id: 对应 MQTT client ID, 用于标志 client 身份, 最长 256 字节

### AT+MQTTUSERNAME — Configure MQTT username
设置指令:

AT+MQTTUSERNAME=<LinkID><"username">

功能:
设置 MQTT 登录用户名, 将会覆盖 AT+MQTTUSERCFG 中 username 参数,
用户可通过 AT+MQTTUSERNAME 设置较长的用户名.

响应:

OK或ERROR

参数说明:

LinkID: 当前只支持 0
username: 对应 MQTT username, 用于登录 MQTT broker, 最长 256 字节

### AT+MQTTPASSWORD — Configure MQTT password
设置指令:

AT+MQTTPASSWORD=<LinkID><"password">

功能:
设置 MQTT 登录密码, 将会覆盖 AT+MQTTUSERCFG 中 password 参数,
用户可通过 AT+MQTTPASSWORD 设置较长的密码.

响应:

OK或ERROR

参数说明:

LinkID: 当前只支持 0
password: 对应 MQTT password, 用于登录 MQTT broker, 最长 256 字节

### AT+MQTTCONNCFG — Configure MQTT connection properties
设置指令:

AT+MQTTCONNCFG=<LinkID>,<keepalive>,<disable_clean_session>,<"lwt_topic">,<"lwt_msg">,<lwt_qos>,<lwt_retain>

功能:
设置 MQTT 连接配置

响应:

OK或ERROR

参数说明:

LinkID: 当前只支持 0
- keepalive: MQTT PING timeout in seconds, range [60, 7200], default 120
- disable_clean_session: clean session flag (0 or 1), default 0
- lwt_topic: Last Will topic, max 64 bytes
- lwt_msg: Last Will message, max 64 bytes
- lwt_qos: Last Will QoS (0, 1, 2), default 0
- lwt_retain: Last Will retain (0 or 1), default 0

### AT+MQTTCONN — Connect to MQTT broker
Command:
AT+MQTTCONN=<LinkID>,<"host">,<port>,<reconnect>

Purpose:
Connect to the specified MQTT broker.

Response:
OK or ERROR

Query:
AT+MQTTCONN?

Purpose:
Query the MQTT broker connection status.

响应:

AT+MQTTCONN:<LinkID>,<state>,<scheme><"host">,<port>,<"path">,<reconnect>

参数说明:

LinkID: 当前只支持 0
- host: MQTT broker hostname, max 128 bytes
- port: MQTT broker port (1–65535)
- path: resource path, max 32 bytes
- reconnect: auto‑reconnect (1 uses additional memory)
state: MQTT 当前状态, 状态说明如下:
0: 连接未初始化
1: 已设置 MQTTUSERCFG
2: 已设置 MQTTCONNCFG
3: 连接已断开
4: 已建立连接
5: 已连接, 但未订阅 topic
6: 已连接, 已订阅过 topic
scheme:
1: MQTT over TCP
2: MQTT over TLS(no certificate verify)
3: MQTT over TLS(verify server certificate)
4: MQTT over TLS(provide client certificate)
5: MQTT over TLS(verify server certificate and provide client certificate)
6: MQTT over WebSocket(based on TCP)
7: MQTT over WebSocket Secure(based on TLS, no certificate verify)
8: MQTT over WebSocket Secure(based on TLS, verify server certificate)
9: MQTT over WebSocket Secure(based on TLS, provide client certificate)
10: MQTT over WebSocket Secure(based on TLS, verify server certificate and provide client certificate)

### AT+ALIYUN_MQTTCONN?

设置指令:

AT+ALIYUN_MQTTCONN=<"host">,<port>,<"ProductKey">,<"DeviceName">,<"DeviceSecret">

功能:
连接指定的阿里云MQTT broker

Parameters:
- host: Alibaba Cloud broker domain (see Alibaba docs link)
- port: broker port (default 1883)
- ProductKey: product-level identifier issued by Alibaba Cloud
- DeviceName: unique device identifier within the product
- DeviceSecret: device secret used for authentication (paired with DeviceName)

响应:

OK或ERROR

### AT+MQTTPUB
设置指令:

AT+MQTTPUB=<LinkID>,<"topic">,<"data">,<qos>,<retain>

功能:
在 LinkID上通过 topic 发布数据 data, 其中 data 为字符串消息, 若要发布二进制,请使用 AT+MQTTPUBRAW

响应:

OK或ERROR

参数说明:

LinkID: 当前只支持 0
topic: 发布主题, 最长 64 字节
data: 发布消息, data 不能包含 \0, 请确保整条 AT+MQTTPUB 不超过 AT 指令的最大长度限制
qos: 发布服务质量, 参数可选 0,1,2, 默认为 0
retain: 发布 retain

### AT+MQTTPUBRAW
设置指令:

AT+MQTTPUBRAW=<LinkID>,<"topic">,<length>,<qos>,<retain>

功能:
在 LinkID 上通过 topic 发布数据 data, 其中 data 为二进制数据

响应:

OK或ERROR

等待用户输入 length 大小数据, 之后响应如下:

+MQTTPUB:FAIL

或

+MQTTPUB:OK

参数说明:

LinkID: 当前只支持 0
topic: 发布主题, 最长 64 字节
length: 要发布消息长度, 长度受限于当前可用内存
qos: 发布服务质量, 参数可选 0,1,2, 默认为 0
retain: 发布 retain
AT port 未收到指定 length 长度的数据, 将一直等待, 在此期间接收到的数据都会当成普通数据

### AT+MQTTSUB
设置指令:

AT+MQTTSUB=<LinkID>,<"topic">,<qos>

功能:
订阅指定连接的 MQTT 主题, 可重复多次订阅不同 topic

响应:

OK或ERROR

当收到对应主题订阅的 MQTT 消息时, 将按照如下格式打印消息内容

+MQTTSUBRECV:<LinkID>,<"topic">,<data_length>,data

如果订阅已订阅过的主题, 仍无条件向 MQTT broker 订阅, Log 口打印 ALREADY SUBSCRIBE

查询指令:

### AT+MQTTSUB?

### 功能:
查询 MQTT 所有连接上已订阅的 topic

响应:

+MQTTSUB:<LinkID>,<state>,<"topic1">,<qos>
+MQTTSUB:<LinkID>,<state>,<"topic2">,<qos>
+MQTTSUB:<LinkID>,<state>,<"topic3">,<qos>
...
OK
1
2
3
4
5
或ERROR

参数说明:

LinkID: 当前只支持 0
state: MQTT 当前状态, 状态说明如下:
0: 连接未初始化
1: 已设置 MQTTUSERCFG
2: 已设置 MQTTCONNCFG
3: 连接已断开
4: 已建立连接
5: 已连接, 但未订阅 topic
6: 已连接, 已订阅过 topic
topic*: 订阅过的主题
qos: 订阅过的 QoS

### AT+MQTTUNSUB
设置指令:

AT+MQTTUNSUB=<LinkID>,<"topic">

功能:
取消订阅指定连接的 MQTT 主题, 可多次取消不同订阅 topic

响应:

OK或ERROR

参数说明:

LinkID: 当前只支持 0
topic: 取消订阅主题, 最长 64 字节
如果取消未订阅的主题, 仍无条件向 MQTT broker 取消订阅, Log 口打印 NO UNSUBSCRIBE

### AT+MQTTCLEAN
设置指令:

AT+MQTTCLEAN=<LinkID>

功能:
关闭 MQTT Client 为 LinkID 的连接, 并释放内部占用的资源

响应:

OK或者ERROR

参数说明:

LinkID: 当前只支持 0


### microbit makecode块
- Initialization block: set TX/RX pins, Wi‑Fi SSID/password, MQTT server IP and port (default 1883). Use the "+" to set extra options.
  ![image](image/init.png)

- Alibaba Cloud block: enter the domain, ProductKey, DeviceName and DeviceSecret (see Alibaba docs).
  ![image](image/aliyun introduction.png)
- 消息订阅块

![image](image/sub.png)

- Subscribe block: specify topic and QoS (0/1/2). QoS behavior:
  - 0: at most once (no retries)
  - 1: at least once (retries may cause duplicates)
  - 2: exactly once (no duplicates)
  
- Publish block: specify topic and message.
  ![image](image/pub.png)

- Receive block: reads messages for subscribed topics.
  ![image](image/rec.png)

- HTTP mode block: set HTTP server domain/IP and port (default 80).
  ![image](image/http.png)

- HTTP GET block: send GET requests.
  ![image](image/get_method.png)


### MQTT demo

![image](image/last.png)

    Explanation: module uses P1/P2 for TX/RX, configures Wi‑Fi, connects to MQTT broker (port 1883), subscribes to "test" (QoS ≥ 1). Press micro:bit A to publish "hello world" to "testtopic" and display incoming "test" messages on the micro:bit.

### HTTP demo

![image](image/http_example.png)

    Explanation: module uses P1/P2 for TX/RX, configures Wi‑Fi, connects to HTTP server (port 80). Press micro:bit A to send a GET request "test" and display the response on the micro:bit LED matrix.

### Alibaba Cloud MQTT demo
![image](image/aliyun.jpg)

    Explanation: module uses P1/P2 for TX/RX, configures Wi‑Fi, connects to Alibaba Cloud broker (port 1883). Press micro:bit A to publish to topic `/a1gVfAJo2pv/emakefun/user/update` and check messages via Alibaba Cloud logs; incoming messages on `/a1gVfAJo2pv/emakefun/user/get` are displayed on the micro:bit.
	