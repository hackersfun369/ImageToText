const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const output = document.getElementById("output");
const distance1 = document.getElementById("distance");

// Start the mobile camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera error:", err);
    alert("Could not access the camera.");
  });

// Capture and describe the current video frame
function captureAndDescribeImage() {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png").split(',')[1]; // Get base64 only

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

// Speak the description
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// Get distance from Blynk API
async function getDistance() {
  try {
    const url = 'https://blynk.cloud/external/api/get?token=Q-7lAZiPkUJH_XutFsthGvCqXa43rElg&v1';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    distance1.textContent = `Distance: ${data} cm`;

    if (data < 30) {
      captureAndDescribeImage();
    }
  } catch (error) {
    console.error('Fetch error:', error.message || error);
  }
}

// Periodically check distance
setInterval(getDistance, 1000);

// Manual triggers
output.addEventListener("click", captureAndDescribeImage);

distance1.addEventListener("click", () => {
  speak(distance1.textContent); // Speak the distance when clicked
});
