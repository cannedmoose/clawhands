// How to reschedule an animation
// Or reverse it..

const stateText = {
  OPEN: "Eloise on this special day I wanted to say...", // Normal
  CRAB: "Ahhh a crab, kill itt!!!!!", // Fast
  CRABKILL: "Good job! Uhhh where was I...", // Normal
  EYE: "Ewwww an eye, killl it!!!!", // Fast
  EYEKILL: "Ummmm so as I was saying...", // Normal
  U: "... a U??!?! KILL ITTT!!!", // Fast
  UKILL: "Sooo I was going to say...", // Normal
  FINISH: ""
};

window.onload = function() {
  const main = document.querySelector("#main");
  const textArea = document.querySelector("#text");
  let gameState = {
    stage: "OPEN",
    lines: [],
    props: {},
    backgroundAnim: {
      ease: Math.easeInOutQuad,
      duration: 1000,
      start: 0,
      startVal: 0.5,
      changeVal: 0.6
    },
    titleAnim: {
      ease: Math.linearTween,
      duration: 2000,
      start: 0,
      startVal: 0,
      changeVal: 1
    },
    textAnim: {
      ease: Math.easeOutQuad,
      duration: 2000,
      start: 0,
      startVal: 0,
      changeVal: 1
    },
    time: 0
  };

  window.requestAnimationFrame(render(main, textArea, gameState));
};

function render(canvas, textArea, gameState) {
  const ctx = canvas.getContext("2d");
  canvasClick(ctx, gameState);

  function renderer(delta) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.time = delta;

    // Update title
    changeTitle(animate(delta, gameState.titleAnim));
    if (isFinished(delta, gameState.titleAnim)) {
      gameState.titleAnim.start = delta;
    }

    // Draw blue background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    ctx.save();

    ctx.beginPath();
    for (let i = 0; i < gameState.lines.length; i++) {
      if (gameState.stage != "FINISH") {
        pathRay(ctx, delta, gameState.lines[i]);
      } else {
        pathExpanding(ctx, delta, gameState.lines[i]);
      }
    }
    ctx.clip();

    // Draw background hearts
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, delta, gameState.backgroundAnim, "pink", "red");

    // Loop hearts animation
    if (isFinished(delta, gameState.backgroundAnim)) {
      gameState.backgroundAnim.start = delta;
      gameState.backgroundAnim.startVal =
        gameState.backgroundAnim.startVal + gameState.backgroundAnim.changeVal;
      gameState.backgroundAnim.changeVal = -gameState.backgroundAnim.changeVal;
      if (gameState.backgroundAnim.changeVal < 0) {
        zzfx(gameState.lines.length * 0.15, 0, 100, 2, 0.5, 0.1, 0, 0.2, -3.35);
      }
    }
    ctx.restore();

    // Draw props
    if (gameState.props.crab) {
      crabRender(ctx, gameState);
    }

    if (gameState.props.eye) {
      eyeRender(ctx, gameState);
    }

    if (gameState.props.u) {
      uRender(ctx, gameState);
    }

    // Draw text

    let text = stateText[gameState.stage];
    let textPercent = animate(delta, gameState.textAnim);
    textArea.innerText = text;
    textArea.style = "opacity: " + textPercent;

    window.requestAnimationFrame(renderer);
  }

  return renderer;
}

function crabRender(ctx, gameState) {
  let rot = animate(gameState.time, gameState.props.crab.rotAnim);
  let scale = animate(gameState.time, gameState.props.crab.scaleAnim);
  let x = animate(gameState.time, gameState.props.crab.xAnim);
  let y = animate(gameState.time, gameState.props.crab.yAnim);
  drawProp(ctx, rot, scale, x, y, crabIMG);

  if (
    isFinished(gameState.time, gameState.props.crab.xAnim) &&
    gameState.props.crab.stage == "ALIVE"
  ) {
    let xGoal = Math.random() * window.innerWidth;
    let yGoal = Math.min(
      Math.max(
        y - Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.1,
        window.innerHeight * 0.2
      ),
      window.innerHeight * 0.8
    );

    gameState.props.crab.xAnim.start = gameState.time;
    gameState.props.crab.xAnim.startVal = x;
    gameState.props.crab.xAnim.changeVal = xGoal - x;

    gameState.props.crab.yAnim.start = gameState.time;
    gameState.props.crab.yAnim.startVal = y;
    gameState.props.crab.yAnim.changeVal = yGoal - y;
  }
}

