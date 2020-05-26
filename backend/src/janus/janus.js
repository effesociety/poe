const JanusWrapper = require('./janus-wrapper')
const WebSocket = require('ws')
const helper = require('../utils/helpers')
const cookie = require('cookie')
const Helpers = require('../utils/helpers')
const currentExams = require('../utils/current-exams')

const janus = async (server) => {

    //Authentication and Authorization  
    server.on('upgrade', async (req, ws, head) => {
        const cookies = cookie.parse(req.headers.cookie || '')
        user = await helper.checkUser(cookies)
        if(user){
            console.log("Set WebSocket role",user.email, "[",user.role,"]")
            ws.role = user.role
        }
        else {
            console.log("No valid token")
            ws.destroy();
            return;        
        }

        wss.handleUpgrade(req, ws, head, function(ws) {
            ws.role = ws._socket.role
            wss.emit('connection', ws, req);
          });
    })

    //SETUP @TO-DO: Move in separate files all the following
    var janusWrapper = new JanusWrapper();
    await janusWrapper.init();
	const wss = new WebSocket.Server({ noServer: true })
    const janusEventHandler =  Helpers.commonEmitter;

    wss.on('connection', async (ws) => {
        ws.on('message', async e => {
            var object = JSON.parse(e);
            
            
            if(object.message!=="trickle" && object.message !=="publish"){
                console.log("Received message on WebSocket:");
                console.log(object);
            }

            if(ws.course && ws.course !== object.course){
                //@TO-DO: What happened?
                console.log("What happened?")
            }

            if(object.course){
                ws.course = object.course
            }
            else{
                console.log("Missing mandatory element: course")
                ws.close()
                return
            }

            if(object.message === "start"){
            /*
                The first thing to do is check if the websocket has a role attached. Then if it is a teacher and the exam does not exist yet it has to be created (hence create a room). If there is already a room associated with the exam then the teacher/user needs just to join it.
            */
                console.log("Received start message");   
                console.log(ws.role)             
                if(ws.role){
                    ws.videoroomHandle = janusWrapper.addHandle();
                    await ws.videoroomHandle.attach("janus.plugin.videoroom");
                    
                    if(ws.role === 'teacher'){
                        console.log("Role teacher")
                        let exam = currentExams.getExam(ws.course);
                        if(exam){
                            await ws.videoroomHandle.join(exam.room, "publisher");
                        }
                        else{
                            let room = Math.floor(Math.random()*10000)
                            await ws.videoroomHandle.createRoom(room)
                            currentExams.setExam(ws.course,room)
                            await ws.videoroomHandle.join(room, "publisher");                       
                        }
                    }
                    else if(ws.role === 'student'){
                        console.log("Role student")
                        if(currentExams[ws.course].room){
                            await ws.videoroomHandle.join(currentExams[ws.course].room, "publisher"); 
                        }       
                        //@TO-DO: Send some info msg to the client                     
                    } 
                }    
            }
            //There are ICE candidates ready to be sent
            else if(object.message === "trickle"){
                console.log("Received trickle message");
                let candidate = object.candidate;
				if(object.subscriberID){
					ws.subscriberHandles[object.subscriberID].sendTrickle(candidate || null);
				}
                else if(ws.videoroomHandle){
                    ws.videoroomHandle.sendTrickle(candidate || null);
                }
            }
            //The media stream is ready to be published
            else if(object.message === "publish"){
                console.log("Received publish message");
                if(ws.videoroomHandle){
                    let remote = await ws.videoroomHandle.publish(object.offer,object.audio,object.video);
                    let body = {
                        "message": "answer",
                        "jsep": remote.jsep,
                        "publisherID": ws.videoroomHandle.id
                    }
                    ws.send(JSON.stringify(body));
                }
            }
            //The teacher wants to get all feeds
            else if(object.message === "getFeeds" && ws.role === 'teacher'){
                console.log("Received getFeeds message");
                var room = currentExams.getExam(ws.course).room
                if(ws.videoroomHandle.id && room){
                    let ev = await ws.videoroomHandle.listParticipants(room);
                    if(ev.plugindata){
                        if(ev.plugindata.plugin === "janus.plugin.videoroom" && ev.plugindata.data.videoroom === "participants"){
                            if(ev.plugindata.data.participants.length>0){
                                var participants = ev.plugindata.data.participants;
                                ws.subscriberHandles = {}
                                participants.forEach(async (participant) => {
                                    let feed = participant.id;
                                    if(feed !== ws.videoroomHandle.feedID){
                                        console.log("Printing participant id: ", feed);
                                        let subscriberHandle = janusWrapper.addHandle();
                                        await subscriberHandle.attach("janus.plugin.videoroom");
                                        ws.subscriberHandles[subscriberHandle.id] = subscriberHandle;
                                        console.log("Printing ID of this subscriber handle")
                                        console.log(subscriberHandle.id)
                                        let object = await subscriberHandle.join(room, "subscriber", feed);
                                        let body = {
                                            "message": "offer",
                                            "jsep": object.jsep,
                                            "subscriberID": subscriberHandle.id
                                        };
                                        console.log("Sending offer to ",subscriberHandle.id)
                                        ws.send(JSON.stringify(body));
                                    }
                                });
                            }
                        }
                    }
                }   
            }
            //The teacher wants to subscribe to a particular feed
            else if(object.message === "subscribe" && ws.role === 'teacher'){
                console.log("Received subscribe message");
                console.log("Printing subscriber ID");
                console.log(object.subscriberID)
                
                await ws.subscriberHandles[object.subscriberID].start(object.jsep);
                let body = {
                    "message": "started"
                };
                ws.send(JSON.stringify(body))
            }
        })

        ws.on('close', () => {
            if(ws.videoroomHandle){
                ws.videoroomHandle.detach()
            }
            if(ws.subscriberHandle){
                Object.keys(ws.subscriberHandles).forEach(handle => {
                    ws.subscriberHandles[handle.id].detach()
                })
            }
        })
    })

    janusEventHandler.on('leaving', (data) => {
        console.log("Leaving event")
        console.log(data)
    })
}

module.exports = janus
