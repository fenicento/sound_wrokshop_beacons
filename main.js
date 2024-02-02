import './style.css'
import { init } from './audio.js'

//call init on pressing the start button
document.getElementById('start').addEventListener('click', async ()=>{
  await init()
});

