const JanusWrapper = require('./janus-wrapper')
const janusAdminAPI = require('./janus-admin-session')
const WebSocket = require('ws')
const cookie = require('cookie')
const Helpers = require('../utils/helpers')
const currentExams = require('../utils/current-exams')


const janus = async (server) => {

    //Authentication and Authorization  
    server.on('upgrade', async (req, ws, head) => {
        const cookies = cookie.parse(req.headers.cookie || '')
        user = await Helpers.checkUser(cookies)
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

            if(object.course && !ws.course){
                ws.course = object.course
            }
            else if(!object.course || (object.course && ws.course && ws.course !== object.course)){
                console.log("Missing mandatory element: course")
                ws.close()
                return
            }
                 
            switch(object.message){
                case 'start':
                    manageStartMessage(ws)
                    break

                case 'trickle':
                    manageTrickleMessage(ws,object)
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
                    manageDestroyMessage(ws, object)
                    break   
                
                case 'complete':
                    manageCompleteMessage(ws,object)
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

    janusWrapper.session.on('trickle', (object) => {
        //data.sender has the pluginID
        //data.candidate has the ICE candidate
        let body = {
            "message": "trickle",
            "candidate": object.candidate
        }

        wss.clients.forEach(ws => {
            console.log("Printing cose")
            console.log(ws.videoroomHandle)
            console.log(ws.subscriberHandles)
            if(ws.videoroomHandle && ws.videoroomHandle.id === object.sender){
                ws.send(JSON.stringify(body))
                return
            }
            
            for (subscriberID in Object.keys(ws.subscriberHandles)){
                if(ws.subscriberHandles[subscriberID] === data.sender){
                    body = Object.assign({"subscriberID": subscriberID}, body)
                    ws.send(JSON.stringify(body))
                    return
                }
            }
        })
        
    })

    janusEventHandler.on('published', (data) => {
        console.log("published event")
        console.log(data)

        
        wss.clients.forEach(async ws => {
            console.log(ws.role)
            if(ws.role === 'teacher'){
                let exam = await currentExams.getExam(ws.course)
                if(exam && exam.room === data.room){
                    sendOffer(ws,data.room,data.id)
                }
            }
        })
    })

    janusEventHandler.on('leaving', (data) => {
        wss.clients.forEach(ws => {
            if(ws.subscriberHandles){
                Object.keys(ws.subscriberHandles).forEach(subscriberHandle => {
                    if(ws.subscriberHandles[subscriberHandle].feedID === data.id){
                        let body = {
                            message : "leaving",
                            subscriberID : subscriberHandle
                        }
                        ws.send(JSON.stringify(body))
                    }
                })
            }        
        })
        
        janusAdminAPI.listParticipants(data.room)
        .then(participants => {
            console.log("Printing participants")
            console.log(participants)
            if(participants.length === 0){
                janusAdminAPI.destroyRoom(data.room)
                .then(async () => {
                    var course = await currentExams.getCourse(data.room)
                    await currentExams.removeExam(course)
                })
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
                    if(ws.subscriberHandles[subscriberHandle].feedID === data.feed){
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
                let exam = await currentExams.getExam(ws.course);

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
                    await currentExams.setExam(ws.course,room)
                    await ws.videoroomHandle.join(room, "publisher");                       
                }
            }
            else if(ws.role === 'student'){
                console.log("Role student")
                let exam = await currentExams.getExam(ws.course);
                if(exam){
                    await ws.videoroomHandle.join(exam.room, "publisher"); 
                    wss.clients.forEach(websocket => {
                        if(websocket.role === "teacher" && websocket.course === ws.course){
                            console.log("Attacching to teacher feed")
                            sendOffer(ws, exam.room, websocket.videoroomHandle.feedID)
                        }
                    })
                }
                //@TO-DO: Send some info msg to the client                     
            } 
        }  
    }
    
    function manageTrickleMessage(ws,object){
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
            /*
            ws.send(JSON.stringify(body))
            */            
            
            if(ws.role === 'teacher'){
                ws.send(JSON.stringify(body))
            }
            else if(ws.role === 'student'){
                let test = await Helpers.getTest(ws.course)
                if(test){
                    body["test"] = test
                    ws.send(JSON.stringify(body))
                }
                else{
                    console.log("Test not found")
                }           
            }
            
        }  
    }
    
    async function manageGetFeedsMessage(ws){
        console.log("Received getFeeds message")
        if(ws.role === 'teacher'){
            var room = await currentExams.getExam(ws.course).room
            if(ws.videoroomHandle.id && room){
                let ev = await ws.videoroomHandle.listParticipants(room)
                if(ev.plugindata){
                    if(ev.plugindata.plugin === "janus.plugin.videoroom" && ev.plugindata.data.videoroom === "participants"){
                        if(ev.plugindata.data.participants.length>0){
                            var participants = ev.plugindata.data.participants;
                            ws.subscriberHandles = {}
                            participants.forEach(async (participant) => {
                                let feed = participant.id;
                                sendOffer(ws, room, feed)
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
    
    async function manageDestroyMessage(ws,object){
        console.log("Received destroy message")
        if(ws.role === 'teacher'){
            let exam = await currentExams.getExam(object.course)
            if(exam){
                let room = exam.room
                await currentExams.removeExam(object.course)
                await janusAdminAPI.destroyRoom(room)
            }
            let body = {
                "message": "destroyed",
                "course": object.course
            }
            ws.send(JSON.stringify(body))
        }
    }

    async function manageCompleteMessage(ws,object){
        console.log("Received complete message")
        if(ws.role === 'student'){
            console.log("Your answers:\n",object)
            let course = await Helper.checkCourse(ws.course)
            if(course){
                console.log("[",course.name,"] Test completed")
                let counter = 0
                const response = Object.keys(object).map(id => {
                    let question = course.test.questions[id]
                    console.log("Question:",question)
                    let answer = object[id]
                    console.log("Your answer:",answer)
                    let correctAnswer = course.test.answers[id]
                    console.log("Correct answer:",correctAnswer)
                    
                    let res = {
                        "question": question,
                        "answer": {
                            "correctAnswer": correctAnswer,
                            "yourAnswer": answer
                        } 
                    }
                    if(answer === correctAnswer){
                        counter += 1
                        res.answer = Object.assign({"correct": true}, res.answer)
                    }
                    else{
                        res.answer = Object.assign({"correct": false}, res.answer)
                    }
                    console.log(res)
                    return res;
                    /*
                    if(answer === correctAnswer){
                        counter += 1
                        return {
                            "question": question,
                            "answer": {
                                "correctAnswer": correctAnswer,
                                "yourAnswer": answer,
                                "correct": true
                            }
                        }
                    }
                    else {
                        return {
                            "question": question,
                            "answer": {
                                "correctAnswer": correctAnswer,
                                "yourAnswer": answer,
                                "correct": false
                            }
                        }
                    }
                    */
                })

                const report = {
                    "answers": Object.keys(object).length,
                    "correctAnswers": counter
                }
                
                const body = {
                    "message": "completed",
                    "test": response,
                    "report": report
                }  
                ws.send(JSON.stringify(body))              
            }
        }
    }

    async function sendOffer(ws, room, feed){
        if(feed !== ws.videoroomHandle.feedID){
            console.log("Printing participant id: ", feed);
            let subscriberHandle = janusWrapper.addHandle();
            await subscriberHandle.attach("janus.plugin.videoroom");
            if(!ws.subscriberHandles){
                ws.subscriberHandles = {}
            }
            ws.subscriberHandles[subscriberHandle.id] = subscriberHandle;
            let object = await subscriberHandle.join(room, "subscriber", feed);
            let body = {
                "message": "offer",
                "jsep": object.jsep,
                "subscriberID": subscriberHandle.id
            };
            console.log("Sending offer to ",subscriberHandle.id)
            ws.send(JSON.stringify(body));
        }
    }
}

module.exports = janus
