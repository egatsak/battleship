import { Position } from '../types/types';

export class Ship {
  private _position: Position;
  private _length: number;
  private _isVertical: boolean;
  private _positions: Position[];
  private _aroundPositions: Position[];
  private _health: boolean[];

  constructor({
    length,
    position,
    isVertical,
  }: {
    length: number;
    position: Position;
    isVertical: boolean;
  }) {
    this._length = length;
    this._position = position;
    this._isVertical = isVertical;
    this._health = new Array(this._length).fill(true);
    this._positions = this._getPositions();
    this._aroundPositions = this._getAroundPositions();
  }

  get position() {
    return this._position;
  }

  get length() {
    return this._length;
  }

  get isVertical() {
    return this._isVertical;
  }

  set isVertical(isVertical: boolean) {
    this._isVertical = isVertical;
    this._positions = this._getPositions();
    this._aroundPositions = this._getAroundPositions();
  }

  set position(pos: Position) {
    this._position = pos;
    this._positions = this._getPositions();
    this._aroundPositions = this._getAroundPositions();
  }

  get isHorizontal() {
    return !this._isVertical;
  }

  get isDestroyed() {
    return this._health.every((v) => !v);
  }

  get positions(): Position[] {
    return this._positions;
  }

  get aroundPositions(): Position[] {
    return this._aroundPositions;
  }

  isShipShot(pos: Position): boolean {
    if (!this._isShip(pos)) return false;

    const distance = this._isVertical ? pos.y - this._position.y : pos.x - this._position.x;

    this._health[distance] = false;
    return true;
  }

  private _isShip({ x, y }: Position) {
    const xDistance = x - this._position.x;
    const yDistance = y - this._position.y;
    return this._isVertical
      ? xDistance === 0 && yDistance >= 0 && yDistance < this._length
      : yDistance === 0 && xDistance >= 0 && xDistance < this._length;
  }

  private _getPositions(): Position[] {
    const { x, y } = this._position;
    const positions: Position[] = [];

    for (let i = 0; i < this._length; i++) {
      positions.push(this._isVertical ? { x, y: y + i } : { x: x + i, y });
    }

    return positions;
  }

  private _getAroundPositions(): Position[] {
    const { x, y } = this._position;
    const topLeft: Position = { x: x - 1, y: y - 1 };
    const bottomRight: Position = this._isVertical
      ? { x: x + 1, y: y + this._length }
      : { x: x + this._length, y: y + 1 };

    const aroundPositions: Position[] = [];
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        if (!this._isShip({ x, y })) {
          aroundPositions.push({ x, y });
        }
      }
    }

    return aroundPositions;
  }
}
