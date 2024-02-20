/* eslint-disable @typescript-eslint/no-unused-vars */
import { WebSocket } from 'ws';
import {
  CommandData,
  CommandType,
  WebSocketCommandWithParsedData,
} from '../types/types';

export function battleShipController(
  commandObj: WebSocketCommandWithParsedData,
  ws: WebSocket,
) {
  console.log(commandObj);
  const { data, type } = commandObj;

  const method = commandMapper[type];

  const result = method(data, ws);
  console.log({ result });
  return (
    /*   result ?? */
    {
      type: CommandType.REG,
      data: {
        name: '12345',
        index: 1,
        error: false,
        errorText: '',
      },
      id: 0,
    } satisfies WebSocketCommandWithParsedData
  );
}

const commandMapper = {
  [CommandType.REG]: reg,
  [CommandType.UPDATE_WINNERS]: updateWinners,
  [CommandType.CREATE_ROOM]: createRoom,
  [CommandType.ADD_USER_TO_ROOM]: addUserToRoom,
  [CommandType.CREATE_GAME]: createGame,
  [CommandType.UPDATE_ROOM]: updateRoom,
  [CommandType.ADD_SHIPS]: addShips,
  [CommandType.START_GAME]: startGame,
  [CommandType.ATTACK]: attack,
  [CommandType.RANDOM_ATTACK]: randomAttack,
  [CommandType.TURN]: turn,
  [CommandType.FINISH]: finish,
};

function reg(data: CommandData, ws: WebSocket) {}
function updateWinners(data: CommandData, ws: WebSocket) {}
function createRoom(data: CommandData, ws: WebSocket) {}
function addUserToRoom(data: CommandData, ws: WebSocket) {}
function createGame(data: CommandData, ws: WebSocket) {}
function updateRoom(data: CommandData, ws: WebSocket) {}
function addShips(data: CommandData, ws: WebSocket) {}
function startGame(data: CommandData, ws: WebSocket) {}
function attack(data: CommandData, ws: WebSocket) {}
function randomAttack(data: CommandData, ws: WebSocket) {}
function turn(data: CommandData, ws: WebSocket) {}
function finish(data: CommandData, ws: WebSocket) {}
