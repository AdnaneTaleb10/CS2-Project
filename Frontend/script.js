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