import Acknowledgement from './Acknowledgement.mjs';
import AcknowledgementBus from '../busses/AcknowledgementBus.mjs';
import MessageHandler from '../handlers/MessageHandler.mjs';
import ClientBus from '../busses/ClientBus.mjs';

class Client {

    constructor(ws, id = null) {

        this.acks = [];
        this.attributes = new Map();

        this.ws = ws;

        if (id === null) {
            this.id = crypto.randomUUID();
        } else {
            this.id = id;
        }

		this.ws.on('message', message => {
            MessageHandler.processMessage(this, message)
        });
		
        this.ws.on('close', () => {
            ClientBus.removeClient(this);
        });        

    }

    setAttribute(key, value) {
        this.attributes.set(key, value);
    }

    getAttribute(key) {
        return this.attributes.get(key);
    }    

    send(type, data = {}, uuid = null) {

        const msg = {
            type: type,
            data: data,
            uuid: uuid
        };

        msg.clientId = this.id;
        
        if (!msg.uuid) {
            msg.uuid = crypto.randomUUID();
        }

        console.log('Sending message: ', type, msg.uuid)

        AcknowledgementBus.addAcknowledgement(Acknowledgement.create(msg));

        this.ws.send(JSON.stringify(msg));
    }

    resend(msg = {}) {
        this.ws.send(JSON.stringify(msg));
    }

    sendAck(uuid) {
        console.log('Sending Ack for ' +  uuid);
        this.ws.send(JSON.stringify({type: "ACK", messageId: uuid}));
    }

}

export default Client;