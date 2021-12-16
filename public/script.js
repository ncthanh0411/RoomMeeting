const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peers = {}
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connecttoNewUser(userId, stream);
      //alert("new User " + userId)
      console.log("User connected " + userId);
    });
  });

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