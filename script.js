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
output.addEventListener("click", () => {
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
  });

  distance.addEventListener("click", () => {
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
  });
// Speak the description
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

async function getDistance() {
    try {
      const url = 'http://192.168.137.204/distance';
      console.log('Sending request to:', url);

      const response = await fetch(url);

      console.log('Raw response:', response);

      if (!response.ok) {
        throw new Error(HTTP error! status: ${response.status});
      }

      const data = await response.json();
      console.log('Received data:', data);

      const distance = data.distance;
      console.log('Distance value:', distance);

      if (distance) {
        distance1.textContent = Distance: ${distance} cm;
      }

    } catch (error) {
      console.error('Fetch error:', error.message || error);
    }
  }

  // Fetch every second
  setInterval(getDistance, 1000);
