import {app, pc} from "../initApp";
import {resetGame, startGame} from "./index";
import {nextPlateDirection, tubeTwist} from "./helpers";

export const onKeyDown = (e) => {
  if(app.game.gameState === 'initialising') {
    app.keyboard.isPressed(pc.KEY_SPACE) && startGame();
  }else if(app.game.gameState === 'running'){
    app.keyboard.isPressed(pc.KEY_SPACE) && tubeTwist(nextPlateDirection());
    app.keyboard.isPressed(pc.KEY_LEFT) || app.keyboard.isPressed(pc.KEY_A) && tubeTwist();
    app.keyboard.isPressed(pc.KEY_RIGHT) || app.keyboard.isPressed(pc.KEY_D) && tubeTwist(1);
  }else if(app.game.gameState === 'failed'){
    app.keyboard.isPressed(pc.KEY_SPACE) && resetGame();
  }
  e.event.preventDefault(); // Use original browser event to prevent browser action.
};
export const onMouseDown = () => {
  mouseDownAndTouch();
}
export const onTouchStart = () => {
  mouseDownAndTouch();
}
const mouseDownAndTouch = () => {
  if(app.game.gameState === 'initialising') {
    startGame();
  }else if(app.game.gameState === 'running'){
    tubeTwist(nextPlateDirection());
  }else if(app.game.gameState === 'failed'){
    resetGame();
  }
}