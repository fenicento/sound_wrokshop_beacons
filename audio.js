let audioCtx = new AudioContext();
let firstStart = true;
let paused = false;
let bufferSrcNode = null;

let buffers = [
  {
    url: "sounds/Lantern_Ambiance01.mp4",
    id: "310_3",
  },
  {
    url: "sounds/ma_ambience_loop_rove_100_Cmaj.mp4",
    id: "310_4",
  },
  {
    url: "sounds/aat_texture_loop_scape_128.mp4",
    id: "310_7",
  },
  {
    url: "sounds/ai1_atmosphere_loop_factotum_60_C.mp4",
    id: "310_9",
  },
  {
    url: "sounds/ma_ambience_loop_isolation_100_Cmaj.mp4",
    id: "310_10"
  }
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
    buffer.node.start(audioCtx.currentTime+1.0);
  }
}

export const init = async () => {
  console.log("init");
  await startEverything();
  console.log("init over");
}