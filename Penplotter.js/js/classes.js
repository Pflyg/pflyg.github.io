
//import Flatten from "https://unpkg.com/@flatten-js/core@1.2.8/dist/main.esm.js";

//var BooleanOperations = Flatten.BooleanOperations;
var ref = window;

class Point {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  add(point){
    this.x += point.x;
    this.y += point.y;
    return this;
  }
  sub(point){
    this.x -= point.x;
    this.y -= point.y;
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
  /*
  union(poly2){
    var res = (greinerHormann.union(this.points, poly2.points));
    return new Polygon(res[0].map(p => new Point(p.x, p.y)));
  }
  diff(poly2) {
    var res = (greinerHormann.diff(this.points, poly2.points));
    return new Polygon(res[0].map(p => new Point(p.x, p.y)));
  }
  intersection(poly2) {
    var inter = BooleanOperations.intersect(this.toFlatten(), poly2.toFlatten());
    //var points = inter.vertices.map(p => new Point(p.x, p.y));
    var firstFace = inter.faces.values().next().value
    var points = firstFace.edges.map(p => new Point(p.start.x, p.start.y));
    
    return new Polygon(points);
    /*var res = (greinerHormann.intersection(this.points, poly2.points));
    //console.log(res);
    if(!res)return false;
    return new Polygon(res[0].map(p => new Point(p.x, p.y)));
  }*/
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
    //TODO
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
    /*for(let i = 0; i < poly.points.length; i++){
      var p0 = this.points[(this.points.length + i - 1) % this.points.length];
      var p1 = this.points[i];
      var p2 = this.points[(i + 1) % this.points.length];
      var vec12 = p2.clone().sub(p1).normalise();
      var vec10 = p0.clone().sub(p1).normalise();
      var vec = vec12.add(vec10);
      vec.normalise().mult(off); //Set length to offset
      poly.points[i] = poly.points[i].add(vec);
    }*/
    return poly;
  }
}

Polygon.prototype.intersect = function(poly2) {
  var poly = PolyBool.intersect (
    {regions: [this.toPointArray()], inverted: false},
    {regions: [poly2.toPointArray()], inverted: false}
    );
  return poly.regions && poly.regions.length > 0 ? new Polygon(poly.regions[0]) : false;
}

Polygon.prototype.diff = function(poly2) {
  var poly = PolyBool.difference(
    {regions: [this.toPointArray()], inverted: false},
    {regions: [poly2.toPointArray()], inverted: false}
    );
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