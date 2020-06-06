
function rayCast(from, to, p1, p2) {
  //https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
  var eps = 0.0001;
  var eps1 = 1 + eps;
  var a = from.x, b = from.y, c = to.x, d = to.y, p = p1.x, q = p1.y, r = p2.x,  s = p2.y;
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    //Lambda: from -> to
    //Gamma: p1 -> p2
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    if(lambda < -eps //Before from
      || gamma < -eps //Before p1
      || gamma > eps1) //Before p2
      return {lambda, gamma};
    //if(!((eps < lambda && lambda < eps1) && (eps < gamma && gamma < eps1))) return {lambda, gamma};
    var p = new Point(
      a + lambda * (c - a),
      b + lambda * (d - b)
    );
    return {point: p, lambda, gamma};
  }
}
function intersectLine(from, to, p1, p2) {
  //https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
  var eps = 0.00001;
  var eps1 = 1 + eps;
  var a = from.x, b = from.y, c = to.x, d = to.y, p = p1.x, q = p1.y, r = p2.x,  s = p2.y;
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    //Lambda: from -> to
    //Gamma: p1 -> p2
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    if(lambda < -eps //Before from
      || lambda > eps1 //After to
      || gamma < -eps //Before p1
      || gamma > eps1) //Before p2
      return {lambda, gamma};
    //if(!((eps < lambda && lambda < eps1) && (eps < gamma && gamma < eps1))) return {lambda, gamma};
    var p = new Point(
      a + lambda * (c - a),
      b + lambda * (d - b)
    );
    return {point: p, lambda, gamma};
  }
}

export {rayCast, intersectLine};