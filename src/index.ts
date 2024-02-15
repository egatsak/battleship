import { httpServer } from './http_server';
import { createWebSocketStream, WebSocketServer } from 'ws';

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8181);
const WS_PORT = Number(process.env.WS_PORT ?? 8181);

const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('connection', (ws) => {
  console.log(`WS Server connected on PORT ${WS_PORT}!`);

  const wsStream = createWebSocketStream(ws, {
    decodeStrings: false,
    encoding: 'utf-8',
  });

  wsStream.on('data', async (data: unknown) => {
    console.log(typeof data === 'string' ? JSON.parse(data) : data);

    wsStream.write(JSON.stringify(data) /* message */);
  });
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
