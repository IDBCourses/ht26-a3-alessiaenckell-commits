/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
const note1 = "G3"; // the note played when the pointer goes down
const note2 = "C3";
const not3e = "D3";
const shape1 = createShape("circle1");
const shape2 = createShape("circle2");
// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let playing = false; // a boolean to tell the computer at the start no sound should be playing, since its a let it can and will be changed at keydown when playing is set to true
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let averageSpeed = 0;

let speeds = [];

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
//const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once
const synth = new Tone.Synth().toDestination();
//const shape = "example";
// ---------- Update ----------
// Update the state. This is called every 100ms.
//function update() {
//setTimeout(update, 100); // call update() again in 100 milliseconds
//}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
//function use() {
// setTimeout(use, 100); // call use() again in 100 milliseconds
//}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // sound starts when pointer is pressed anywhere 

  console.log("Pointer down at", event.clientX, event.clientY);
  synth.triggerAttackRelease(note1); // play note1
}
function startSound(event) {
  Tone.start();
}
function pointerEnter(event) {
  synth.triggerAttack(note2);
}
function pointerLeave(event) {
  synth.triggerRelease();
}
function keyDown(event) {
  Tone.start(); // sound can only start after a key press or a click
  if (event.key === " " && event.repeat === false) {
    if (playing) {
      synth.triggerRelease();
    } else {
      synth.triggerAttack("A3");
    }
    playing = !playing; // updates the boolean playing variable in the beginning
  }
}

function pointerMove(event) {
  let normX = event.clientX / window.innerWidth;
  let normY = event.clientY / window.innerHeight;
  let now = Date.now();
  let distance = Math.hypot(normX - lastX, normY - lastY); // in screens
  let seconds = (now - lastTime) / 1000;
  if (seconds === 0) {
    return;
  }
  let speed = distance / seconds; // screens per second
  lastX = normX;
  lastY = normY;
  lastTime = now;
  console.log(speed);
  // TODO 7a and 8a go here

  synth.detune.value = speed * 300;
  speeds.push(speed);
  console.log(speeds.length);

  if (speeds.length > 10) {
    speeds.shift(); // take out the oldest, at the front
  }

  let total = 0;
  for (let i = 0; i < speeds.length; i++) {
    total = total + speeds[i];
  }
  let average = 0;
  if (speeds.length > 0) {
    average = total / speeds.length;
  }
  synth.detune.value = average * 1200;
  console.log(average);

  if (averageSpeed > 10) {
    // 1. If moving fast, change BOTH shapes to a bright red (hue 0)
    shape1.setColour(0, 100, 50);
    shape2.setColour(0, 100, 50);
  } else {
    // 2. Otherwise (slow or stopped), return them to your original settings color (hue 100)
    shape1.setColour(200, 50, 80);
    shape2.setColour(200, 50, 80);
  }
}

// ---------- Setup ----------

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  //update(); // start the update loop
  //use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.

  shape1.setSize(150);
  shape1.setColour(10, 90, 60); // hue 0 to 360, saturation, lightness
  shape1.setPosition(0.5, 0.5);

  shape2.setSize(200);
  shape2.setColour(50, 80, 60); // hue 0 to 360, saturation, lightness
  shape2.setPosition(0.3, 0.3);
  // Put your event listener code here

  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerdown", startSound);
  window.addEventListener("keydown", keyDown);
  shape1.element.addEventListener("pointerenter", pointerEnter);
  shape1.element.addEventListener("pointerleave", pointerLeave);
}

setup(); // Always remember to call setup()!
