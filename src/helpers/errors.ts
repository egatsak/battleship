function getGameCoreErrorMessage(customMsg: string, gameId: number, player: number) {
  return `${customMsg} (game ${gameId}, player ${player})`;
}

abstract class GameCoreError extends Error {
  constructor(customMsg: string, gameId: number, player: number) {
    const message = getGameCoreErrorMessage(customMsg, gameId, player);
    super(message);
  }
}

export class GameFinishedError extends GameCoreError {
  constructor(gameId: number, player: number) {
    const customMsg = `Game already finished`;
    super(customMsg, gameId, player);
  }
}

export class InvalidPlayerError extends GameCoreError {
  constructor(gameId: number, player: number) {
    const customMsg = `Invalid player`;
    super(customMsg, gameId, player);
  }
}

export class ShipsAlreadyPlacedError extends GameCoreError {
  constructor(gameId: number, player: number) {
    const customMsg = `Ships already placed`;
    super(customMsg, gameId, player);
  }
}

export class GameNotStartedError extends GameCoreError {
  constructor(gameId: number, player: number) {
    const customMsg = `Game hasn't started yet`;
    super(customMsg, gameId, player);
  }
}

export class RandomAttackFailedError extends GameCoreError {
  constructor(gameId: number, player: number) {
    const customMsg = `Random attack failed`;
    super(customMsg, gameId, player);
  }
}

export class RandomShipsPlacementFailedError extends GameCoreError {
  constructor(gameId: number, player: number) {
    const customMsg = `Random ship placement failed`;
    super(customMsg, gameId, player);
  }
}

export class IncorrectPasswordError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class DatabaseError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class PlayerNotFoundError extends Error {
  constructor(playerId: number) {
    const message = `Player ID=${playerId} not found`;
    super(message);
  }
}

export class RoomNotFoundError extends Error {
  constructor(roomId: number) {
    const message = `Room ID=${roomId} not found`;
    super(message);
  }
}

export class RoomAlreadyExistsError extends Error {
  constructor(roomId: number) {
    const message = `Room ID=${roomId} already exists`;
    super(message);
  }
}

export class GameNotFoundError extends Error {
  constructor(gameId: number) {
    const message = `Game ID=${gameId} not found`;
    super(message);
  }
}
