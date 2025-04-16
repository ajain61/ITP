let mic;
let fft;
let angle = 0;
let audioStarted = false; // needed to get it to work in full screen mode. Add in the variable section


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Fullscreen canvas
  getAudioContext().suspend(); // needed to get it to work in full screen mode. Add in setup

  fft = new p5.FFT();
  mic = new p5.AudioIn();
  mic.start(); // Start capturing mic input
  fft.setInput(mic); // Connect mic to FFT for frequency analysis
}
function mousePressed() { // needed to get it to work in full screen mode. Add in mousePressed()
    // Start audio on user gesture
    if (!audioStarted) {
        userStartAudio();
        audioStarted = true;
    }
}

function draw() {
  background(0);
  
  let spectrum = fft.analyze();
  
  // Get bass energy (low frequencies)
  let bass = fft.getEnergy("bass");
  let bassSize = map(bass, 0, 255, 50, height / 3); // Scaled for fullscreen
  
  // Get vocal range energy (mid-high frequencies)
  let vocal = fft.getEnergy(1000, 4000);
  let vocalSize = map(vocal, 0, 255, 50, height / 3); // Scaled for fullscreen
  
  // Rotate the spheres
  push();
  rotateY(angle);
  rotateX(angle * 0.5);
  
  // Red sphere for bass/kick
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);
  sphere(bassSize, 24, 16);
  
  // Green sphere for vocals
  stroke(0, 255, 0);
  sphere(vocalSize, 24, 16);
  
  pop();

  angle += 0.01;
}

// Adjust canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
