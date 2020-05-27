const JanusWrapper = require('./janus-wrapper')
const janusAdminAPI = require('./janus-admin-session')
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
            console.log("Set WebSocket",user.email, "role [",user.role,"]")
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
            var object = JSON.parse(e)

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
                 
            switch(object.message){
                case 'start':
                    manageStartMessage(ws)
                    break

                case 'trickle':
                    manageTrickeMessage(ws,object)
                    break

                case 'publish':
                    managePublishMessage(ws,object)
                    break
                
                case 'getFeeds':
                    manageGetFeedsMessage(ws)
                    break

                case 'subscribe':
                    manageSubscribeMessage(ws,object)
                    break

                case 'destroy':
                    manageDestroyMessage(ws)
                    break   
                    
                default:
                    console.log("[",object.message,"] not handled...")
                    break
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

    janusEventHandler.on('published', (data) => {
        console.log("published event")
        console.log(data)

        wss.clients.forEach(ws => {
            console.log(ws.role)
            if(ws.role === 'teacher'){
                let exam = currentExams.getExam(ws.course)
                if(exam.room === data.room){
                    manageSubscribeHandle(ws,data.room,data.id)
                }
            }
        })
    })

    janusEventHandler.on('leaving', (data) => {
        console.log("Leaving event")
        console.log(data)
        
        janusAdminAPI.listParticipants(data.room)
        .then(participants => {
            console.log(participants)
            if(participants.length === 0){
                janusAdminAPI.destroyRoom(data.room)
                var course = currentExams.getCourse(data.room)
                currentExams.removeExam(course)
            }
        })  
        .catch(err => {
            console.log(err)
        })     
    })

    janusEventHandler.on('subscribed', (data) => {
        wss.clients.forEach(ws => {
            if(ws.subscriberHandles){
                Object.keys(ws.subscriberHandles).forEach(subscriberHandle => {
                    if(subscriberHandle.feed_id === data.id){
                        let body = {
                            message : "subscribed",
                            subscriberID : subscriberHandle
                        }
                        ws.send(JSON.stringify(body))
                    }
                })
            }        
        })
    })



    async function manageStartMessage(ws){
        console.log("Received start message");   
        console.log(ws.role)             
        if(ws.role){
            ws.videoroomHandle = janusWrapper.addHandle();
            await ws.videoroomHandle.attach("janus.plugin.videoroom");
            
            if(ws.role === 'teacher'){
                console.log("Role teacher")
                let exam = currentExams.getExam(ws.course);

                console.log("printing exam")
                console.log(exam)
                console.log("printing currentExams")
                console.log(currentExams)

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
                let exam = currentExams.getExam(ws.course);
                if(exam){
                    await ws.videoroomHandle.join(exam.room, "publisher"); 
                    wss.clients.forEach(websocket => {
                        if(websocket.role === "teacher" && websocket.course === ws.course){
                            console.log("ATTACHING TO TEACHER FEED")
                            console.log(ws.role)
                            console.log(websocket.role)
                            console.log(websocket.videoroomHandle.feedID)
                            manageSubscribeHandle(ws, exam.room, websocket.videoroomHandle.feedID)
                        }
                    })
                }
                //@TO-DO: Send some info msg to the client                     
            } 
        }  
    }
    
    function manageTrickeMessage(ws,object){
        console.log("Received trickle message");
        let candidate = object.candidate;
        if(object.subscriberID){
            ws.subscriberHandles[object.subscriberID].sendTrickle(candidate || null);
        }
        else if(ws.videoroomHandle){
            ws.videoroomHandle.sendTrickle(candidate || null);
        }
    }
    
    async function managePublishMessage(ws,object){
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
    
    async function manageGetFeedsMessage(ws){
        console.log("Received getFeeds message")
        if(ws.role === 'teacher'){
            var room = currentExams.getExam(ws.course).room
            if(ws.videoroomHandle.id && room){
                let ev = await ws.videoroomHandle.listParticipants(room)
                if(ev.plugindata){
                    if(ev.plugindata.plugin === "janus.plugin.videoroom" && ev.plugindata.data.videoroom === "participants"){
                        if(ev.plugindata.data.participants.length>0){
                            var participants = ev.plugindata.data.participants;
                            ws.subscriberHandles = {}
                            participants.forEach(async (participant) => {
                                let feed = participant.id;
                                manageSubscribeHandle(ws, room, feed)
                            })
                        }
                    }
                }
            }   
        }    
    }
    
    async function manageSubscribeMessage(ws,object){
        console.log("Received subscribe message")
        console.log("Printing subscriber ID")
        console.log(object.subscriberID)
        
        await ws.subscriberHandles[object.subscriberID].start(object.jsep);
        let body = {
            "message": "started",
            "subscriberID": object.subscriberID
        }
        ws.send(JSON.stringify(body))
    }
    
    function manageDestroyMessage(ws){
        if(ws.role === 'teacher'){
            console.log("Received destroy message")
            var room = currentExams.getExam(ws.course).room
            ws.videoroomHandle.destroyRoom(room)
        }
    }

    async function manageSubscribeHandle(ws, room, feed){
        if(feed !== ws.videoroomHandle.feedID){
            console.log("Printing participant id: ", feed);
            let subscriberHandle = janusWrapper.addHandle();
            await subscriberHandle.attach("janus.plugin.videoroom");
            if(!ws.subscriberHandles){
                ws.subscriberHandles = {}
            }
            ws.subscriberHandles[subscriberHandle.id] = subscriberHandle;
            console.log("Printing ID of this subscriber handle")
            console.log(subscriberHandle.id)
            console.log("Priting feed we're trying to attach")
            console.log(feed)
            console.log("Printing room")
            console.log(room)
            let object = await subscriberHandle.join(room, "subscriber", feed);
            let body = {
                "message": "offer",
                "jsep": object.jsep,
                "subscriberID": subscriberHandle.id
            };
            console.log("Sending offer to ",subscriberHandle.id)
            ws.send(JSON.stringify(body));

            console.log("WS ROLE")
            console.log(ws.role)
            console.log("ROOM")
            console.log(room)
            console.log("FEED")
            console.log(feed)
            console.log("*********")
        }
    }
}

module.exports = janus
