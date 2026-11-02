// IDB Programming: A3 — a musical instrument

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Constant variables used in the rest of the programme
const basenote = "G3";
const note1 = "C4";
const note2 = "D4";
const note3 = "E4";
const shape1 = createShape("circle1");
const shape2 = createShape("circle2");
const shape3 = createShape("circle3");
const MAX_SPEEDS = 200; // Fixed-capacity limit for the array window

// ---------- State ----------
// Variables which will change when the programe is run
let lastX = 0;
let lastY = 0;
let lastTime = Date.now();
let isInsideCircle1 = false;
let isInsideCircle2 = false;
let isInsideCircle3 = false;

let isShape1Dragging = false;
let isShape2Dragging = false;
let isShape3Dragging = false;
let x = 0;
let y = 0;

let speeds = [];

// ---------- Sound ----------
const synth = new Tone.Synth().toDestination();

// ---------- Update ----------
function update() {
  setTimeout(update, 100);
}

// ---------- Use ----------
function use() {
  if (isShape1Dragging) {
    shape1.setPositionPixels(x - shape1.width / 2, y - shape1.height / 2);
  }

  if (isShape2Dragging) {
    shape2.setPositionPixels(x - shape2.width / 2, y - shape2.height / 2);
  }

  if (isShape3Dragging) {
    shape3.setPositionPixels(x - shape3.width / 2, y - shape3.height / 2);
  }

  window.requestAnimationFrame(use);
}

// ---------- Controls (Event Handlers) ----------
// Starts playing basenote (G3)
function pointerDown(event) {
  Tone.start();
  console.log("Pointer down at", event.clientX, event.clientY);
  synth.triggerAttack(basenote);
}
// Tells the programme to set isdragging back to false after poinerdown sets it true. stopping volume and dragging of shapes
function pointerUp(event) {
  isShape1Dragging = false;
  isShape2Dragging = false;
  isShape3Dragging = false;
  console.log("pointer up registered globally");
  synth.volume.value = 0;
}
// Pointer is inside circle, clears speed array to avoid spike in audio, stops plaing basenote and plays note1, 2 or 3, sets detune effect to 0
function circle1Enter(event) {
  isInsideCircle1 = true;
  speeds = []; // Empties array to avoid audio spikes
  synth.triggerRelease();
  synth.triggerAttack(note1);
  synth.detune.value = 0;
}

function circle2Enter(event) {
  isInsideCircle2 = true;
  speeds = [];
  synth.triggerRelease();
  synth.triggerAttack(note2);
  synth.detune.value = 0;
}

function circle3Enter(event) {
  isInsideCircle3 = true;
  speeds = [];
  synth.triggerRelease();
  synth.triggerAttack(note3);
  synth.detune.value = 0;
}
// sets boolean to false therefore detune starts again and basenote starts.
function circle1Leave(event) {
  isInsideCircle1 = false;
  synth.triggerAttack(basenote);
}

function circle2Leave(event) {
  isInsideCircle2 = false;
  synth.triggerAttack(basenote);
}

function circle3Leave(event) {
  isInsideCircle3 = false;
  synth.triggerAttack(basenote);
}
// is any of the shapes are dragging update x and y values.
function pointerMove(event) {
  if (isShape1Dragging || isShape2Dragging || isShape3Dragging) {
    x = event.clientX;
    y = event.clientY;
    let normVolumeY = y / window.innerHeight;
    let calculatedVolume = (1 - normVolumeY) * 30 - 30;
    synth.volume.value = calculatedVolume;
  }
  // updates pointer coordinates
  let normX = event.clientX / window.innerWidth;
  let normY = event.clientY / window.innerHeight;
  let now = Date.now();

  let distance = Math.hypot(normX - lastX, normY - lastY);
  let seconds = (now - lastTime) / 1000;

  if (seconds === 0) return;

  let speed = distance / seconds;
  lastX = normX;
  lastY = normY;
  lastTime = now;

  if (speeds.length >= MAX_SPEEDS) {
    forgetOldest();
  }
  speeds.push(speed);

  useAverage();
}
// forget oldest spped value in array
function forgetOldest() {
  speeds.shift();
}
// calculates the average value of speed in of the speeds recorded in the speed array
function useAverage() {
  if (
    isInsideCircle1 ||
    isInsideCircle2 ||
    isInsideCircle3 ||
    isShape1Dragging ||
    isShape2Dragging ||
    isShape3Dragging
  ) {
    synth.detune.value = 0;
    return;
  }

  let total = 0;
  for (let i = 0; i < speeds.length; i++) {
    total = total + speeds[i];
  }

  let average = speeds.length > 0 ? total / speeds.length : 0;
  synth.detune.value = average * 500;
}

// ---------- Setup ----------
// runs update and use function above, listens for any pointer events
function setup() {
  update();
  use();

  shape1.setSize(350);
  shape1.setColour(50, 90, 63);
  shape1.setPosition(0.7, 0.7);

  shape2.setSize(350);
  shape2.setColour(10, 90, 63);
  shape2.setPosition(0.37, 0.4);

  shape3.setSize(350);
  shape3.setColour(200, 90, 63);
  shape3.setPosition(0.05, 0.1);

  // acts as a switch to check if shape 1 is clicked, which signals to the animation loop in the use function. attaches a listener to shape 1
  shape1.element.addEventListener("pointerdown", (event) => {
    isShape1Dragging = true;
    x = event.clientX;
    y = event.clientY;
  });

  shape2.element.addEventListener("pointerdown", (event) => {
    isShape2Dragging = true;
    x = event.clientX;
    y = event.clientY;
  });

  shape3.element.addEventListener("pointerdown", (event) => {
    isShape3Dragging = true;
    x = event.clientX;
    y = event.clientY;
  });

  // global event listener to listen to any pinter movement on the screen
  window.addEventListener("pointermove", (event) => {
    if (isShape1Dragging || isShape2Dragging || isShape3Dragging) {
      // if any shape is dragging, if flase it deosnt excecute further
      x = event.clientX; // if true it live updates x and y values of the pointer
      y = event.clientY;
    }
  });
  // listens for the other pointer events
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointerup", pointerUp);
  window.addEventListener("pointermove", pointerMove);
  //listents for the pointer enter and leave events for the pointer inside each circle.
  shape1.element.addEventListener("pointerenter", circle1Enter);
  shape1.element.addEventListener("pointerleave", circle1Leave);

  shape2.element.addEventListener("pointerenter", circle2Enter);
  shape2.element.addEventListener("pointerleave", circle2Leave);

  shape3.element.addEventListener("pointerenter", circle3Enter);
  shape3.element.addEventListener("pointerleave", circle3Leave);
}

setup();
