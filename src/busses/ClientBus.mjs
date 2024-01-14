/**
 * Manages WebSocket clients.
 */
class ClientBus {
    /**
     * Initializes a new instance of the client bus.
     */
    constructor() {

        if (!ClientBus.instance) {

            /**
             * A map to store active WebSocket clients.
             * @type {Map<string, Client>}
             */
            this.clients = new Map();

            /**
             * A map to store client groups.
             * @type {Map<Group, Client>}
             */        
            this.groupToClients = new Map();

            ClientBus.instance = this;

        }

        // Return the existing instance
        return ClientBus.instance;
    }

    /**
     * Adds a WebSocket client to the bus.
     * 
     * @param {Client} client - The WebSocket client to add.
     */
    addClient(client) {
        this.clients.set(client.id, client);
        this.updateGroupMappings(client);
    }

    /**
     * Removes a WebSocket client from the bus.
     * 
     * @param {string} clientId - The identifier of the WebSocket client to remove.
     */
    removeClient(client) {
        this.clients.delete(client.id);
        //this.updateGroupMappings(client);        
    }

    /**
     * Retrieves a WebSocket client from the bus.
     * 
     * @param {string} clientId - The identifier of the WebSocket client to retrieve.
     * @returns {Client | undefined} The WebSocket client, if found.
     */
    getClient(clientId) {
        return this.clients.get(clientId);
    }    

    updateGroupMappings(client) {
        const groups = client.getAttribute('groups') || [];
        groups.forEach(group => {
            if (!this.groupToClients.has(group)) {
                this.groupToClients.set(group, new Set());
            }
            this.groupToClients.get(group).add(client.id);
        });
    }

    setClientAttribute(clientId, key, value) {
        const client = this.getClient(clientId);
        if (client) {
            client.setAttribute(key, value);
            // if (key === 'groups') {
            //     this.updateGroupMappings(client);
            // }
        }
    }

    getClientsByGroup(group) {
        return Array.from(this.groupToClients.get(group) || []).map(clientId => {
            return { clientId, client: this.clients.get(clientId) };
        });
    }
    
    /**
     * handle pickups from clients reconnecting
     * 
     * @param {object} data - the message data
     * @param {Client} client - The client picking up* 
     */    
    handlePickup(data, client) {
        // TODO: migrate groups when pickup performed
        ClientBus.instance.removeClient(client);
        client.id = data.clientId;
        ClientBus.instance.addClient(client);
        client.send('PICKEDUP');
    }    

    broadcast(type, data, senderId) {
        this.clients.forEach(client => {
            if (client.id !== senderId) {
                client.send(type, data, crypto.randomUUID());
            }
        });
    }

}

export default new ClientBus();