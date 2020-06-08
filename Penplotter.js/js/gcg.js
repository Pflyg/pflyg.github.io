
import {Point, Polygon, Line} from './classes.js';

var ref = window;

class GCodeGenerator {
  constructor() {
    const DEFAULT_OPTS = {
      drawHeight: 0,
      penLiftHeight: 2.5,
      liftEnd: 30,
      initialWaitTime: 3,
      feed: 3000,
      precision: 3,
      swapX: true,
      buildArea: [130, 130, 300],
      center: [88.7, 70.9]
    }
    this.canvasSize = [0, 0];
    this.tfMatrix = new Matrix();
    this.output = [];
    this.opt = Object.assign({}, DEFAULT_OPTS);
    this.penLifted = false;
    this.lastPos = new Point(NaN, NaN);

    ref.getGCode = this.getGCode.bind(this);
    ref.finishGCode = this.finish.bind(this);
    ref.setGCodeOptions = (opt) => {
      this.opt = Object.assign(this.opt, opt);
    };
  }
  displayMessage(msg){
    this.output.push("M117 " + msg);
  }
  liftPen() {
    if(this.penLifted)return;
    this.penLifted = true;
    this.output.push(`G0 Z${this.fix(this.opt.drawHeight + this.opt.penLiftHeight)}`);
  }
  lowerPen() {
    if(!this.penLifted)return;
    this.penLifted = false;
    this.output.push(`G0 Z${this.fix(this.opt.drawHeight)}`);
  }
  setFeedRate(f) {
    this.currentFeed = f;
    this.output.push("G0 F" + f);
  }
  pause(s) {
    this.output.push("G4 S" + s)
  }
  getToPosition(pos){
    if(this.lastPos.isEqual(pos) || this.lastPos.dist2(pos) <= 0.01)return;
    this.liftPen();
    this.move(pos);
  }
  line(p1, p2){
    this.getToPosition(p1);
    
    this.lowerPen();
    this.move(p2);
    this.lastPos = p2;
  }
  polygon(points) {
    for(let i = 0; i < points.length; i++){
      var p1 = points[i];
      var p2 = points[(i + 1)%points.length];
      this.line(p1, p2);
    }
  }
  move(pos) {
    var p = this.applyTF(pos);
    this.output.push(`G1 X${this.fix(p.x)} Y${this.fix(p.y)}`)
  }
  applyTF(pos) {
    //var p = this.tfMatrix.applyToPoint(this.canvasSize[0] - pos.x, pos.y);
    var p = this.tfMatrix.applyToPoint(this.opt.swapX ? this.canvasSize[0] - pos.x : pos.x, pos.y);
    return new Point(p.x, p.y);
  }
  init(opt) {
    this.output = [
      "G21; Units in mm",
      "G28; Auto home",
      "G90; Absolute Positioning",
      "G1 X0 Y0",
      //`G1 X${this.opt.center[0]} Y${this.opt.center[1]}`
    ];
    this.penLifted = false;
    this.liftPen();
    this.displayMessage("Starte Zeichnen in " + this.opt.initialWaitTime +"s");
    this.pause(this.opt.initialWaitTime);
    this.displayMessage("Gestartet");
    this.move(new Point(0, 0));
    this.setFeedRate(this.opt.feed);
    this.liftPen();
  }
  setCanvas(w, h) {
    var sx = this.opt.buildArea[0] / w;
    var sy = this.opt.buildArea[1] / h;
    this.canvasSize = [w, h];
    var scaleFactor = Math.min(sx, sy);
    this.tfMatrix.reset();
    //this.tfMatrix.translate(-w / 2, -h / 2);
    //this.tfMatrix.scale(-1, 1);
    //this.tfMatrix.translate(-w / 2, 0);

    //Center
    this.tfMatrix.translate(-this.opt.buildArea[0] / 2, -this.opt.buildArea[1] / 2);
    //Translate to new center
    this.tfMatrix.translate(this.opt.center[0], this.opt.center[1]);
    this.tfMatrix.scale(scaleFactor, scaleFactor);
    //console.log(this.canvasSize, this.tfMatrix.applyToPoint(w, h), scaleFactor);
  }
  clear() {
    this.init();
  }
  finish() {
    this.output.push(`G1 Z${this.fix(this.opt.drawHeight + this.opt.penLiftHeight + this.opt.liftEnd)}`);
    this.output.push(`G28 X Y; Go home`);
    this.displayMessage("Finished")
    this.pause(3);
    this.output.push(`M18 X Y`);
  }
  getGCode() {
    return this.output.join("\n");
  }
  fix(x){
    return x.toFixed(this.opt.precision);
  }
}

