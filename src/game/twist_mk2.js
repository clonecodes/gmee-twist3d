import {app, pc} from "../initApp";
//import "../util/FlyCamera";

// rigidbody type BODYTYPE_KINEMATIC could be ideal for my needs
// try physics version during ESA

app.mouse.on(pc.EVENT_MOUSEDOWN, myScript, this);

function myScript(){
  console.log()
  if(!container.moving){
    let angle = container.getLocalEulerAngles()
    console.log(angle)
    container.tween(angle)
        .rotate(new pc.Vec3(0, 0, Math.round(angle.z) - diffAngle), 0.5, pc.Linear)
        .start()
        .on('complete', () => {
          let pos = Math.round(container.getLocalEulerAngles().z)/diffAngle;
          pos = pos > 0 ? Math.round(container.getLocalEulerAngles().z - 360)/diffAngle : pos;
          // for some reason zero is not zero, it is ...-2 to 2 range
          //if(angle >= 360) angle -= 360;
          // container.setLocalEulerAngles(0,0,angle)
          container.moving = false;
          console.log(Math.round(container.getLocalEulerAngles().z), pos, plates[0].pos)

          plates.forEach(p => {
            if(Math.abs(pos) === p.pos % angleCount){
              p.model.material = red
            }else{
              p.model.material = gray
            }
          })
        });
    container.moving = true;
  }
}

let plates = [];
let spiral = true;

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
  // shape.addComponent('script');
  // shape.script.create('fly');
  return shape;
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
    if(pos.z<4) {
      this.entity.setPosition(pos.x, pos.y, pos.z + 0.5 * dt);

      //this.entity.setLocalPosition(pos.x, pos.y, pos.z + 0.5 * dt);
    }else{
      // alternatively, just reposition plate
      this.entity.destroy();
      plates.shift();
      addNextPlate();
    }
  };

  container.name = 'container';
  app.root.addChild(container);
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

  let ball = createBallShape( 0,-1.21,1);

  // // ball jump
  // ball.tween(ball.getLocalPosition())
  //     .to(new pc.Vec3(0, 0.2, 0), 0.5, pc.SineOut)
  //     //.loop(true)
  //     .yoyo(true)
  //     .repeat(2)
  //     .start();

  [...Array(24)].map((a, i)=> addPlate(i));
  //[...Array(8)].map(()=> addNextPlate());
  // [...Array(1)].map((a, i)=> addPlate(i));
  // [...Array(plateCount)].map(()=> addNextPlate());


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
    const z = plates.length ? (plates.at(-1).getPosition().z - plates.at(-1).getScale().z /2 - length/2) : - length/2 + 1;
    const plate = createPlateShape( x, y, z, corAngle, length, i, plates.length);
    plates.push(plate);
  }
};


function degToRad(degrees){
  return degrees * (Math.PI/180);
}
function radToDeg(radians){
  return radians * (180/Math.PI);
}