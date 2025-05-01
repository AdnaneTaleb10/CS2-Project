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