function SVGLib(ref) {
  SVGLibMatrix(ref);
  var GC = new GCodeGenerator();
  var draw;
  var elId = "svgg";
  var styling = {
    stroke: {
      col: "black",
      weight: 1,
      nostroke: false
    },
    fill: {
      col: "black",
      nofill: false
    }
  }
  var dimensions = [];
  function applyStyling(obj){
    obj.stroke(styling.stroke.nostroke ? 'none' : {width: styling.stroke.weight, color: styling.stroke.col});
    obj.fill(styling.fill.nofill ? 'none' : { color: styling.fill.col});
  }
  function newClipPoly(poly) {
    var pol = new Polygon([[0, 0], [0, dimensions[1]], dimensions, [dimensions[0], 0]]);
    pol = pol.intersect(poly);
    return pol;
  }

  ref.createCanvas = function(w, h) {
    if(draw)draw.remove();
    dimensions = [w, h];
    ref.resetMatrix();
    draw = SVG().addTo('#svg').size(w, h).attr("id", elId)
    .attr("preserveAspectRatio", "none")
    .attr("viewBox", `0 0 ${w} ${h}`);
    
    GC.setCanvas(w, h)
  }
  ref.center = function() {
    ref.translate(dimensions[0] / 2, dimensions[1] / 2);
  }
  ref.clear = function() {
    ref.resetMatrix();
    GC.clear();
    GC.setCanvas(dimensions[0], dimensions[1]);
    draw.clear();
  }
  ref.background = function(col){
    draw.attr("style", "background-color: " + col);
  }
  ref.strokeWeight = function(w){
    styling.stroke.weight = w;
    styling.stroke.nostroke = false;
  }
  ref.stroke = function(col){
    styling.stroke.col = col;
    styling.stroke.nostroke = false;
  }
  ref.circle = function() {
    var args = normaliseArguments(arguments, {center: {type: "point"}, radius: {type: "number"}});
    if(!args.radius)return;
    var segments = Math.floor(Math.max(15, 2 * Math.PI * args.radius / 7));
    var pointAr = [];
    for(let i = 0; i < segments; i++){
      let alpha = i * (2 * Math.PI / segments);
      let x = args.radius * Math.sin(alpha);
      let y = args.radius * Math.cos(alpha);
      pointAr.push(new Point(x, y).add(args.center));
    }
    var poly = new Polygon(pointAr);
    poly.draw();
    return poly;
  }
  ref.arc = function() {
    var args = normaliseArguments(arguments, {center: {type: "point"}, radius: {type: "number"}, start: {type: "number", default: 0}, end: {type: "number", default: 360}});
    if(!args.radius)return;
    var circumTotal = 2 * Math.PI * args.radius;
    var circum = circumTotal * (Math.abs(args.end - args.start) / 360);
    var segments = Math.floor(Math.max(15, circum / 7));
    var pointAr = [];
    //
    var deg = args.start;
    var first = true;
    for(let i = 0; i <= segments; i++){
      let alpha = Math.PI * deg / 180;
      let x = args.radius * Math.sin(alpha);
      let y = args.radius * Math.cos(alpha);
      pointAr.push(new Point(x, y).add(args.center));
      deg += (args.end - args.start) / segments;
    }
    for(let i = 1; i < pointAr.length; i++){
      line(pointAr[i - 1], pointAr[i]);
    }
    return pointAr;
  }
  ref.fill = function(col){
    styling.fill.col = col;
    styling.fill.nofill = false;
  }
  ref.noFill = function(){
    styling.fill.nofill = true;
  }
  ref.noStroke = function(){
    styling.stroke.nostroke = true;
  }
  ref.toSVG = function() {
    return draw.svg()
  }
  ref.getCanvasDimensions = function() {
    return dimensions;
  }
  ref.getStroke = function() {
    return styling.stroke.col;
  }
  ref.line = function () {
    var args = normaliseArguments(arguments, {p1: {type: "point"}, p2: {type: "point"}, addToGcode: {type: "bool", default: true}, clip: {type: "bool", default: true}});
    if(args.p1.isEqual(args.p2))return;
    if(args.clip){
      /*var p1 = ref.reverseTF(new Point(0, 0));
      var p2 = ref.reverseTF(new Point(dimensions[0], dimensions[1]));
      //Clip line by bounding box
      var pol2 = new Polygon([[p1.x, p1.y], [p2.x, p1.y], [p2.x, p2.y], [p1.x, p2.y]]);
      pol2.draw();*/
  
      var pol = new Polygon([[0, 0], [0, dimensions[1]], dimensions, [dimensions[0], 0]]);

      var clip = pol.clipLine(ref.applyTF(args.p1), ref.applyTF(args.p2));
      for(let lin of clip){
        var p1 = lin.p1;
        var p2 = lin.p2;
        if(args.addToGcode)GC.line(p1, p2);
        var line = draw.path(`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
        applyStyling(line);
      }
      /*var clip = pol.clipLine(args.p1, args.p2);
      for(let lin of clip){
        var p1 = ref.applyTF(lin.p1);
        var p2 = ref.applyTF(lin.p2);
        if(args.addToGcode)GC.line(p1, p2);
        var line = draw.path(`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
        applyStyling(line);
      }*/
    }else{
      var p1 = ref.applyTF(args.p1);
      var p2 = ref.applyTF(args.p2);
      if(args.addToGcode)GC.line(p1, p2);
      var line = draw.path(`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
      applyStyling(line);
    }
  }
  ref.rect = function(){
    var args = normaliseArguments(arguments, {p1: {type: "point"}, p2: {type: "point"}});
    ref.polygon([
      args.p1,
      new Point(args.p2.x, args.p1.y),
      args.p2,
      new Point(args.p1.x, args.p2.y),
    ]);
  }
  ref.polygon = function () {
    var args = normaliseArguments(arguments, {poly: {type: "polygon"}});
    //Keep polygon in bounding box
    var poly = newClipPoly(new Polygon(args.poly.points.map(p => ref.applyTF(p))));
    
    if(!poly)return;
    var points = poly.points;//.map(p => ref.applyTF(p));
    GC.polygon(points);
    var poly = draw.polygon(points.map(p => p.toArray()));
    applyStyling(poly);
  }
  ref.hatchPolygon = function () {
    var args = normaliseArguments(arguments, 
      {poly: {type: "polygon"}, density: {type: "number"}, angle: {type: "number", default: 0}}
    );
    if(args.density == 0)return;
    var next = (new Point(0, args.density));
    var currentLine = new Line(ref.reverseTF(new Point(-dimensions[0] / 2, -dimensions[1] / 2)), ref.reverseTF(new Point(dimensions[0] * 2, -dimensions[1] / 2)));

    var rotMat = new Matrix();
    var mat = ref.getMatrix();
    //Hacky magic: Copy rotation from global tf matrix
    /*rotMat.a = -mat.a;
    rotMat.b = mat.b;
    rotMat.c = -mat.c;
    rotMat.d = mat.d;*/
    //rotate coordinate system
    rotMat.rotateDeg(-args.angle);
    var invRotMat = rotMat.inverse();
    //Copy polygon
    var poly = args.poly.clone();
    //Apply tf to polygon
    poly.points = poly.points.map(p => rotMat.applyToPoint(p.x, p.y));
    var hasIntersected = false;
    //Draw lines over the screen
    for(let i = -dimensions[0] / 2; i < (dimensions[0] * 2 / args.density); i++){
      //Clip line by polygon
      //line(currentLine.p1, currentLine.p2, true, false);
      var inter = currentLine.clip(poly);
      if(inter.length == 0 && hasIntersected == true){
        break;
      }else if(inter.length > 0){
        hasIntersected = true;
        for(let line of inter){
          //Reverse transformation and draw
          line.p1 = invRotMat.applyToPoint(line.p1.x, line.p1.y);
          line.p1 = new Point(line.p1.x, line.p1.y);
          line.p2 = invRotMat.applyToPoint(line.p2.x, line.p2.y);
          line.p2 = new Point(line.p2.x, line.p2.y);

          ref.line(line.p1, line.p2);
        }
      }
      currentLine.p1.add(next);
      currentLine.p2.add(next);
    }
  }
  ref.hatchPolygon2 = function () {
    var args = normaliseArguments(arguments, 
      {poly: {type: "polygon"}, density: {type: "number"}, angle: {type: "number", default: 0}}
    );

    var angle = args.angle * Math.PI / 180;
    var diffX = Math.tan(angle) * dimensions[1];
    var diffY = Math.tan(angle) * dimensions[0];

    var points = args.poly.points.map(p => ref.applyTF(p).toArray());
    var next = (new Point(args.density / Math.cos(angle), 0));//Math.sin(angle) * args.density)

    var currentLine = new Line(ref.reverseTF(new Point(-diffX, 0)), ref.reverseTF(new Point(0, dimensions[1])));

    var hasIntersected = false;
    for(let i = 0; i < (dimensions[0] / args.density); i++){
      var inter = currentLine.clip(args.poly);
      if(inter.length == 0 && hasIntersected == true){
        break;
      }else if(inter.length > 0){
        hasIntersected = true;
        for(let line of inter){
          line.draw();
        }
      }
      //currentLine.draw();
      currentLine.p1.add(next);
      currentLine.p2.add(next);
    }
  }
}
function SVGLibMatrix(ref) {
  var mat = new Matrix();
  ref.resetMatrix = function() {
    mat.reset();
  }
  ref.getMatrix = function() {
    return mat;
  }
  ref.reverseTF = function() {
    var args = normaliseArguments(arguments, {p: {type: "point"}});
    var p = mat.inverse().applyToPoint(args.p.x, args.p.y)
    return new Point(p.x, p.y);
  }
  ref.applyTF = function() {
    var args = normaliseArguments(arguments, {p: {type: "point"}});
    var p = mat.applyToPoint(args.p.x, args.p.y)
    return new Point(p.x, p.y);
  }
  ref.scale = function(scaleX, scaleY) {
    scaleY = scaleY || scaleX;
    mat.scale(scaleX, scaleY);
  }
  ref.rotate = function (deg) {
    mat.rotateDeg(deg);
  }
  ref.translate = function (x, y) {
    mat.translate(x, y);
  }
}
function commonFunctions(ref) {
  ref.sin = (deg) => Math.sin(deg * Math.PI / 180);
  ref.cos = (deg) => Math.cos(deg * Math.PI / 180);
  ref.tan = (deg) => Math.tan(deg * Math.PI / 180);
}
SVGLib(ref);


function normaliseArguments(args, pattern){
  var ret = {};
  var i = 0;
  for(let key in pattern){
    let pat = pattern[key];
    if(args[i] === undefined && pat.default !== undefined){
      i++;
      ret[key] = pat.default;
      continue;
    }
    if(pat.type === "point"){
      if(args[i].x !== undefined){
        ret[key] = args[i];
        i++;
      }else if(Array.isArray(args[i])){
        ret[key] = new Point(args[i][0], args[i][1]);
        i++;
      }else{
        ret[key] = new Point(args[i], args[i + 1]);
        i+=2;
      }
    }else if(pat.type === "polygon"){
      if(Array.isArray(args[i])){
        ret[key] = new Polygon(args[i]);
      }else{//if(args[i].points !== undefined){
        ret[key] = args[i];
        i++;
      }
    }else{
      ret[key] = args[i];
      i++;
    }
  }
  return ret;
}

ref.Point = Point;
ref.P = (x, y) => new Point(x, y);
ref.Line = ref.Line = Line;
ref.Polygon = Polygon;
ref.Utils = {
  makeNGON (pos = new Point(0, 0), n = 6, size = 200, offset = 0) {
    offset = offset * Math.PI / 180;
    var pointAr = [];
    for(let i = 0; i < n; i++){
      let alpha = i * (2 * Math.PI / n) + offset;
      let x = size * Math.sin(alpha);
      let y = size * Math.cos(alpha);
      pointAr.push(new Point(x, y).add(pos));
    }
    return new Polygon(pointAr);
  },
  drawGrid (divsX = 10, divsY = 10, border = 50, color = "rgba(0, 0, 0, 0.2)", addToGcode = false) {
    var dims = ref.getCanvasDimensions();
    var dSizeX = (dims[0] - 2 * border) / divsX;
    var dSizeY = (dims[1] - 2 * border) / divsY;
    var str = ref.getStroke();
    stroke(color);
    for(let i = 0; i <= divsX; i++){
      let x = border + i *  dSizeX;
      var p1 = ref.reverseTF(new Point(x, border));
      var p2 = ref.reverseTF(new Point(x, dims[0] - border));
      ref.line(p1, p2, addToGcode);
    }
    for(let i = 0; i <= divsY; i++){
      let y = border + i *  dSizeY;
      var p1 = ref.reverseTF(new Point(border, y));
      var p2 = ref.reverseTF(new Point(dims[1] - border, y));
      ref.line(p1, p2, addToGcode);
      //ref.line(border, y, dims[1] - border, y, addToGcode);
    }
    stroke(str);
  }
};
ref.U = ref.Utils;

