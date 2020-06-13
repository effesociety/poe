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
            ws.email = user.email
            ws.role = user.role
        }
        else {
            console.log("No valid token")
            ws.destroy();
            return;        
        }

        wss.handleUpgrade(req, ws, head, function(ws) {
            ws.email = ws._socket.email
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
            if(ws.publisherHandlers){
                Object.keys(ws.publisherHandlers).forEach(type => {
                    ws.publisherHandlers[type].detach()
                })
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
            if(ws.publisherHandlers){
                for (let i=0; i<Object.keys(ws.publisherHandlers).length; i++){
                    let type = Object.keys(ws.publisherHandlers)[i]
                    if(ws.publisherHandlers[type].id === object.sender){
                        console.log("Relaying trickle message to publisher (" + type + ")")
                        body = Object.assign({"publisherType": type}, body)
                        ws.send(JSON.stringify(body))
                        return
                    }
                }
            }

            if(ws.subscriberHandles){
                for (let i=0; i<Object.keys(ws.subscriberHandles).length; i++){
                    let subscriberID = Object.keys(ws.subscriberHandles)[i]
                    if(ws.subscriberHandles[subscriberID].id === object.sender){
                        console.log("Relaying trickle message to subscriber")
                        body = Object.assign({"subscriberID": subscriberID}, body)
                        ws.send(JSON.stringify(body))
                        return
                    }
                }
            }
        })        
    })

    janusEventHandler.on('published', (data) => {
        console.log("Published event")
        console.log(data)

        let publishedRole;
        let type;
        let user;

        wss.clients.forEach(ws => {
            Object.keys(ws.publisherHandlers).forEach(t => {
                if(ws.publisherHandlers[t] && ws.publisherHandlers[t].feedID === data.id){
                    publishedRole = ws.role
                    type = t
                    user = ws.email
                }
            })
        })
        
        wss.clients.forEach(async ws => {
            if(publishedRole === "student"){
                if(ws.role === 'teacher'){
                    let exam = await currentExams.getExam(ws.course)
                    if(exam && exam.room === data.room){
                        sendOffer(ws,data.room,data.id,type,user)
                    }
                }
            }
            else if(publishedRole === "teacher"){
                if(ws.role === "student"){
                    let exam = await currentExams.getExam(ws.course)
                    if(exam && exam.room === data.room){
                        sendOffer(ws,data.room,data.id,type,user)
                    }
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
        /*
        janusAdminAPI.listParticipants(data.room)
        .then(participants => {
            console.log("Printing participants")
            console.log(participants)
            if(participants && participants.length === 0){
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
        */     
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
        if(ws.role){
            if(!ws.publisherHandlers){
                ws.publisherHandlers = {}
            }
            ws.publisherHandlers.userMedia = janusWrapper.addHandle();
            ws.publisherHandlers.displayMedia = janusWrapper.addHandle();
            await ws.publisherHandlers.userMedia.attach("janus.plugin.videoroom");
            if(ws.role === 'teacher'){
                console.log("Role teacher")
                let exam = await currentExams.getExam(ws.course);

                if(exam){
                    await ws.publisherHandlers.userMedia.join(exam.room, "publisher");
                }
                else{
                    let room = Math.floor(Math.random()*10000)
                    await ws.publisherHandlers.userMedia.createRoom(room)
                    await currentExams.setExam(ws.course,room)
                    await ws.publisherHandlers.userMedia.join(room, "publisher");                                          
                }
            }
            else if(ws.role === 'student'){
                console.log("Role student")
                await ws.publisherHandlers.displayMedia.attach("janus.plugin.videoroom");
                let exam = await currentExams.getExam(ws.course);
                if(exam){
                    let firstTime = await currentExams.verifyFirstTime(ws.email,exam)
                    if(firstTime){
                        await currentExams.addStudent(ws.email,exam.room)
                        await ws.publisherHandlers.userMedia.join(exam.room, "publisher");  
                        await ws.publisherHandlers.displayMedia.join(exam.room, "publisher");  
                    }
                    else{
                        console.log("Impossible to retake exam")
                        ws.close()
                    }                        
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
        else if(object.publisherType){
            ws.publisherHandlers[object.publisherType].sendTrickle(candidate || null);
        }
    }
    
    async function managePublishMessage(ws,object){
        console.log("Received publish message");
        if(object.publisherType){
            let remote = await ws.publisherHandlers[object.publisherType].publish(object.offer,object.audio,object.video);
            let body = {
                "message": "answer",
                "jsep": remote.jsep,
                "publisherType": object.publisherType
            }         
            
            if(ws.role === 'teacher'){
                ws.send(JSON.stringify(body))

                let exam = await currentExams.getExam(ws.course);
                if(exam){
                    wss.clients.forEach(websocket => {
                        if(websocket.role === "student" && websocket.course === ws.course){
                            sendOffer(ws, exam.room, websocket.publisherHandlers.userMedia.feedID,"userMedia", websocket.email)
                            sendOffer(ws, exam.room, websocket.publisherHandlers.displayMedia.feedID,"displayMedia", websocket.email)
                        }
                    })
                }
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
                
                let exam = await currentExams.getExam(ws.course);
                if(exam){
                    wss.clients.forEach(websocket => {
                        if(websocket.role === "teacher" && websocket.course === ws.course){
                            console.log("Attacching to teacher feed")
                            sendOffer(ws, exam.room, websocket.publisherHandlers.userMedia.feedID,"userMedia", websocket.email)
                        }
                    })
                }
            }
            
        }  
    }
    
    //NOT USED
    async function manageGetFeedsMessage(ws){
        console.log("Received getFeeds message")
        if(ws.role === 'teacher'){
            var room = await currentExams.getExam(ws.course).room
            if(ws.publisherHandlers.userMedia.id && room){
                let ev = await ws.publisherHandlers.userMedia.listParticipants(room)
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
            currentExams.stopExam(object.course)
            let clients = []
            for(ws of wss.clients){
                clients.push(ws.email)
            }
            let numStudents = await currentExams.getNumStudents(object.course,clients)
            if(numStudents === 0){
                sendReport(ws, object.course)
            }
            else{
                forceComplete(object.course)
            }
        }
    }

    async function manageCompleteMessage(ws,object){
        console.log("Received complete message")
        if(ws.role === 'student'){
            let course = await Helpers.checkCourse(ws.course)
            if(course){
                console.log("[",course.name,"] Test completed")
                let counter = 0
                const response = Object.keys(object.answers).map(id => {
                    let question = course.test.questions[id]
                    let answer = object.answers[id]
                    let correctAnswer = course.test.answers[id]
                    
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
                    return res;
                })

                const report = {
                    "answers": Object.keys(course.test.answers).length,
                    "correctAnswers": counter
                }
                
                const body = {
                    "message": "completed",
                    "test": response,
                    "report": report
                }

                ws.send(JSON.stringify(body))
                await currentExams.completeExam(object.course, ws.email, report)
                let stopping = await currentExams.getStopping(object.course)
                let clients = []
                for(ws of wss.clients){
                    clients.push(ws.email)
                }
                let numStudents = await currentExams.getNumStudents(object.course,clients)
                if(stopping && numStudents === 0){
                    wss.clients.forEach(ws => {
                        if(ws.role === "teacher" && ws.course === object.course){
                            sendReport(ws, object.course)
                        }
                    })
                }
                              
            }
        }
    }

    async function sendOffer(ws, room, feed, type, user){
        //ws.attachedToTeacher = true; //To avoid double attach
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
            "subscriberID": subscriberHandle.id,
            "user": user,
            "type": type
        };
        console.log("Sending offer to ",subscriberHandle.id)
        ws.send(JSON.stringify(body));      

    }

    async function sendReport(ws, course){
        let exam = await currentExams.getExam(course)
        if(exam){
            const reports = currentExams.getReports(exam)
            let room = exam.room
            await currentExams.removeExam(course)
            await janusAdminAPI.destroyRoom(room)
            let body = {
                "message": "destroyed",
                "course": course,
                "reports": reports
            }
            ws.send(JSON.stringify(body))
        }
    }

    async function forceComplete(course){
        const exam = await currentExams.getExam(course);
        let body = {
            "message": "forceComplete"
        }
        if(exam && exam.students){
            wss.clients.forEach(ws => {
                if(ws.email in exam.students){
                    ws.send(JSON.stringify(body))
                }
            })
        }
    }
}

module.exports = janus
