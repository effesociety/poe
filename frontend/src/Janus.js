const websocketURI = process.env.NODE_ENV === "development" ? "ws://localhost:5000/" : "wss://poe-dtlab.herokuapp.com";
const config = {"iceServers": [{urls: "stun:stun.l.google.com:19302"},{urls: "turn:numb.viagenie.ca", username: "webrtc@live.com", credential: "muazkh"}]}
//const config = {"iceServers": [{urls: "stun:stun.l.google.com:19302"}]}
var pc_constraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
			
class Janus {
  constructor() {
    this.websocket = undefined; //the WebSocket connection with the backend
    this.publisherConn = {}; //the peerConnection as publisher
    this.subscriberConn = {}; //the peerConnections as subscriber (only available for teachers, students are refused by backend)
    this.streams = {}; //all the remote streams to be displayed (just the teacher feed for the students)
    this.mystream = {}; //the local stream
    this.course = undefined; //the course to be added to every message sent to the backend
    this.messageHandlers = {}; //handlers for responses received from the backend

    this.candidates = {}; //list of candidates not sent yet
    this.SDP = {}; //boolean var to keep track if the SDP is already been sent
     //Just to cleanup the setInterval on Heroku
     this.keepAliveID = undefined;
  }

  connect() {
    return new Promise((resolve, reject) => {
      let socket = new WebSocket(websocketURI);
      socket.onopen = () => {
        resolve(socket);
      };
      socket.onerror = (err) => {
        reject(err);
      };
    });
  }

  async init(course) {
    this.course = course
    if(!this.websocket){
      this.websocket = await this.connect();
      this.websocket.onmessage = this.receive.bind(this);   
      this.websocket.onclose = this.onCloseHandler.bind(this);

      //Just for Heroku because it closes the websocket for inactivity
      const keepaliveMs = 30000;
      this.sendKeepalive(keepaliveMs);
    }
  }

  //Method for static declaration. Unused 
  static async create() {
    const o = new Janus();
    await o.init();
    return o;
  }

  destroy(closeWebsocket){
    //Closing everything
    if(closeWebsocket && this.websocket){
      this.websocket.close();
      this.websocket = undefined; 
      clearTimeout(this.keepAliveID);
      this.keepAliveID = undefined;
    }
    Object.keys(this.publisherConn).forEach((type) => {
      if(this.mystream[type]){
        for(let i in this.streams[object.subscriberID].getTracks()){
          this.mystream[type].getTracks()[i].stop(); 
        }
      }
      this.publisherConn[type].close();
    })
    Object.keys(this.subscriberConn).forEach((subscriberID) => {
      if(this.streams[subscriberID]){
        for(let i in this.streams[object.subscriberID].getTracks()){
          this.streams[subscriberID].getTracks()[i].stop(); 
        } 
      }
      this.subscriberConn[subscriberID].close();
    })

    //Resetting everything to default values without destroying the object itself
    //This way we can keep using .init() before every action
    this.publisherConn = {}; 
    this.subscriberConn = {}; 
    this.streams = {}; 
    this.mystream = {}; 
    this.course = undefined; 
    this.messageHandlers = {}; 

    this.candidates = {} 
    this.SDP = {};

  }

  //Just for Heroku to send keepalive messages every 30 seconds
  sendKeepalive(keepaliveMs){
    let body = {
      "message": "keepalive",
      "course": this.course
    }
    this.keepAliveID = setInterval(() => {
      if(this.websocket){
        this.websocket.send(JSON.stringify(body))
      }
    }, keepaliveMs)
  }

  //Close all RTCPeerConnections
  onCloseHandler(){
    console.log("WebSocket closed")
    Object.keys(this.publisherConn).forEach((type) => {
      this.publisherConn[type].close();
    })
    Object.keys(this.subscriberConn).forEach((subscriberID) => {
      this.subscriberConn[subscriberID].close();
    })
  }

  //Define callback for each event
  on(ev,callback){
    let handlers = this.messageHandlers[ev];
    if(handlers == null){
      handlers = this.messageHandlers[ev] = [];
    }
    handlers.push(callback);
  }

  receive(ev){
    let object = JSON.parse(ev.data);

    let responseType = object.message;
    let handlers = this.messageHandlers[responseType];
    if (handlers != null) {
      for (let i = 0; i < handlers.length; i++) {
        handlers[i](object);
      }
    }
  }

  onAnswerHandler(object){
    //object.message is equal to "answer"
    //This means that the user wants to send its audio/video stream
    console.log("Got message type ANSWER. Setting Remote Description...")
    this.publisherConn[object.publisherType].setRemoteDescription(object.jsep);
    if(this.candidates[object.publisherType]){
      this.candidates[object.publisherType].forEach(candidate => {
        console.log("Adding ICE candidate for publisher (" + object.publisherType + ")")
        this.publisherConn[object.publisherType].addIceCandidate(candidate)
      })
    }
  }

