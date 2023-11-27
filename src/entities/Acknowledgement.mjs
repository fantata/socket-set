class Acknowledgement {

    clientId = null;
    message = null;
    attempts = 0;

    constructor(message) {
        if (typeof window == 'undefined') {
            this.clientId = message.clientId;
        }
        this.message = message;
    }

    incrementAttempts() {
        this.attempts++;
    }

    static create(message) {
        return new Acknowledgement(message);
    }    

}

export default Acknowledgement;