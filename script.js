const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const output = document.getElementById("output");
const distance1 = document.getElementById("distance");
const divOutputs = document.getElementsByClassName("divOutputs");

// Start the mobile camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera error:", err);
    alert("Could not access the camera.");
  });

// Trigger captioning from camera feed
output.addEventListener("click", () => {
  captureAndSend();
});

distance.addEventListener("click", () => {
  captureAndSend();
});

// Function to capture and send image for captioning
function captureAndSend() {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png").split(',')[1]; // base64 image only

  fetch("https://wooded-rose-otter.glitch.me/caption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData })
  })
    .then(res => res.json())
    .then(data => {
      output.textContent = data.caption || "No description available.";
      speak(data.caption);
    })
    .catch(err => {
      console.error("Error:", err);
      output.textContent = "Error getting image description.";
    });
}

// Speak the caption
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// 🔁 Fetch distance from Glitch backend every second
async function getDistance() {
  try {
    const response = await fetch('https://wooded-rose-otter.glitch.me/distance');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const distance = data.distance;

    if (typeof distance === "number") {
      distance1.textContent = `Distance: ${distance.toFixed(2)} cm`;
    } else {
      distance1.textContent = "Distance: N/A";
    }
  } catch (error) {
    console.error("Fetch error:", error.message || error);
    distance1.textContent = "Distance: Error";
  }
}

setInterval(getDistance, 1000);
