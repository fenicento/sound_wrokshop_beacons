function mtof(midi) {
  return Math.pow(2, (midi - 69) / 12) * 440;
}

let bpm = 120;
function tempoToSeconds(fraction = 4) {
  let quartersPerBeat = 4;
  let bps = bpm/60;
  return (quartersPerBeat / fraction) / bps;
}

export default class Arpeggiator {
  constructor(ctx, clock) {
    this.ctx = ctx;
    this.clock = clock;
    this.bCounter = 1;
    this.aCounter = 0;
    this.initSpeed = tempoToSeconds(16);
    this.stretchFactor = 4;
    this.progression = [{chord:'C',dur:4,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]},
                        {chord:'F',dur:4,notes:[53, 65, 55, 67, 57, 69, 48, 60, 50, 62]},
                        {chord:'G',dur:4,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'A',dur:2,notes:[57, 69, 59, 71, 48, 60, 52, 64, 52, 64]},
                        {chord:'G',dur:2,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'C',dur:4,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]},
                        {chord:'F',dur:4,notes:[53, 65, 55, 67, 57, 69, 48, 60, 50, 62]},
                        {chord:'G',dur:4,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'A',dur:4,notes:[57, 69, 59, 71, 48, 60, 52, 64, 52, 64]},
                        {chord:'C',dur:4,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]},
                        {chord:'F',dur:4,notes:[53, 65, 55, 67, 57, 69, 48, 60, 50, 62]},
                        {chord:'G',dur:4,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'A',dur:2,notes:[57, 69, 59, 71, 48, 60, 52, 64, 52, 64]},
                        {chord:'G',dur:2,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'C',dur:3,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]},
                        {chord:'G',dur:5,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'F',dur:3,notes:[53, 65, 55, 67, 57, 69, 48, 60, 50, 62]},
                        {chord:'C',dur:5,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]},
                        {chord:'G',dur:3,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'C',dur:3,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]},
                        {chord:'G',dur:5,notes:[55, 67, 57, 69, 59, 71, 50, 62, 52, 64]},
                        {chord:'C',dur:5,notes:[48, 60, 50, 62, 52, 64, 55, 67, 57, 69]}]

    let tot = 0;
    this.progression.forEach(el => tot = tot + el.dur);
    this.loopDuration = tot;
  }

  playNote(
    {
      time,
      note,
      duration = 0.1,
      attack = 0,
      decay = 0.1,
      sustain = 0.3,
      release = 1.0,
      delayTime = 0,
      delayFeedback = 0,
    },
    destination = this.ctx.destination
  ) {
    // Create
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    let volume = this.ctx.createGain();
    let delay = this.ctx.createDelay();
    let delayFeedbackGain = this.ctx.createGain();

    // Configure
    osc.frequency.value = mtof(note);
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(1, time + attack);
    gain.gain.linearRampToValueAtTime(1 * sustain, time + attack + decay);
    gain.gain.setValueAtTime(1 * sustain, time + duration);
    gain.gain.setTargetAtTime(0, time + duration, release * 0.2);
    delay.delayTime.value = delayTime;
    delayFeedbackGain.gain.value = delayFeedback;

    volume.gain.value = 0.5;

    // Connect
    osc.connect(gain);
    gain.connect(volume);
    gain.connect(delay);
    delay.connect(volume);
    delay.connect(delayFeedbackGain);
    delayFeedbackGain.connect(delay);

    volume.connect(destination);

    // Start
    osc.start(time);
    osc.stop(time + duration + release);
  }

  start() {
    this.clock
      .callbackAtTime((event) => {
        

        let note = this.progression[this.aCounter]['notes'][Math.floor(Math.random()*(this.progression[this.aCounter]['notes'].length - 1))];
        console.log("bCounter:", this.bCounter, "aCounter", this.aCounter, this.progression[this.aCounter]['chord'], note)

        this.playNote({ time: event.deadline, note: note+12 });

        if (this.bCounter >= this.progression[this.aCounter]['dur'] * this.stretchFactor) {
          this.aCounter++;
          this.bCounter = 1;
        } else {
          this.bCounter++;          
        }


      }, this.ctx.currentTime)
      .repeat(this.initSpeed);
  }
}