function eyeRender(ctx, gameState) {
  let rot = animate(gameState.time, gameState.props.eye.rotAnim);
  let scale = animate(gameState.time, gameState.props.eye.scaleAnim);
  let x = animate(gameState.time, gameState.props.eye.xAnim);
  let y = animate(gameState.time, gameState.props.eye.yAnim);
  drawProp(ctx, rot, scale, x, y, eyeIMG);

  if (
    isFinished(gameState.time, gameState.props.eye.xAnim) &&
    gameState.props.eye.stage == "ALIVE"
  ) {
    let xGoal = Math.random() * window.innerWidth;
    let yGoal = Math.min(
      Math.max(
        y - Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.1,
        window.innerHeight * 0.2
      ),
      window.innerHeight * 0.8
    );

    gameState.props.eye.xAnim.start = gameState.time;
    gameState.props.eye.xAnim.startVal = x;
    gameState.props.eye.xAnim.changeVal = xGoal - x;

    gameState.props.eye.yAnim.start = gameState.time;
    gameState.props.eye.yAnim.startVal = y;
    gameState.props.eye.yAnim.changeVal = yGoal - y;
  }
}

function uRender(ctx, gameState) {
  let rot = animate(gameState.time, gameState.props.u.rotAnim);
  let scale = animate(gameState.time, gameState.props.u.scaleAnim);
  let x = animate(gameState.time, gameState.props.u.xAnim);
  let y = animate(gameState.time, gameState.props.u.yAnim);
  drawProp(ctx, rot, scale, x, y, uIMG);

  if (
    isFinished(gameState.time, gameState.props.u.xAnim) &&
    gameState.props.u.stage == "ALIVE"
  ) {
    let xGoal = Math.random() * window.innerWidth;
    let yGoal = Math.min(
      Math.max(
        y - Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.1,
        window.innerHeight * 0.2
      ),
      window.innerHeight * 0.8
    );

    gameState.props.u.xAnim.start = gameState.time;
    gameState.props.u.xAnim.startVal = x;
    gameState.props.u.xAnim.changeVal = xGoal - x;

    gameState.props.u.yAnim.start = gameState.time;
    gameState.props.u.yAnim.startVal = y;
    gameState.props.u.yAnim.changeVal = yGoal - y;
  }
}

function drawProp(ctx, rot, scale, x, y, prop) {
  let biggestDim = window.innerWidth;
  let scaleFactor = 0.1 * (biggestDim / 550);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.scale(scale, scale);
  ctx.translate(-550 / 2, -550 / 2);
  ctx.drawImage(prop, 0, 0);
  ctx.restore();
}

