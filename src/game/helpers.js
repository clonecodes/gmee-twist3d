import {app, pc} from "../initApp";
import {angleCount, cSpeed, cSpeedInc, cSpeedMax, diffAngle} from "./consts";
import {addNextPlate, coral, gray, green, red} from "./factory";
import {roundToTwo} from "./util";

export const getCurrentPlate = () => {
  return app.game.plates.filter(p => p.zeroAngle).filter(p => {
    const pPos = roundToTwo(p.getPosition().z);
    const pScale = p.getLocalScale().z/2;
    p.current = false;
    if(-pScale < pPos && pPos < pScale){
      // under the ball
      p.model.material = coral;
      p.current = true;
      return p;
    }else if(-pScale >= pPos){
      // in front of ball
      p.model.material = green;
    }else if(pPos >= pScale){
      // behind ball
      p.model.material = red;
    }
  }).find(p => p.current);
}

export const nextPlateDirection = () => {
  const cp = getCurrentPlate();
  const np = app.game.plates.find(p => p.id === cp.id+1)
  const dif = cp.pos - np.pos;
  return (dif < 0 && dif > -1 * (angleCount - 1)) || dif === angleCount - 1 ? 1 : 0;
}

export const checkPos = () => {
  if(!app.game.ball.fallen && !app.game.ball.jumping) {
    if(!getCurrentPlate()){
      app.game.ball.tween(app.game.ball.getLocalPosition())
          .to(new pc.Vec3(0, -10, 0), 3, pc.Linear)
          .start();
      app.game.ball.fallen = true;
      app.game.gameState = 'failed';
      app.game.container.script.destroy('fly');
    }
  }
}

export const checkRotation = () => {
  if(!app.game.ball.fallen && !app.game.ball.jumping) {
    let pos = Math.round(app.game.container.getLocalEulerAngles().z) / diffAngle;
    pos = pos > 0 ? Math.round(app.game.container.getLocalEulerAngles().z - 360) / diffAngle : pos;
    app.game.plates.forEach(p => {
      if (Math.abs(pos) === p.pos % angleCount) {
        p.model.material = red
        p.zeroAngle = true;
      } else {
        p.model.material = gray
        p.zeroAngle = false;
      }
    })
    checkPos();
  }
}

export const tileLoop = () => {
  const p = app.game.plates.find(p => p.getPosition().z > 6);
  if(p){
    p.destroy();
    app.game.plates.shift();
    addNextPlate();
  }
}

export const tubeTwist = (direction) => {
  if(!app.game.container.twisting){
    const angle = app.game.container.getLocalEulerAngles();
    const animSpeed = roundToTwo(cSpeed-app.game.speed/2);
    app.game.container.tween(angle)
        .rotate(new pc.Vec3(0, 0, direction ? Math.round(angle.z) - diffAngle : Math.round(angle.z) + diffAngle), animSpeed, pc.Linear)
        .start()
        .on('complete', () => {
          app.game.container.twisting = false;
          //checkRotation(); // not needed when 'fly' script is on
        });
    app.game.container.twisting = true;

    if(!app.game.ball.fallen){
      app.game.ball.tween(app.game.ball.getLocalPosition())
          .to(new pc.Vec3(0, -0.6, 0),  animSpeed/2, pc.Linear)
          .repeat(2)
          .yoyo(true)
          .start()
          .on('complete', () => {
            app.game.ball.jumping = false;
            //checkRotation(); // not needed when 'fly' script is on
          });
      // TODO this happens to often so speed becomes unplayable really fast, should be every fifth or tenth jump
      if(cSpeedMax > app.game.speed) app.game.speed = roundToTwo(app.game.speed + cSpeedInc);
      app.game.ball.jumping = true;
    }
  }
}