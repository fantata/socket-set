import Acknowledgement from './Acknowledgement.mjs';
import AcknowledgementBus from '../busses/AcknowledgementBus.mjs';
import MessageHandler from '../handlers/MessageHandler.mjs';
import ClientBus from '../busses/ClientBus.mjs';

import { v4 as uuidv4 } from 'uuid';

class Client {

    constructor(ws, id = null) {

        this.acks = [];
        this.attributes = new Map();

        this.ws = ws;

        if (id === null) {
            this.id = uuidv4();
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

    send(type, data = {}) {

        console.log('Sending message: ', type)
        
        const msg = {
            type: type,
            data: data
        };

        msg.clientId = this.id;
        
        if (!msg.uuid) {
            msg.uuid = uuidv4();
        }

        AcknowledgementBus.addAcknowledgement(Acknowledgement.create(msg));

        this.ws.send(JSON.stringify(msg));
    }

    resend(msg = {}) {
        this.ws.send(JSON.stringify(msg));
    }    

}

export default Client;