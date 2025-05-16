// Get references to the HTML canvas and buttons
const canvas = document.getElementById("canvas");
const captureBtn = document.querySelector("#capture");
const submitBtn = document.querySelector("#submit");
const clearBtn = document.querySelector("#clear");

// Get the 2D drawing context for the canvas
const ctx = canvas.getContext("2d");

// Define the size of each grid cell (600px canvas / 28 cells)
const gridSize = 600 / 28;

// Track the previously filled cell to avoid duplicate fills
let prevCell = { x: -1, y: -1 };

// Track whether the mouse is currently pressed (drawing mode)
let isMouseDown = false;

// Draw a 28x28 grid on the canvas to guide user input
function drawGrid() {
  ctx.strokeStyle = "#424141"; // Light grid color
  ctx.lineWidth = 0.5;

  // Draw vertical lines
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Convert pixel coordinates to grid cell coordinates
function getGridPosition(x, y) {
  return {
    col: Math.floor(x / gridSize), // Column index in 28x28 grid
    row: Math.floor(y / gridSize), // Row index in 28x28 grid
  };
}

// Fill the corresponding cell on the canvas
function fillCell(x, y) {
  const { col, row } = getGridPosition(x, y);

  // Only fill if the cell is different from the last one
  if (prevCell.x !== col || prevCell.y !== row) {
    prevCell = { x: col, y: row };

    ctx.fillStyle = "black"; // Draw in black
    ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
  }
}

// Set drawing mode to true when mouse is pressed
canvas.addEventListener("mousedown", () => {
  isMouseDown = true;
});

// Stop drawing when mouse is released or leaves canvas
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});
canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
});

// When the mouse moves over the canvas while pressed, draw
canvas.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return; // Only draw if mouse is pressed

  const rect = canvas.getBoundingClientRect(); // Canvas position on screen
  const x = e.clientX - rect.left;  // Mouse X within canvas
  const y = e.clientY - rect.top;   // Mouse Y within canvas

  fillCell(x, y); // Fill the cell under the mouse
});

captureBtn.addEventListener("click", () => {
  // Step 1: Create a hidden 28x28 canvas for MNIST-style formatting
  const hiddenCanvas = document.createElement("canvas");
  hiddenCanvas.width = 28;
  hiddenCanvas.height = 28;
  const hiddenCtx = hiddenCanvas.getContext("2d");

  // Step 2: Fill the background with white (MNIST standard: white background, black digits)
  hiddenCtx.fillStyle = "white";
  hiddenCtx.fillRect(0, 0, 28, 28);

  // Step 3: Draw the main canvas content onto the hidden canvas, scaling it down to 28x28
  hiddenCtx.drawImage(canvas, 0, 0, 28, 28);

  // Step 4: Get pixel data from the hidden canvas
  let imageData = hiddenCtx.getImageData(0, 0, 28, 28);
  let pixels = imageData.data;

  // Step 5: Convert each pixel to grayscale and invert colors
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];

    // Average RGB to get grayscale value
    let gray = (r + g + b) / 3;

    // Invert grayscale (MNIST has black digits on white)
    gray = 255 - gray;

    // Apply the inverted grayscale value to RGB channels
    pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
    pixels[i + 3] = 255; // Fully opaque
  }

  // Step 6: Put the updated grayscale image back into the hidden canvas
  hiddenCtx.putImageData(imageData, 0, 0);

  // Step 7: Export the hidden canvas as a PNG data URL
  const imageURL = hiddenCanvas.toDataURL("image/png");

  // Step 8: Trigger download of the image (for testing or saving)
  const link = document.createElement("a");
  link.href = imageURL;
  link.download = "mnist_digit.png";
  link.click();
});

clearBtn.addEventListener("click", () => {
  // Clear the entire canvas (remove user drawing)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw the 28x28 guide grid
  drawGrid();

  // Reset previous cell to avoid skip issues on new drawing
  prevCell = { x: -1, y: -1 };
});

submitBtn.addEventListener("click", () => {
  // Show loading message while prediction is in progress
  const resultEl = document.getElementById("predicted-digit");
  resultEl.textContent = "Predicting...";

  // Create a hidden 28x28 canvas to format the drawing for model input
  const hiddenCanvas = document.createElement("canvas");
  hiddenCanvas.width = 28;
  hiddenCanvas.height = 28;
  const hiddenCtx = hiddenCanvas.getContext("2d");

  // Step 1: Fill the background with white (MNIST standard)
  hiddenCtx.fillStyle = "white";
  hiddenCtx.fillRect(0, 0, 28, 28);

  // Step 2: Resize and draw the user's canvas into the hidden 28x28 canvas
  hiddenCtx.drawImage(canvas, 0, 0, 28, 28);

  // Step 3: Get and process pixel data for grayscale + inversion
  let imageData = hiddenCtx.getImageData(0, 0, 28, 28);
  let pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    let gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3; // Grayscale
    gray = 255 - gray; // Invert for MNIST

    pixels[i] = pixels[i + 1] = pixels[i + 2] = gray; // Apply grayscale
    pixels[i + 3] = 255; // Fully opaque
  }

  // Step 4: Put the processed data back into the canvas
  hiddenCtx.putImageData(imageData, 0, 0);

  // Step 5: Convert the hidden canvas to a Blob and prepare form data
  hiddenCanvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'digit.png'); // Name must match Flask backend field

    // Step 6: Send image to Flask backend via POST request
    fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      body: formData,
      cache: 'no-cache'
    })
      .then(response => response.json()) // Parse JSON response
      .then(data => {
        // Step 7: Display prediction result
        if (data.digit !== undefined) {
          resultEl.textContent = `${data.digit}`; // Show predicted digit
        } else if (data.error) {
          resultEl.textContent = `Error: ${data.error}`; // Show backend error
        } else {
          resultEl.textContent = 'Unexpected error'; // Catch-all
        }
      })
      .catch(error => {
        // Network or unexpected error handling
        resultEl.textContent = 'Error during prediction';
        console.error('Prediction error:', error);
      });
  }, 'image/png'); // Specify PNG format
});

drawGrid();