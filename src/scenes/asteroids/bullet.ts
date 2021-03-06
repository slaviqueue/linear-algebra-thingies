import { Canvas } from '../../engine/canvas/canvas'
import { GameObject } from '../../engine/loop/game-object'
import { Vector } from '../../engine/primitives/vector'

export class Bullet extends GameObject {
  public static size = 5
  private static _velocity: number = 2

  public constructor (private _position: Vector, private readonly _direction: Vector) {
    super()
  }

  public get position () {
    return this._position
  }

  public update () {
    this._position = this._position.plus(this._direction.normalize().scale(Bullet._velocity))
  }

  public draw (canvas: Canvas) {
    canvas.drawVector(this._position, this._direction.scale(Bullet.size))
  }
}
