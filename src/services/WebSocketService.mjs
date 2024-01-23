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
		const self = this;
		const interval = setInterval(function ping() {
			self.wss.clients.forEach(function each(ws) {
				if (ws.isAlive === false) {
					return ws.terminate();
				}
				ws.isAlive = false;
				ws.ping();
			});
		}, 5000);
	}

	handleConnection(ws) {
		const client = new Client(ws);
        ClientBus.addClient(client);
		client.send('clientId');
		ws.isAlive = true;
		ws.on('error', console.error);
		ws.on('pong', () => {
			ws.isAlive = true;
		});
	}

	getClientCount() {
		return this.wss.clients.size;
	}

    sendToClient(clientId, type, data) {
        ClientBus.getClient(clientId).send(type, data);
    }

	serverBroadcast(type, data) {
		ClientBus.broadcast(type, data);
	}	

}

export default new WebSocketService();
