import {app, pc} from "../initApp";
//import "../util/FlyCamera";

// rigidbody type BODYTYPE_KINEMATIC could be ideal for my needs
// try physics version during ESA


let plates = [];
let plateIdCount = 0;
// TODO use spiral for initial tile positioning
let spiral = true;

let container;
let ball;

const startAngle = 0;
const firstTileLength = 8;
const diffAngle = 45;
const angleCount = 360/diffAngle;
const baseTileLength = 1;
const radius = 1.4;
let gameState = 'initialising'; // initialising running failed

const onKeyDown = (e) => {
  if(gameState === 'initialising') {
    app.keyboard.isPressed(pc.KEY_SPACE) && startGame();
  }else if(gameState === 'running'){
    app.keyboard.isPressed(pc.KEY_SPACE) && tubeTwist(nextPlateDirection());
    app.keyboard.isPressed(pc.KEY_LEFT) || app.keyboard.isPressed(pc.KEY_A) && tubeTwist();
    app.keyboard.isPressed(pc.KEY_RIGHT) || app.keyboard.isPressed(pc.KEY_D) && tubeTwist(1);
  }else if(gameState === 'failed'){
    app.keyboard.isPressed(pc.KEY_SPACE) && resetGame();
  }
  e.event.preventDefault(); // Use original browser event to prevent browser action.

  // if (app.keyboard.isPressed(pc.KEY_F)) {
  //   const pos = container.getPosition();
  //   container.setPosition(pos.x, pos.y, pos.z + 0.1);
  //   checkPos();
  // }
  // if (app.keyboard.isPressed(pc.KEY_R)) {
  //   const pos = container.getPosition();
  //   container.setPosition(pos.x, pos.y, pos.z - 0.1);
  //   checkPos();
  // }

};
const onMouseDown = (e) => {
  if(gameState === 'initialising') {
    startGame();
  }else if(gameState === 'running'){
    tubeTwist(nextPlateDirection());
  }else if(gameState === 'failed'){
    resetGame();
  }
  e.event.preventDefault(); // Use original browser event to prevent browser action.
}

const getCurrentPlate = () => {
  return plates.filter(p => p.zeroAngle).filter(p => {
    const pPos = roundToTwo(p.getPosition().z);
    const pScale = p.getLocalScale().z/2;
    p.current = false;
    if(-pScale < pPos && pPos < pScale){
      // under the ball
      p.model.material = coral
      p.current = true;
      return p;
    }else if(-pScale >= pPos){
      // in front of ball
      p.model.material = green
    }else if(pPos >= pScale){
      // behind ball
      p.model.material = red
    }
  }).find(p => p.current);
}
const nextPlateDirection = () => {
  const cp = getCurrentPlate();
  const np = plates.find(p => p.id === cp.id+1)
  const dif = cp.pos - np.pos;
  return (dif < 0 && dif > -1 * (angleCount - 1)) || dif === angleCount - 1 ? 1 : 0;
}

const checkPos = () => {
  if(!ball.fallen && !ball.moving) {
    if(!getCurrentPlate()){
      ball.tween(ball.getLocalPosition())
          .to(new pc.Vec3(0, -10, 0), 3, pc.Linear)
          .start();
      ball.fallen = true;
      gameState = 'failed';
      container.script.destroy('fly');
    }
  }
}

const checkRotation = () => {
  if(!ball.fallen && !ball.moving) {
    let pos = Math.round(container.getLocalEulerAngles().z) / diffAngle;
    pos = pos > 0 ? Math.round(container.getLocalEulerAngles().z - 360) / diffAngle : pos;
    plates.forEach(p => {
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

const tileLoop = () => {
  const p = plates.find(p => p.getPosition().z > 6);
  if(p){
    p.destroy();
    plates.shift();
    addNextPlate();
  }
}

const tubeTwist = (direction) => {
  if(!container.moving){
    const angle = container.getLocalEulerAngles();
    container.tween(angle)
        .rotate(new pc.Vec3(0, 0, direction ? Math.round(angle.z) - diffAngle : Math.round(angle.z) + diffAngle), 0.5, pc.Linear)
        .start()
        .on('complete', () => {
          container.moving = false;
          checkRotation(); // not needed when 'fly' script is on
        });
    container.moving = true;

    if(!ball.fallen){
      ball.tween(ball.getLocalPosition())
          .to(new pc.Vec3(0, -0.6, 0), 0.26, pc.Linear)
          .repeat(2)
          .yoyo(true)
          .start()
          .on('complete', () => {
            ball.moving = false;
            checkRotation(); // not needed when 'fly' script is on
          });
      ball.moving = true;
    }
  }
}

const createMaterial = (color) => {
  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.specular.set(0.4, 0.4, 0.4);
  material.shininess = 70;
  material.update();
  return material;
}
const gray = createMaterial(new pc.Color(1, 1, 1));
const red = createMaterial(new pc.Color(1, 0.3, 0.3));
const green = createMaterial(new pc.Color(0, 1, 0));
const coral = createMaterial(new pc.Color().fromString('#f87854') );

const createBallShape = (x, y, z) => {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'sphere', material: red });
  app.root.addChild(shape);
  shape.model.castShadows = true;
  shape.setLocalScale(0.2, 0.2, 0.2);
  shape.setPosition(x, y, z);
  return shape;
}

const createPlateShape = (x, y, z, angle = 0, length , pos, id) => {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'box' , material: gray });
  shape.pos = pos;
  shape.id = id;
  container.addChild(shape);
  shape.setLocalScale(1, 0.2, length);
  shape.setLocalPosition(x, y, z);
  shape.setLocalEulerAngles(0, 0, angle);
  return shape;
}

