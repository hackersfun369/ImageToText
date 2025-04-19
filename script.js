const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const output = document.getElementById("output");
const distanceDisplay = document.getElementById("distance");
const divOutputs = document.getElementsByClassName("divOutputs");

// API endpoints
const CAPTION_API = "https://your-glitch-app.glitch.me/caption"; // Glitch URL for caption API
const DISTANCE_API = "https://your-glitch-app.glitch.me/distance"; // Glitch URL for distance API

// Initialize camera
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" } 
    });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera error:", err);
    alert("Could not access the camera. Please check permissions.");
  }
}

// Capture image and get description
async function captureAndDescribe() {
  try {
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL("image/png").split(',')[1];
    
    const response = await fetch(CAPTION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData })
    });
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    const description = data.caption || "No description available.";
    
    output.textContent = description;
    speak(description);
  } catch (err) {
    console.error("Description error:", err);
    output.textContent = "Error getting image description.";
  }
}

// Get distance from server (latest distance from ESP8266)
async function getDistance() {
  try {
    const response = await fetch(DISTANCE_API);
    if (!response.ok) throw new Error(`Device error: ${response.status}`);
    
    const data = await response.json();
    const distance = data.distance;
    
    if (typeof distance === 'number') {
      distanceDisplay.textContent = `Distance: ${distance.toFixed(1)} cm`;
    } else {
      throw new Error("Invalid distance data");
    }
  } catch (err) {
    console.error("Distance error:", err.message);
    distanceDisplay.textContent = "Distance: -- cm";
  }
}

// Text-to-speech function
function speak(text) {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

// Event listeners
output.addEventListener("click", captureAndDescribe);
distanceDisplay.addEventListener("click", getDistance);

// Initialize camera
initCamera();

// Poll distance every second
const distanceInterval = setInterval(getDistance, 1000);

// Cleanup on page exit
window.addEventListener('beforeunload', () => {
  clearInterval(distanceInterval);
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
