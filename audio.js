let audioCtx = new AudioContext();
let firstStart = true;
let paused = false;
let bufferSrcNode = null;

let buffers = [
  {
  url: "sounds/Lantern_Ambiance01.mp4",
  },
  {
  url: "sounds/ma_ambience_loop_rove_100_Cmaj.mp4",
}
]


const loadBuffer = (url) => {
  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buffer) => audioCtx.decodeAudioData(buffer));
}

const startEverything = async() => {
  console.log("start everytinhg");
  await audioCtx.resume();
  console.log("start loops");
  await startLoops();
}

const startLoops  = async () => {
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

    // Start
    bufferSrcNode.start();
    buffer.node = bufferSrcNode;
    buffer.gain = gain;
    buffer.filter = filter;
  }
  console.log(buffers);
}

export const init = async() => {
  console.log("init");
  await startEverything();
  console.log("init over");
}