import { httpServer } from './http_server';
import { BattleShipWebSocketServer } from './ws_server/BattleShipWebSocketServer';

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8181);
const WS_PORT = Number(process.env.WS_PORT ?? 3000);

const wsServer = new BattleShipWebSocketServer({
  port: WS_PORT,
});

httpServer.on('connection', (socket) => {
  socket.unref();
});

process.on('SIGINT', () => {
  wsServer.handleServerClose();
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

// netstat -ano | findstr :<PORT>
// taskkill /PID <PID> /F
