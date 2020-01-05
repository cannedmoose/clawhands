// How to reschedule an animation
// Or reverse it..

window.onload = function() {
  const main = document.querySelector("#main");
  let gameState = {
    stage: "OPEN",
    lines: [],
    props: [],
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
    textAnim: {},
    time: 0
  };

  window.requestAnimationFrame(render(main, gameState));
};

function render(canvas, gameState) {
  const ctx = canvas.getContext("2d");
  let canvasClicker = canvasClick(gameState);
  main.addEventListener("click", canvasClicker);

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
      if (gameState.stage != "FINAL") {
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

    window.requestAnimationFrame(renderer);
  }

  return renderer;
}

function canvasClick(gameState) {
  return function(event) {
    let startPos = Math.random() * (window.innerWidth + window.innerHeight) * 2;
    if (gameState.lines.length == 0) {
      startPos = window.innerWidth * 0.3;
    } else if (gameState.lines.length == 1) {
      startPos = window.innerWidth * 1.13 + window.innerHeight;
    } else if (gameState.lines.length == 2) {
      startPos = window.innerWidth * 2 + window.innerHeight * 1.4;
    } else {
      return;
    }

    let x = 0;
    let y = 0;

    if (startPos < window.innerWidth) {
      x = startPos;
    } else {
      startPos -= window.innerWidth;
      if (startPos < window.innerHeight) {
        y = startPos;
        x = window.innerWidth;
      } else {
        startPos -= window.innerHeight;
        if (startPos < window.innerWidth) {
          x = startPos;
          y = window.innerHeight;
        } else {
          y = startPos - window.innerWidth;
        }
      }
    }

    gameState.lines.push({
      animation: {
        ease: Math.linearTween,
        duration: 2000,
        start: gameState.time,
        startVal: 0,
        changeVal: 1
      },
      x,
      y
    });
    zzfx(1, 4.7, 0, 0.75, 0.1, 0.005, 0.02, 181, 1.68); // ZzFX 77605
  };
}

// LINES
/**
 * Draw a ray through the center that expands in both length and width
 */
function pathRay(ctx, delta, line) {
  let { x, y, animation } = line;
  let biggestDim = Math.max(window.innerWidth, window.innerHeight);
  let maxLineWidth = biggestDim * 0.05;
  let x2 = window.innerWidth - x;
  let y2 = window.innerHeight - y;

  let percent = animate(delta, animation);

  let angleRadians = Math.PI / 2 - Math.atan2(y2 - y, x2 - x);

  let length = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));

  ctx.translate(x, y);
  ctx.rotate(-angleRadians);
  ctx.rect(
    (-maxLineWidth * percent * percent) / 2,
    -maxLineWidth,
    maxLineWidth * percent * percent,
    (length + maxLineWidth * 2) * percent
  );
  ctx.rotate(angleRadians);
  ctx.translate(-x, -y);
}

/**
 * Draw a ray through the center that expands in width
 */
function pathExpanding(ctx, delta, line) {
  let { x, y, animation } = line;
  let biggestDim = Math.max(window.innerWidth, window.innerHeight);
  let rayWidth = biggestDim * 0.05;
  let x2 = window.innerWidth - x;
  let y2 = window.innerHeight - y;

  let percent = animate(delta, animation);

  let angleRadians = Math.PI / 2 - Math.atan2(y2 - y, x2 - x);

  let length = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));

  ctx.translate(x, y);
  ctx.rotate(-angleRadians);
  ctx.rect(
    (-biggestDim * percent * percent - rayWidth) / 2,
    -rayWidth,
    biggestDim * percent * percent + rayWidth,
    length + rayWidth * 2
  );
  ctx.rotate(angleRadians);
  ctx.translate(-x, -y);
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
    document.title = "😘_____😊";
  } else if (percent < 2 / steps) {
    document.title = "😘💕___😊";
  } else if (percent < 3 / steps) {
    document.title = "😘_💕__😊";
  } else if (percent < 4 / steps) {
    document.title = "😘__💕_😊";
  } else if (percent < 5 / steps) {
    document.title = "😘___💕😊";
  } else if (percent < 6 / steps) {
    document.title = "😘_____😍";
  } else if (percent < 7 / steps) {
    document.title = "😘_____😍";
  }
}
