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
        let int = setInterval(() => {
            if (this.acks.size) {
                this.acks.forEach((ack) => {
                    if (ack.attempts > 2) {
                        console.log('Failed to send ack: ', ack);
                        this.acks.delete(ack.id);
                    } else {
                        console.log('Resending msg: ', ack.message);
                        this.clientBus.getClient(ack.clientId).resend(ack.message);
                        ack.incrementAttempts();
                    }
                });
            }
        }, 1000);
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
        this.acks.delete(uuid);
        console.log(this.acks)
    }

}

export default new AcknowledgementBus();