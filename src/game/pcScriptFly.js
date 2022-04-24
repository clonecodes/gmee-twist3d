import {app, pc} from "../initApp";
import {checkRotation, tileLoop} from "./helpers";

export const Fly = pc.createScript('fly');
Fly.prototype.update = function (dt) {
  const pos = this.entity.getPosition();
  this.entity.setPosition(pos.x, pos.y, pos.z + app.game.speed * dt);
  checkRotation();
  tileLoop();
};

export const FlyDebug = pc.createScript('flyDebug');
FlyDebug.prototype.update = function (dt) {
  const pos = this.entity.getPosition();
  if (app.keyboard.isPressed(pc.KEY_UP) || app.keyboard.isPressed(pc.KEY_W)) {
    this.entity.setPosition(pos.x, pos.y, pos.z + app.game.speed * dt);
    checkRotation();
    tileLoop();
  } else if (app.keyboard.isPressed(pc.KEY_DOWN) || app.keyboard.isPressed(pc.KEY_S)) {
    this.entity.setPosition(pos.x, pos.y, pos.z - app.game.speed * dt);
    checkRotation();
    tileLoop()
  }
};