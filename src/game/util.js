export const degToRad = (degrees) => {
  return degrees * (Math.PI/180);
}
export const radToDeg = (radians) => {
  return radians * (180/Math.PI);
}
export const roundToTwo = (num) => {
  return Math.round(num * 100) / 100;
  //return +(Math.round(num + "e+2")  + "e-2");
}