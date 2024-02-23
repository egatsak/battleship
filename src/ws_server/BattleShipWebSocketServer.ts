import { RawData, WebSocketServer, WebSocket } from 'ws';

import { customStringify } from '../helpers/jsonHandlers';
import { CommandType, WebSocketCommandWithParsedData } from '../types/types';
import {
  isValidWebSocketCommandData,
  isValidWebsocketCommand,
} from '../helpers/isValidWebsocketCommand';
import { battleShipController } from '../controllers/controller';
import { ClientRequest } from 'node:http';

export class BattleShipWebSocketServer extends WebSocketServer {
  private _clients: Record<number, WebSocket> = {};
  private _clientIdCounter: number = 0;

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
      const client = this._clients[userId];
      /*       if (client.readyState === WebSocket.OPEN) { */
      client.send(data);
      client.close();
      delete this._clients[userId];
      /*    } */
    }
  }

  handleConnect(ws: WebSocket, req: ClientRequest) {
    console.log(req.socket?.remoteAddress);
    const userId = ++this._clientIdCounter;
    console.log(`Received a new connection.`);
    // Store the new connection and handle messages
    this._clients[userId] = ws;
    console.log(`${userId} connected.`);

    ws.on('message', (data) => this.messageHandler(data, ws));
    ws.on('error', console.error);
    ws.on('close', () => this.handleDisconnect(userId));
  }

  messageHandler(message: RawData, ws: WebSocket) {
    console.log('Incoming', message.toString());

    const parsedMessage = JSON.parse(message.toString());

    // validation!
    if (!isValidWebsocketCommand(parsedMessage)) {
      console.log('Command validation failed!');

      const errorMsg = {
        type: CommandType.REG,
        data: {
          name: 'ERROR',
          index: 0,
          error: true,
          errorText: 'Command validation failed!',
        },
        id: 0,
      } satisfies WebSocketCommandWithParsedData;

      return ws.send(customStringify(errorMsg));
    }

    const parsedMessageData = JSON.parse(parsedMessage.data);

    if (!isValidWebSocketCommandData(parsedMessageData)) {
      console.log('Command data validation failed!');

      const errorMsg = {
        type: CommandType.REG,
        data: {
          name: parsedMessageData?.name ?? 'ERROR',
          index: 0,
          error: true,
          errorText: 'Command data validation failed!',
        },
        id: 0,
      } satisfies WebSocketCommandWithParsedData;

      return ws.send(customStringify(errorMsg));
    }

    const result = battleShipController(
      { ...parsedMessage, data: parsedMessageData },
      ws,
    );

    const responseString = customStringify(result);
    console.log('Response', responseString);

    return ws.send(responseString);
  }

  handleDisconnect(userId: number) {
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
      const client = this._clients[userId];
      /*       if (client.readyState === WebSocket.OPEN) { */
      client.send(data);
      /*    } */
    }
  }
}
