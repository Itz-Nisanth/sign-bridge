const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");

const gestureText = document.getElementById("gestureText");
const handStatus = document.getElementById("handStatus");

let lastGesture = "";


function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speechSynthesis.speak(speech);
}


function detectGesture(landmarks) {

  const thumbTip = landmarks[4];
  const thumbBase = landmarks[2];

  const indexTip = landmarks[8];
  const indexBase = landmarks[6];

  const middleTip = landmarks[12];
  const middleBase = landmarks[10];

  const ringTip = landmarks[16];
  const ringBase = landmarks[14];

  const pinkyTip = landmarks[20];
  const pinkyBase = landmarks[18];


  const indexUp = indexTip.y < indexBase.y;
  const middleUp = middleTip.y < middleBase.y;
  const ringUp = ringTip.y < ringBase.y;
  const pinkyUp = pinkyTip.y < pinkyBase.y;

  const thumbUp = thumbTip.x < thumbBase.x;


  if(indexUp && middleUp && !ringUp && !pinkyUp) {
    return "PEACE ✌️";
  }


  if(indexUp && middleUp && ringUp && pinkyUp) {
    return "HELLO 👋";
  }


  if(indexUp && !middleUp && !ringUp && !pinkyUp) {
    return "STOP ✋";
  }

  return "Detecting...";
}


function onResults(results) {

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );


  if(results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

    handStatus.innerText = "HAND DETECTED";

    for(const landmarks of results.multiHandLandmarks) {

      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: '#00E5FF',
        lineWidth: 3
      });

      drawLandmarks(canvasCtx, landmarks, {
        color: '#7A5CFF',
        lineWidth: 2,
        radius: 4
      });


      const detected = detectGesture(landmarks);

      gestureText.innerText = detected;


      if(detected !== lastGesture && detected !== "Detecting...") {
        speak(detected);
        lastGesture = detected;
      }
    }

  } else {

    handStatus.innerText = "NOT DETECTED";
    gestureText.innerText = "Waiting...";
  }

  canvasCtx.restore();
}


const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});


hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);


const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});

camera.start();