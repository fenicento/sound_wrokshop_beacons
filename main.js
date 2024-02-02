import './style.css'
import { init, updateBeacon } from './audio.js'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js';
import { wsDms } from './wsDms.js';

let beacons = {}; 
const onBleScan = data => {
  let id = data['major']+'_'+data['minor'];

  Object.keys(data['all_rssi']).forEach(emitter => {
    let obj = {};
    obj[id] = data['all_rssi'][emitter] // save just the last one
    
    if (!beacons.hasOwnProperty(emitter)) {
      beacons[emitter] = obj;
    } else {
      beacons[emitter] = {...beacons[emitter], ...obj};
    }

    let updatePayload = {
      id: emitter,
      rssi: data['all_rssi'][emitter]
    }

    updateBeacon(updatePayload);
  })
  // console.log("updated list:", beacons);
}
let ws = new wsDms(onBleScan);

//call init on pressing the start button
document.getElementById('start').addEventListener('click', async ()=>{
  await init()
});

