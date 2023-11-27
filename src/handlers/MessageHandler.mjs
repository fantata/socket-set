import ClientBus from '../busses/ClientBus.mjs';
import AcknowledgementBus from '../busses/AcknowledgementBus.mjs';

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

            console.log('Server received message:', data);

            if (data.type == 'ACK') {
                AcknowledgementBus.removeAcknowledgement(data.messageId);
            } else if (this.listeners[data.type]) {
                await this.listeners[data.type](client, data);
            } else {
                console.log('No listener found for message:', data.type);
            }

        } catch (err) {
            console.error(`Error processing message:`, err);
        }
    }

}

export default new MessageHandler();