function canvasClick(ctx, gameState) {
  let biggestDim = window.innerWidth;
  let scaleFactor = 0.1 * (biggestDim / 550);

  let clicker = function(event) {
    let textAnimationFinished = isFinished(gameState.time, gameState.textAnim);
    if (gameState.stage == "OPEN") {
      gameState.stage = "CRAB";
      gameState.textAnim.start = gameState.time;
      let xpos =
        Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.1;
      let xGoal =
        Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.1;
      let ypos =
        Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.7;
      let yGoal =
        ypos -
        Math.random() * window.innerHeight * 0.2 -
        window.innerHeight * 0.1;
      gameState.props.crab = {
        xAnim: {
          ease: Math.easeInOutQuad,
          duration: 1500,
          start: gameState.time,
          startVal: xpos,
          changeVal: xGoal - xpos
        },
        yAnim: {
          ease: Math.easeInOutQuad,
          duration: 1500,
          start: gameState.time,
          startVal: ypos,
          changeVal: yGoal - ypos
        },
        rotAnim: {
          ease: Math.easeInOutQuad,
          duration: 0,
          start: gameState.time,
          startVal: 0,
          changeVal: 0
        },
        scaleAnim: {
          ease: Math.easeInOutQuad,
          duration: 0,
          start: gameState.time,
          startVal: 0,
          changeVal: 0
        },
        stage: "ALIVE"
      };
    } else if (gameState.stage == "CRAB") {
      let crabRad = (550 * scaleFactor) / 2;
      let crabX = animate(gameState.time, gameState.props.crab.xAnim);
      let crabY = animate(gameState.time, gameState.props.crab.yAnim);
      gameState.click = event;
      if (
        (event.clientX - crabX) * (event.clientX - crabX) +
          (event.clientY - crabY) * (event.clientY - crabY) <=
        crabRad * crabRad
      ) {
        gameState.props.crab.xAnim.start = gameState.time;
        gameState.props.crab.xAnim.startVal = crabX;
        gameState.props.crab.xAnim.changeVal = 0;

        gameState.props.crab.yAnim.start = gameState.time;
        gameState.props.crab.yAnim.startVal = crabY;
        gameState.props.crab.yAnim.changeVal = 0;

        gameState.props.crab.stage = "KILLED";
        gameState.stage = "CRABKILL";
        gameState.props.crab.rotAnim = {
          ease: Math.easeInOutQuad,
          duration: 1000,
          start: gameState.time,
          startVal: 0,
          changeVal: Math.PI
        };
        gameState.textAnim.start = gameState.time + 1000;
        addLine(gameState, crabX, crabY);
      }
    } else if (gameState.stage == "CRABKILL") {
      gameState.stage = "EYE";
      gameState.textAnim.start = gameState.time;
      let xpos =
        Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.1;
      let xGoal =
        Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.1;
      let ypos =
        Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.7;
      let yGoal =
        Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.7;
      gameState.props.eye = {
        xAnim: {
          ease: Math.easeInOutQuad,
          duration: 1000,
          start: gameState.time,
          startVal: xpos,
          changeVal: xGoal - xpos
        },
        yAnim: {
          ease: Math.easeInOutQuad,
          duration: 1000,
          start: gameState.time,
          startVal: ypos,
          changeVal: yGoal - ypos
        },
        rotAnim: {
          ease: Math.easeInOutQuad,
          duration: 0,
          start: gameState.time,
          startVal: 0,
          changeVal: 0
        },
        scaleAnim: {
          ease: Math.easeInOutQuad,
          duration: 0,
          start: gameState.time,
          startVal: 0,
          changeVal: 0
        },
        stage: "ALIVE"
      };
    } else if (gameState.stage == "EYE") {
      let crabRad = (550 * scaleFactor) / 2;
      let crabX = animate(gameState.time, gameState.props.eye.xAnim);
      let crabY = animate(gameState.time, gameState.props.eye.yAnim);
      gameState.click = event;
      if (
        (event.clientX - crabX) * (event.clientX - crabX) +
          (event.clientY - crabY) * (event.clientY - crabY) <=
        crabRad * crabRad
      ) {
        gameState.props.eye.xAnim.start = gameState.time;
        gameState.props.eye.xAnim.startVal = crabX;
        gameState.props.eye.xAnim.changeVal = 0;

        gameState.props.eye.yAnim.start = gameState.time;
        gameState.props.eye.yAnim.startVal = crabY;
        gameState.props.eye.yAnim.changeVal = 0;

        gameState.props.eye.stage = "KILLED";
        gameState.stage = "EYEKILL";
        gameState.props.eye.rotAnim = {
          ease: Math.easeInOutQuad,
          duration: 1000,
          start: gameState.time,
          startVal: 0,
          changeVal: Math.PI
        };
        gameState.textAnim.start = gameState.time + 1000;
        addLine(gameState, crabX, crabY);
      }
    } else if (gameState.stage == "EYEKILL") {
      gameState.stage = "U";
      gameState.textAnim.start = gameState.time;
      let xpos =
        Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.1;
      let xGoal =
        Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.1;
      let ypos =
        Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.7;
      let yGoal =
        ypos -
        Math.random() * window.innerHeight * 0.2 -
        window.innerHeight * 0.1;
      gameState.props.u = {
        xAnim: {
          ease: Math.easeInOutQuad,
          duration: 750,
          start: gameState.time,
          startVal: xpos,
          changeVal: xGoal - xpos
        },
        yAnim: {
          ease: Math.easeInOutQuad,
          duration: 750,
          start: gameState.time,
          startVal: ypos,
          changeVal: yGoal - ypos
        },
        rotAnim: {
          ease: Math.easeInOutQuad,
          duration: 0,
          start: gameState.time,
          startVal: 0,
          changeVal: 0
        },
        scaleAnim: {
          ease: Math.easeInOutQuad,
          duration: 0,
          start: gameState.time,
          startVal: 0,
          changeVal: 0
        },
        stage: "ALIVE"
      };
    } else if (gameState.stage == "U") {
      let crabRad = (550 * scaleFactor) / 2;
      let crabX = animate(gameState.time, gameState.props.u.xAnim);
      let crabY = animate(gameState.time, gameState.props.u.yAnim);
      gameState.click = event;
      if (
        (event.clientX - crabX) * (event.clientX - crabX) +
          (event.clientY - crabY) * (event.clientY - crabY) <=
        crabRad * crabRad
      ) {
        gameState.props.u.xAnim.start = gameState.time;
        gameState.props.u.xAnim.startVal = crabX;
        gameState.props.u.xAnim.changeVal = 0;

        gameState.props.u.yAnim.start = gameState.time;
        gameState.props.u.yAnim.startVal = crabY;
        gameState.props.u.yAnim.changeVal = 0;

        gameState.props.u.stage = "KILLED";
        gameState.stage = "UKILL";
        gameState.props.u.rotAnim = {
          ease: Math.easeInOutQuad,
          duration: 1000,
          start: gameState.time,
          startVal: 0,
          changeVal: Math.PI
        };
        gameState.textAnim.start = gameState.time + 1000;
        addLine(gameState, crabX, crabY);
      }
    } else if (gameState.stage == "UKILL") {
      gameState.stage = "FINISH";
      gameState.lines = gameState.lines.map(function(line) {
        line.animation.start = gameState.time + 100;
        line.animation.ease = Math.easeInOutSine;
        line.animation.duration = 2000;
        return { ...line };
      });

      let rotAnim = {
        ease: Math.easeInOutQuad,
        duration: 1000,
        start: gameState.time,
        startVal: Math.PI,
        changeVal: -Math.PI
      };

      let scaleAnim = {
        ease: Math.easeInOutQuad,
        duration: 1000,
        start: gameState.time,
        startVal: 1,
        changeVal: 2
      };

      let y = window.innerHeight / 2;

      let eyeX = window.innerWidth / 6;
      let crabX = window.innerWidth / 2;
      let uX = (5 * window.innerWidth) / 6;

      gameState.props.eye.rotAnim = rotAnim;
      gameState.props.eye.scaleAnim = scaleAnim;
      gameState.props.eye.xAnim.changeVal =
        eyeX - gameState.props.eye.xAnim.startVal;
      gameState.props.eye.xAnim.start = gameState.time;
      gameState.props.eye.yAnim.changeVal =
        y - gameState.props.eye.yAnim.startVal;
      gameState.props.eye.yAnim.start = gameState.time;

      gameState.props.crab.rotAnim = rotAnim;
      gameState.props.crab.scaleAnim = scaleAnim;
      gameState.props.crab.xAnim.changeVal =
        crabX - gameState.props.crab.xAnim.startVal;
      gameState.props.crab.xAnim.start = gameState.time;
      gameState.props.crab.yAnim.changeVal =
        y - gameState.props.crab.yAnim.startVal;
      gameState.props.crab.yAnim.start = gameState.time;

      gameState.props.u.rotAnim = rotAnim;
      gameState.props.u.scaleAnim = scaleAnim;
      gameState.props.u.xAnim.changeVal = uX - gameState.props.u.xAnim.startVal;
      gameState.props.u.xAnim.start = gameState.time;
      gameState.props.u.yAnim.changeVal = y - gameState.props.u.yAnim.startVal;
      gameState.props.u.yAnim.start = gameState.time;
    }
  };

  if (gameState.clicker) {
    window.removeEventListener(gameState.clicker);
  }
  gameState.clicker = clicker;
  window.addEventListener("click", clicker);
}

