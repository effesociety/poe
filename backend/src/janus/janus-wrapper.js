const JanusSession = require('./janus-session');
const JanusVideoroomHandle = require('./janus-videoroom-handle')
const WebSocket = require('ws');

module.exports = class JanusWrapper{
    constructor(){
        this.socket =  undefined;
        this.session = undefined;
        this.handles = [];
    }
    
    connect(){
        return new Promise((resolve, reject) =>{
            let socket = new WebSocket(process.env.JANUS_URI, "janus-protocol");
            socket.onopen = () => {
                resolve(socket);
            }
            socket.onerror = (err) => {
                reject(err)
            }
        })
    }

    async init(){
        this.socket = await this.connect();
        this.session = new JanusSession(this.socket.send.bind(this.socket));
        this.socket.onmessage = (ev) => {
            console.log("Received response from Janus:");
            console.log(JSON.parse(ev.data));
            this.session.receive(JSON.parse(ev.data));
        }
        await this.session.create();        
    }

    addHandle(){
        let newVideoroomHandle = new JanusVideoroomHandle(this.session);
        this.handles.push(newVideoroomHandle);
        return newVideoroomHandle;
    }
}