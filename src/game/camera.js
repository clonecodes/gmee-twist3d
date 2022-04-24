import {app, pc} from "../initApp";
import "../util/FlyCamera";

export const addCamera = (fly = false) => {
  // Create camera entity
  const camera = new pc.Entity();
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.2, 0.3)
  });
  camera.setPosition(0, 0.5, 6);
  if(fly){
    // add the fly camera script to the camera
    camera.addComponent("script");
    camera.script.create("flyCamera");
  }
  app.root.addChild(camera);
}