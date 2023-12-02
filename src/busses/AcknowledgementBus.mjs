import ClientBus from './ClientBus.mjs';

/**
 * Manages Acknowledgement messages
 */
class AcknowledgementBus {
    /**
     * Initializes a new instance of the Acknowledgement.
     */
    constructor() {
        if (!AcknowledgementBus.instance) {
            /**
             * A map to store pending Acknowledgements
             * @type {Map<string, Acknowledgement>}
             */
            this.acks = new Map();

            /**
             * The client bus to use for sending messages.
             * @type {ClientBus}
            */
            this.clientBus = ClientBus;

            this.pollForAcks();

            AcknowledgementBus.instance = this;
        }
    }

    /**
     * Polls the Acknowledgement bus for messages that have not been acknowledged.
     */
    pollForAcks() {
        // let int = setInterval(() => {
        //     if (this.acks.size) {
        //         this.acks.forEach((ack, key) => {
        //             if (ack.attempts > 2) {
        //                 console.log('Ack not received: ', key);
        //                 this.acks.delete(key);
        //             } else {
        //                 console.log('Resending msg: ', ack.message.type, ack.message.uuid);
        //                 this.clientBus.getClient(ack.clientId).resend(ack.message);
        //                 ack.incrementAttempts();
        //             }
        //         });
        //     }
        // }, 1000);
    }

    /**
     * Adds an acknowledgement client to the bus.
     * 
     * @param {Acknowledgement} acknowledgement - The Acknowledgement object to be added
     */
    addAcknowledgement(acknowledgement) {
        this.acks.set(acknowledgement.message.uuid, acknowledgement);
    }

    /**
     * Removes an acknowledgement client from the bus.
     * 
     * @param {string} uuid - The identifier of the acknowledgement message to remove.
     */
    removeAcknowledgement(uuid) {
        if (this.acks.has(uuid)) {
            this.acks.delete(uuid);
            console.log("Removed ack: ", uuid);
        }
    }

}

export default new AcknowledgementBus();