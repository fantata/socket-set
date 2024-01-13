import WebSocketService from '../services/WebSocketService.mjs';
import MessageHandler from '../handlers/MessageHandler.mjs';
import { eventBus } from '../busses/EventBus.mjs';

export default {

    init(server) {
        WebSocketService.useServer(server);
        //this.registerUpgradeHandler(server);
    },

    registerUpgradeHandler(server) {
        server.on('upgrade', (request, socket, head) => {
            WebSocketService.wss.handleUpgrade(request, socket, head, (ws) => {
                WebSocketService.wss.emit('connection', ws, request);
            });
        });
    },

    addListener(type, cb) {
        MessageHandler.addListener(type, cb);
    },

    eventBus() {
        return eventBus;
    },

    sendToClient(clientId, type, stage) {
        WebSocketService.sendToClient(clientId, type, stage);
    },

    serverBroadcast(type, data) {
        this.clients.forEach(client => {
            client.send(type, data, crypto.randomUUID());
        });
    }    

}