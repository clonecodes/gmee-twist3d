import {app, pc} from "../initApp";

let plateCount = 16;
let plates = [];
let spiral = true;

const container = new pc.Entity();

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
function createPlateShape(x, y, z, angle = 0, length = 1) {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'box' , material: gray });
  //app.root.addChild(shape);
  container.addChild(shape);
  shape.setLocalScale(1, 0.2, length);
  //shape.setPosition(x, y, z);
  shape.setLocalPosition(x, y, z);
  shape.rotate(0, 0, angle);
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
    if(pos.z<4) {
      this.entity.setPosition(pos.x, pos.y, pos.z + 0.5 * dt);
      //this.entity.setLocalPosition(pos.x, pos.y, pos.z + 0.5 * dt);
    }else{
      this.entity.setPosition(pos.x, pos.y, pos.z - plates.length );
      //this.entity.setLocalPosition(pos.x, pos.y, pos.z - plates.length );
    }
  };

  container.name = 'container';
  app.root.addChild(container);
  //container.setPosition(2,0,0);
  //container.rotate(0,0,45);

  // // tween version //
  // container.tween(container.getLocalEulerAngles())
  //     .rotate(new pc.Vec3(0, 0, 45), 0.5, pc.Linear)
  //     //.to(new pc.Vec3(0, 0.2, 0), 0.5, pc.SineOut)
  //     .loop(true)
  //     .yoyo(true)
  //     //.repeat(2)
  //     .start();

  let ball = createBallShape( 0,-1.21,1);

  // // tween version //
  // ball.tween(ball.getLocalPosition())
  //     .to(new pc.Vec3(0, 0.2, 0), 0.5, pc.SineOut)
  //     //.loop(true)
  //     .yoyo(true)
  //     .repeat(2)
  //     .start();

  let x = 0;
  let y = -1.4;
  let z = 0;
  let a = 0;
  let l = 1;
  let pl = 0;
  //initial tile
  plates[0] = createPlateShape( x, y, z, a, l);
  //other tiles
  for (let i = 1; i < plateCount; i++){
    if(!spiral && Math.random() < 0.5){
      // console.log('left');
      a = a - 45;
      if(a < 0) a += 360;
    }else{
      // console.log('right');
      a = a + 45;
      if(a >= 360) a -= 360;
    }
    pl = l;
    // if(Math.random() < 0.5){
    //   l = 2;
    // }else{
    //   l = 1;
    // }
    if([0,180].includes(a)) x = 0;
    if([45,135].includes(a)) x = 1;
    if([90].includes(a)) x = 1.4;
    if([270].includes(a)) x = -1.4;
    if([225,315].includes(a)) x = -1;

    if([0].includes(a)) y = -1.4;
    if([180].includes(a)) y = 1.4;
    if([225,135].includes(a)) y = 1;
    if([90,270].includes(a)) y = 0;
    if([45,315].includes(a)) y = -1;
    //z = pl === 1 ? -1 * i : -1 * i - pl/2; // - (pl - 1);
    // console.log(plates[i-1].getPosition());
    //console.log(plates[i-1].getLocalScale());
    plates[i] = createPlateShape( x, y, -1 * i, a, l);
  }
  for (let i = 0; i < plates.length; i++){
    plates[i].addComponent('script');
    plates[i].script.create('fly');
  }
};