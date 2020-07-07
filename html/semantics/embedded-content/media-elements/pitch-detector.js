// This should be removed when the webaudio/historical.html tests are passing.
// Tracking bug: https://bugs.webkit.org/show_bug.cgi?id=204719
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;

var FFT_SIZE = 2048;

function getPitchDetector(media) {
  if (!audioContext)
    audioContext = new AudioContext();

  var sourceNode = audioContext.createMediaElementSource(media);

  var analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;

  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);

  return () => getPitch(analyser);
}

var buf = new Uint8Array(FFT_SIZE/2);

function getPitch(analyser) {
  analyser.getByteFrequencyData(buf);
  return findDominantFrequency(buf);
}

// Returns the frequency value for the nth FFT bin.
function binToFrequency(bin) {
  return audioContext.sampleRate*(bin/FFT_SIZE);
}

// Returns the dominant frequency, +/- a certain margin.
function findDominantFrequency(buf) {
  var max = 0;
  var bin = 0;

  for (var i=0;i<buf.length;i++) {
    if(buf[i] > max) {
      max = buf[i];
      bin = i;
    }
  }

  // Use the average of the two adjacent bins to determine the margin.
  return { value:binToFrequency(bin),
           margin:(binToFrequency(bin+1)-binToFrequency(bin-1))/2 };
}