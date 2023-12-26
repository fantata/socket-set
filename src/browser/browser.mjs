import Acknowledgement from '../entities/Acknowledgement.mjs';
let clientId = null;
const $ = document.querySelector.bind(document);

const fantataSocketSet = function() {
    return {
        title: 'websocketAck',
        acks: [],
        proc: [],
        eventHandlers: {},
        ws: null,
        init(url) {
            this.ws = new WebSocket(url);
            this.procAcks();

            clientId = localStorage.getItem('clientId');

            if (clientId) {
                this.wsSend({type: "PICKUP", clientId: clientId});
                this.addListener('PICKEDUP', () => {
                    let clientLoaded = new CustomEvent("clientReady");
                    window.dispatchEvent(clientLoaded);                                  
                });
            }

            this.addListener('clientId', (vals) => {

                this.sendAck(vals.uuid);

                if (!clientId) {
                    localStorage.setItem('clientId', vals.clientId);
                    let clientLoaded = new CustomEvent("clientReady");
                    window.dispatchEvent(clientLoaded);
                }

            });
            
            this.ws.onmessage = (event) => {

                const data = JSON.parse(event.data);
                if (data.type == 'ACK') {
                    this.acks = this.acks.filter(ack => {
                        return ack.message.uuid != data.messageId;
                    });
                    return;      
                } else {
                    this.handleMessages(data);
                }

            };

            this.ws.onclose = (e) => console.log('WebSocket disconnected');
            this.ws.onerror = (error) => console.error('WebSocket Error:', error);

        },

        sendAck(uuid) {
            this.wsSend({type: "ACK", messageId: uuid});
        },

        sendMessage(type, data = null) {

            if (this.ws.readyState === WebSocket.OPEN) {
                
                let item = {
                    type: type
                };

                if (data !== null) {
                    item.data = data;
                }

                this.wsSend(item);

            } else {
                console.error('WebSocket is not connected on send ', type, data);
            }

        },

        handleMessages(vals) {

            if (this.proc.indexOf(vals.uuid) < 0) {

                this.proc.push(vals.uuid);

                const type = vals.type;

                if (this.eventHandlers[type]) {
                    this.eventHandlers[type].forEach(handler => handler(vals));
                    this.sendAck(vals.uuid);
                }

            }
        },

        addListener(eventType, handler) {
            if (!this.eventHandlers[eventType]) {
                this.eventHandlers[eventType] = [];
            }
            this.eventHandlers[eventType].push(handler);
        },

        clientBroadcast(msg) {
            msg.broadcast = true;
            this.wsSend(msg);
        },
        
        wsSend(msg) {

            msg.uuid = crypto.randomUUID();
            msg.clientId = localStorage.getItem('clientId');
            
            if (msg.type !== 'ACK') {
                this.acks.push(Acknowledgement.create(msg));
            }
            
            if(this.ws.readyState==1) {             
                this.ws.send(JSON.stringify(msg));
            }
            
        },

        procAcks() {
            let int = setInterval(() => {
                if (this.acks.length > 0) {
                    this.acks.forEach((ack, i) => {
                        if (ack.attempts > 9) {
                            this.acks.splice(i, 1);
                        } else {
                            this.ws.send(JSON.stringify(ack.message));
                            ack.incrementAttempts();
                        }
                    });
                }
            }, 1500);
        }
    };

}

let socketSetLoaded = new CustomEvent("socketSetLoaded", { detail: fantataSocketSet });
window.dispatchEvent(socketSetLoaded);