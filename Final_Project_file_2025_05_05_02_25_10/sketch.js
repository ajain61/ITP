let mode = 0; // 0 = info page, 1 = MPC program
let splash;
let soundFile;
let waveform;
let markers = [];
let playingMarker = -1;
let uploadButton;
let playheadX = 0;
let isPlaying = false;
let startTime = 0;
let endTime = 0;
let pitchShift = 0;
let pitchUpButton, pitchDownButton;
let padLights = Array(9).fill(0); // for pads
let showCode = false;
let codeButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  splash = new SplashScreen();

  // Buttons for main program
  uploadButton = createFileInput(handleFile);
  uploadButton.position(20, 20);
  uploadButton.hide();

  pitchDownButton = createButton('Pitch -');
  pitchDownButton.position(180, 20);
  pitchDownButton.mousePressed(() => pitchShift--);
  pitchDownButton.hide();

  pitchUpButton = createButton('Pitch +');
  pitchUpButton.position(270, 20);
  pitchUpButton.mousePressed(() => pitchShift++);
  pitchUpButton.hide();

  // Code toggle button
  codeButton = createA('https://editor.p5js.org/ajain61/sketches/ca1zPnkJC', 'View Full Code', '_blank');
  codeButton.position(width / 2 - 60, height / 2 + 150);
  codeButton.style('font-size', '16px');
  codeButton.style('background', 'none');
  codeButton.style('border', 'none');
  codeButton.style('color', '#00ccff');
  codeButton.style('text-decoration', 'underline');
  codeButton.style('cursor', 'pointer');
}

function draw() {
  background(10);

  if (mode == 0) {
    splash.show();
  } else if (mode == 1) {
    splash.hide();
    drawMPC();
  }
}

function mousePressed() {
  if (mode == 0 && splash.update()) {
    mode = 1;
    uploadButton.show();
    pitchDownButton.show();
    pitchUpButton.show();
    codeButton.hide();
  } else if (mode == 1) {
    if (!soundFile || !waveform || mouseY < 80 || mouseY > height - 180) return;

    let mouseTime = map(mouseX, 0, width, 0, soundFile.duration());

    if (mouseButton === LEFT) {
      let nearMarkerIndex = getMarkerNear(mouseX);
      if (nearMarkerIndex === -1 && markers.length < 9) {
        markers.push(mouseTime);
        markers.sort((a, b) => a - b);
      }
    } else if (mouseButton === RIGHT) {
      let nearMarkerIndex = getMarkerNear(mouseX);
      if (nearMarkerIndex !== -1) {
        markers.splice(nearMarkerIndex, 1);
      }
      return false;
    }
  }
}

function keyPressed() {
  if (mode == 1 && soundFile && markers.length > 0) {
    let index = parseInt(key) - 1;
    if (index >= 0 && index < markers.length) {
      if (soundFile.isPlaying()) {
        soundFile.stop();
      }
      startTime = markers[index];
      endTime = (index < markers.length - 1) ? markers[index + 1] : soundFile.duration();
      let rate = pow(2, pitchShift / 12);
      soundFile.rate(rate);
      soundFile.play(0, rate, 1, startTime, endTime - startTime);
      isPlaying = true;
      playingMarker = index;
      padLights[index] = 255;
    }
  }
}

function drawMPC() {
  background(10);
  fill(200);
  textFont('Courier New');
  textSize(18);
  textAlign(CENTER);
  text("AKAI Sample Chopper - Upload MP3 | Left-click: Add Marker | Right-click: Delete | Keys 1-9: Play", width / 2, 30);

  if (soundFile && waveform) {
    drawWaveform();
    drawMarkers();
    drawPlayhead();
  } else {
    fill(100);
    textSize(24);
    text("No file loaded", width / 2, height / 2);
  }

  drawPads();

  fill(255, 100, 100);
  textSize(20);
  text(`Pitch: ${pitchShift >= 0 ? '+' : ''}${pitchShift} st`, width / 2, height - 30);

  fadePadLights();
}

function drawWaveform() {
  stroke(0, 255, 50);
  noFill();
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height - 180, 80);
    vertex(x, y);
  }
  endShape();
}

