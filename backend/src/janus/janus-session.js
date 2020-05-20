module.exports = class JanusSession{
    constructor(output){
        this.output = output;
        this.id = undefined;
        this.txns = {};
        this.eventHandlers = {};
        this.options = {
            verbose: false,
            timeoutMs: 10000,
            keepaliveMs: 30000
        };
    }

    /*
    bindSocket(){
        const webSocketURI = "wss://janus.conf.meetecho.com/ws";
        let ws = new WebSocket(webSocketURI,"janus-protocol");
        ws.onopen = () => {
            this.output = ws.send.bind(ws);
        }
    }
    */

    create(){
        return this.send('create').then(res => {
            this.id = res.data.id;
            return res;
        })
    }

    destroy = function() {
        return this.send("destroy").then((resp) => {
            this.dispose();
            return resp;
        });
    }

    dispose = function() {
        this._killKeepalive();
        this.eventHandlers = {};
        for (var txId in this.txns) {
            if (this.txns.hasOwnProperty(txId)) {
                var txn = this.txns[txId];
                clearTimeout(txn.timeout);
                txn.reject(new Error("Janus session was disposed."));
                delete this.txns[txId];
            }
        }
    }

    send(type, signal){
        let transaction = Math.random().toString(36).slice(2);
        signal = Object.assign({transaction: transaction}, signal);
        return new Promise((resolve, reject) => {
            var timeout = null;
            if (this.options.timeoutMs) {
              timeout = setTimeout(() => {
                delete this.txns[signal.transaction];
                reject(new Error("Signalling transaction with txid " + signal.transaction + " timed out."));
              }, this.options.timeoutMs);
            }
            this.txns[signal.transaction] = { resolve: resolve, reject: reject, timeout: timeout, type: type };
            this._transmit(type, signal);
        });       
    }

    receive(signal){
        if(this.options.verbose){
            this._logIncoming(signal);
        }

        if(signal.session_id !== this.id){
            console.warn("Incorrect session ID. Received " + signal.session_id + " - Expected " + this.id);
        }

        var responseType = signal.janus;
        var handlers = this.eventHandlers[responseType];
        if(handlers !== null && handlers !== undefined){
            for(let i = 0; i < handlers.length; i++){
                handlers[i](signal);
            }
        }

        if(signal.transaction !== null){
            var txn = this.txns[signal.transaction];
            if(txn === null || txn === undefined){
                return;
            }
        }

        if(responseType === "ack" && txn.type === "message"){
            return;
        }

        clearTimeout(txn.timeout);

        delete this.txns[signal.transaction];
        (this.isError(signal) ? txn.reject : txn.resolve)(signal);
    }

    on(ev, callback){
        var handlers = this.eventHandlers[ev];
        if(handlers === null || handlers === undefined){
            handlers = this.eventHandlers[ev] = [];
        }
        handlers.push(callback);
    }

    isError(signal){
        if(signal.plugindata && signal.plugindata.data){
            return (signal.janus === "error" || signal.plugindata.data.error);
        }
        else{
            return signal.janus === "error"
        }
    }

    _transmit(type, signal){
        signal = Object.assign({ janus:type}, signal);
        
        if(this.id !== null){
            signal = Object.assign({session_id: this.id}, signal);
        }

        if(this.options.verbose){
            this._logOutgoing(signal);
        }

        this.output(JSON.stringify(signal));
        this._resetKeepalive();
    }

    _logOutgoing(signal){
        let kind = signal.janus;
        if (kind === "message" && signal.jsep){
            kind = signal.jsep.type;
        }
        let message = "Outgoing Janus " + (kind || "signal") + " (#" + signal.transaction + "): ";
        console.debug("%c" + message, "color: #040", signal);
    }

    _logIncoming(signal){
        let kind = signal.janus;
        let message = signal.transaction ?
            "Incoming Janus " + (kind || "signal") + " (#" + signal.transaction + "): " :
            "Incoming Janus " + (kind || "signal") + ": ";
        console.debug("%c" + message, "color: #040", signal);
    }

    _sendKeepalive(){
        return this.send("keepalive");
      };
      
    _killKeepalive(){
        clearTimeout(this.keepaliveTimeout);
    };
    
    _resetKeepalive(){
        this._killKeepalive();
        if(this.options.keepaliveMs) {
            this.keepaliveTimeout = setTimeout(() => {
                this._sendKeepalive().catch(e => console.error("Error received from keepalive: ", e));
            }, this.options.keepaliveMs);
        }
    };

}