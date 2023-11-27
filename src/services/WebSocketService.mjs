import { WebSocketServer } from 'ws';
import Client from '../entities/Client.mjs';
import ClientBus from '../busses/ClientBus.mjs';

class WebSocketService {

	constructor() {
		this.wss = new WebSocketServer({ noServer: true });
		this.wss.on('connection', this.handleConnection.bind(this));
	}

	handleConnection(ws) {
		const client = new Client(ws);
        ClientBus.addClient(client);
		client.send('clientId');
	}

}

export default new WebSocketService();