function drawMarkers() {
  for (let i = 0; i < markers.length; i++) {
    let x = map(markers[i], 0, soundFile.duration(), 0, width);
    stroke(255, 0, 0);
    strokeWeight(2);
    line(x, 80, x, height - 180);
    noStroke();
    fill(255);
    textSize(14);
    text(i + 1, x, 65);
  }
}

function drawPlayhead() {
  if (isPlaying) {
    let currentTime = soundFile.currentTime();
    if (currentTime >= endTime) {
      isPlaying = false;
      playingMarker = -1;
      soundFile.stop();
      return;
    }
    playheadX = map(currentTime, 0, soundFile.duration(), 0, width);
    stroke(255, 255, 0);
    strokeWeight(2);
    line(playheadX, 80, playheadX, height - 180);
  }
}

function getMarkerNear(x) {
  for (let i = 0; i < markers.length; i++) {
    let markerX = map(markers[i], 0, soundFile.duration(), 0, width);
    if (abs(markerX - x) < 10) return i;
  }
  return -1;
}

function drawPads() {
  let padWidth = 100;
  let padHeight = 80;
  let padMargin = 30;
  let startX = (width - (3 * padWidth + 2 * padMargin)) / 2;
  let startY = height - 300;

  textSize(24);
  textFont('Courier New');

  for (let i = 0; i < 9; i++) {
    let row = floor(i / 3);
    let col = i % 3;

    let x = startX + col * (padWidth + padMargin);
    let y = startY + row * (padHeight + padMargin);

    let brightness = padLights[i];
    fill(40 + brightness, 40 + brightness / 2, 40);
    stroke(200);
    strokeWeight(3);
    rect(x, y, padWidth, padHeight, 12);

    fill(255);
    noStroke();
    text(i + 1, x + padWidth / 2, y + padHeight / 2);
  }
}

function fadePadLights() {
  for (let i = 0; i < padLights.length; i++) {
    if (padLights[i] > 0) {
      padLights[i] -= 12;
      padLights[i] = max(padLights[i], 0);
    }
  }
}

function handleFile(file) {
  if (file.type === 'audio') {
    if (soundFile) soundFile.stop();
    soundFile = loadSound(file.data, () => {
      waveform = soundFile.getPeaks(width);
      markers = [];
    });
  } else {
    alert('Please upload an audio file.');
  }
}

class SplashScreen {
  constructor() {
    this.xButtonX = windowWidth - 70;
    this.xButtonY = 30;
    this.xButtonSize = 40;
  }

  show() {
    background(20);
    fill(255);
    textAlign(CENTER, CENTER);
    textFont('Courier New');

    textSize(40);
    textStyle(BOLD);
    text("SAMPLE CHOPPER", width / 2, height / 2 - 160);

    textSize(24);
    textStyle(NORMAL);
    text("By Aahan Jain", width / 2, height / 2 - 120);

    textSize(20);
    text("This is a program that allows a user to upload an mp3 audio sample", width / 2, height / 2 - 60);
    text("and place chops to play on keys 1–9,", width / 2, height / 2 - 30);
    text("inspired by legendary samplers such as the AKAI MPC and SP404.", width / 2, height / 2);
    text("Enjoy! Press X to continue.", width / 2, height / 2 + 30);

    fill(200, 50, 50);
    noStroke();
    rect(this.xButtonX, this.xButtonY, this.xButtonSize, this.xButtonSize, 10);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('X', this.xButtonX + this.xButtonSize / 2, this.xButtonY + this.xButtonSize / 2);
  }

  hide() {}

  update() {
    return (mouseX > this.xButtonX && mouseX < this.xButtonX + this.xButtonSize &&
            mouseY > this.xButtonY && mouseY < this.xButtonY + this.xButtonSize);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (splash) splash.xButtonX = windowWidth - 70;

  uploadButton.position(20, 20);
  pitchDownButton.position(180, 20);
  pitchUpButton.position(270, 20);
  if (codeButton && mode === 0) {
    codeButton.position(width / 2 - 60, height / 2 + 150);
  }
}

document.oncontextmenu = () => false;
