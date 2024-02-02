function mtof(midi) {
  return Math.pow(2, (midi - 69) / 12) * 440;
}

export default class Arpeggiator {
  constructor(ctx, clock) {
    this.ctx = ctx;
    this.clock = clock;
  }

  playNote(
    {
      time,
      note,
      duration = 1.15,
      attack = 0.21,
      decay = 0.1,
      sustain = 0.5,
      release = 5.0,
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
    osc.connect(destination);
    // gain.connect(volume);
    // gain.connect(delay);
    // delay.connect(volume);
    // delay.connect(delayFeedbackGain);
    // delayFeedbackGain.connect(delay);

    volume.connect(destination);

    // Start
    osc.start(time);
    osc.stop(time + duration + release);
  }

  start() {
    console.log("@@@@START", this.clock)
    this.clock
      .callbackAtTime((event) => {
        console.log("CALLBACK<!")
        let note = 60;
        this.playNote({ time: event.deadline, note });
      }, this.ctx.currentTime)
      .repeat(1);
  }
}