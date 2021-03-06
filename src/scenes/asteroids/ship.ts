import { throttle } from 'lodash'
import { Canvas } from '../../engine/canvas/canvas'
import { GameObject } from '../../engine/loop/game-object'
import { radians } from '../../engine/utils/radians'
import { Vector } from '../../engine/primitives/vector'
import { Bullet } from './bullet'
import { CanvasEntityBoundaries } from './canvas-entity-boundaries'
import { CanvasBoundaryConstraint, IGetSetPosition } from './canvas-boundary-constraint'

export class Ship extends GameObject implements IGetSetPosition {
  private _position: Vector = new Vector(0, 0)
  private _direction: Vector = new Vector(0, 1)
  private _velocity: Vector = new Vector(0, 0)
  private _acceleration: Vector = new Vector(0, 0)
  private readonly friction: number = 0.995
  private readonly _shipRectSize = 10
  private readonly _boundaryConstraint = new CanvasBoundaryConstraint(this, this._shipRectSize)
  private readonly _throttleShoot = throttle(() => this._shoot(), 500, { trailing: false })
  private readonly _shotBullets: Set<Bullet> = new Set()
  private readonly _bulletsBoundary = new CanvasEntityBoundaries(Bullet.size)

  public constructor (position: Vector) {
    super()
    this._position = position
  }

  public update () {
    this._handleInput()
    this._boundaryConstraint.constrain()
    this._clearDistantBullets()

    this._velocity = this._velocity.plus(this._acceleration).limitAbs(1)
    this._position = this._position.plus(this._velocity)
  }

  public draw (canvas: Canvas) {
    canvas.drawVector(this._position, this._direction.scale(10).rotate(radians(-30)))
    canvas.drawVector(this._position, this._direction.scale(10).rotate(radians(30)))
  }

  public setPosition (pos: Vector): void {
    this._position = pos
  }

  public getPosition (): Vector {
    return this._position
  }

  private _handleInput () {
    if (window.inputController.pressed('w')) {
      this._acceleration = this._direction.scale(0.02)
    } else {
      this._acceleration = this._acceleration.scale(0.1)
      this._velocity = this._velocity.scale(this.friction)
    }

    if (window.inputController.pressed('a')) {
      this._direction = this._direction.rotate(-Math.PI / 100).normalize()
    } else if (window.inputController.pressed('d')) {
      this._direction = this._direction.rotate(Math.PI / 100).normalize()
    }

    if (window.inputController.pressed(' ')) {
      this._throttleShoot()
    }
  }

  private _shoot () {
    const bullet = new Bullet(this._position, this._direction)
    window.world.instantiate(bullet)
    this._shotBullets.add(bullet)
  }

  private _clearDistantBullets () {
    for (const bullet of this._shotBullets) {
      if (!this._bulletsBoundary.includes(bullet.position)) {
        window.world.remove(bullet)
        this._shotBullets.delete(bullet)
      }
    }
  }
}
