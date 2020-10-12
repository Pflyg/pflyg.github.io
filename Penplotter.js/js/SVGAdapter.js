export default class SVGAdapter {

  constructor(container) {
    this.container = container;
  }

  createCanvas(w, h) {
    if(this.draw)this.draw.remove();
    this.draw = SVG().addTo(this.container);
    //.attr("id")
    this.draw.attr("preserveAspectRatio", "none").attr("viewBox", `0 0 ${w} ${h}`);
  }
  done() {

  }
  clear() {
    this.draw.clear();
  }
  dot(p, r = 3, col = "black") {
    var circ = this.draw.circle(2*r).move(p.x - r, p.y - r);
    circ.fill({color: col});
  }
  setBackground(col) {
    this.draw.attr("style", "background-color: " + col);
  }

  applyStyle(obj, styling) {
    obj.stroke(styling.stroke.nostroke ? 'none' : {width: styling.stroke.weight, color: styling.stroke.col});
    obj.fill(styling.fill.nofill ? 'none' : { color: styling.fill.col});
  }

  line(p1, p2, style) {
    var line = this.draw.path(`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
    this.applyStyle(line, style);
  }

  polygon(pointAr, style) {
    var poly = this.draw.polygon(pointAr.map(p => p.toArray()));
    this.applyStyle(poly, style);
  }
}