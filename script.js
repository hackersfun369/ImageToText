const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const output = document.getElementById("output");

// Start the mobile camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera error:", err);
    alert("Could not access the camera.");
  });

// Capture image and send to backend
captureBtn.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png").split(',')[1];

  if (!imageData || imageData.length < 100) {
    alert("Image data is empty. Please try again.");
    return;
  }

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
});

// Speak the description
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
