export default class TwoAdapter {

  constructor(container) {
    this.container = container;
  }

  createCanvas(width, height) {
    this.container.textContent = '';
    this.two = new Two({width, height, type: Two.Types.svg}).appendTo(this.container);
  }
  setBackground() {

  }
  done() {
    this.two.update();
  }
  clear() {
    this.two.clear();
  }
  applyStyle(obj, style) {
    if(style.fill &! style.fill.nofill) obj.fill = style.fill.col;
    else obj.noFill();
    if(style.stroke &&! style.stroke.nostroke){
      if(style.stroke.lineWidth) obj.lineWidth = style.stroke.width;
      if(style.stroke.col) obj.stroke = style.stroke.col;
    }
    else obj.noStroke();
  }

  line(p1, p2, style) {
    var line = this.two.makeLine(p1.x, p1.y, p2.x, p2.y);
    this.applyStyle(line, style);
  }

  polygon(pointAr, style) {
    var path = new Two.Path(pointAr.map(p => new Two.Anchor(p.x, p.y)), true, false);
    this.two.add(path);
    this.applyStyle(path, style);
  }

}