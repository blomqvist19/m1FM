// @ts-nocheck
const cameraEl = document.getElementById('camera');
const canvasEl = document.getElementById('canvas');
const resultsEl = document.getElementById('results');
//var ctx = canvasEl.getContext("2d");
const poseColours = [];
let lastFrame = 0;
let backgroundC = ["white", "red", "purple", "yellow"];

document.getElementById('btnFreeze').addEventListener('click', evt => {
  if (cameraEl.paused) {
    cameraEl.play();
  } else {
    cameraEl.pause();
  }
});

console.log('Loading posenet model')

// See docs for info on these parameters
// https://github.com/tensorflow/tfjs-models/tree/master/posenet
let model = null;
posenet.load({
  architecture: 'ResNet50',
  outputStride: 32,
  inputResolution: 257,
  quantBytes: 4
}).then(m => {
  model = m;
  console.log('Model loaded, starting camera');
  startCamera();
})


cameraEl.addEventListener('play', () => {
  // Resize canvas to match camera frame sie
  canvasEl.width = cameraEl.videoWidth;
  canvasEl.height = cameraEl.videoHeight;

  // Start processing!
  window.requestAnimationFrame(process);
});

// Processes the last frame from camera
function process() {
  model.estimateMultiplePoses(canvasEl, {
    flipHorizontal: false,
    maxDetections: 5, /* max # poses */
    scoreThreshold: 0.5,
    nmsRadius: 20
  }).then(processPoses); /* call processPoses with result */
}

let i = 0;
let time = 0;

function processPoses(poses) {
  // For debug purposes, draw points
  drawPoses(poses);

  // console.log(poses.length);  

  if (poses.length === 2) {
    //document.body.style.backgroundColor = backgroundC[poses.length];
    //document.body.style.backgroundColor = "blue";
    //time = 1000;
    myMove(10, 15);
    console.log("1000");
  } else if (poses.length === 1) {
    //document.body.style.backgroundColor = backgroundC[poses.length];
    //document.body.style.backgroundColor = "red";
    //time = 3000;
    myMove(100, 150);
    console.log("3000");
  }
   else {
     //document.body.style.backgroundColor = backgroundC[poses.length];
    //  var x = Math.floor(Math.random() * 256);
    //  var y = Math.floor(Math.random() * 256);
    //  var z = Math.floor(Math.random() * 256);
    //  var bgColor = "rgb(" + x + ", " + y + ", " + z + ")";
    //  document.body.style.background = bgColor;
    //time = 5000;
    console.log("5000");
    }
 

  // Repeat, if not paused
  if (cameraEl.paused) {
    console.log('Paused processing');
    return;
  }
 // lastFrame = poses.length;
  //lastC = backgroundC[poses.length];
 // document.body.style.backgroundColor = backgroundC[poses.length];
  window.requestAnimationFrame(process);
}
/*
setInterval(() => {
  // console.log(i);
  //  i++;
   //document.body.style.backgroundColor = bgColor;
   //change color here
   random_bg_color();
}, time);

function random_bg_color() {
  var x = Math.floor(Math.random() * 256);
  var y = Math.floor(Math.random() * 256);
  var z = Math.floor(Math.random() * 256);
  var bgColor = "rgb(" + x + ", " + y + ", " + z + ")";
  console.log(bgColor);
  
  document.body.style.background = bgColor;
} */

function myMove(x, y) {
  var elem = document.getElementById("animate"); 
  var pos1 = x;
  var pos2 = y;
  var id = setInterval(frame, 5);
  
  function frame() {
    if (pos1 == 350) {
      clearInterval(id);
    }
     else if (pos2 == 350) {
        clearInterval(id);

    } else {
      pos1++; 
      pos2++;
      elem.style.top = pos1 + 'px'; 
      elem.style.left = pos2 + 'px'; 
    }
  }
}



// Helper function to get a named keypoint position
function getKeypointPos(poses, name, poseIndex = 0) {
  // Don't return a value if overall score is low
  if (poses.score < 0.3) return null;
  if (poses.length < poseIndex) return null;

  const kp = poses[poseIndex].keypoints.find(kp => kp.part == name);
  if (kp == null) return null;
  return kp.position;
}

function drawPoses(poses) {
  // Draw frame to canvas
  var c = canvasEl.getContext('2d');
  c.drawImage(cameraEl, 0, 0, cameraEl.videoWidth, cameraEl.videoHeight);

  // Fade out image
  //c.fillStyle = 'rgba(255,255,255,0.7)';
  // c.fillRect(0, 0, cameraEl.videoWidth, cameraEl.videoHeight);

  // Draw each detected pose
  for (var i = 0; i < poses.length; i++) {
    drawPose(i, poses[i], c);
  }

  // If there's no poses, draw a warning
  if (poses.length == 0) {
    c.textBaseline = 'top';
    c.fillStyle = 'red';
    c.fillText('No poses detected', 10, 10);
  }
}

// Draws debug info for each detected pose
function drawPose(index, pose, c) {
  // Lookup or generate random colour for this pose index
  if (!poseColours[index]) poseColours[index] = getRandomColor();
  const colour = poseColours[index];

  // Draw prediction info
  c.textBaseline = 'top';
  c.fillStyle = colour;
  c.fillText(Math.floor(pose.score * 100) + '%', 10, (index * 20) + 10);

  // Draw each pose part
  pose.keypoints.forEach(kp => {
    // Draw a dot for each keypoint
    c.beginPath();
    c.arc(kp.position.x, kp.position.y, 5, 0, 2 * Math.PI);
    c.fill();

    // Draw the keypoint's score (not very useful)
    //c.fillText(Math.floor(kp.score * 100) + '%', kp.position.x + 7, kp.position.y - 3);

    // Draw name of keypoint
    c.fillText(kp.part, kp.position.x - 3, kp.position.y + 6);
  });
}

// ------------------------
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Reports outcome of trying to get the camera ready
function cameraReady(err) {
  if (err) {
    console.log('Camera not ready: ' + err);
    return;
  }
  console.log('Camera ready');
}

// Tries to get the camera ready, and begins streaming video to the cameraEl element.
function startCamera() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  if (!navigator.getUserMedia) {
    cameraReady('getUserMedia not supported');
    return;
  }
  navigator.getUserMedia({ video: { width: 640, height: 480 }, audio: false },
    (stream) => {
      try {
        cameraEl.srcObject = stream;
      } catch (error) {
        cameraEl.srcObject = window.URL.createObjectURL(stream);
      }
      cameraReady();
    },
    (error) => {
      cameraReady(error);
    });
}