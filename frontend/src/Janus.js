const websocketURI = process.env.NODE_ENV === "development" ? "ws://localhost:8080/" : "wss://poe-dtlab.herokuapp.com";
const config = {"iceServers": [{urls: "stun:stun.l.google.com:19302"}]}

class Janus {
  constructor() {
    this.websocket = undefined;
    this.publisherConn = undefined
    this.subscriberConn = {};
    this.streams = {};
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

  async init() {
    this.websocket = await this.connect();
    this.websocket.onmessage = this.onMessageHandler.bind(this);   
  }

  //Method for static declaration. Unused 
  static async create() {
    const o = new Janus();
    await o.init();
    return o;
  }

  async onMessageHandler(ev){
    let object = JSON.parse(ev.data);

    if (object.message === "answer") { //The user is a student who needs to send its audio/video stream
      this.publisherConn.setRemoteDescription(object.jsep);
    }

    else if(object.message === "offer"){ //The user is a teacher who needs to get all audio/video streams

      this.subscriberConn[object.subscriberID] = new RTCPeerConnection(config);
      this.subscriberConn[object.subscriberID].onicecandidate = this.onIceCandidateHandler.bind(this)
      this.subscriberConn[object.subscriberID].ontrack = (ev) => {
        this.onTrackHandler(ev,object.subscriberID);
      }

      this.subscriberConn[object.subscriberID].setRemoteDescription(object.jsep);
      let answer = await this.subscriberConn[object.subscriberID].createAnswer();
      this.subscriberConn[object.subscriberID].setLocalDescription(answer)
      let body = {
          "message": "subscribe",
          "jsep": answer,
          "subscriberID": object.subscriberID
      }
      this.websocket.send(JSON.stringify(body)) 
    } 

    else {
      console.log("Received msg from server");
      console.log(object);
    }
  }

  publish(){
    let body = {
      message: "start"
    };
    this.websocket.send(JSON.stringify(body));
	
	this.publisherConn = new RTCPeerConnection(config);
	this.publisherConn.onicecandidate = this.onIceCandidateHandler.bind(this);
    this.publisherConn.onnegotiationneeded = this.onNegotiationNeededHandler.bind(this);	
    this.userMediaSetup()
  }

  subscribe(){
    let body = {
      message: "getFeeds"
    };
    this.websocket.send(JSON.stringify(body))
  }

  async userMediaSetup() {
    var media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    media
      .getTracks()
      .forEach((track) => this.publisherConn.addTrack(track, media));
	
  }

  async onIceCandidateHandler(ev) {
    console.log("onIceCandidateHandler");
	if(ev.candidate && ev.candidate.candidate){
		console.log("Printing candidate....")
		console.log(ev.candidate)
		
		let body = {
		  message: "trickle",
		  candidate: ev.candidate,
		};
		this.websocket.send(JSON.stringify(body));
	}
  }

  async onNegotiationNeededHandler(ev) {
    console.log("onNegotiationNeededHandler");

    let offer = await this.publisherConn.createOffer();
	console.log("Printing offer...")
	console.log(offer)
    this.publisherConn.setLocalDescription(offer);

    let body = {
      message: "publish",
      offer: offer,
      audio: true,
      video: true,
    };
    this.websocket.send(JSON.stringify(body));
  }

  onTrackHandler(ev, subscriberID){
    console.log("On Add Stream event")
    this.streams[subscriberID]=ev.streams[0] 
  }
}

export default Janus;