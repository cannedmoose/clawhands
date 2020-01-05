window.onload = function() {
  const main = document.querySelector("#main");
  main.addEventListener("click", canvasClick);

  zzfx(0.4, 0, 100, 2, 0.5, 0.1, 0, 0.2, -3.35); // ZzFX 21117
  window.requestAnimationFrame(render(main));
};

let lineAnimations = [];
let time = 0;

function canvasClick(event) {
  let startPos = Math.random() * (window.innerWidth + window.innerHeight) * 2;
  if (lineAnimations.length == 0) {
    startPos = window.innerWidth * 0.3;
  } else if (lineAnimations.length == 1) {
    startPos = window.innerWidth * 1.13 + window.innerHeight;
  } else if (lineAnimations.length == 2) {
    startPos = window.innerWidth * 2 + window.innerHeight * 1.4;
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

  console.log(x, y);
  const lineAnim = {
    ease: Math.easeInOutCirc,
    duration: 700,
    start: time,
    content: lineDrawer(x, y),
    loops: false,
    reverse: false,
    startVal: 0,
    changeVal: 1
  };
  zzfx(1, 4.7, 0, 0.75, 0.1, 0.005, 0.02, 181, 1.68); // ZzFX 77605
  lineAnimations.push({ ...lineAnim });
}

function lineDrawer(x1, y1) {
  let biggestDim = Math.max(window.innerWidth, window.innerHeight);
  let maxLineWidth = biggestDim * 0.3;
  let x2 = window.innerWidth - x1;
  let y2 = window.innerHeight - y1;

  let angleRadians = Math.PI / 2 - Math.atan2(y2 - y1, x2 - x1);

  let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

  function drawLine(ctx, percent) {
    ctx.translate(x1, y1);
    ctx.rotate(-angleRadians);
    ctx.rect(
      (-maxLineWidth * percent * percent) / 2,
      -maxLineWidth,
      maxLineWidth * percent * percent,
      (length + maxLineWidth * 2) * percent
    );
    ctx.rotate(angleRadians);
    ctx.translate(-x1, -y1);
  }
  return drawLine;
}

// Want to specify function onStart and onFinish functions for animation
// can get rid of loops, reverse if we do
// Also content should just be onAnimate
// Also also should only draw hearts once, then color shift for the second one.

function animate(ctx, time, animation) {
  let {
    ease,
    duration,
    start,
    content,
    loops,
    reverse,
    startVal,
    changeVal
  } = { ...animation };

  // Elapsed time since start Clamped to [0, duration]
  let clampedElapsed = Math.min(Math.max(time - start, 0), duration);

  if (clampedElapsed >= duration && loops) {
    animation.start = time;
    animation.reverse = !reverse;
    if (reverse) {
      zzfx(0.4, 0, 100, 2, 0.5, 0.1, 0, 0.2, -3.35); // ZzFX 21117
    }
  }

  if (reverse) {
    clampedElapsed = duration - clampedElapsed;
  }

  const genValue = ease(clampedElapsed, startVal, changeVal, duration);
  content(ctx, genValue);
}

function render(canvas) {
  const ctx = canvas.getContext("2d");

  let heartAnim = {
    ease: Math.easeInOutQuad,
    duration: 1000,
    start: 0,
    content: drawScaledHearts("yellowgreen", "lightblue"),
    loops: true,
    reverse: false,
    startVal: 0.5,
    changeVal: 0.6
  };

  let heartAnim2 = {
    ease: Math.easeInOutQuad,
    duration: 1000,
    start: 0,
    content: drawScaledHearts("pink", "red"),
    loops: true,
    reverse: false,
    startVal: 0.5,
    changeVal: 0.6
  };

  function renderer(delta) {
    time = delta;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, delta, heartAnim);

    ctx.save();

    ctx.beginPath();
    for (let i = 0; i < lineAnimations.length; i++) {
      animate(ctx, delta, lineAnimations[i]);
    }
    ctx.clip();
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, delta, heartAnim2);
    ctx.restore();

    window.requestAnimationFrame(renderer);
  }

  return renderer;
}

