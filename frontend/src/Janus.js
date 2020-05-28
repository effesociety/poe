const websocketURI = process.env.NODE_ENV === "development" ? "ws://localhost:5000/" : "wss://poe-dtlab.herokuapp.com";
const config = {"iceServers": [{urls: "stun:stun.l.google.com:19302"},{urls: "turn:numb.viagenie.ca", username: "webrtc@live.com", credential: "muazkh"}]}
//const config = {"iceServers": [{urls: "stun:stun.l.google.com:19302"}]}
var pc_constraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
			
class Janus {
  constructor() {
    this.websocket = undefined; //the WebSocket connection with the backend
    this.publisherConn = undefined; //the peerConnection as publisher
    this.subscriberConn = {}; //the peerConnections as subscriber (only available for teachers, students are refused by backend)
    this.streams = {}; //all the remote streams to be displayed (just the teacher feed for the students)
    this.mystream = undefined; //the local stream
    this.course = undefined; //the course to be added to every message sent to the backend
    this.messageHandlers = {}; //handlers for responses received from the backend

    this.candidates = []; //list of candidates not sent yet
    this.SDP = {}; //boolean var to keep track if the SDP is already been sent
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
    }
  }

  //Method for static declaration. Unused 
  static async create() {
    const o = new Janus();
    await o.init();
    return o;
  }

  //Close all RTCPeerConnections
  onCloseHandler(){
    console.log("WebSocket closed")
    /*
    this.publisherConn.close();
    Object.keys(this.subscriberConn).forEach((subscriberID) => {
      this.subscriberConn[subscriberID].close();
    })
    */
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
    
    console.log("Printing the impossible")
    console.log(object)

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
    this.publisherConn.setRemoteDescription(object.jsep);
  }

  async onOfferHandler(object){
    //object.message is equal to "offer"
    //This means that the user is a teacher who needs to get all audio/video streams
    console.log("Got message type OFFER. Creating new RTCPeerConnection")


    console.log("Printing this")
    console.log(this)
    console.log("Printing object")
    console.log(object)

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
    this.subscriberConn[object.subscriberID].setRemoteDescription(object.jsep);
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


  publish(){
    this.subscriberSetup();

    let body = {
      "message": "start",
      "course": this.course
    };
    this.websocket.send(JSON.stringify(body));
  
    this.publisherConn = new RTCPeerConnection(config,pc_constraints);
    this.publisherConn.onicecandidate = this.onIceCandidateHandlerPublisher.bind(this);
    this.publisherConn.onnegotiationneeded = this.onNegotiationNeededHandler.bind(this);	
    this.userMediaSetup()
    //this.on('answer', this.onAnswerHandler.bind(this))

    return new Promise((resolve) => {
      this.on('answer',(object) => {
        this.onAnswerHandler(object);
        resolve()
      })
    })
  }

  subscribe(){
    let body = {
      "message": "getFeeds",
      "course": this.course
    };
    this.websocket.send(JSON.stringify(body))

    this.on('started', this.onStartedHandler.bind(this))
    this.on('offer',this.onOfferHandler.bind(this))
  }

  async userMediaSetup() {
    var media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    if(this.publisherConn.iceConnectionState !== 'closed'){
      this.mystream = media;
      media.getTracks().forEach((track) => {
          this.publisherConn.addTrack(track, media)
      });
    }
  }

  destroyExam(course){
    console.log("DESTROYING COURSE");
    let body = {
      "message": "destroy",
      "course": course
    }
    this.websocket.send(JSON.stringify(body))
  }

  subscriberSetup(){
    console.log("SUBSCRIBER SETUP")
    this.on('started',this.onStartedHandler.bind(this));
    this.on('offer', this.onOfferHandler.bind(this));
  }

  onRemoteFeed(object){
    return new Promise((resolve) => {
      const subscriberID = object.subscriberID;
      if(object.subscriberID == subscriberID){
        console.log("And it was the right one!")
        resolve(subscriberID)
      }
    })
  }

  async onIceCandidateHandlerPublisher(ev) {
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
        "course": this.course
      };
      this.websocket.send(JSON.stringify(body));
    }
    else{
      console.log("No candidate")
      let body = {
        "message": "trickle",
        "completed": true,
        "course": this.course
      }
      this.websocket.send(JSON.stringify(body));
    }
  }
  
  async onIceCandidateHandlerSubscriber(ev,subscriberID) {
	  
    console.log("onIceCandidateHandler");
    console.log("Printing candidate....")
    console.log(ev.candidate)
    if(this.SDP[subscriberID]){
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
      if(this.candidates.length>0){
        console.log("this.candidates.length:", this.candidates.length);
        for(let i = 0; i<this.candidates.length; i++){
          console.log("sending saved candidate number: ",i+1)
          let body = {
            "message": "trickle",
            "candidate": this.candidates[i],
            "subscriberID": subscriberID,
            "course": this.course
          };
          this.websocket.send(JSON.stringify(body))
        }
        console.log("Cleaning candidates array")	
        this.candidates = [];
      }
    }
    else if(ev.candidate){
      console.log("SDP not sent yet")
      let candidate = {
        "candidate": ev.candidate.candidate,
        "sdpMid": ev.candidate.sdpMid,
        "sdpMLineIndex": ev.candidate.sdpMLineIndex
      };
      //this.subscriberConn[subscriberID].addIceCandidate(candidate)
      this.candidates.push(candidate);
    }
  }  

  async onNegotiationNeededHandler() {
    console.log("onNegotiationNeededHandler");

    let offer = await this.publisherConn.createOffer();
    console.log("Printing offer...")
    console.log(offer)
    this.publisherConn.setLocalDescription(offer);

    let body = {
      "message": "publish",
      "offer": offer,
      "audio": true, //@TO-D: Not true by default!
      "video": true, //@TO-D: Not true by default!
      "course": this.course
    };
    this.websocket.send(JSON.stringify(body));
  }

  onTrackHandler(ev, subscriberID){
    console.log("On Add Stream event")
    this.streams[subscriberID]=ev.streams[0] 
  }
}

var JanusInstance = new Janus();

export default JanusInstance;