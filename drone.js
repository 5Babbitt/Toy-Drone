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

class Heading {
  constructor(x = 0, y = 0) {
    let angle = Math.atan2(y, x) * 180/Math.PI;

    this.direction = new Vector2(x, y);
    this.rotation = (angle >= 0) ? angle : angle + 360
  }

  isEqual(other) {
    return this.direction.x === other.direction.x && this.direction.y === other.direction.y;
  }

  getName() {
    if (this.isEqual(directions.north)) return "North";
    if (this.isEqual(directions.east)) return "East";
    if (this.isEqual(directions.south)) return "South";
    if (this.isEqual(directions.west)) return "West";
    console.warn("Invalid direction!");
    return null;
  }
}

class Drone {
  constructor(x, y, heading) {
    this.position = new Vector2(x, y);
    this.heading = heading;
  }

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
  }

  report() {
    console.log(`Position: ${this.position.x},${this.position.y} Heading: ${this.heading.getName()}`);
  }
}

// Directions
const directions = Object.freeze({
  east: new Heading(1, 0),
  north: new Heading(0, 1),
  west: new Heading(-1, 0),
  south: new Heading(0, -1)
});
const directionArray = [directions.east, directions.south, directions.west, directions.north];
const left = 1;
const right = -1;

const container = document.getElementById("gameContainer");

let drone = null;

function isValidPosition(pos) {
  if (pos.x < 0 || pos.x > 9 || pos.y < 0 || pos.y > 9) {
    return false;
  }

  return true;
}

function Place(x = 0, y = 0, heading = directions.north) {
  if (!isValidPosition(new Vector2(x, y))) {
    console.error("Invalid Place Location! Place it within the grid.");
    return;
  }

  drone = new Drone(x, y, heading);
  console.log(drone);
}

function Move() {
  drone?.move();
}

function Left() {
  drone?.rotate(left);
}

function Right() {
  drone?.rotate(right);
}

function Report() {
  drone?.report();
}

function Attack() { 
  drone?.attack();
}