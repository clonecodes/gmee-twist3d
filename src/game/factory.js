import {app, pc} from "../initApp";
import {degToRad} from "./util";
import {angleCount, baseTileLength, diffAngle, firstTileLength, radius, startAngle} from "./consts";

const createMaterial = (color) => {
  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.specular.set(0.4, 0.4, 0.4);
  material.shininess = 70;
  material.update();
  return material;
}
export const gray = createMaterial(new pc.Color(1, 1, 1));
export const red = createMaterial(new pc.Color(1, 0.3, 0.3));
export const green = createMaterial(new pc.Color(0, 1, 0));
export const coral = createMaterial(new pc.Color().fromString('#f87854') );

export const createBallShape = (x, y, z) => {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'sphere', material: red });
  app.root.addChild(shape);
  shape.model.castShadows = true;
  shape.setLocalScale(0.2, 0.2, 0.2);
  shape.setPosition(x, y, z);
  return shape;
}

export const createPlateShape = (x, y, z, angle = 0, length , pos, id) => {
  const shape = new pc.Entity();
  shape.addComponent('model', { type: 'box' , material: gray });
  shape.pos = pos;
  shape.id = id;
  app.game.container.addChild(shape);
  shape.setLocalScale(1, 0.2, length);
  shape.setLocalPosition(x, y, z);
  shape.setLocalEulerAngles(0, 0, angle);
  return shape;
}

export const addNextPlate = () => {
  let n = app.game.plates.at(-1).pos + (Math.random() < 0.5 ? 1 : -1);
  if(n >= angleCount) n -= angleCount;
  if(n < 0) n += angleCount;
  addPlate(n)
}

export const addPlate = (i) =>{
  let angle = i * diffAngle + startAngle;
  if(angle >= 360) angle -= 360;
  const length = app.game.plates.length ? baseTileLength + (Math.random() < 0.6 ? baseTileLength : 0) : firstTileLength;
  const x = radius * Math.sin(degToRad(angle));
  const y = - radius * Math.cos(degToRad(angle));
  const z = app.game.plates.length ? (app.game.plates.at(-1).getLocalPosition().z - app.game.plates.at(-1).getScale().z /2 - length/2) : 0;
  const plate = createPlateShape( x, y, z, angle, length, i, app.game.plateIdCount);
  app.game.plateIdCount++;
  //console.log(plate.id, plate.pos)
  app.game.plates.push(plate);
}