// LINES
/**
 * Draw a ray through the center that expands in both length and width
 */

function slope(x1, y1, x2, y2) {
  return (y1 - y2) / (x1 - x2);
}

// x = 0
function lcase1(x1, y1, x2, y2) {
  let m = slope(x1, y1, x2, y2);
  return y1 - m * x1;
}

// x= width
function lcase2(x1, y1, x2, y2) {
  let m = slope(x1, y1, x2, y2);
  return y1 + m * window.innerWidth - m * x1;
}

// y= 0
function lcase3(x1, y1, x2, y2) {
  let m = slope(x1, y1, x2, y2);
  return -y1 / m + x1;
}

// y = height
function lcase4(x1, y1, x2, y2) {
  let m = slope(x1, y1, x2, y2);
  return (window.innerHeight - y1) / m + x1;
}

function addLine(gameState, x, y) {
  let startPos = Math.random() * (window.innerWidth + window.innerHeight) * 2;

  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;

  let width = window.innerWidth;
  let height = window.innerHeight;

  if (startPos < window.innerWidth) {
    // y = 0
    x1 = startPos;

    if (lcase1(x1, y1, x, y) < height && lcase1(x1, y1, x, y) > 0) {
      y2 = lcase1(x1, y1, x, y);
    } else if (lcase2(x1, y1, x, y) < height && lcase2(x1, y1, x, y) > 0) {
      y2 = lcase2(x1, y1, x, y);
      x2 = width;
    } else if (lcase4(x1, y1, x, y) < width && lcase3(x1, y1, x, y) > 0) {
      x2 = lcase4(x1, y1, x, y);
      y2 = height;
    }
  } else {
    startPos -= window.innerWidth;
    if (startPos < window.innerHeight) {
      y1 = startPos;
      x1 = window.innerWidth;

      if (lcase1(x1, y1, x, y) < height && lcase1(x1, y1, x, y) > 0) {
        y2 = lcase1(x1, y1, x, y);
      } else if (lcase3(x1, y1, x, y) < width && lcase3(x1, y1, x, y) > 0) {
        x2 = lcase3(x1, y1, x, y);
      } else if (lcase4(x1, y1, x, y) < width && lcase4(x1, y1, x, y) > 0) {
        x2 = lcase4(x1, y1, x, y);
        y2 = height;
      }
    } else {
      startPos -= window.innerHeight;
      if (startPos < window.innerWidth) {
        x1 = startPos;
        y1 = window.innerHeight;
        if (lcase1(x1, y1, x, y) < height && lcase1(x1, y1, x, y) > 0) {
          y2 = lcase1(x1, y1, x, y);
        } else if (lcase2(x1, y1, x, y) < height && lcase2(x1, y1, x, y) > 0) {
          y2 = lcase2(x1, y1, x, y);
          x2 = width;
        } else if (lcase3(x1, y1, x, y) < width && lcase3(x1, y1, x, y) > 0) {
          x2 = lcase3(x1, y1, x, y);
        }
      } else {
        y1 = startPos - window.innerWidth;
        if (lcase3(x1, y1, x, y) < width && lcase3(x1, y1, x, y) > 0) {
          x2 = lcase3(x1, y1, x, y);
        } else if (lcase2(x1, y1, x, y) < height && lcase2(x1, y1, x, y) > 0) {
          y2 = lcase2(x1, y1, x, y);
          x2 = width;
        } else if (lcase4(x1, y1, x, y) < width && lcase4(x1, y1, x, y) > 0) {
          x2 = lcase4(x1, y1, x, y);
          y2 = height;
        }
      }
    }
  }

  gameState.lines.push({
    animation: {
      ease: Math.easeInOutQuad,
      duration: 1000,
      start: gameState.time,
      startVal: 0,
      changeVal: 1
    },
    x1,
    y1,
    x2,
    y2
  });
  zzfx(1, 4.7, 0, 0.75, 0.1, 0.005, 0.02, 181, 1.68); // ZzFX 77605
}

