export default {
  "Vector Field": `/*Always try to call this at the start if you don't know what you're doing*/
  setDefaults(); 
 
 function grid(start, end, div, func) {
   var stepX = (end.x - start.x) / div;
   var stepY = (end.y - start.y) / div;
   var current = start.clone();
   for(let x = start.x; x <= end.x; x+= stepX){
     for(let y = start.y; y <= end.y; y+= stepY){
       func(P(x, y));
     }
   }
 }
 
 var points = [];
 for(let i = 0; i < 5; i++){
   points.push(
     P(
       random(-300, 300),
       random(-300, 300)
     )
   );
 }
   
 var len = 13;
 grid(P(-250, -250), P(250, 250), 22, (p) => {
   circle(p, 2);
   var vec = vector(p).mult(len / 2);
   arrow(
     p.clone().sub(vec),
     p.clone().add(vec)
   );
 });
 
 function vector (p) {
   var vec = P(0, 0);
   for(let p2 of points){
     let toP = p2.clone().sub(p);
     vec.add(
       toP.mult(20 / p2.dist2(p))
     )
   }
   return vec.normalise();
 }
 function closestPoint (p) {
   var min;
   var minLen = Infinity;
   for(let p2 of points){
     let dist = p2.dist2(p);
     if(dist < minLen){
       min = p2;
       minLen = dist;
     }
   }
   return min;
 }
 function arrow(p1, p2, size = 3) {
   line(p1, p2);
   //circle(p2, 3);
   var norm = p2.clone().sub(p1).normalise().mult(size);
   var head = p2.clone().add(norm.clone().mult(1 / 2));
   var e1 = head.clone().add(norm);
   var e2 = head.clone().add(norm.clone().rotate(120));
   var e3 = head.clone().add(norm.clone().rotate(-120));
   polygon([e1, e2, e3]);
 }
 `,
 "Cube": `/*Always try to call this at the start if you don't know what you're doing*/
 setDefaults(); 


rect(-300, -300, 300, 300);

drawCube(P(0, 0), 200);

function drawCube(pos, size = 100) {
  var poly = Utils.makeNGON(pos, 6, size);
  var polyTop = new Polygon([
    pos,
    poly.points[2],
    poly.points[3],
    poly.points[4]
  ]);
  var polyRight = new Polygon([
    pos,
    poly.points[0],
    poly.points[1],
    poly.points[2]
  ]);
  var polyLeft = new Polygon([
    pos,
    poly.points[4],
    poly.points[5],
    poly.points[0]
  ]);
  polyTop.draw();
  polyLeft.draw();
  polyRight.draw();
  
  hatchPolygon(polyLeft, 5, 60);
  hatchPolygon(polyRight, 2, -30);
}`,
"Sierpiński triangle": `/*Always try to call this at the start if you don't know what you're doing*/
setDefaults(); 

const maxN = 5;
function triangle(p1, p2, p3, n = 0){
 if(n > maxN)return;
 var mp12 = midpoint(p1, p2);
 var mp23 = midpoint(p2, p3);
 var mp31 = midpoint(p3, p1);
 polygon([mp12, mp23, mp31]);
 
 triangle(p1, mp12, mp31, n + 1);
 triangle(p2, mp23, mp12, n + 1);
 triangle(p3, mp31, mp23, n + 1);
}

function midpoint(p1, p2){
 return p1.clone().add(p2).mult(0.5);
}

function tri(p1, p2, p3){
 polygon([
   p1, p2, p3
 ]);
}
var off = 300;
var dx = Math.sqrt(3) * off / 2;
var dy = 0.75 * off;
var p1 = P(0, -dy);
var p2 = P(dx, +dy);
var p3 = P(-dx, +dy);

tri(p1, p2, p3);
triangle(p1, p2, p3);`,
"Spiralling": `/*Always try to call this at the start if you don't know what you're doing*/
setDefaults();

var n = 12, size = 200, steps = 50;

var points = [];
for(let i = 0; i < steps; i++) {
 //Make a regular polygon with n corners at Point (0, 0) and with a decreasing size
 var ps = Utils.makeNGON(P(0, 0), n, size - i * 2 , 15 + i * 2);
 //Draw it
 ps.draw();
 points.push(ps);
}

//Connect every point to the one of the next polygon, shifted by one position
for(let i = 0; i < points[0].length; i++){
 for(let j = 1; j < points.length; j++){
   var p1 = points[j - 1][i];
   var p2 = points[j][i];
   line(p1, p2);
 }
}`
}