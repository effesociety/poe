const websocketURI = "ws://localhost:8080/";

class Janus {
  constructor() {
    this.websocket = undefined;
    this.connection = undefined;
    this.streams = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      let socket = new WebSocket(websocketURI);
      socket.onopen = () => {
        console.log("ciao");
        resolve(socket);
      };
      socket.onerror = (err) => {
        reject(err);
      };
    });
  }

  async init() {
    this.connection = new RTCPeerConnection({});
    this.websocket = await this.connect();

    this.websocket.onmessage = this.onMessageHandler.bind(this);

    this.connection.onicecandidate = this.onIceCandidateHandler.bind(this);
    this.connection.onnegotiationneeded = this.onNegotiationNeededHandler.bind(this);
    this.connection.ontrack = this.onTrackHandler.bind(this);
  }

  static async create() {
    const o = new Janus();
    await o.init();
    return o;
  }

  async onMessageHandler(ev){
    let object = JSON.parse(ev.data);
    console.log(object);

    if (object.message === "answer") { //The user is a student who needs to send its audio/video stream
      this.connection.setRemoteDescription(object.jsep);
    }
    else if(object.message === "offer"){ //The user is a teacher who needs to get all audio/video streams
      this.connection.setRemoteDescription(object.jsep);
      let answer = await this.connection.createAnswer();
      this.connection.setLocalDescription(answer)
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

  async userMediaSetup() {
    var media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    media
      .getTracks()
      .forEach((track) => this.connection.addTrack(track, media));
  }

  async onIceCandidateHandler(ev) {
    console.log("onIceCandidateHandler");
    let body = {
      message: "trickle",
      candidate: ev.candidate,
    };
    this.websocket.send(JSON.stringify(body));
  }

  async onNegotiationNeededHandler(ev) {
    console.log("onNegotiationNeededHandler");
    console.log(this.connection);

    let offer = await this.connection.createOffer();
    console.log(offer);
    this.connection.setLocalDescription(offer);

    let body = {
      message: "publish",
      offer: offer,
      audio: true,
      video: true,
    };
    this.websocket.send(JSON.stringify(body));
  }

  async onTrackHandler(ev){
    console.log("On Add Stream event")
    console.log(ev)
    this.streams.push(ev.streams[0])

    console.log("Some info printing")
      console.log(ev.srcElement.remoteDescription)
    //let remoteVideo = document.getElementById('remote');
    //remoteVideo.srcObject = ev.streams[0]   
  }
}

export default Janus;