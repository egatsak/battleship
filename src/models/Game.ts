import { Field } from './Field';
import { Ship } from './Ship';
import {
  GameFinishedError,
  GameNotStartedError,
  InvalidPlayerError,
  RandomAttackFailedError,
  RandomShipsPlacementFailedError,
  ShipsAlreadyPlacedError,
} from '../helpers/errors';
import { AttackResultData, GameStatus, Position } from '../types/types';
import { SHIPS } from '../constants/constants';

export class Game {
  private readonly _id: number;
  private _players: [number, number] = [0, 1];
  private _fields: [Field, Field];
  private _currentPlayerIndex: number = 0;
  private _winner?: number;
  private _ships: [Ship[], Ship[]] = [[], []];

  constructor({ randomId, players }: { randomId: number; players: [number, number] }) {
    this._id = randomId;
    this._players = players;
    this._fields = [new Field(), new Field()];
  }

  get currentShips() {
    return this._currentPlayerShips;
  }
  get enemyShips() {
    return this._enemyShips;
  }

  private get _currentPlayerShips() {
    return this._ships[this._currentPlayerIndex];
  }

  private get _enemyIndex(): number {
    return (this._currentPlayerIndex + 1) % 2;
  }

  get id() {
    return this._id;
  }

  get currentPlayer() {
    return this._players[this._currentPlayerIndex];
  }

  get enemyPlayer() {
    return this._players[this._enemyIndex];
  }

  private get _enemyShips() {
    return this._ships[this._enemyIndex];
  }

  private get _currentField() {
    return this._fields[this._currentPlayerIndex];
  }

  private get _enemyField() {
    return this._fields[this._enemyIndex];
  }

  get winner() {
    return this._winner;
  }

  get players() {
    return [...this._players];
  }

  get status(): GameStatus {
    switch (true) {
      case !!this._winner:
        return 'finished';
      case this._currentPlayerShips.length > 0 && this._enemyShips.length > 0:
        return 'started';
      default:
        return 'created';
    }
  }

  placeShips(player: number, ships: Ship[]): void {
    if (this.status === 'finished') {
      throw new GameFinishedError(this._id, player);
    }
    const playerIndex = this._getPlayerIndex(player);

    if (playerIndex === -1) {
      throw new InvalidPlayerError(this._id, player);
    }

    if (this._ships[playerIndex].length) {
      throw new ShipsAlreadyPlacedError(this._id, player);
    }

    this._ships[playerIndex] = ships;
    this._currentPlayerIndex = Math.random() > 0.5 ? 0 : 1;
  }

  placeRandomShips(player: number, shipsLength = SHIPS): void {
    const tmpBoard = new Field(this._currentField.size);

    const ships = shipsLength.map((length) => {
      const isVertical = Math.random() > 0.5;
      const ship = new Ship({ position: { x: 0, y: 0 }, length, isVertical });

      if (!this._placeShipRandomly(tmpBoard, ship)) {
        throw new RandomShipsPlacementFailedError(this._id, player);
      }

      tmpBoard.setValues([...ship.positions, ...ship.aroundPositions], true);

      return ship;
    });

    this.placeShips(player, ships);
  }

  attack(player: number, position?: Position): AttackResultData[] {
    if (player !== this.currentPlayer) return [];

    if (this.status !== 'started') {
      throw new GameNotStartedError(this._id, player);
    }

    const attackPosition = position ?? this._enemyField.getRandomEmptyPosition();

    if (!attackPosition) {
      throw new RandomAttackFailedError(this._id, player);
    }

    if (!this._enemyField.isDotEmpty(attackPosition)) return [];

    let damagedShip = null;

    for (const ship of this._enemyShips) {
      if (ship.isShipShot(attackPosition)) {
        damagedShip = ship;
        break;
      }
    }

    // miss
    if (!damagedShip) {
      this._enemyField.setValue(attackPosition, false);
      this._swapPlayers();
      return [
        {
          currentPlayer: player,
          status: 'miss',
          position: attackPosition,
        } satisfies AttackResultData,
      ];
    }

    if (!damagedShip.isDestroyed) {
      this._enemyField.setValue(attackPosition, true);
      return [
        {
          currentPlayer: player,
          status: 'shot',
          position: attackPosition,
        } satisfies AttackResultData,
      ];
    }

    const deckPosition = damagedShip.positions.filter((pos) =>
      this._enemyField.isDotInsideField(pos),
    );
    const aroundPosition = damagedShip.aroundPositions.filter((pos) =>
      this._enemyField.isDotInsideField(pos),
    );

    deckPosition.forEach((pos) => this._enemyField.setValue(pos, true));
    aroundPosition.forEach((pos) => this._enemyField.setValue(pos, false));

    this._checkWinner();
    return [
      ...deckPosition.map(
        (pos) =>
          ({
            currentPlayer: player,
            status: 'killed',
            position: pos,
          }) satisfies AttackResultData,
      ),
      ...aroundPosition.map(
        (pos) =>
          ({
            currentPlayer: player,
            status: 'miss',
            position: pos,
          }) satisfies AttackResultData,
      ),
    ];
  }

  surrender(player: number): void {
    if (!this._players.includes(player)) {
      throw new InvalidPlayerError(this._id, player);
    }

    this._winner = player === this.currentPlayer ? this.enemyPlayer : this.currentPlayer;
  }

  private _getPlayerIndex(player: number): number {
    return this._players.findIndex((value) => value === player);
  }

  private _checkWinner(): void {
    if (this._enemyShips.every((ship) => ship.isDestroyed)) {
      this._winner = this.currentPlayer;
    }
    if (this._currentPlayerShips.every((ship) => ship.isDestroyed)) {
      this._winner = this.enemyPlayer;
    }
  }

  private _placeShipRandomly(field: Field, ship: Ship): boolean {
    let position: Position | null;

    while ((position = field.getRandomEmptyPosition())) {
      ship.position = position;
      if (field.areDotsEmpty(ship.positions)) return true;

      ship.isVertical = !ship.isVertical;
      if (field.areDotsEmpty(ship.positions)) return true;
    }

    return false;
  }

  private _swapPlayers(): void {
    this._currentPlayerIndex = this._enemyIndex;
  }
}
