const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peers = {}
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

var Peer = window.SimplePeer;
var initiateBtn = document.getElementById('initiateBtn');
var stopBtn = document.getElementById('stopBtn');
var initiator = false;
var share;
var sharePeer;
const turnServerConfig = {
  iceServers: [{
    urls: 'turn:13.250.13.83:3478?transport=udp',
    username: "td11011999",
    credential: "BTdd92kaGVseRd10"
  }]
};

const myVideo = document.createElement('video')
myVideo.muted = true

navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call=>{
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })  

  socket.on('user-connected', userId=>{
    connecttoNewUser(userId, stream)
    //alert("new User " + userId)
    console.log("User connected " + userId);
  })
})

// btn share
initiateBtn.onclick = (e) => {
  console.log('start peer: ', sharePeer);
  initiator = true;
  socket.emit('initiate');
  stopBtn.style.display = 'block';
}

stopBtn.onclick = (e) => {
  console.log('end peer: ', sharePeer);
  socket.emit('stopshare');
  stopBtn.style.display = 'none';
}

socket.on('initiate', () => {
  startStream();
  initiateBtn.style.display = 'none';
})

socket.on('stopshare', () => {
  stopStream();
  initiateBtn.style.display = 'block';
})

socket.on('user-disconnected', userId=>{
  if(peers[userId])
  {
    peers[userId].close()  
  }

  //alert('User disconnected: ', userId);
  console.log('User disconnected: ', userId);
})

myPeer.on('open', id=>{
  socket.emit('join-room', ROOM_ID, id)

})

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function connecttoNewUser(userId, stream){
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call  
}

function startStream () {
  if (initiator) {
      // get screen stream
      navigator.mediaDevices.getUserMedia({
          video: {
              mediaSource: "screen",
              width: { max: '720' },
              height: { max: '720' },
              frameRate: { max: '60' }
          }
      }).then(gotMedia);
  } else {
      gotMedia(null);
  }
}

function stopStream() {
  if(share) {
    console.log('share off!!')
    // sharePeer.destroy();
    socket.emit('screenoff');
    share.getTracks().length ? share.getTracks().forEach( track => track.stop() ) : '';
  }
}

socket.on('screenoff', () => {
  console.log('screenoff');
  console.log('end shared peer: ', sharePeer);
  var video = document.querySelector('video');
  if ('srcObject' in video) {
    video.srcObject = null;
  } else {
    video.src = window.URL.createObjectURL(null); // for older browsers
  }
  video.pause();
})

function gotMedia (stream) {
  console.log('start media screen!')
  share = stream;
  if (initiator) {
      console.log('start share peer initiator');
      sharePeer = new Peer({
          initiator,
          stream
      });
      console.log('share peer initiator: ', sharePeer);
  } else {
      console.log('start share peer uninitiator');
      sharePeer = new Peer({
      });
      console.log('share peer uninitiator: ', sharePeer);
  }
  console.log('????>>>', sharePeer);

  // socket.on('screenplay', (stream) => {
  //   console.log("this: ", stream);
  //   var video = document.querySelector('video');
  //   video.srcObject = stream;
  //   video.play();
  // })

  sharePeer.on('signal', function (data) {
      console.log('signal');
      socket.emit('offer', JSON.stringify(data));
  });

  socket.on('offer', (data) => {
      console.log('offer');
      sharePeer.signal(JSON.parse(data));
  })

  sharePeer.on('stream', function (stream) {
      console.log('stream - ', stream);
      // got remote video stream, now let's show it in a video tag
      var video = document.querySelector('video');
      if ('srcObject' in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream); // for older browsers
      }
      video.play();
  })
}