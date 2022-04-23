import {app, pc} from "../initApp";
//import "../util/FlyCamera";

// rigidbody type BODYTYPE_KINEMATIC could be ideal for my needs
// try physics version during ESA

app.mouse.on(pc.EVENT_MOUSEDOWN, tubeTwist, this);

const onKeyDown = function (e) {
  if (app.keyboard.isPressed(pc.KEY_F)) {
    const pos = container.getPosition();
    container.setPosition(pos.x, pos.y, pos.z + 0.1);
    checkPos();
  }
  if (app.keyboard.isPressed(pc.KEY_R)) {
    const pos = container.getPosition();
    container.setPosition(pos.x, pos.y, pos.z - 0.1);
    checkPos();
  }
  if (app.keyboard.isPressed(pc.KEY_LEFT) || app.keyboard.isPressed(pc.KEY_A)) {
    tubeTwist();
  } else if (app.keyboard.isPressed(pc.KEY_RIGHT) || app.keyboard.isPressed(pc.KEY_D)) {
    tubeTwist(1);
  }
  e.event.preventDefault(); // Use original browser event to prevent browser action.
};
app.keyboard.on("keydown", onKeyDown, this);

function checkPos() {
  if(!ball.fallen && !ball.moving) {
    // TODO now everything depends on tileLoop clearing
    // TODO all zeroAngle plates have to be checked
    // TODO all plates behind(?) interest range(!) // they are positive

    const p = plates.filter(p => p.zeroAngle).filter(p => {
      const pPos = roundToTwo(p.getPosition().z)// - firstTileLength / 2;
      const pScale = p.getLocalScale().z/2

      p.current = false;
      if(pPos > pScale){
        p.model.material = red
      }else if(-pScale > pPos){
        p.model.material = green
      }else if(-pScale < pPos && pPos < pScale){
        p.model.material = coral
        p.current = true;
        return p;
      }else if(pScale === pPos){
        console.log('same', pScale, pPos)
        p.model.material = red
      }else{
        console.log('NEVER HAPPENS', pScale, pPos)
        //p.model.material = red
      }

      // if(-pScale < pPos && pPos < pScale){
      //   p.model.material = coral
      // }else if(pPos > pScale){
      //   p.model.material = gray
      // }else if(-pScale > pPos){
      //   p.model.material = red
      // }else{
      //   console.log('NEVER HAPPENS')
      //   //p.model.material = red
      // }
    }).find(p => p.current)
    //const p = row.length && row.find(p => p.current)

    if(!p){
      ball.fallen = true;
      ball.tween(ball.getLocalPosition())
          .to(new pc.Vec3(0, -10, 0), 3, pc.Linear)
          .start();
    }

    // const p = plates.find(p => p.zeroAngle)
    // if(p){
    //     const pPos = roundToTwo(p.getPosition().z)// - firstTileLength / 2;
    //     if(-p.getLocalScale().z/2 < pPos && pPos < p.getLocalScale().z/2){
    //       p.model.material = coral
    //     }else{
    //       ball.fallen = true;
    //       ball.tween(ball.getLocalPosition())
    //           .to(new pc.Vec3(0, -10, 0), 3, pc.Linear)
    //           .start();
    //       p.model.material = red
    //     }
    // }
  }
}
function checkRotation(rot){
  if(!ball.fallen && !ball.moving) {
    let pos = Math.round(rot) / diffAngle;
    pos = pos > 0 ? Math.round(rot - 360) / diffAngle : pos;
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

function tileLoop(){
  const p = plates.find(p => p.getPosition().z > 6);
  if(p){
    p.destroy();
    plates.shift();
    addNextPlate();
  }
}

function tubeTwist(direction){
  if(!container.moving){
    const angle = container.getLocalEulerAngles()
    //checkRotation(direction ? Math.round(angle.z) - diffAngle : Math.round(angle.z) + diffAngle);
    container.tween(angle)
        .rotate(new pc.Vec3(0, 0, direction ? Math.round(angle.z) - diffAngle : Math.round(angle.z) + diffAngle), 0.5, pc.Linear)
        .start()
        .on('complete', () => {
          container.moving = false;
          checkRotation(container.getLocalEulerAngles().z);
        });
    container.moving = true;

    if(!ball.fallen){
      ball.tween(ball.getLocalPosition())
          .to(new pc.Vec3(0, 0, 0), 0.26, pc.Linear)
          .repeat(2)
          .yoyo(true)
          .start()
          .on('complete', () => {
            ball.moving = false;
            checkRotation(container.getLocalEulerAngles().z);
          });
      ball.moving = true;
    }
  }
}

let plates = [];
let spiral = true;
let ball;

const startAngle = 0;
const firstTileLength = 8;
const diffAngle = 45;
const angleCount = 360/diffAngle;
const baseTileLength = 1;
const radius = 1.4;

const container = new pc.Entity();
//container.rotate(0, 0, 180);
//container.setLocalEulerAngles(0,0,180)

function createMaterial(color) {
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

function createBallShape(x, y, z) {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'sphere', material: red });
  app.root.addChild(shape);
  shape.model.castShadows = true;
  shape.setLocalScale(0.2, 0.2, 0.2);
  shape.setPosition(x, y, z);
  return shape;
}
function createPlateShape(x, y, z, angle = 0, length , pos, id) {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'box' , material: gray });
  shape.pos = pos;
  shape.id = id;
  container.addChild(shape);
  shape.setLocalScale(1, 0.2, length);
  //shape.setPosition(x, y, z);
  shape.setLocalPosition(x, y, z);
  shape.setLocalEulerAngles(0, 0, angle)
  //shape.rotate(0, 0, angle);
  return shape;
}
function addNextPlate(){
  let n = plates.at(-1).pos + (Math.random() < 0.6 ? 1 : -1);
  if(n >= angleCount) n -= angleCount;
  if(n <= 0) n += angleCount;
  addPlate(n)
}

