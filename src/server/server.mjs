import WebSocketService from '../services/WebSocketService.mjs';
import MessageHandler from '../handlers/MessageHandler.mjs';

export default {

    init(server) {
        this.registerUpgradeHandler(server);
    },

    registerUpgradeHandler(server) {
        server.on('upgrade', (request, socket, head) => {
            WebSocketService.wss.handleUpgrade(request, socket, head, (ws) => {
                WebSocketService.wss.emit('connection', ws, request);
            });
        });
    },

    addListener() {
        console.log(MessageHandler);
    }

}