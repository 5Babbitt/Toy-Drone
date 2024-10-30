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

    // Check if the drone element exists
    if (document.getElementById("drone") === null) { 
      this.element = CreateElementWithAttributes("img", "drone", "drone");
      this.element.setAttribute("src", "./img/Drone.svg")
    }
    else {
      this.element = document.getElementById("drone");
    }

    // Calculate rotation of the element based on the heading
    this.elementRotation = (this.heading.rotation - 90) % 360;
  }
  
  // Getters (I'm sure these aren't necessary but it's a simple habit from C, C++, C#)
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

  // Get the element position and rotation used for element transform
  getElementTransform() {
    let x = this.position.scale(CellSize()).x;
    let y = this.position.scale(-CellSize()).y;
    let rot = this.elementRotation;
    
    return `translate(${x}px, ${y}px) rotate(${rot}deg)`;
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
    this.elementRotation -= direction * 90;
  }

  attack() {
    const attackPos = this.position.translate(this.heading.direction.scale(2));

    if (!isValidPosition(attackPos)) {
      console.warn("Invalid attack target!");
      return;
    }

    return attackPos;
  }
}

const directions = Object.freeze({
  west: new Heading(-1, 0, 0),
  north: new Heading(0, 1, 90),
  east: new Heading(1, 0, 180),
  south: new Heading(0, -1, 270)
});

// Grids Settings
const gridSize = 10;

// Drone Settings
let drone = null;

const directionArray = [
  directions.north, 
  directions.east, 
  directions.south, 
  directions.west
];

const GridRect = () => {
  return document.getElementById("grid").getBoundingClientRect().left;
}

const CellSize = () => {
  const content = document.getElementById("content");
  const gridContainerSize = Math.min(window.innerWidth, content.getBoundingClientRect().height);
  return gridContainerSize / gridSize * (4/5);
};

const IsDroneSpawned = () => {
  return !(drone === null);
}

// Events
window.addEventListener('resize', () => {AdjustGridSize()})
window.addEventListener('DOMContentLoaded', () => {CreateGrid()})

function CreateGrid(rows = 10, cols = 10) {
  const grid = document.getElementById("grid");
  
  grid.innerHTML = "";
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
  
  for (let i = 0; i < rows * cols; i++) {
    const cellID = i.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
    const cell = CreateElementWithAttributes("div", `cell-${cellID}`, "cell")
    grid.appendChild(cell);
  }
  
  AdjustGridSize();
}

function AdjustGridSize() {  
  const cells = document.querySelectorAll(".cell");
  
  cells.forEach(cell => {
    cell.style.width = `${CellSize()}px`;
    cell.style.height = `${CellSize()}px`;
  });
  
  if (IsDroneSpawned()) {
    drone.element.style.width = `${CellSize()}px`
    drone.element.style.height = `${CellSize()}px`
  }
}

function Place() {
  // Placement Settings HTML
  const xInputElement = document.getElementById("x-input");
  const yInputElement = document.getElementById("y-input");
  const directionInputElement = document.getElementById("heading-input");

  const x = parseInt(xInputElement.value);
  const y = parseInt(yInputElement.value);
  const heading = directions[directionInputElement.value];

  // check if spawn position is within the grid
  if (!isValidPosition(new Vector2(x, y))) {
    console.error("Invalid Placement Location! Place it within the grid.");
    return;
  }

  // run the first time the drone is spawned
  if (!IsDroneSpawned()) {
    AddMoveControls();
  }

  drone = new Drone(x, y, heading);
  drone.element.style.transform = drone.getElementTransform();
  document.getElementById("cell-00").appendChild(drone.element);
  
  console.log(drone);
  
  AdjustGridSize();
  Report();
}

function Move() {
  drone?.move();
  drone.element.style.transform = drone.getElementTransform();

  Report();
}

function Left() {
  drone.rotate(1);

  drone.element.style.transform = drone.getElementTransform();
}

function Right() {
  drone.rotate(-1);

  drone.element.style.transform = drone.getElementTransform();
  Report();
}

function Report() {
  const posMsg = `Position: ${drone.getPosition().x},${drone.getPosition().y}`;
  const headingMsg = `Heading: ${drone.getHeading()}`;
  const rotMsg = `Rotation: ${drone.getRotation()}`;
  const msg = `${posMsg}  ${headingMsg}  ${rotMsg}`;
  console.log(msg);
}

function Attack() { 
  const attackPos = drone?.attack();

  const projectile = CreateElementWithAttributes("div", "", "bullet");
  const cell = document.getElementById(`cell-00`);

  const startX = drone.getPosition().scale(CellSize()).x;
  const startY = drone.getPosition().scale(-CellSize()).y;

  projectile.style.transform = `translate(${startX}px, ${startY}px)`

  cell.appendChild(projectile);

  const x = attackPos.scale(CellSize()).x;
  const y = attackPos.scale(-CellSize()).y;

  projectile.style.width = `${CellSize()/8}px`;
  projectile.style.height = `${CellSize()/8}px`;
  projectile.style.transform = `translate(${x}px, ${y}px)`
  
  console.log(`Attacked ${attackPos.x}:${attackPos.y}`)

  setTimeout(() => {
    const explosion = CreateElementWithAttributes("div", "", "explosion");
    //explosion.style.transform = `translate(${x}px, ${y}px)`;
    explosion.style.width = `${CellSize()}px`;
    explosion.style.height = `${CellSize()}px`;
    const explodeCell = document.getElementById(`cell-${attackPos.x}${attackPos.y}`)

    explodeCell.appendChild(explosion);

    projectile.remove();

    setTimeout(() => {
      explosion.remove();
    }, 500);
  }, 250);
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
  // Drone Controls HTML
  const droneControls = CreateElementWithAttributes("div", "footer-drone-controls", "footer-drone-controls");
  const droneMovementControls = CreateElementWithAttributes("div", "footer-drone-controls-movement", "footer-drone-controls-movement");
  const moveButton = CreateElementWithAttributes("button", "", "drone-btn", "Move");
  const leftButton = CreateElementWithAttributes("button", "", "drone-btn", "Left");
  const rightButton = CreateElementWithAttributes("button", "", "drone-btn", "Right");
  const attackButton = CreateElementWithAttributes("button", "", "drone-btn", "Attack");
  
  moveButton.onclick = function() { Move(); };
  leftButton.onclick = function() { Left(); };
  rightButton.onclick = function() { Right(); };
  attackButton.onclick = function() { Attack(); };
  
  droneControls.appendChild(droneMovementControls);
  droneMovementControls.appendChild(leftButton);
  droneMovementControls.appendChild(moveButton);
  droneMovementControls.appendChild(rightButton);
  droneControls.appendChild(attackButton);
  
  const footer = document.getElementById("footer");

  footer.appendChild(droneControls);
}

function isValidPosition(pos) {
  if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
    return false;
  }

  return true;
}