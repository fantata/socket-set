import ClientBus from '../busses/ClientBus.mjs';
import AcknowledgementBus from '../busses/AcknowledgementBus.mjs';
import { eventBus } from '../busses/EventBus.mjs';

/**
 * Handles the processing of messages for the WebSocket service.
 */
class MessageHandler {

    /**
     * 
     * @property {Object.<string, function>} listeners - An object holding the message code as keys and their corresponding callback functions.
     */    
    listeners = {};

    /**
     * Constructs a new MessageHandler instance.
     * 
     */
    constructor() {
        this.addListener('PICKUP', ClientBus.handlePickup);
    }

    /**
     * Add a new listener for a specific message code.
     * 
     * @param {string} code - The message code to listen for.
     * @param {function} callback - The callback function to execute when the message is received.
     */
    addListener(code, callback) {
        if (this.listeners[code] && this.listeners[code] === callback) {
            console.log(`Listener for code '${code}' is already added.`);
            return;            
        }
        this.listeners[code] = callback;
    }

    /**
     * Processes an incoming WebSocket message.
     * 
     * @param {Client} client - The client instance that sent the message.
     * @param {string} message - The raw message string received from the client.
     * @returns {Promise<void>} A promise that resolves when the message is processed.
     */
    async processMessage(client, message) {

        try {

            if (Buffer.isBuffer(message)) {
                message = message.toString();
            }

            const data = JSON.parse(message);

            if (data.type == 'ACK') {
                AcknowledgementBus.removeAcknowledgement(data.messageId);
            } else if(data.broadcast) {
                await ClientBus.broadcast(data.type, data, data.clientId);
                client.sendAck(data.uuid);
                eventBus.emit('broadcast:' + data.type, data);
            } else if (this.listeners[data.type]) {
                await this.listeners[data.type](data, client);
                client.sendAck(data.uuid);
            } else {
                console.log('No listener found for message:', data.type, data.uuid);
            }

        } catch (err) {
            console.error(`Error processing message:`, err);
        }
    }

}

export default new MessageHandler();