//Google User
function onSignIn(googleUser) {
  
  if(window.location.pathname == '/login' )
  {
    console.log(window.location.pathname)
    $.ajax({
      url: "/login",
      method: "post",
      success: function (user) {
        window.location.replace("/");
      },
      error: function (user) {
        alert(user.error);
      },
    });
  }
  if(window.location.pathname != '/login' )
  {
    var profile = googleUser.getBasicProfile();
    console.log("test");
    var user_student = {
      id_gg: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
    };
    console.log(user_student);

    const socket = io('/')
    const videoGrid = document.getElementById('video-grid')
    const peers = {}
    const myPeer = new Peer(undefined, {
      host: "/",
      port: "3001",
    });
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
  }

}

//Google signOut
function signOut() {
  gapi.auth2
    .getAuthInstance()
    .signOut()
    .then(function () {
      console.log("Sign Out");
      window.location.replace("/logout");
    });
}