function drawBackground(ctx, delta, anim) {
  let largestDim = Math.max(window.innerHeight, window.innerWidth);

  const heartsAcross = 4;

  let heartSize = largestDim / heartsAcross; // Scaled size of a heart
  const scaleFactor = heartSize / 100;

  for (let ycol = 0; ycol < window.innerHeight / heartSize + 1; ycol++) {
    for (let xcol = 0; xcol < window.innerWidth / heartSize + 1; xcol++) {
      ctx.save();
      ctx.translate(xcol * heartSize, ycol * heartSize);
      if ((ycol + xcol) % 2 == 0) {
        ctx.rotate(Math.PI);
      }
      ctx.scale(scaleFactor, scaleFactor);
      animate(ctx, delta, anim);
      ctx.restore();
    }
  }
}

function drawScaledHearts(fill1, fill2) {
  return function(ctx, scale) {
    ctx.save();
    ctx.scale(scale, scale);
    heartStack(
      ctx,
      4,
      (t, b, c, d) =>
        Math.linearTween(t * Math.sqrt(Math.sqrt(scale)), b, c, d),
      fill1,
      fill2
    );
    ctx.restore();
  };
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

/**EASING**/

// simple linear tweening - no easing, no acceleration

Math.linearTween = function(t, b, c, d) {
  return (c * t) / d + b;
};

// quadratic easing in - accelerating from zero velocity

Math.easeInQuad = function(t, b, c, d) {
  t /= d;
  return c * t * t + b;
};

// quadratic easing out - decelerating to zero velocity

Math.easeOutQuad = function(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
};

// quadratic easing in/out - acceleration until halfway, then deceleration

Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

// cubic easing in - accelerating from zero velocity

Math.easeInCubic = function(t, b, c, d) {
  t /= d;
  return c * t * t * t + b;
};

// cubic easing out - decelerating to zero velocity

Math.easeOutCubic = function(t, b, c, d) {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
};

// cubic easing in/out - acceleration until halfway, then deceleration

Math.easeInOutCubic = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t + b;
  t -= 2;
  return (c / 2) * (t * t * t + 2) + b;
};

// quartic easing in - accelerating from zero velocity

Math.easeInQuart = function(t, b, c, d) {
  t /= d;
  return c * t * t * t * t + b;
};

// quartic easing out - decelerating to zero velocity

Math.easeOutQuart = function(t, b, c, d) {
  t /= d;
  t--;
  return -c * (t * t * t * t - 1) + b;
};

// quartic easing in/out - acceleration until halfway, then deceleration

Math.easeInOutQuart = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t * t + b;
  t -= 2;
  return (-c / 2) * (t * t * t * t - 2) + b;
};

// quintic easing in - accelerating from zero velocity

Math.easeInQuint = function(t, b, c, d) {
  t /= d;
  return c * t * t * t * t * t + b;
};

// quintic easing out - decelerating to zero velocity

Math.easeOutQuint = function(t, b, c, d) {
  t /= d;
  t--;
  return c * (t * t * t * t * t + 1) + b;
};

// quintic easing in/out - acceleration until halfway, then deceleration

Math.easeInOutQuint = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t * t * t + b;
  t -= 2;
  return (c / 2) * (t * t * t * t * t + 2) + b;
};

// sinusoidal easing in - accelerating from zero velocity

Math.easeInSine = function(t, b, c, d) {
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
};

// sinusoidal easing out - decelerating to zero velocity

Math.easeOutSine = function(t, b, c, d) {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

// sinusoidal easing in/out - accelerating until halfway, then decelerating

Math.easeInOutSine = function(t, b, c, d) {
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};

// exponential easing in - accelerating from zero velocity

Math.easeInExpo = function(t, b, c, d) {
  return c * Math.pow(2, 10 * (t / d - 1)) + b;
};

// exponential easing out - decelerating to zero velocity

Math.easeOutExpo = function(t, b, c, d) {
  return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
};

// exponential easing in/out - accelerating until halfway, then decelerating

Math.easeInOutExpo = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
  t--;
  return (c / 2) * (-Math.pow(2, -10 * t) + 2) + b;
};

// circular easing in - accelerating from zero velocity

Math.easeInCirc = function(t, b, c, d) {
  t /= d;
  return -c * (Math.sqrt(1 - t * t) - 1) + b;
};

// circular easing out - decelerating to zero velocity

Math.easeOutCirc = function(t, b, c, d) {
  t /= d;
  t--;
  return c * Math.sqrt(1 - t * t) + b;
};

// circular easing in/out - acceleration until halfway, then deceleration

Math.easeInOutCirc = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
  t -= 2;
  return (c / 2) * (Math.sqrt(1 - t * t) + 1) + b;
};
