import { WebSocketServer } from 'ws';
import Client from '../entities/Client.mjs';
import ClientBus from '../busses/ClientBus.mjs';

class WebSocketService {

	makeServer() {
		this.wss = new WebSocketServer({ noServer: true });
		this.wss.on('connection', this.handleConnection.bind(this));
	}

	useServer(httpsServer) {
		this.wss = new WebSocketServer({
			server: httpsServer
		});
		this.wss.on('connection', this.handleConnection.bind(this));
	}

	handleConnection(ws) {
		const client = new Client(ws);
        ClientBus.addClient(client);
		client.send('clientId');
	}

    sendToClient(clientId, type, data) {
        ClientBus.getClient(clientId).send(type, data);
    }

	serverBroadcast(type, data) {
		ClientBus.broadcast(type, data);
	}	

}

export default new WebSocketService();