  async onOfferHandler(object){
    //object.message is equal to "offer"
    //This means that the user is a teacher who needs to get all audio/video streams
    console.log("Got message type OFFER. Creating new RTCPeerConnection")

    this.subscriberConn[object.subscriberID] = new RTCPeerConnection(config, pc_constraints)

    //Define what happens onTrack
    this.subscriberConn[object.subscriberID].ontrack = (ev) => {
      this.onTrackHandler(ev,object.subscriberID);
    }
    
    //Define what happens every time there is a ICE candidate
    this.subscriberConn[object.subscriberID].onicecandidate = (ev) => {
      this.onIceCandidateHandlerSubscriber(ev,object.subscriberID)
    }

    console.log("Setting Remote Description for Remote Feed")
    //Setup remote description with the JSEP received
    this.subscriberConn[object.subscriberID].setRemoteDescription(object.jsep)
    .then(() => {
      if(this.candidates[object.subscriberID]){
        console.log("Found candidates that got here before offer msg, adding...")
        this.candidates[object.subscriberID].forEach(candidate => {
          console.log("Adding ICE candidate for subscriber")
          console.log(candidate)
          this.subscriberConn[object.subscriberID].addIceCandidate(candidate)
        })
      }
    })  

    var mediaConstraints = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    }

    console.log("Creating answer to send back to the server")
    //Create an answer to send
    let answer = await this.subscriberConn[object.subscriberID].createAnswer(mediaConstraints);
    this.subscriberConn[object.subscriberID].setLocalDescription(answer)
    
    //Encapsulate the message
    var jsep = {
      "type": answer.type,
      "sdp": answer.sdp
     };
    let body = {
      "message": "subscribe",
      "jsep": jsep,
      "subscriberID": object.subscriberID,
      "course": this.course
    }

