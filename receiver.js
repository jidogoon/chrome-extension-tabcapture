function shutdownReceiver() {
  if (!window.currentStream) {
    return;
  }

  var player = document.getElementById('player');
  player.srcObject = null;
  var tracks = window.currentStream.getTracks();
  for (var i = 0; i < tracks.length; ++i) {
    tracks[i].stop();
  }
  window.currentStream = null;
}

function testRecording() {
  var options = {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    mimeType: 'video/webm'
  }

  var types = ["video/webm",
               "video/webm\;codecs=vp8",
               "video/webm\;codecs=daala",
               "video/webm\;codecs=h264",
               "video/mpeg"];

  for (var i in types) {
    console.log( "Is " + types[i] + " supported? " + (MediaRecorder.isTypeSupported(types[i]) ? "Maybe!" : "Nope :("));
  }

  var mediaRecorder = new MediaRecorder(window.currentStream, options);
  var chunks = [];
  console.log('mimetpe >>> ' + mediaRecorder.mimeType);
  mediaRecorder.ondataavailable = function(e) {
    console.log('add chunk >>> ' + e.data);
    chunks.push(e.data);
  }
  mediaRecorder.onstop = function(e) {
    console.log('on recorder stop');
    const blob = new Blob(chunks, { 'type' : 'video/webm;' });
    chunks = [];
    console.log('blob >> ' + blob);
    // var blobReader = new FileReader();
    // blobReader.onload = function(event){
    //     console.log(JSON.stringify(blobReader.result));
    // };
    // blobReader.readAsText(blob);

    // stop stream
    // var tracks = window.currentStream.getTracks();
    // for (var i = 0; i < tracks.length; ++i) {
    //   tracks[i].stop();
    // }
    var player = document.getElementById('player');
    player.style.display = 'none';
    var player_recorded = document.getElementById('player_recorded');
    player_recorded.style.display = 'block';
    player_recorded.addEventListener('canplay', function() {
      this.volume = 0.75;
      this.muted = false;
      this.play();
    });
    player_recorded.src = window.URL.createObjectURL(blob);
    document.body.style.backgroundColor = 'black';
  }

  mediaRecorder.start(1000);  // timeslice = 1000
  console.log(mediaRecorder.state);

  setTimeout(function() {
    shutdownReceiver();
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
  }, 5000);
}

window.addEventListener('load', function() {
  var player = document.getElementById('player');
  player.addEventListener('canplay', function() {
    this.volume = 0.75;
    this.muted = false;
    this.play();
  });
  player.setAttribute('controls', '1');
  console.log('stream >> ' + window.currentStream);
  player.srcObject = window.currentStream;

  var tracks = window.currentStream.getTracks();
  console.log('stream tracks >> ' + tracks);
  for (var i = 0; i < tracks.length; ++i) {
    console.log('stream tracks [' + i + '] >> ' + tracks[i].kind);
    tracks[i].addEventListener('ended', function() {
      shutdownReceiver();
    });
  }

  // test recorder
  testRecording();
});

window.addEventListener('beforeunload', shutdownReceiver);