function pathRay(ctx, delta, line) {
  let { x1, y1, x2, y2, animation } = line;
  let biggestDim = Math.max(window.innerWidth, window.innerHeight);
  let maxLineWidth = biggestDim * 0.05;
  //let x2 = window.innerWidth - x;
  //let y2 = window.innerHeight - y;

  let percent = animate(delta, animation);

  let angleRadians = Math.PI / 2 - Math.atan2(y2 - y1, x2 - x1);

  let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

  ctx.translate(x1, y1);
  ctx.rotate(-angleRadians);
  ctx.rect(
    (-maxLineWidth * percent * percent) / 2,
    -maxLineWidth * 2,
    maxLineWidth * percent * percent,
    (length + maxLineWidth * 4) * percent
  );
  ctx.rotate(angleRadians);
  ctx.translate(-x1, -y1);
}

/**
 * Draw a ray through the center that expands in width
 */
function pathExpanding(ctx, delta, line) {
  let { x1, y1, x2, y2, animation } = line;
  let biggestDim = Math.max(window.innerWidth, window.innerHeight);
  let rayWidth = biggestDim * 0.05;
  biggestDim = biggestDim * 2;
  //let x2 = window.innerWidth - x;
  //let y2 = window.innerHeight - y;

  let percent = animate(delta, animation);

  let angleRadians = Math.PI / 2 - Math.atan2(y2 - y1, x2 - x1);

  let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

  ctx.translate(x1, y1);
  ctx.rotate(-angleRadians);
  ctx.rect(
    (-biggestDim * percent * percent - rayWidth) / 2,
    -rayWidth * 2,
    biggestDim * percent * percent + rayWidth,
    length + rayWidth * 4
  );
  ctx.rotate(angleRadians);
  ctx.translate(-x1, -y1);
}