const addNextPlate = () => {
  let n = plates.at(-1).pos + (Math.random() < 0.6 ? 1 : -1);
  if(n >= angleCount) n -= angleCount;
  if(n < 0) n += angleCount;
  addPlate(n)
}

const addPlate = (i) =>{
  let angle = i * diffAngle + startAngle;
  if(angle >= 360) angle -= 360;
  const length = plates.length ? baseTileLength + (Math.random() < 0.6 ? baseTileLength : 0) : firstTileLength;
  const x = radius * Math.sin(degToRad(angle));
  const y = - radius * Math.cos(degToRad(angle));
  const z = plates.length ? (plates.at(-1).getLocalPosition().z - plates.at(-1).getScale().z /2 - length/2) : 0;

  const plate = createPlateShape( x, y, z, angle, length, i, plateIdCount);
  plateIdCount++;
  //console.log(plate.id, plate.pos)
  plates.push(plate);
}

export default() => {
  app.start();

  // Create camera entity
  let camera = new pc.Entity();
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.2, 0.3)
  });
  camera.setPosition(0, 0.5, 6);
  // // add the fly camera script to the camera
  // camera.addComponent("script");
  // camera.script.create("flyCamera");
  app.root.addChild(camera);

  // Create directional light entity
  const dLight = { type: "directional", color: new pc.Color(1, 1, 1) }
  const light0 = new pc.Entity();
  light0.addComponent("light", dLight);
  light0.setLocalEulerAngles(45, 30, 0);
  app.root.addChild(light0);
  const light1 = new pc.Entity();
  light1.addComponent("light", dLight);
  light1.setLocalEulerAngles(45, 30, 180);
  app.root.addChild(light1);

  // Create a movement script (used for plates container)
  let Fly = pc.createScript('fly');
  Fly.prototype.update = function (dt) {
    // TODO make duplicate fly script, one auto and one on key press
    const pos = this.entity.getPosition();
    //if (app.keyboard.isPressed(pc.KEY_UP) || app.keyboard.isPressed(pc.KEY_W)) {
      // TODO increase speed after a while
    // TODO speed of flying and speed of turning have to be in relation

      this.entity.setPosition(pos.x, pos.y, pos.z + 1.2 * dt);
      checkRotation();
      checkPos();
      tileLoop();
    // } else if (app.keyboard.isPressed(pc.KEY_DOWN) || app.keyboard.isPressed(pc.KEY_S)) {
    //   this.entity.setPosition(pos.x, pos.y, pos.z - 5 * dt);
    //   checkPos();
    //   tileLoop()
    // }
  };
  initGame();
  app.keyboard.on("keydown", onKeyDown, this);
  app.mouse.on(pc.EVENT_MOUSEDOWN, onMouseDown, this);
  //app.mouse.off(pc.EVENT_MOUSEDOWN, tubeTwist, this);
  //app.keyboard.off("keydown", onKeyDown, this);
};

const initGame = () => {
  container = new pc.Entity();
  app.root.addChild(container);
  ball = createBallShape( 0,-1 * (radius - 0.19),0);
  addPlate(0);
  //[...Array(7)].map((a, i)=> addPlate(i));
  [...Array(23)].map(()=> addNextPlate());
  // [...Array(plateCount)].map(()=> addNextPlate());
  checkRotation();
  gameState = 'initialising';
}

const startGame = () => {
  gameState = 'playing';
  container.addComponent('script');
  container.script.create('fly');
  gameState = 'running';
}

const resetGame = () => {
  plateIdCount = 0;
  ball.destroy();
  plates.forEach(p => {
    p.destroy();
    p = null;
  });
  plates = [];
  container.script.destroy('fly');
  container.destroy();
  initGame();
}


function degToRad(degrees){
  return degrees * (Math.PI/180);
}
function radToDeg(radians){
  return radians * (180/Math.PI);
}
function roundToTwo(num) {
  return Math.round(num * 100) / 100;
  //return +(Math.round(num + "e+2")  + "e-2");
}