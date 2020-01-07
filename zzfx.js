// ZzFXmicro - Zuper Zmall Zound Zynth - MIT License - Copyright 2019 Frank Force

(function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (window.AudioContext) {
    window.audioContext = new window.AudioContext();
  }
  var fixAudioContext = function(e) {
    if (window.audioContext) {
      // Create empty buffer
      var buffer = window.audioContext.createBuffer(1, 1, 22050);
      var source = window.audioContext.createBufferSource();
      source.buffer = buffer;
      // Connect to output (speakers)
      source.connect(window.audioContext.destination);
      // Play sound
      if (source.start) {
        source.start(0);
      } else if (source.play) {
        source.play(0);
      } else if (source.noteOn) {
        source.noteOn(0);
      }
    }
    // Remove events
    document.removeEventListener("touchstart", fixAudioContext);
    document.removeEventListener("touchend", fixAudioContext);
  };
  // iOS 6-8
  document.addEventListener("touchstart", fixAudioContext);
  // iOS 9
  document.addEventListener("touchend", fixAudioContext);
})();

var AudioContext =
  window.AudioContext || // Default
  window.webkitAudioContext || // Safari and old versions of Chrome
  false;

zzfx_v = 0.5;
zzfx_x = new AudioContext();
zzfx = (g, h, a, b = 1, c = 0.1, k = 0, f = 0, l = 0, m = 0) => {
  let q = 44100,
    Q = Q => Q * (Math.random() * 2 - 1),
    d = 2 * Math.PI;
  a = (d / q) * a * (1 + Q(h));
  k *= (500 * d) / q ** 2;
  b = (q * b) | 0;
  c = (c * b) | 0;
  l = (d / q) * l;
  m = (d / 2) * m;
  h = [];
  for (let n = (d = 0), e = 0; e < b; ++e)
    (h[e] =
      g *
      zzfx_v *
      Math.cos(d * a * Math.cos(n * l + m)) *
      (e < c ? e / c : 1 - (e - c) / (b - c))),
      (d += 1 + Q(f)),
      (n += 1 + Q(f)),
      (a += k);
  g = zzfx_x.createBuffer(1, b, q);
  a = zzfx_x.createBufferSource();
  g.getChannelData(0).set(h);
  a.buffer = g;
  a.connect(zzfx_x.destination);
  a.start();
};
