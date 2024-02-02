import ReconnectingWebSocket from 'reconnecting-websocket';

const DMS_WS_URL = 'ws://bcnsrv:5111/debug';

export class wsDms {
  constructor(handler) {
    this.url = DMS_WS_URL;
    this.handler = handler;
    this.init();
    this.ws;
    this.majorFilter = 310;
  }

  init() {
    this.ws = new ReconnectingWebSocket(this.url);
    this.ws.addEventListener('open', res => {
      console.log("DMS connection open", res);
      this.connected = true;
    });
    this.ws.addEventListener('close', res => {
      this.connected = false;
      this.shortId = null;
    });
    this.ws.addEventListener('message', rawMsg => {
      const msg = JSON.parse(rawMsg.data);
      // console.log("DMS message:", msg);
      switch(msg.type) {
        case 'beacon':
          // console.log("Device id is:", msg['minor'])
          if (msg['major'] && msg['minor']) {
            this.shortId = msg['major'] + '_' + msg['minor'];
          }
          break;
        case 'auto_zone':
          console.log("auto_zone", msg)
          break;
        case 'debug':
          // msg['all_rssi'] = msg['all_rssi'].filter(el => el)
          this.handler(msg);
          break;
        default:
          break;
      }
    });
    this.ws.addEventListener('error', err => {
      console.error("DMS ws error:", err);
    })
  }
}