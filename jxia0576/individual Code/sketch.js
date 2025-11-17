// Color schemes
const COLOR_SCHEMES = {
  day: {
    bg: [220, 220, 220],
    primary: [[221, 1, 0], [244, 196, 48], [0, 72, 186]],
    accent: [255, 255, 255],
    grid: [0, 0, 0]
  },
  night: {
    bg: [8, 8, 15],
    primary: [[119, 101, 213], [252, 101, 154], [255, 114, 59]],
    accent: [85, 237, 189],
    grid: [30, 42, 72]
  }
};

// Global variables
let isNightMode = false;
let gridLines = [];
let blocks = [];

// new interaction variables
let lastMouseX = 0;
let lastMouseY = 0;
let dragSpeed = 0;
const SPEED_FACTOR = 0.12;

// GridLine class
class GridLine {
  constructor(x1, y1, x2, y2, isVertical) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.isVertical = isVertical;
    this.thickness = 12;
    this.cubes = [];
    this.initCubes();
  }

  initCubes() {
    const length = this.isVertical ? this.y2 - this.y1 : this.x2 - this.x1;
    const numCubes = Math.floor(length / 30);
    
    for (let i = 0; i < numCubes; i++) {
      const pos = Math.random() * length;
      const size = random(6, 14);
      const speed = random(0.5, 2) * (random() > 0.5 ? 1 : -1);
      const colorIndex = floor(random(3));
      
      this.cubes.push({
        pos: pos,
        size: size,
        speed: speed,
        colorIndex: colorIndex
      });
    }
  }

  update() {
    const length = this.isVertical ? this.y2 - this.y1 : this.x2 - this.x1;
    
    this.cubes.forEach(cube => {
      // interaction-based adaptive movement
      let delta = cube.speed * (1 + dragSpeed);

      // drag direction control
      if (mouseIsPressed) {
        if (this.isVertical && mouseY < pmouseY) delta *= -1;
        if (!this.isVertical && mouseX < pmouseX) delta *= -1;
      }

      cube.pos += delta;
      
      if (delta > 0 && cube.pos > length) {
        cube.pos = 0;
      } else if (delta < 0 && cube.pos < 0) {
        cube.pos = length;
      }
    });
  }

  draw() {
    const colors = isNightMode ? COLOR_SCHEMES.night : COLOR_SCHEMES.day;
    
    // Draw line
    stroke(...colors.grid);
    strokeWeight(this.thickness);
    line(this.x1, this.y1, this.x2, this.y2);
    
    // Draw moving cubes
    noStroke();
    this.cubes.forEach(cube => {
      fill(...colors.primary[cube.colorIndex]);
      
      if (this.isVertical) {
        const y = this.y1 + cube.pos;
        const x = this.x1 - cube.size / 2;
        rect(x, y, cube.size, cube.size);
      } else {
        const x = this.x1 + cube.pos;
        const y = this.y1 - cube.size / 2;
        rect(x, y, cube.size, cube.size);
      }
    });
  }
}

// IntersectionBlock class
class IntersectionBlock {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.colorIndex = floor(random(4));
  }

  draw() {
    const colors = isNightMode ? COLOR_SCHEMES.night : COLOR_SCHEMES.day;
    noStroke();
    
    if (this.colorIndex < 3) {
      fill(...colors.primary[this.colorIndex]);
    } else {
      fill(...colors.accent);
    }
    rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

// Initialize grid lines
function initializeGridLines() {
  // Create vertical lines
  const verticalPositions = [100, 180, 280, 360, 450, 520];
  verticalPositions.forEach(x => {
    gridLines.push(new GridLine(x, 50, x, 550, true));
  });
  
  // Create horizontal lines
  const horizontalPositions = [80, 160, 250, 330, 420, 500];
  horizontalPositions.forEach(y => {
    gridLines.push(new GridLine(50, y, 550, y, false));
  });
  
  return { verticalPositions, horizontalPositions };
}

// Initialize blocks using a city map grid system
function initializeBlocks(verticalPositions, horizontalPositions) {
  const cityMap = [
    [1, 0, 1, 1, 0],
    [0, 1, 0, 1, 1],
    [1, 1, 1, 0, 1],
    [0, 0, 1, 1, 0],
    [1, 1, 1, 0, 1],
  ];
  
  const roadThickness = 12;
  const roadHalf = roadThickness / 2;
  
  for (let i = 0; i < cityMap.length; i++) {
    for (let j = 0; j < cityMap[i].length; j++) {
      if (cityMap[i][j] === 1) {
        const leftX = verticalPositions[j];
        const rightX = verticalPositions[j + 1];
        const topY = horizontalPositions[i];
        const bottomY = horizontalPositions[i + 1];
        
        const size = random(25, 60);
        const corner = floor(random(4));
        let x, y;
        
        if (corner === 0) {
          x = leftX + roadHalf + size / 2;
          y = topY + roadHalf + size / 2;
        } else if (corner === 1) {
          x = rightX - roadHalf - size / 2;
          y = topY + roadHalf + size / 2;
        } else if (corner === 2) {
          x = leftX + roadHalf + size / 2;
          y = bottomY - roadHalf - size / 2;
        } else {
          x = rightX - roadHalf - size / 2;
          y = bottomY - roadHalf - size / 2;
        }
        
        blocks.push(new IntersectionBlock(x, y, size));
      }
    }
  }
}

// p5.js setup function
function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');
  frameRate(60);
  
  const { verticalPositions, horizontalPositions } = initializeGridLines();
  initializeBlocks(verticalPositions, horizontalPositions);
}

// p5.js draw function
function draw() {
  const colors = isNightMode ? COLOR_SCHEMES.night : COLOR_SCHEMES.day;

  // semi-transparent fade for trails
  let fade = isNightMode ? 30 : 18;
  background(colors.bg[0], colors.bg[1], colors.bg[2], fade);

  // mouse drag motion input
  if (mouseIsPressed) {
    let dx = mouseX - lastMouseX;
    let dy = mouseY - lastMouseY;
    dragSpeed = sqrt(dx * dx + dy * dy) * SPEED_FACTOR;
  } else {
    dragSpeed *= 0.95;
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  // Update and draw grid lines
  gridLines.forEach(line => {
    line.update();
    line.draw();
  });
  
  // Draw intersection blocks
  blocks.forEach(block => {
    block.draw();
  });
}

// Toggle mode function
function toggleMode() {
  isNightMode = !isNightMode;
  const btn = document.getElementById('mode-btn');
  
  if (isNightMode) {
    btn.textContent = '☀️ Day Mode';
    btn.className = 'night-mode';
  } else {
    btn.textContent = '🌙 Night Mode';
    btn.className = 'day-mode';
  }
}
