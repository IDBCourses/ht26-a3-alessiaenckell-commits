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
const basenote = "G3";
const note1 = "A4";
const note2 = "B4";
const note3 = "D4";
const shape1 = createShape("circle1");
const shape2 = createShape("circle2");
const shape3 = createShape("circle3");

// ---------- State ----------
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
const MAX_SPEEDS = 200; // Fixed-capacity limit for the array window

// ---------- Sound ----------
const synth = new Tone.Synth().toDestination();

// ---------- Update ----------
function update() {
  // Logic updates go here if needed over standard intervals
  setTimeout(update, 100);
}

// ---------- Use ----------
function use() {
  // FIXED: Drag handling now checks global window offsets smoothly
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
function pointerDown(event) {
  Tone.start();
  console.log("Pointer down at", event.clientX, event.clientY);
  synth.triggerAttack(basenote);
}

function pointerUp(event) {
  isShape1Dragging = false;
  isShape2Dragging = false;
  isShape3Dragging = false;
  console.log("pointer up registered globally");
}

function circle1Enter(event) {
  isInsideCircle1 = true;
  speeds = []; // Flushes historical entries cleanly
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

function pointerMove(event) {
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

  // FIXED: The "Forget Oldest" logic is wired directly into data population
  if (speeds.length >= MAX_SPEEDS) {
    forgetOldest();
  }
  speeds.push(speed);

  // FIXED: Now safely executes updates when data alters
  useAverage();
}

function forgetOldest() {
  speeds.shift();
}

function useAverage() {
  // FIXED: Condition flags act as a strict guard gate early in execution loop
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
function setup() {
  update();
  use();

  shape1.setSize(450);
  shape1.setColour(50, 90, 60);
  shape1.setPosition(0.7, 0.7);

  shape2.setSize(350);
  shape2.setColour(10, 90, 60);
  shape2.setPosition(0.4, 0.4);

  shape3.setSize(350);
  shape3.setColour(200, 90, 60);
  shape3.setPosition(0.2, 0.2);

  // FIXED: Cleaned redundant event listener scopes causing coordinate leaks
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

  // FIXED: Drag window captures unified coordinates cleanly in one step
  window.addEventListener("pointermove", (event) => {
    if (isShape1Dragging || isShape2Dragging || isShape3Dragging) {
      x = event.clientX;
      y = event.clientY;
    }
  });

  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointerup", pointerUp);
  window.addEventListener("pointermove", pointerMove);

  shape1.element.addEventListener("pointerenter", circle1Enter);
  shape1.element.addEventListener("pointerleave", circle1Leave);

  shape2.element.addEventListener("pointerenter", circle2Enter);
  shape2.element.addEventListener("pointerleave", circle2Leave);

  shape3.element.addEventListener("pointerenter", circle3Enter);
  shape3.element.addEventListener("pointerleave", circle3Leave);
}

setup();
