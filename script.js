
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  const captureBtn = document.getElementById("captureBtn");
  const output = document.getElementById("output");
  const distanceDisplay = document.getElementById("distance");

  // Your Glitch server URL
  const SERVER_URL = "https://your-glitch-project.glitch.me"; // 🔁 Replace with your Glitch app URL

  const CAPTION_API = `${SERVER_URL}/caption`;
  const DISTANCE_API = `${SERVER_URL}/distance`;

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

  // Capture image and send to backend
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

      if (!response.ok) throw new Error(`Caption API error: ${response.status}`);

      const data = await response.json();
      const description = data.caption || "No description available.";
      output.textContent = description;
      speak(description);
    } catch (err) {
      console.error("Error getting caption:", err);
      output.textContent = "Error getting image description.";
    }
  }

  // Get distance from Glitch server
  async function getDistance() {
    try {
      const response = await fetch(DISTANCE_API);
      if (!response.ok) throw new Error(`Distance API error: ${response.status}`);

      const data = await response.json();
      const distance = data.distance;

      if (typeof distance === "number") {
        distanceDisplay.textContent = `Distance: ${distance.toFixed(1)} cm`;
      } else {
        throw new Error("Invalid distance data");
      }
    } catch (err) {
      console.error("Distance error:", err);
      distanceDisplay.textContent = "Distance: -- cm";
    }
  }

  // Speak the given text
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
  captureBtn.addEventListener("click", captureAndDescribe);

  // Initialize on page load
  initCamera();

  // Poll distance every second
  const distanceInterval = setInterval(getDistance, 1000);

  // Cleanup on unload
  window.addEventListener("beforeunload", () => {
    clearInterval(distanceInterval);
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  });
