import {app, pc} from "../initApp";
import {addCamera} from "./camera";
import {addLights} from "./lights";
import {cSpeed, radius, spiral} from "./consts";
import {createBallShape, addPlate, addNextPlate} from "./factory";
import {onKeyDown, onMouseDown, onTouchStart} from "./inputHandlers";
import "./pcScriptFly";
import {checkRotation} from "./helpers";


const game = {
  speed: cSpeed,
  plates: [],
  container: null,
  ball: null,
  plateIdCount: 0,
  gameState: 'initialising', // one of: initialising / running / failed
}

export default() => {
  app.game = game;
  app.start();
  addCamera();
  addLights();
  initGame();
  app.keyboard.on("keydown", onKeyDown, this);
  if('ontouchstart' in window || navigator.msMaxTouchPoints) {
    app.touch = new pc.TouchDevice(window);
    app.touch.on(pc.EVENT_TOUCHSTART, onTouchStart, this);
  }else{
    app.mouse.on(pc.EVENT_MOUSEDOWN, onMouseDown, this);
  }
}

export const initGame = () => {
  app.game.container = new pc.Entity();
  app.root.addChild(app.game.container);
  app.game.ball = createBallShape( 0,-1 * (radius - 0.19),0);
  spiral ? buildSpiral() : buildRandom();
  checkRotation();
  app.game.speed = cSpeed;
  app.game.gameState = 'initialising';
}

const buildSpiral = () => {
  [...Array(24)].map((a, i)=> addPlate(i));
}
const buildRandom = () => {
  addPlate(0);
  [...Array(23)].map(()=> addNextPlate());
}

export const startGame = () => {
  app.game.container.addComponent('script');
  app.game.container.script.create('fly');
  app.game.gameState = 'running';
}

export const resetGame = () => {
  app.game.plateIdCount = 0;
  app.game.ball.destroy();
  app.game.plates.forEach(p => {
    p.destroy();
    p = null;
  });
  app.game.plates = [];
  app.game.container.script.destroy('fly');
  app.game.container.destroy();
  initGame();
}