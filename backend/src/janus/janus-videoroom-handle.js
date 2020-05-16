module.exports = class JanusHandle{
    constructor(session){
        this.session = session;
        this.id = undefined;
    }

    attach(plugin){            
        let transaction = Math.random().toString(36).slice(2);
        let payload = {plugin: plugin};
        return this.session.send("attach",payload).then(res =>{
            this.id = res.data.id;
            return res;
        })
    }

    detach(){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Detaching")
        }            
        return this.send("detach");
    }

    on(ev, callback){
        return this.session.on(ev, signal => {
            if(signal.sender === this.id){
                callback(signal);
            }
        })
    }

    send(type, signal){
        var signal = Object.assign({handle_id: this.id}, signal);
        return this.session.send(type, signal);
    }

    sendMessage(body){
        return this.send("message", {body: body});
    }

    sendJsep(jsep,body){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Sending JSEP")
        }    
        return this.send("message", {body: body, jsep: jsep});
    }

    sendTrickle(candidate){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Sending trickle candidate")
        }        
        return this.send("trickle", {candidate: candidate});
    }

    join(room,ptype){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Joining room " + room + " as " + ptype)
        }

        let body = {
            "request": "join",
            "ptype": ptype,
            "room": room
        };
        return this.sendMessage(body);
    }

    publish(jsep,audio,video){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Publishing...")
        }

        let body = {
            "request": "publish",
            "audio": audio,
            "video": video
        };
        return this.sendJsep(jsep,body);
    }

    createRoom(room){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Creating a new room");
        }
        
        let body = {
            "request": "create",
            "room": room,
            "max_publishers": 150,
            "permanent": false,
            "bitrate": 128000,
            "fir_freq": 10
        };
        return this.sendMessage(body);
    }

    destroyRoom(room){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Destroying room");
        }
        
        let body = {
            "request": "destroy",
            "room": room,
        }
        return this.sendMessage(body);
    }

    listRooms(){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Listing rooms");
        }
        
        let body = {
            "request": "list"
        }
        return this.sendMessage(body);
    }

    listParticipants(room){
        if(this.session.options.verbose === true){
            console.log("[" + this.id  + "] Listing participants in room " + room);
        }
        
        let body = {
            "request": "listparticipants",
            "room": room
        }
        return this.sendMessage(body);
    }


}
