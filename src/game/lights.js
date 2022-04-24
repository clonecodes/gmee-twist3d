import {app, pc} from "../initApp";

export const addLights = () => {
  // Create directional light entity
  const dLight = { type: "directional", color: new pc.Color(1, 1, 1) }

  const light0 = new pc.Entity();
  light0.addComponent("light", dLight);
  light0.setLocalEulerAngles(45, 30, 0);
  app.root.addChild(light0);

  const light180 = new pc.Entity();
  light180.addComponent("light", dLight);
  light180.setLocalEulerAngles(45, 30, 180);
  app.root.addChild(light180);
}