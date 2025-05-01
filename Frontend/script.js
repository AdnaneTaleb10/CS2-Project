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
