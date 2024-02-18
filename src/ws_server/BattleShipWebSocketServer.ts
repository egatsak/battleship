import { UUID, randomUUID } from 'node:crypto';
import { RawData, WebSocketServer, WebSocket } from 'ws';

import { customStringify } from '../helpers/customStringify';
import { CommandType, WebSocketCommand } from '../types/types';
import { isValidWebsocketCommand } from '../helpers/isValidWebsocketCommand';

export class BattleShipWebSocketServer extends WebSocketServer {
  private _clients: Record<UUID, WebSocket> = {};

  constructor({ port }: { port: number }) {
    super({ port });

    // A new client connection request received
    this.on('close', this.handleServerClose.bind(this));
    this.on('connection', this.handleConnect.bind(this));
  }

  handleServerClose() {
    // this.clients.forEach((ws) => ws.close());
    const data = JSON.stringify({ server: 'closed' });

    for (const userId in this._clients) {
      const client = this._clients[userId as UUID];
      /*       if (client.readyState === WebSocket.OPEN) { */
      client.send(data);
      client.close();
      /*    } */
    }
  }

  handleConnect(ws: WebSocket) {
    const userId = randomUUID();
    console.log(`Received a new connection.`);

    // Store the new connection and handle messages
    this._clients[userId] = ws;
    console.log(`${userId} connected.`);

    ws.on('message', (data) => this.messageHandler(data, ws));
    ws.on('error', console.error);
    ws.on('close', () => this.handleDisconnect(userId));
  }

  messageHandler(data: RawData, ws: WebSocket) {
    console.log('Incoming', data.toString());

    const parsed = JSON.parse(data.toString());

    // validation!
    if (!isValidWebsocketCommand(parsed)) {
      console.log('Validation failed!');

      const errorMsg = {
        type: CommandType.REG,
        data: {
          name: parsed?.data?.name ?? 'ERROR',
          index: 0,
          error: true,
          errorText: 'Validation failed',
        },
        id: 0,
      } satisfies WebSocketCommand;

      return ws.send(customStringify(errorMsg));
    }

    const testMsg = {
      type: CommandType.REG,
      data: {
        name: '12345',
        index: 1,
        error: false,
        errorText: '',
      },
      id: 0,
    } satisfies WebSocketCommand;

    const responseString = customStringify(testMsg);
    console.log('Response', responseString);

    return ws.send(responseString);
  }

  handleDisconnect(userId: UUID) {
    console.log(`${userId} disconnected.`);
    // const json = { type: typesDef.USER_EVENT };
    // const username = users[userId]?.username || userId;
    // userActivity.push(`${username} left the document`);
    // json.data = { users, userActivity }
    delete this._clients[userId];
    // delete users[userId];
    this.broadcastMessage({ hello: 'world' });
  }

  broadcastMessage(json: Record<string, unknown>) {
    // We are sending the current data to all connected active clients
    const data = JSON.stringify(json);

    for (const userId in this._clients) {
      const client = this._clients[userId as UUID];
      /*       if (client.readyState === WebSocket.OPEN) { */
      client.send(data);
      /*    } */
    }
  }
}
