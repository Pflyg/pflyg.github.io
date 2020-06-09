
import {Point, Polygon, Line} from './classes.js';

export default class GCGen {
  constructor(ref) {
    this.ref = ref;
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

    this.ref.getGCode = this.getGCode.bind(this);
    this.ref.finishGCode = this.finish.bind(this);
    this.ref.setGCodeOptions = (opt) => {
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