function addPlate(i){
  let angle = i * diffAngle + startAngle;
  //if(angle >= 360) angle -= 360;
  //const corAngle = angle%2 ? angle < diffAngle * 2 ? angle + diffAngle * 2 : angle - diffAngle * 2 : angle;
  const corAngle = angle//%2 ? angle < 90 ? angle + 90 : angle - 90 : angle;
  const length = plates.length ? baseTileLength + (Math.random() < 0.6 ? baseTileLength : 0) : firstTileLength;
  const x = radius * Math.sin(degToRad(angle));
  const y = - radius * Math.cos(degToRad(angle));
  const z = plates.length ? (plates.at(-1).getLocalPosition().z - plates.at(-1).getScale().z /2 - length/2) : 0;

  const plate = createPlateShape( x, y, z, corAngle, length, i, plates.length);
  plates.push(plate);
}

export default() => {
  app.start();

  // Create camera entity
  let camera = new pc.Entity();
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.2, 0.3)
  });
  camera.setPosition(0, 0, 6);
  // // add the fly camera script to the camera
  // camera.addComponent("script");
  // camera.script.create("s");
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

  // Create a movement script (used for plates)
  let Fly = pc.createScript('fly');
  Fly.prototype.update = function (dt) {
    let pos = this.entity.getPosition();
//console.log(this.entity)
    //this.entity.render.meshInstances[0].material = red;
    //if (app.keyboard.isPressed(pc.KEY_UP) || app.keyboard.isPressed(pc.KEY_W)) {
      this.entity.setPosition(pos.x, pos.y, pos.z + 1 * dt);
    checkRotation(container.getLocalEulerAngles().z);
      checkPos();
      tileLoop();
    // } else if (app.keyboard.isPressed(pc.KEY_DOWN) || app.keyboard.isPressed(pc.KEY_S)) {
    //   this.entity.setPosition(pos.x, pos.y, pos.z - 5 * dt);
    //   checkPos();
    //   tileLoop()
    // }

  };

  container.name = 'container';
  app.root.addChild(container);
  container.addComponent('script');
  container.script.create('fly');
  //container.setPosition(2,0,0);
  //container.rotate(0,0,diffAngle);

  // // tilt plates container
  // container.tween(container.getLocalEulerAngles())
  //     .rotate(new pc.Vec3(0, 0, diffAngle), 0.5, pc.Linear)
  //     //.to(new pc.Vec3(0, 0.2, 0), 0.5, pc.SineOut)
  //     .loop(true)
  //     .yoyo(true)
  //     //.repeat(2)
  //     .start();

  //ball = createBallShape( 0,-1 * (radius - 0.15),0.5);
  ball = createBallShape( 0,-1 * (radius - 0.19),0);

  // // ball jump
  // ball.tween(ball.getLocalPosition())
  //     .to(new pc.Vec3(0, 0.2, 0), 0.5, pc.SineOut)
  //     //.loop(true)
  //     .yoyo(true)
  //     .repeat(2)
  //     .start();

  [...Array(1)].map((a, i)=> addPlate(i));
  [...Array(23)].map(()=> addNextPlate());
  // [...Array(1)].map((a, i)=> addPlate(i));
  // [...Array(plateCount)].map(()=> addNextPlate());
  checkRotation(container.getLocalEulerAngles().z);


};


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