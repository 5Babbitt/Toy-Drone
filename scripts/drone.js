class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  translate(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  scale(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
}

// A class that stores rotation and a Vector2 for direction
class Heading {
  constructor(x = 0, y = 0, rotation = 90) {
    this.direction = new Vector2(x, y);
    this.rotation = rotation;
  }

  // Compare two headings directions
  isDirectionEqual(other) {
    return this.direction.x === other.direction.x && this.direction.y === other.direction.y;
  }

  // Return cardinal direction name based on this headings direction
  getName() {
    if (this.isDirectionEqual(directions.north)) return "North";
    if (this.isDirectionEqual(directions.east)) return "East";
    if (this.isDirectionEqual(directions.south)) return "South";
    if (this.isDirectionEqual(directions.west)) return "West";
    console.error("Invalid direction!");
    return null;
  }
}

class Drone {
  constructor(x, y, heading) {
    this.position = new Vector2(x, y);
    this.heading = heading;
  }
  
  // Getters (I'm sure these are redundant but it's a simple habit from C, C++, C#)
  getPosition() {
    return this.position;
  }

  getHeading() {
    return this.heading.getName();
  }

  getDirection() {
    return this.heading.direction;
  }

  getRotation() {
    return this.heading.rotation;
  }

  move() {
    const dest = this.position.translate(this.heading.direction);

    if (!isValidPosition(dest)) {
      console.error("Invalid Destination!")
      return;
    }

    this.position = dest;

    return dest;
  }

  rotate(direction) {
    const currentIndex = directionArray.indexOf(this.heading);
    const newIndex = (currentIndex - direction + directionArray.length) % directionArray.length;
    this.heading = directionArray[newIndex];
  }

  attack() {
    const attackPos = this.position.translate(this.heading.direction.scale(2));

    if (!isValidPosition(attackPos)) {
      console.warn("Invalid attack target!");
      return;
    }
    
    // send projectile to attack pos

    return attackPos;
  }

  report() {
    let msg = `Position: ${this.position.x},${this.position.y} Heading: ${this.heading.getName()}`;
    console.log(msg);
    console.log(drone.getRotation());
    return msg;
  }
}

// Directions
const directions = Object.freeze({
  west: new Heading(-1, 0, 0),
  north: new Heading(0, 1, 90),
  east: new Heading(1, 0, 180),
  south: new Heading(0, -1, 270)
});

const PlaceDrone = () => {
  const x = parseInt(xInputElement.value);
  const y = parseInt(yInputElement.value);
  const heading = directions[directionInputElement.value];

  Place(x, y, heading);
}

const directionArray = [directions.north, directions.east, directions.south, directions.west];
const left = 1;
const right = -1;

// HTML References
const header = document.getElementById("header");
const footer = document.getElementById("footer");
const content = document.getElementById("content");
const debugElement = document.createElement("h3")
const droneElement = CreateElementWithAttributes("div", "drone");

// Placement Settings HTML
const placeSettings = document.getElementById("footer-placement-settings");
const xInputElement = document.getElementById("x-input");
const yInputElement = document.getElementById("y-input");
const directionInputElement = document.getElementById("heading-input");

// Drone Controls HTML
const droneControls = CreateElementWithAttributes("div", "footer-drone-controls");
const droneMovementControls = CreateElementWithAttributes("div", "footer-drone-controls-movement");
const moveButton = CreateElementWithAttributes("button", "", "drone-btn", "Move");
const leftButton = CreateElementWithAttributes("button", "", "drone-btn", "Left");
const rightButton = CreateElementWithAttributes("button", "", "drone-btn", "Right");
const attackButton = CreateElementWithAttributes("button", "", "drone-btn", "Attack");

// Grids Settings HTML
const gridSize = 10;
const grid = document.getElementById("grid-container");
const gridTop = grid.getBoundingClientRect().top;
const gridBottom = grid.getBoundingClientRect().bottom;
const gridLeft = grid.getBoundingClientRect().left;
const gridRight = grid.getBoundingClientRect().right;

let cellSize = 10;

CreateGrid();

window.addEventListener('resize', adjustGridSize)

// Setting Children
header.appendChild(debugElement);

let drone = null;
let currentRotation = 0;

function CreateGrid(rows = 10, cols = 10) {
  grid.innerHTML = "";
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
  
  for (let i = 0; i < rows * cols; i++) {
    const cell = CreateElementWithAttributes("div", "", "cell", i)
    grid.appendChild(cell);
  }
  
  adjustGridSize();
}

function adjustGridSize() {
  const gridContainerSize = Math.min(window.innerWidth, window.innerHeight);
  const cells = document.querySelectorAll(".cell");
  cellSize = gridContainerSize / gridSize * (2/3);
  
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });

  console.log("Size Adjusted")
}

function Place(x = 0, y = 0, heading = directions.north) {
  // check if spawn position is within the grid
  if (!isValidPosition(new Vector2(x, y))) {
    console.error("Invalid Placement Location! Place it within the grid.");
    return;
  }

  // run the first time the drone is spawned
  if (drone === null) {
    AddMoveControls();
    content.appendChild(droneElement);
  }

  drone = new Drone(x, y, heading);
  currentRotation = (drone.getRotation() - 90) % 360;
  droneElement.style.transform = `rotate(${currentRotation}deg)`;
  
  console.log(drone);
  
  Report();
}

function Move() {
  const moveDistance = cellSize;
  
  const movePos = drone?.move();

  const newLeft = gridLeft + movePos.scale(moveDistance).x;
  const newBottom = gridBottom + movePos.scale(moveDistance).y;

  SetDronePosition(movePos.scale(moveDistance).x, -movePos.scale(moveDistance).y);

  Report();
}

function Left() {
  drone?.rotate(left);
  currentRotation -= 90;

  droneElement.style.transform = `rotate(${currentRotation}deg)`;
  Report();
}

function Right() {
  drone?.rotate(right);
  currentRotation += 90;

  droneElement.style.transform = `rotate(${currentRotation}deg)`;
  Report();
}

function Report() {
  let msg = drone?.report();

  debugElement.innerText = msg;
}

function Attack() { 
  let attackPos = drone?.attack();
  
  console.log(`Attacked ${attackPos.x}:${attackPos.y}`)
}

function SetDronePosition(x, y) {
  droneElement.style.transform = `translate(${x}px, ${y}px)`
}

function CreateElementWithAttributes(element = "div", id = "", elementClass = "", text = "") {
  if (typeof(element) === "undefined") {
    return false;
  }

  var newElement = document.createElement(element);

  if (id !== "") {
    newElement.id = id;
  }

  if (elementClass !== "") {
    newElement.classList.add(elementClass)
  }

  if (text !== "") {
    newElement.innerText = text;
  }
  
  return newElement;
}

function AddMoveControls() {
  moveButton.onclick = function() { Move(); };
  leftButton.onclick = function() { Left(); };
  rightButton.onclick = function() { Right(); };
  attackButton.onclick = function() { Attack(); };

  droneControls.appendChild(droneMovementControls);
  droneMovementControls.appendChild(leftButton);
  droneMovementControls.appendChild(moveButton);
  droneMovementControls.appendChild(rightButton);
  droneControls.appendChild(attackButton);

  footer.appendChild(droneControls);
}

function isValidPosition(pos) {
  if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
    return false;
  }

  return true;
}