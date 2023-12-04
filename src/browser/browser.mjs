import Acknowledgement from '../entities/Acknowledgement.mjs';

let clientId = null;
const $ = document.querySelector.bind(document);

function app() {
    return {
        title: 'websocketAck',
        acks: [],
        proc: [],
        eventHandlers: {},
        ws: null,
        init() {

            this.ws = new WebSocket('ws://localhost:3600');
            this.procAcks();

            clientId = localStorage.getItem('clientId');

            this.addListener('clientId', (vals) => {
                localStorage.setItem('clientId', vals.clientId);
                this.sendAck(vals.uuid);
                let clientLoaded = new CustomEvent("clientReady");
                window.dispatchEvent(clientLoaded);                
            });
            
            this.ws.onmessage = (event) => {

                const data = JSON.parse(event.data);

                if (data.type == 'ACK') {
                    //console.log('Removing Ack for : ', data.messageId);
                    this.acks = this.acks.filter(ack => ack.id !== data.uuid);
                    return;
                } else {
                    //console.log('Recd message: ', data.type, data.uuid);
                    this.handleMessages(data);
                }

            };

            this.ws.onclose = (e) => console.log('WebSocket disconnected');
            this.ws.onerror = (error) => console.error('WebSocket Error:', error);

        },

        sendAck(uuid) {
            //console.log('Sending Ack for ' +  uuid);
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
                //console.log('Sending message: ', msg.type, msg.uuid);                
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
                            //console.log('Failed to send message: ', ack.message.type, ack.message.uuid);
                            this.acks.splice(i, 1);
                        } else {
                            //console.log('Resending message: ', ack.message.type, ack.message.uuid);
                            this.ws.send(JSON.stringify(ack.message));
                            ack.incrementAttempts();
                        }
                    });
                }
            }, 1500);
        }
    };

}

const main = app();
main.init();
let mainLoaded = new CustomEvent("socketSetLoaded", {detail: main});
window.dispatchEvent(mainLoaded);