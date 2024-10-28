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
    let angle = ((Math.atan2(y, x) * 180/Math.PI) + 360) % 360;

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
    
    console.log(`Attacked ${attackPos.x}:${attackPos.y}`)
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

const directionArray = [directions.north, directions.east, directions.south, directions.west];
const left = 1;
const right = -1;

// Grid
const cellSize = 10;
const gridSize = 10;

// HTML References
const header = document.getElementById("header");
const footer = document.getElementById("footer");
const content = document.getElementById("content");
const placeSettings = document.getElementById("footer-placement-settings");
const debugElement = document.createElement("h3")
const droneElement = CreateElementWithAttributes("div", "drone");

// drone controls HTML
const droneControlsWrapper = CreateElementWithAttributes("div", "footer-drone-controls");
const droneMovementControlsWrapper = CreateElementWithAttributes("div", "footer-drone-controls-movement");
const moveButton = CreateElementWithAttributes("button", "", "move-btn", "Move");
const leftButton = CreateElementWithAttributes("button", "", "rotate-btn", "Left");
const rightButton = CreateElementWithAttributes("button", "", "rotate-btn", "Right");
const attackButton = CreateElementWithAttributes("button", "", "attack-btn", "Attack");

// Setting Children
header.appendChild(debugElement);

let drone = null;
let currentRotation = 0;

function isValidPosition(pos) {
  if (pos.x < 0 || pos.x > gridSize || pos.y < 0 || pos.y > gridSize) {
    return false;
  }

  return true;
}

function Place(x = 0, y = 0, heading = directions.north) {
  // check if spawn position is within the grid
  if (!isValidPosition(new Vector2(x, y))) {
    console.error("Invalid Place Location! Place it within the grid.");
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
  drone?.move();


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

  droneControlsWrapper.appendChild(droneMovementControlsWrapper);
  droneMovementControlsWrapper.appendChild(leftButton);
  droneMovementControlsWrapper.appendChild(moveButton);
  droneMovementControlsWrapper.appendChild(rightButton);
  droneControlsWrapper.appendChild(attackButton);

  footer.appendChild(droneControlsWrapper);
}