import {app, pc} from "../initApp";

var plateCount = 16;
var plates = [];
var spiral = true;

function createShape(type, x, y, z, angle = 0, length = 1) {
  var shape = new pc.Entity();
  shape.addComponent('model', { type: type });
  app.root.addChild(shape);
  shape.model.castShadows = true;
  var material = shape.model.model.meshInstances[0].material;
  material.diffuse.set(1, 1, 1);
  material.specular.set(0.4, 0.4, 0.4);
  material.shininess = 70;
  material.update();
  if(type === 'box')shape.setLocalScale(1, 0.2, length);
  if(type === 'sphere')shape.setLocalScale(0.2, 0.2, 0.2);
  shape.setPosition(x, y, z);
  shape.rotate(0, 0, angle);
  return shape;
}

export default() => {
  app.start();

  // Create camera entity
  var camera = new pc.Entity();
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.2, 0.3)
  });

  // Create directional light entity
  var light = new pc.Entity();
  light.addComponent('light');

  // Add to hierarchy
  app.root.addChild(camera);
  app.root.addChild(light);

  // Set up initial positions and orientations
  camera.setPosition(0, 0, 6);
  //camera.rotate(0, 0, 45);
  //light.rotate(0, 0, 45);
  light.setEulerAngles(45, 0, 0);

  // Create a rotation script
  var Rotate = pc.createScript('rotate');
  Rotate.prototype.update = function (dt) {
    this.entity.rotate(10 * dt, 20 * dt, 30 * dt);
  };
  // Create a movement script
  var Fly = pc.createScript('fly');
  Fly.prototype.update = function (dt) {
    var pos = this.entity.getPosition();
    if(pos.z<4) {
      this.entity.setPosition(pos.x, pos.y, pos.z + 0.5 * dt);
    }else{
      this.entity.setPosition(pos.x, pos.y, pos.z - plates.length );
    }
  };
  // var timer = 0;
  // // Create a bounce script
  // var Bounce = pc.createScript('bounce');
  // Bounce.prototype.update = function (dt) {
  //   timer += dt;
  //     //var pos = this.entity.getPosition();
  //     //this.entity.setPosition(pos.x, pos.y, pos.z + 0.2 * dt);
  //    this.entity.setPosition(0, Math.sin(timer*2), 0);
  // };

  // Create box entity
  var cube = new pc.Entity();
  cube.addComponent('model', {type: "box"});
  //cube.rotate(10, 15, 45);
  cube.setLocalScale(1, 1, 1);
  //cube.translate(-2, 0, 0);
  // Add rotation script to cube
  //cube.addComponent('script');
  //cube.script.create('rotate');
  //cube.script.create('fly');
  //app.root.addChild(cube);

  var ball = createShape('sphere', 0,-1.21,1);
  //var pos = ball.getPosition();
  // gsap.to(pos,{duration: 0.5, ease: "bounce.easeOut", y: 0.5, yoyo:true, repeat:-1, onUpdate: function() {
  //     ball.setPosition(pos);
  //   }});

  // ball.addComponent('script');
  // ball.script.create('bounce');

  //    cone.setPosition(2, Math.sin(timer*2), 0);

  var x = 0;
  var y = -1.4;
  var z = 0;
  var a = 0;
  var l = 1;
  var pl = 0;
  //initial tile
  plates[0] = createShape('box', x, y, z, a, l);
  //other tiles
  for (var i = 1; i < plateCount; i++){
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
    plates[i] = createShape('box', x, y, -1 * i, a, l);
  }
  for (var i = 0; i < plates.length; i++){
    plates[i].addComponent('script');
    plates[i].script.create('fly');
  }
};