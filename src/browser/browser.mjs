import Acknowledgement from '../entities/Acknowledgement.mjs';
import MessageHandler from '../handlers/MessageHandler.mjs';

let clientId = null;
const $ = document.querySelector.bind(document);

function app() {
    return {
        title: 'websocketAck',
        acks: [],
        proc: [],
        eventHandlers: {},
        messageHandler: MessageHandler,
        ws: null,
        init() {

            this.ws = new WebSocket('ws://localhost:3600');
            this.procAcks();

            clientId = localStorage.getItem('clientId');

            this.addListener('clientId', (data, uuid, clientId) => {
                localStorage.setItem('clientId', clientId);
                this.wsSend({type: "ACK", messageId: uuid});
            });
            
            this.ws.onmessage = (event) => {

                const data = JSON.parse(event.data);
                console.log('Recd message: ', data.type);

                if (data.type == 'ACK') {
                    this.acks = this.acks.filter(ack => ack.id !== data.uuid);
                    return;
                } else {
                    this.handleMessages(data);
                }

            };

            this.ws.onclose = () => console.log('WebSocket disconnected');
            this.ws.onerror = (error) => console.error('WebSocket Error:', error);

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
                console.error('WebSocket is not connected');
            }

        },

        handleMessages(vals) {
            if (this.proc.indexOf(vals.uuid) < 0) {
                this.proc.push(vals.uuid);
                const type = vals.type;
                const data = vals.data;
                console.log('handleMessage', vals.type)
                this.triggerEvent(type, data, vals.uuid, vals.clientId);
            }

        },

        addListener(eventType, handler) {
            if (!this.eventHandlers[eventType]) {
                this.eventHandlers[eventType] = [];
            }
            this.eventHandlers[eventType].push(handler);
        },

        triggerEvent(eventType, data, uuid, clientId) {
            if (this.eventHandlers[eventType]) {
                this.eventHandlers[eventType].forEach(handler => handler(data, uuid, clientId));
            }
        },        

        wsSend(msg) {

            msg.uuid = crypto.randomUUID();
            
            if (msg.type !== 'ACK') {
                this.acks.push(Acknowledgement.create(msg));
            }
            
            if(this.ws.readyState==1) {
                console.log('Sending message: ', msg);
                this.ws.send(JSON.stringify(msg));
            }
            
        },

        procAcks() {
            let int = setInterval(() => {
                if (this.acks.length > 0) {
                    this.acks.forEach((ack, i) => {
                        if (ack.attempts > 9) {
                            console.log('Failed to send message: ', ack);
                            this.acks.splice(i, 1);
                        } else {
                            console.log('Resending message: ', ack.message);
                            this.ws.send(JSON.stringify(ack.message));
                            ack.incrementAttempts();
                        }
                    });
                } else {
                    console.log('NO ACKS');
                }
            }, 1500);
        }
    };

}

const main = app();
main.init();
let mainLoaded = new CustomEvent("socketSetLoaded", {detail: main});
window.dispatchEvent(mainLoaded);