import {rayCast, intersectLine} from './utils.js';
//import Flatten from "https://unpkg.com/@flatten-js/core@1.2.8/dist/main.esm.js";

//var BooleanOperations = Flatten.BooleanOperations;
var ref = window;


class Point {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  add(point){
    if(arguments.length == 2){
      this.x += arguments[0];
      this.y += arguments[1];
    }else{
      this.x += point.x;
      this.y += point.y;
    }
    return this;
  }
  sub(point){
    if(arguments.length == 2){
      this.x -= arguments[0];
      this.y -= arguments[1];
    }else{
      this.x -= point.x;
      this.y -= point.y;
    }
    return this;
  }
  toArray() {
    return [this.x, this.y];
  }
  rotate(angle) {
    angle = angle * Math.PI / 180;
    var x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    var y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    this.x = x;
    this.y = y;
    return this;
  }
  mult(s){
    this.x *= s;
    this.y *= s;
    return this;
  }
  normalise() {
    this.mult(1 / this.len());
    return this;
  }
  len() {
    return this.dist(new Point(0, 0));
  }
  len2() {
    return this.dist2(new Point(0, 0));
  }
  dist(point){
    return Math.sqrt(this.dist2(point));
  }
  dist2(point){
    return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
  }
  isEqual(p){
    return this.x == p.x && this.y == p.y;
  }
  clone() {
    return new Point(this.x, this.y);
  }
}

Point.fromAngle = function(angle, length){
  angle = angle * Math.PI / 180;
  return new Point(Math.cos(angle) * length, Math.sin(angle) * length);
}

class Line {
  constructor(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
  }
  len() {
    return Math.sqrt(this.len2());
  }
  draw(){
    ref.line(this.p1, this.p2);
  }
  clone() {
    return new Line(this.p1.clone(), this.p2.clone())
  }
  len2() {
    var diff = this.p2.clone().sub(this.p1);
    return diff.x ** 2 + diff.y ** 2;
  }

  //Incomplete!
  clip(poly, returnSinglePoint = false){
    var points = [];
    for(let i = 0; i < poly.points.length; i++){
      var p1 = poly.points[i];
      var p2 = poly.points[(i + 1)%poly.points.length];
      let line = new Line(p1, p2);
      let inter = this.intersect(line);
      if(inter.point)points.push(inter.point);
    }
    var lines = [];
    if(points.length == 1 && returnSinglePoint){
      return points[0];
    }
    for(let i = 0; (i + 1) < points.length; i += 2){
      var p1 = points[i];
      var p2 = points[(i + 1)%points.length];
      lines.push(new Line(p1, p2));
    }
    return lines;
  }
  intersect(line2) {
    //https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    var eps = 0.00001;
    var eps1 = 1 + eps;
    var a = this.p1.x, b = this.p1.y, c = this.p2.x, d = this.p2.y, p = line2.p1.x, q = line2.p1.y, r = line2.p2.x,  s = line2.p2.y;
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      if(!((eps < lambda && lambda < eps1) && (eps < gamma && gamma < eps1))) return {lambda, gamma};
      var p = new Point(
        a + lambda * (c - a),
        b + lambda * (d - b)
      );
      return {point: p, lambda, gamma};
    }
  }
}

class Polygon { 
  constructor(points){
    if(points[0].x === undefined){
      points = points.map((p) => new Point(p[0], p[1]));
    }
    this.points = points;
  }
  toPointArray() {
    return this.points.map(p => [p.x, p.y]);
  }
  toFlatten() {
    return Flatten.polygon(this.points.map(p => Flatten.point(p.x, p.y)));
  }
  draw() {
    ref.polygon(this);
  }
  hatch(density = 4, angle = 0){
    ref.hatchPolygon(this, density, angle);
  }
  containsPoint2(p){
    var count = 0;
    this.forEachLine((p1, p2) => {
      //Hacky solution using real numbers
      if(rayCast(p, p.clone().add(2.1, 0.4), p1, p2).point)count++;
    });
    //console.log(count);
    return (count % 2) === 1;
  }

  containsPoint(p){
    var count = 0;
    var points = {};
    var isIn = false;
    this.forEachLine((p1, p2) => {
      if(isIn)return;
      //Hacky solution using real numbers, it avoids any sort of line collinearity (this would be a very extreme edge case)
      var rc = rayCast(p, p.clone().add(Math.PI, Math.SQRT1_2), p1, p2);
      if(rc.lambda == 0)isIn = true;
      if(rc.point){
        let key = rc.point.x + "|" + rc.point.y;
        if(points[key])return;
        count++;
        points[key] = true;
      }
    });
    if(isIn)return true;
    return (count % 2) === 1;
  }
  clipLine (from, to){
    //This is horribly inefficient
    var points = [];
    var lastPoint = new Point(NaN, NaN);
    this.forEachLine((p1, p2) => {
      //Don't count points on the edge
      var rc = intersectLine(from, to, p1, p2);
      if(rc.lambda == 0)return;
      if(rc.point){
        if(lastPoint.isEqual(rc.point)){
          points.pop();
          return;
        }
        lastPoint = rc.point;
        points.push(rc.point);
      }
    });
    if(this.containsPoint(from))points.unshift(from);
    if(this.containsPoint(to))points.push(to);
    var lines = [];
    for(let i = 0; i < (points.length - 1); i += 2){
      lines.push(new Line(points[0], points[1]));
    }
    return lines;
  }

  forEachLine(func) {
    for(let i = 0; i < this.points.length; i++){
      var p1 = this.points[i];
      var p2 = this.points[(i + 1) % this.points.length];
      func(p1, p2);
    }
  }
  clone() {
    return new Polygon(this.points.map(p => p.clone()));
  }
  offset(off = 1) {
    //Not implement yet because I hardly know anything about this
    var poly = this.clone();
    var center = P(0, 0);
    for(let p of this.points){
      center.add(p);
    }
    var mat = new Matrix();
    mat.translate(center.x, center.y);
    var s = 1.5
    mat.scale(s, s);
    mat.translate(-center.x, -center.y);
    for(let p of poly.points){
      var tf = mat.applyToPoint(p.x, p.y);
      p.x = tf.x;
      p.y = tf.y;
    }
    return poly;
  }
}

Polygon.prototype.intersect = function(poly2) {
  var poly = PolyBool.intersect (
    {regions: [this.toPointArray()], inverted: false},
    {regions: [poly2.toPointArray()], inverted: false}
    );
  if(poly.regions && poly.regions.length > 2)return poly.regions.map(r => new Polygon(r));
  return poly.regions && poly.regions.length > 0 ? new Polygon(poly.regions[0]) : false;
}

Polygon.prototype.diff = function(poly2) {
  var poly = PolyBool.difference(
    {regions: [this.toPointArray()], inverted: false},
    {regions: [poly2.toPointArray()], inverted: false}
    );
  if(poly.regions && poly.regions.length > 2)return poly.regions.map(r => new Polygon(r));
  return poly.regions && poly.regions.length > 0 ? new Polygon(poly.regions[0]) : false;
}
Polygon.prototype.union = function(poly2) {
  var poly = PolyBool.union (
    {regions: [this.toPointArray()], inverted: false},
    {regions: [poly2.toPointArray()], inverted: false}
    );
  return new Polygon(poly.regions[0]);
}

export {Point, Line, Polygon};