// BACKGROUND HEARTS

function drawBackground(ctx, delta, anim, fill1, fill2) {
  let largestDim = Math.max(window.innerHeight, window.innerWidth);

  const heartsAcross = 4;

  let heartSize = largestDim / heartsAcross; // Scaled size of a heart
  const scaleFactor = heartSize / 100;

  let percent = animate(delta, anim);

  for (let ycol = 0; ycol < window.innerHeight / heartSize + 1; ycol++) {
    for (let xcol = 0; xcol < window.innerWidth / heartSize + 1; xcol++) {
      ctx.save();
      ctx.translate(xcol * heartSize, ycol * heartSize);
      if ((ycol + xcol) % 2 == 0) {
        ctx.rotate(Math.PI);
      }
      ctx.scale(scaleFactor * percent, scaleFactor * percent);
      heartStack(
        ctx,
        4,
        (t, b, c, d) =>
          Math.linearTween(t * Math.sqrt(Math.sqrt(percent)), b, c, d),
        fill1,
        fill2
      );

      ctx.restore();
    }
  }
}

function heartStack(ctx, n, ease, fill1, fill2) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    ctx.save();
    if (i % 2 == 0) {
      ctx.fillStyle = fill1;
    } else {
      ctx.fillStyle = fill2;
    }

    const scale = ease(i / (n - 1), 1, -3, n);

    ctx.scale(scale, scale);
    heart(ctx);
    ctx.restore();
  }
  ctx.restore();
}

function heart(ctx) {
  ctx.save();
  ctx.translate(-75, -75);
  ctx.beginPath();
  ctx.moveTo(75, 40);
  ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
  ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
  ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
  ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
  ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
  ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
  ctx.fill();
  ctx.restore();
}

// Want to specify function onStart and onFinish functions for animation
// can get rid of loops, reverse if we do
// Also content should just be onAnimate
// Also also should only draw hearts once, then color shift for the second one.

function isFinished(time, animation) {
  return animation.start + animation.duration < time;
}

function animate(time, animation) {
  let { ease, duration, start, startVal, changeVal } = {
    ...animation
  };

  // Elapsed time since start Clamped to [0, duration]
  let clampedElapsed = Math.min(Math.max(time - start, 0), duration);

  const genValue = ease(clampedElapsed, startVal, changeVal, duration);
  return genValue;
}

function changeTitle(percent) {
  let steps = 8;
  if (percent < 1 / steps) {
    document.title = "😘___＿😊";
  } else if (percent < 2 / steps) {
    document.title = "😘💕___😊";
  } else if (percent < 3 / steps) {
    document.title = "😘_💕__😊";
  } else if (percent < 4 / steps) {
    document.title = "😘__💕_😊";
  } else if (percent < 5 / steps) {
    document.title = "😘___💕😊";
  } else if (percent < 6 / steps) {
    document.title = "😘___＿😍";
  } else if (percent < 7 / steps) {
    document.title = "😘___＿😍";
  }
}