    console.log("Sending msg to the server")
    //Send it through the websocket
    this.websocket.send(JSON.stringify(body)) 
  }

  onStartedHandler(object){
    //object.message is equal to "started"
    //This means that Janus successfully received our SDP
    console.log("Server correctly received the SDP")
    this.SDP[object.subscriberID] = true;
  }

  onLeavingHandler(object){
    console.log("Leaving msg received");
    if(this.subscriberConn[object.subscriberID]){
      this.subscriberConn[object.subscriberID].close();
      delete this.subscriberConn[object.subscriberID];
    }
    if(this.streams[object.subscriberID]){
      for(let i in this.streams[object.subscriberID].getTracks()){
        this.streams[object.subscriberID].getTracks()[i].stop(); 
      }
      delete this.streams[object.subscriberID]
    }
  }

  
  destroyExam(course){
    let body = {
      "message": "destroy",
      "course": course
    }
    this.websocket.send(JSON.stringify(body))
    
    return new Promise((resolve) => {
      this.on('destroyed',(object) => {
        if(object.course === course){
          resolve()
        }
      })
    })
  }

  completeExam(answers){
    let body = {
      "message": "complete",
      "answers": answers,
      "course": this.course
    }
    this.websocket.send(JSON.stringify(body))
  }

  async publish(role){
    this.subscriberSetup();

    let body = {
      "message": "start",
      "course": this.course
    };
    this.websocket.send(JSON.stringify(body));

    if(role == 'teacher'){
      await this.publishMedia('userMedia');
    }
    else if(role === 'student'){
      await this.publishMedia('userMedia');
      let test = await this.publishMedia('displayMedia');
      return test;
    }
    
  }

  publishMedia(type){  
    console.log("PUBLISH MEDIA WITH TYPE", type)
    this.publisherConn[type] = new RTCPeerConnection(config,pc_constraints);
    this.publisherConn[type].onicecandidate = (ev) => {
      this.onIceCandidateHandlerPublisher(ev,type)
    }
    this.publisherConn[type].onnegotiationneeded = () => {
      this.onNegotiationNeededHandler(type)
    }
    this.mediaSetup(type)

    return new Promise((resolve) => {
      this.on('answer',(object) => {
        this.onAnswerHandler(object);
        if(object.publisherType === type){
          if(object.test){
            resolve(object.test) //the questions for the student
          }
          else{
            resolve()
          }   
        }
      })
    })
  }

  //NOT USED FOR NOW
  subscribe(){
    let body = {
      "message": "getFeeds",
      "course": this.course
    };
    this.websocket.send(JSON.stringify(body))

    this.on('started', this.onStartedHandler.bind(this))
    this.on('offer',this.onOfferHandler.bind(this))
    this.on('leaving', this.onLeavingHandler.bind(this))
  }

  async mediaSetup(type) {
    if(type === "userMedia"){
      console.log("MEDIA SETUP WITH TYPE userMedia")
      var media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if(this.publisherConn.iceConnectionState !== 'closed'){
        this.mystream[type] = media;
        media.getTracks().forEach((track) => {
          console.log("Adding webcam track")
            this.publisherConn[type].addTrack(track)
        });
      }
    }
    else if (type === 'displayMedia'){
      console.log("MEDIA SETUP WITH TYPE displayMedia")
      let constraints = {}
      constraints.video = {}
      constraints.video.width = 640;
      constraints.video.height = 480;
      constraints.video.frameRate = 30;

      var screen = await navigator.mediaDevices.getDisplayMedia({constraints})
      if(this.publisherConn[type].iceConnectionState !== 'closed'){
        this.mystream[type] = screen
        screen.getTracks().forEach((track) => {
          console.log("Adding screen track")
          this.publisherConn[type].addTrack(track)
        })
      }
    }
  }

  subscriberSetup(){
    this.on('started',this.onStartedHandler.bind(this));
    this.on('offer', this.onOfferHandler.bind(this));
    this.on('trickle', this.onTrickleHandler.bind(this));
  }

  onRemoteFeed(object){
    return new Promise((resolve) => {
      const subscriberID = object.subscriberID;
      if(object.subscriberID == subscriberID){
        resolve(subscriberID)
      }
    })
  }

  onLeavingFeed(object){
    return new Promise((resolve) => {
      const subscriberID = object.subscriberID;
      if(object.subscriberID == subscriberID){
        this.onLeavingHandler(object)
        resolve(subscriberID)
      }
    })
  }

  onTrickleHandler(object){
    console.log("Received Trickle message from backend")
    console.log(object.candidate)
    //This is about a subscriber RTCPeerConnection
    if(!object.candidate.completed){
      if(object.subscriberID){
        console.log("Trickle message is for a subscriberConn")
        if(this.subscriberConn[object.subscriberID] && this.subscriberConn[object.subscriberID].remoteDescription){
          console.log("Found a subscriberConn with remoteDescription already set, adding candidate...")
          console.log(object.candidate)
          this.subscriberConn[object.subscriberID].addIceCandidate(object.candidate)
        }
        else{
          console.log("SubscriberConn or remoteDescrition is not set yet, saving candidate for later")
          if(!this.candidates[object.subscriberID]){
            this.candidates[object.subscriberID] = []
          }
          this.candidates[object.subscriberID].push(object.candidate)
        }
      }
      else if(object.publisherType){
        //should check if remoteDescription is set
        if(this.publisherConn[object.publisherType].remoteDescription){
          this.publisherConn[object.publisherType].addIceCandidate(object.candidate)
        }
        else{
          if(!this.candidates[[object.publisherType]]){
            this.candidates[[object.publisherType]] = []
          }
          this.candidates[[object.publisherType]].push(object.candidate)
        }
      }
    }
  }

  async onIceCandidateHandlerPublisher(ev, publisherType) {
    console.log("onIceCandidateHandler");
  	console.log("Printing candidate....")
  	console.log(ev.candidate)
    if(ev.candidate){
      let candidate = {
        "candidate": ev.candidate.candidate,
        "sdpMid": ev.candidate.sdpMid,
        "sdpMLineIndex": ev.candidate.sdpMLineIndex
      };
      let body = {
        "message": "trickle",
        "candidate": candidate,
        "course": this.course,
        "publisherType": publisherType
      };
      this.websocket.send(JSON.stringify(body));
    }
    else{
      console.log("No candidate")
      let body = {
        "message": "trickle",
        "completed": true,
        "course": this.course,
        "publisherType": publisherType
      }
      this.websocket.send(JSON.stringify(body));
    }
  }
  
  async onIceCandidateHandlerSubscriber(ev,subscriberID) {
    console.log("onIceCandidateHandler");
    console.log("Printing candidate....")
    if(ev.candidate && ev.candidate.candidate.length > 0){

      let candidate = {
        "candidate": ev.candidate.candidate,
        "sdpMid": ev.candidate.sdpMid,
        "sdpMLineIndex": ev.candidate.sdpMLineIndex
      };
      let body = {
        "message": "trickle",
        "candidate": candidate,
        "subscriberID": subscriberID,
        "course": this.course
      };
      this.websocket.send(JSON.stringify(body));
    }
    else{
      console.log("No candidate")
      let body = {
        "message": "trickle",
        "completed": true,
        "subscriberID": subscriberID,
        "course": this.course
      }
      this.websocket.send(JSON.stringify(body))
    }
  }  

  async onNegotiationNeededHandler(type) {
    console.log("onNegotiationNeededHandler for " + type);

    let offer = await this.publisherConn[type].createOffer();
    console.log("Printing offer...")
    console.log(offer)
    this.publisherConn[type].setLocalDescription(offer);

    let body = {
      "message": "publish",
      "offer": offer,
      "audio": true, //@TO-D: Not true by default!
      "video": true, //@TO-D: Not true by default!
      "course": this.course,
      "publisherType": type
    };

    if(type === "displayMedia"){
      body.audio = false
    }
    this.websocket.send(JSON.stringify(body));
  }

  onTrackHandler(ev, subscriberID){
    console.log("On Add Stream event")
    
    console.log(ev)
    console.log(ev.streams[0])
    this.streams[subscriberID]=ev.streams[0] 
  }
}

var JanusInstance = new Janus();

export default JanusInstance;