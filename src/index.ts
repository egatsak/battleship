import { randomUUID, UUID } from 'node:crypto';
import WebSocket, { RawData, WebSocketServer } from 'ws';

import { httpServer } from './http_server';

import { isValidWebsocketCommand } from './helpers/isValidWebsocketCommand';
import { customStringify } from './helpers/customStringify';
import { CommandType, WebSocketCommand } from './types/types';

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8181);
const WS_PORT = Number(process.env.WS_PORT ?? 8181);

const wsServer = new WebSocketServer({ port: WS_PORT });

const clients: Record<UUID, WebSocket> = {};

// A new client connection request received
wsServer.on('connection', (ws) => {
  const userId = randomUUID();
  console.log(`Received a new connection.`);

  // Store the new connection and handle messages
  clients[userId] = ws;
  console.log(`${userId} connected.`);

  ws.on('message', (data: RawData) => {
    console.log('Incoming', data.toString());

    const parsed = JSON.parse(data.toString());

    // validation!
    if (!isValidWebsocketCommand(parsed)) {
      console.log('Validation failed!');
      ws.send(
        JSON.stringify({
          type: CommandType.REG,
          data: JSON.stringify({
            name: parsed?.data?.name ?? 'ERROR',
            index: 0,
            error: true,
            errorText: 'Validation failed',
          }),
          id: 0,
        }),
      );
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

    ws.send(responseString);
  });

  ws.on('close', () => handleDisconnect(userId));
});

httpServer.on('connection', (socket) => {
  socket.unref();
});

process.on('SIGINT', () => {
  wsServer.close();
  httpServer.close();
});

const start = async () => {
  try {
    httpServer.listen(HTTP_PORT, () => {
      console.log(`Start static http server on the ${HTTP_PORT} port!`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

function handleDisconnect(userId: UUID) {
  console.log(`${userId} disconnected.`);
  // const json = { type: typesDef.USER_EVENT };
  // const username = users[userId]?.username || userId;
  // userActivity.push(`${username} left the document`);
  // json.data = { users, userActivity }
  delete clients[userId];
  // delete users[userId];
  broadcastMessage({ hello: 'world' });
}

function broadcastMessage(json: Record<string, unknown>) {
  // We are sending the current data to all connected active clients
  const data = JSON.stringify(json);

  for (const userId in clients) {
    const client = clients[userId as UUID];
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
// User disconnected
