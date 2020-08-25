const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 15; // called grid because each "pixel" is a grid unit, hence why code counts in grid units
const paddleHeight = grid; // 15
const maxPaddleY = 640;

var paddleSpeed = 5;
var ballSpeed = 2.5;
var numHits = 0;
var ballReset = false;
var resetOnce = 0;

var numTimesReset = 0;
var totalReset = false;
var lose = false;

var music = false;
var soundEffect = true;

var blocksRemoved = 0;

const paddle = {
  // start at bottom of canvas in middle
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: grid * 7,
  height: paddleHeight,

  // paddle starting velocity
  dx: 0,
};

const ball = {
  // start on top of paddle
  x: paddle.x + paddle.width / 2,
  y: paddle.y + grid,
  width: grid,
  height: grid,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed,
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MUSIC

function musicToggle() {
  music = !music; //if opposite
  playMusic();
}
function soundEffectToggle() {
  soundEffect = !soundEffect; //if opposite
  playHitSound();
  playBreakSound();
}

function playMusic() {
  var audio = document.getElementById("musicTwo"); // reference line 428
  if (music == true) {
    audio.play();
    audio.loop = true;
    audio.volume = 0.1;
  } else if (music == false) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function playHitSound() {
  var audioFXOne = document.getElementById("soundFXOne"); // reference line 429
  if (soundEffect == true) {
    audioFXOne.play();
  } else {
    audioFXOne.pause();
  }
}
function playBreakSound() {
  var audioFXTwo = document.getElementById("soundFXTwo"); // reference line 430
  if (soundEffect == true) {
    audioFXTwo.play();
  } else {
    audioFXTwo.pause();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create block widths
var blockWidths = [];
var blockWidths2 = [];
var blockWidths3 = [];

// rows
for (var i = 0; i < 4; i++) {
  min = Math.ceil(100);
  max = Math.floor(160);
  var x = Math.floor(Math.random() * (max - min + 1) + min);
  blockWidths.push(x);
}
for (var i = 0; i < 4; i++) {
  min = Math.ceil(90);
  max = Math.floor(160);
  var x = Math.floor(Math.random() * (max - min + 1) + min);
  blockWidths2.push(x);
}
for (var i = 0; i < 4; i++) {
  min = Math.ceil(90);
  max = Math.floor(160);
  var x = Math.floor(Math.random() * (max - min + 1) + min);
  blockWidths3.push(x);
}

//make sure last block always stretches to the edge of canvas
function createBlockWidths() {
  var fourBlockLength = 15;
  for (var i = 0; i < 4; i++) {
    fourBlockLength += blockWidths[i] + 15;
  }
  blockWidths.push(canvas.width - fourBlockLength - 15);
}
function createBlockWidths2() {
  var fourBlockLength = 15;
  for (var i = 0; i < 4; i++) {
    fourBlockLength += blockWidths2[i] + 15;
  }
  blockWidths2.push(canvas.width - fourBlockLength - 15);
}
function createBlockWidths3() {
  var fourBlockLength = 15;
  for (var i = 0; i < 4; i++) {
    fourBlockLength += blockWidths3[i] + 15;
  }
  blockWidths3.push(canvas.width - fourBlockLength - 15);
}

var blocks = [];

createBlockWidths();
var h = grid;
for (var i = 0; i < 5; i++) {
  var block = {
    x: h,
    y: grid * 2,
    width: blockWidths[i],
    height: 70,
    numHits: 0,
  };
  h += block.width + grid;
  blocks.push(block);
}
createBlockWidths2();
h = grid;
for (var i = 0; i < 5; i++) {
  var block = {
    x: h,
    y: 70 + grid * 3,
    width: blockWidths2[i],
    height: 70,
    numHits: 0,
  };
  h += block.width + grid;
  blocks.push(block);
}
createBlockWidths3();
h = grid;
for (var i = 0; i < 5; i++) {
  var block = {
    x: h,
    y: 140 + grid * 4,
    width: blockWidths3[i],
    height: 70,
    numHits: 0,
  };
  h += block.width + grid;
  blocks.push(block);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// check for collision between two objects using axis-aligned bounding box (AABB)
// see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  if (obj2 == paddle) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  //collision with atari blocks
  else {
    if (
      obj1.y + grid > obj2.y &&
      obj1.y + grid < obj2.y + 10 &&
      obj1.x + grid > obj2.x &&
      obj1.x < obj2.x + obj2.width
    ) {
      //top
      return 1;
    } else if (
      obj1.x > obj2.x + obj2.width - 10 &&
      obj1.x < obj2.x + obj2.width &&
      obj1.y + grid > obj2.y &&
      obj1.y < obj2.y + obj2.height
    ) {
      //right
      return 2;
    } else if (
      obj1.y > obj2.y + obj2.height - 10 &&
      obj1.y < obj2.y + obj2.height &&
      obj1.x + grid > obj2.x &&
      obj1.x < obj2.x + obj2.width
    ) {
      //bottom
      return 3;
    } else if (
      obj1.x + grid > obj2.x &&
      obj1.x + grid < obj2.x + 10 &&
      obj1.y + grid > obj2.y &&
      obj1.y < obj2.y + obj2.height
    ) {
      //left
      return 4;
    } else {
    }
  }
}

// display lives
function lives() {
  if (numTimesReset == 1) {
    document.getElementById("lifeOne").style.backgroundColor = "black";
  } else if (numTimesReset == 2) {
    document.getElementById("lifeTwo").style.backgroundColor = "black";
  } else if (numTimesReset == 3) {
    document.getElementById("lifeThree").style.backgroundColor = "black";
  } else {
    alert("Err.277");
  }
}

function loseScreen() {
  document.getElementById("message").innerHTML = "You Lose";
  document.getElementById("message").style.color = "white";
  document.getElementById("message").style.position = "absolute";
  document.getElementById("message").style.fontSize = "60px";
  lose = true;
}
function winScreen() {
  document.getElementById("message").innerHTML = "You Win!";
  document.getElementById("message").style.color = "white";
  document.getElementById("message").style.position = "absolute";
  document.getElementById("message").style.fontSize = "60px";
  lose = true;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // check is user lost
  if (numTimesReset >= 3) {
    loseScreen();
    totalReset = true;
    numTimesReset = 0;
  }
  if (blocksRemoved >= 30) {
    winScreen();
    totalReset = true;
  }

  // if user hasn't lost yet
  if (totalReset == false) {
    // move paddles by their velocity
    paddle.x += paddle.dx;

    // prevent paddles from going through walls
    if (paddle.x < 5) {
      paddle.x = 5;
    } else if (paddle.x > maxPaddleY) {
      paddle.x = maxPaddleY;
    }

    if (ballReset == true) {
      if (resetOnce == 0) {
        ball.dx = 0;
        ball.dy = 0;
      }
      resetOnce = 1;
    }

    // move ball by its velocity
    if (ballReset == false) {
      ball.x += ball.dx;
      ball.y += ball.dy;
    } else if (ballReset == true) {
      ball.x += ball.dx;
      ball.y += 0;
    }

    // prevent ball from going through walls by changing its velocity
    if (ball.y < grid) {
      //top
      ball.y = grid;
      ball.dy *= -1;
      playBreakSound();
    } else if (ball.x > canvas.width - grid) {
      //right
      ball.x = canvas.width - grid;
      ball.dx *= -1;
      playBreakSound();
    } else if (ball.x < grid) {
      //left
      ball.x = grid;
      ball.dx *= -1;
      playBreakSound();
    } else if (ball.y > canvas.height - grid) {
      //bottom
      ball.x = paddle.x + paddle.width / 2;
      ball.y = canvas.height - 65;
      ballReset = true;
      numTimesReset++;
      lives();
    }

    //prevent ball from going past paddle boundary
    if (ballReset == true && ball.x < paddle.x + grid * 3) {
      ball.x = paddle.x + grid * 3;
    } else if (
      ballReset == true &&
      ball.x + grid > paddle.x + paddle.width - grid * 4
    ) {
      ball.x = paddle.x + paddle.width - grid * 4;
    }

    // check to see if ball collides with paddle. if they do change x velocity
    if (collides(ball, paddle)) {
      // //system to check where on the paddle ball hit to calculate angle of deflection
      var center = ball.x + ball.width / 2;
      if (center < paddle.x + grid / 2) {
        //below 1, but still colliding with edge
        ball.dy = -0.675;
        ball.dx = -4;
      } else if (center > paddle.x && center < paddle.x + grid) {
        //1
        ball.dy = -1.33;
        ball.dx = -3.255;
      } else if (center > paddle.x + grid && center < paddle.x + grid * 2) {
        //2
        ball.dy = -2.5;
        ball.dx = -2.5;
      } else if (center > paddle.x + grid * 2 && center < paddle.x + grid * 3) {
        //3
        ball.dy = -3.255;
        ball.dx = -1.33;
      } else if (center > paddle.x + grid * 2 && center < paddle.x + grid * 4) {
        //4
        ball.dy = -3.535;
        ball.dx = 0;
      } else if (center > paddle.x + grid * 2 && center < paddle.x + grid * 5) {
        //5
        ball.dy = -3.275;
        ball.dx = 1.33;
      } else if (center > paddle.x + grid * 2 && center < paddle.x + grid * 6) {
        //6
        ball.dy = -2.5;
        ball.dx = 2.5;
      } else if (center > paddle.x + grid * 2 && center < paddle.x + grid * 7) {
        //7
        ball.dy = -1.38;
        ball.dx = 3.255;
      } else {
        //greater than 7, but still colliding with edge
        ball.dy = -0.675;
        ball.dx = 4;
      }
      playHitSound();

      // move ball above the paddle otherwise the collision will happen again
      ball.y = paddle.y - ball.width;
    }
  }

  // check to see if ball collides with atari block. if they do change velocity based off of which side ball hit
  for (var i = 0; i < blocks.length; i++) {
    if (collides(ball, blocks[i]) == 1) {
      ball.dy *= -1;
      ball.y = blocks[i].y - ball.width;
      blocks[i].numHits++;
      blocksRemoved++;
      playHitSound();
    } else if (collides(ball, blocks[i]) == 2) {
      ball.dx *= -1;
      ball.x = blocks[i].x + blocks[i].width + ball.width;
      blocks[i].numHits++;
      blocksRemoved++;
      playHitSound();
    } else if (collides(ball, blocks[i]) == 3) {
      ball.dy *= -1;
      ball.y = blocks[i].y + blocks[i].height + ball.width;
      blocks[i].numHits++;
      blocksRemoved++;
      playHitSound();
    } else if (collides(ball, blocks[i]) == 4) {
      ball.dx *= -1;
      ball.x = blocks[i].x - ball.width;
      blocks[i].numHits++;
      blocksRemoved++;
      playHitSound();
    }
  }

  // draw paddle
  context.fillStyle = "white";
  context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = "white";
  context.fillRect(0, canvas.height - 15, canvas.width, canvas.height);
  context.fillRect(0, canvas.height - 1153, canvas.width, canvas.height);

  // draw block
  for (var i = 0; i < blocks.length; i++) {
    var colorArray = [
      "#fe4a49",
      "#2ab7ca",
      "#fed766",
      "#005b96",
      "#851e3e",
      "#fe8a71",
      "#35a79c",
      "#ee4035",
      "#f37736",
      "#7bc043",
      "#0392cf",
      "#ffcc5c",
      "#ff6f69",
      "#ff5588",
      "#3d1e6d",
      "#c68642",
      "#64a1f4",
      "#01FF70",
      "#39CCCC",
      "#7FDBFF",
      "#0392cf",
      "#ffeead",
      "#ff6f69",
      "#ffcc5c",
      "#88d8b0",
      "#d11141",
      "#00b159",
      "#00aedb",
      "#f37735",
      "#ffc425",
    ];
    if (blocks[i].numHits < 2) {
      context.fillStyle = colorArray[i];
      context.fillRect(
        blocks[i].x,
        blocks[i].y,
        blocks[i].width,
        blocks[i].height
      );
    } else {
      blocks[i].x = -10;
      blocks[i].y = -10;
      blocks[i].width = 1;
      blocks[i].height = 1;
    }
  }
}

// listen to keyboard events to move the paddles
// see https://css-tricks.com/snippets/javascript/javascript-keycodes/ for keycodes
document.addEventListener("keydown", function (e) {
  // right arrow key
  if (e.which === 39) {
    paddle.dx = paddleSpeed;
    if (ballReset == true) {
      ballSpeed = paddleSpeed;
      ball.dx = ballSpeed;
    }
  }
  // left arrow key
  else if (e.which === 37) {
    paddle.dx = -paddleSpeed;
    if (ballReset == true) {
      ballSpeed = -paddleSpeed;
      ball.dx = ballSpeed;
    }
  }
  if (e.which === 32) {
    // launch ball (spacebar)
    if (ballReset == true) {
      var ySpeeds = [
        -0.675,
        -1.38,
        -2.5,
        -3.275,
        -3.535,
        -3.275,
        -2.5,
        -1.38,
        -0.675,
      ];
      var xSpeeds = [-4, -3.255, -2.5, -1.33, 0, 1.33, 2.5, 3.255, 4];
      min = Math.ceil(0);
      max = Math.floor(9);
      var randomSpeed = Math.floor(Math.random() * (max - min) + min);
      ball.dy = ySpeeds[randomSpeed];
      ball.dx = xSpeeds[randomSpeed];

      ballReset = false;
      resetOnce = 0;
    } else {
    }
  }
  if (e.which === 27) {
    alert("- paused -");
  }

  if ((e.which === 82 && lose == true) || e.which === 82) {
    location.reload();
  }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener("keyup", function (e) {
  if (e.which === 39 || e.which === 37) {
    paddle.dx = 0;
    if (ballReset == true) {
      ballSpeed = 0;
      ball.dx = ballSpeed;
      resetOnce = 0;
    }
  }
});

// start the game
requestAnimationFrame(loop);
