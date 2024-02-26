import { RawData, WebSocketServer, WebSocket } from 'ws';

import { BattleShipController } from '../controllers/game.controller';
import {
  isValidWebSocketCommandData,
  isValidWebsocketCommand,
} from '../helpers/isValidWebsocketCommand';
import { ResponseType, WebSocketContext, WebSocketResponseWithParsedData } from '../types/types';
import { customStringify } from '../helpers/jsonHandlers';

export class BattleShipWebSocketServer extends WebSocketServer {
  private _clients: Record<number, WebSocket> = {};
  private _clientIdCounter: number = 0;
  private _controller: BattleShipController;

  constructor({ port }: { port: number }) {
    super({ port });
    this._controller = new BattleShipController();
    this.on('listening', () => {
      console.log(`WebSocket server listening on port ${port}`);
    });
    this.on('close', this.handleServerClose.bind(this));
    this.on('connection', this.handleUserConnect.bind(this));
  }

  handleServerClose(): void {
    // TODO send message to client?
    const data = JSON.stringify({ server: 'closed' });

    for (const userId in this._clients) {
      const client = this._clients[userId];

      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }

      client.close();
      delete this._clients[userId];
    }
  }

  handleUserConnect(ws: WebSocket): void {
    const userId = ++this._clientIdCounter;
    console.log(`Received a new connection.`);
    const context = this._createContext(userId);

    this._clients[userId] = ws;
    console.log(`User ID=${userId} connected.`);

    ws.on('message', (data) => this.handleMessage(data, context));
    ws.on('error', console.trace);
    ws.on('close', () => this.handleUserDisconnect(context));
  }

  handleMessage(message: RawData, context: WebSocketContext): void {
    console.log('Incoming', message.toString());

    try {
      const parsedMessage = JSON.parse(message.toString());

      if (!isValidWebsocketCommand(parsedMessage)) {
        console.log('Command validation failed!');

        const errorMsg = {
          type: ResponseType.REG,
          data: {
            name: 'ERROR',
            index: 0,
            error: true,
            errorText: 'Command validation failed!',
          },
          id: 0,
        } satisfies WebSocketResponseWithParsedData;

        return context.send([errorMsg]);
      }

      const parsedMessageData = parsedMessage.data ? JSON.parse(parsedMessage.data) : '';

      if (!isValidWebSocketCommandData(parsedMessageData)) {
        console.log('Command data validation failed!');

        const errorMsg = {
          type: ResponseType.REG,
          data: {
            name: parsedMessageData?.name ?? 'ERROR',
            index: 0,
            error: true,
            errorText: 'Command data validation failed!',
          },
          id: 0,
        } satisfies WebSocketResponseWithParsedData;

        return context.send([errorMsg]);
      }

      this._controller.handleIncoming({ ...parsedMessage, data: parsedMessageData }, context);
    } catch (error) {
      console.log(error);
    }
  }

  handleUserDisconnect(context: WebSocketContext): void {
    console.log(`${context.id} disconnected.`);
    delete this._clients[context.id];
    this._controller.handleClose(context);
  }

  private _createContext = (id: number): WebSocketContext => {
    return {
      id,
      send: (msg) => this.broadcastMessage(msg, [id]),
      broadcast: this.broadcastMessage.bind(this),
    };
  };

  broadcastMessage(messages: WebSocketResponseWithParsedData[], contextIds?: number[]): void {
    try {
      for (const message of messages) {
        const rawMessage = customStringify(message);
        let clients: WebSocket[];

        if (contextIds === undefined) {
          clients = Object.values(this._clients);
        } else {
          clients = this._getConnectionsByIds(contextIds);
        }

        clients.forEach((ws) => ws.send(rawMessage));
      }
    } catch (error) {
      console.log(error);
    }
  }

  private _getConnectionsByIds(ids: number[]): WebSocket[] {
    const connections = ids.reduce((acc, id) => {
      const client = this._clients[id];
      if (client) {
        acc.push(client);
      }
      return acc;
    }, [] as WebSocket[]);
    return connections;
  }
}
