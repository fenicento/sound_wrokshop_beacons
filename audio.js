let audioCtx = new AudioContext();
import WAAClock from "waaclock";
import Arpeggiator from './arpeggiator.js'

const minRSSI = -90;
const maxRSSI = -40;
const minGain = 0.01;
const maxGain = 1;
const minFilter = 100;
const maxFilter = 12000;
const fadeTime = 1.0;

let clock = new WAAClock(audioCtx, { toleranceEarly: 0.1 });
let arp = new Arpeggiator(audioCtx, clock);

let buffers = [
  {
    url: "src/assets/sounds/kick_40sec.ogg",
    id: "310_3",
  },
  {
    url: "src/assets/sounds/Drums_40sec.ogg",
    id: "310_4",
  },
  {
    url: "src/assets/sounds/Bass_40sec.ogg",
    id: "310_7",
  },
  {
    url: "src/assets/sounds/Pad_40sec.ogg",
    id: "310_9",
  },
  // {
  //   url: "src/assets/sounds/Lead_40sec.ogg",
  //   id: "310_10"
  // }
]


const loadBuffer = (url) => {
  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buffer) => audioCtx.decodeAudioData(buffer));
}

const startEverything = async () => {
  console.log("start everytinhg");
  await audioCtx.resume();
  console.log("start loops");

  await startLoops();
  clock.start();
  arp.start();
}

const startLoops = async () => {
  // Create
  for (let buffer of buffers) {
    console.log(buffer);
    let bufferSrcNode = audioCtx.createBufferSource();
    let gain = audioCtx.createGain();
    let filter = audioCtx.createBiquadFilter();

    // Configure
    let bufferData = await loadBuffer(buffer.url);
    bufferSrcNode.buffer = bufferData;
    bufferSrcNode.loop = true;
    gain.gain.value = 0.6;
    filter.type = "lowpass";
    filter.frequency.value = 5000;

    // Connect
    bufferSrcNode.connect(gain);
    gain.connect(filter);
    filter.connect(audioCtx.destination);

    // Update the array
    buffer.node = bufferSrcNode;
    buffer.gain = gain;
    buffer.filter = filter;
  }
  console.log(buffers);

  //start the buffers at given time all together
  for(let buffer of buffers){
    buffer.node.start(audioCtx.currentTime);
  }
}

const mapRSSItoGain = (rssi) => {
  let gain = ((rssi - minRSSI) / (maxRSSI - minRSSI)) * (maxGain - minGain) + minGain;
  return gain
}
const mapRSSItoFilter = (rssi) => {
  let filter = ((rssi - minRSSI) / (maxRSSI - minRSSI)) * (maxFilter - minFilter) + minFilter;
  return filter
}

export const initAudio = async () => {
  console.log("init");
  await startEverything();
  console.log("init over");
}

export const updateBeacon = (obj) => {
  let beacon = buffers.find((b) => b.id == obj.id);
  if (beacon && beacon.gain) {
    // console.log("beacon",beacon, mapRSSItoGain(obj.rssi), obj.rssi)
    beacon.gain.gain.exponentialRampToValueAtTime(mapRSSItoGain(obj.rssi),audioCtx.currentTime+fadeTime);
    beacon.filter.frequency.exponentialRampToValueAtTime(mapRSSItoFilter(obj.rssi), audioCtx.currentTime+fadeTime);
  }
}