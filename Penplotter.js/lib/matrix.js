/*
	Transformation Matrix v2.0
	(c) Epistemex 2014-2015
	www.epistemex.com
	By Ken Fyrstenberg
	Contributions by leeoniya.
	License: MIT, header required.
*/
function Matrix(a){var b=this;b._t=b.transform;b.a=b.d=1;b.b=b.c=b.e=b.f=0;b.context=a;if(a){a.setTransform(1,0,0,1,0,0)}}Matrix.prototype={concat:function(a){return this.clone()._t(a.a,a.b,a.c,a.d,a.e,a.f)},flipX:function(){return this._t(-1,0,0,1,0,0)},flipY:function(){return this._t(1,0,0,-1,0,0)},reflectVector:function(c,e){var b=this.applyToPoint(0,1),a=2*(b.x*c+b.y*e);c-=a*b.x;e-=a*b.y;return{x:c,y:e}},reset:function(){return this.setTransform(1,0,0,1,0,0)},rotate:function(a){var b=Math.cos(a),c=Math.sin(a);return this._t(b,c,-c,b,0,0)},rotateFromVector:function(a,b){return this.rotate(Math.atan2(b,a))},rotateDeg:function(a){return this.rotate(a*Math.PI/180)},scaleU:function(a){return this._t(a,0,0,a,0,0)},scale:function(a,b){return this._t(a,0,0,b,0,0)},scaleX:function(a){return this._t(a,0,0,1,0,0)},scaleY:function(a){return this._t(1,0,0,a,0,0)},shear:function(a,b){return this._t(1,b,a,1,0,0)},shearX:function(a){return this._t(1,0,a,1,0,0)},shearY:function(a){return this._t(1,a,0,1,0,0)},skew:function(a,b){return this.shear(Math.tan(a),Math.tan(b))},skewX:function(a){return this.shearX(Math.tan(a))},skewY:function(a){return this.shearY(Math.tan(a))},setTransform:function(g,h,i,j,k,l){var m=this;m.a=g;m.b=h;m.c=i;m.d=j;m.e=k;m.f=l;return m._x()},translate:function(a,b){return this._t(1,0,0,1,a,b)},translateX:function(a){return this._t(1,0,0,1,a,0)},translateY:function(a){return this._t(1,0,0,1,0,a)},transform:function(b,d,f,h,j,l){var m=this,a=m.a,c=m.b,e=m.c,g=m.d,i=m.e,k=m.f;m.a=a*b+e*d;m.b=c*b+g*d;m.c=a*f+e*h;m.d=c*f+g*h;m.e=a*j+e*l+i;m.f=c*j+g*l+k;return m._x()},divide:function(b){if(!b.isInvertible()){throw"Input matrix is not invertible"}var a=b.inverse();return this._t(a.a,a.b,a.c,a.d,a.e,a.f)},divideScalar:function(a){var b=this;b.a/=a;b.b/=a;b.c/=a;b.d/=a;b.e/=a;b.f/=a;return b._x()},inverse:function(){if(this.isIdentity()){return new Matrix()}else{if(!this.isInvertible()){throw"Matrix is not invertible."}else{var p=this,g=p.a,h=p.b,i=p.c,j=p.d,l=p.e,n=p.f,o=new Matrix(),k=g*j-h*i;o.a=j/k;o.b=-h/k;o.c=-i/k;o.d=g/k;o.e=(i*n-j*l)/k;o.f=-(g*n-h*l)/k;return o}}},interpolate:function(c,e,a){var d=this,b=a?new Matrix(a):new Matrix();b.a=d.a+(c.a-d.a)*e;b.b=d.b+(c.b-d.b)*e;b.c=d.c+(c.c-d.c)*e;b.d=d.d+(c.d-d.d)*e;b.e=d.e+(c.e-d.e)*e;b.f=d.f+(c.f-d.f)*e;return b._x()},interpolateAnim:function(e,j,a){var f=this,d=a?new Matrix(a):new Matrix(),b=f.decompose(),c=e.decompose(),g=b.rotation+(c.rotation-b.rotation)*j,k=b.translate.x+(c.translate.x-b.translate.x)*j,l=b.translate.y+(c.translate.y-b.translate.y)*j,h=b.scale.x+(c.scale.x-b.scale.x)*j,i=b.scale.y+(c.scale.y-b.scale.y)*j;d.translate(k,l);d.rotate(g);d.scale(h,i);return d._x()},decompose:function(w){var l=this,e=l.a,h=l.b,i=l.c,j=l.d,f=Math.acos,g=Math.atan,u=Math.sqrt,m=Math.PI,v={x:l.e,y:l.f},o=0,q={x:1,y:1},t={x:0,y:0},k=e*j-h*i;if(w){if(e){t={x:g(i/e),y:g(h/e)};q={x:e,y:k/e}}else{if(h){o=m*0.5;q={x:h,y:k/h};t.x=g(j/h)}else{q={x:i,y:j};t.x=m*0.25}}}else{if(e||h){var n=u(e*e+h*h);o=h>0?f(e/n):-f(e/n);q={x:n,y:k/n};t.x=g((e*i+h*j)/(n*n))}else{if(i||j){var p=u(i*i+j*j);o=m*0.5-(j>0?f(-i/p):-f(i/p));q={x:k/p,y:p};t.y=g((e*i+h*j)/(p*p))}else{q={x:0,y:0}}}}return{scale:q,translate:v,rotation:o,skew:t}},determinant:function(){return this.a*this.d-this.b*this.c},applyToPoint:function(b,c){var a=this;return{x:b*a.a+c*a.c+a.e,y:b*a.b+c*a.d+a.f}},applyToArray:function(e){var a=0,d,b,c=[];if(typeof e[0]==="number"){b=e.length;while(a<b){d=this.applyToPoint(e[a++],e[a++]);c.push(d.x,d.y)}}else{for(;d=e[a];a++){c.push(this.applyToPoint(d.x,d.y))}}return c},applyToTypedArray:function(e,f){var a=0,d,b=e.length,c=f?new Float64Array(b):new Float32Array(b);while(a<b){d=this.applyToPoint(e[a],e[a+1]);c[a++]=d.x;c[a++]=d.y}return c},applyToContext:function(a){var b=this;a.setTransform(b.a,b.b,b.c,b.d,b.e,b.f);return b},isIdentity:function(){var a=this;return(a._q(a.a,1)&&a._q(a.b,0)&&a._q(a.c,0)&&a._q(a.d,1)&&a._q(a.e,0)&&a._q(a.f,0))},isInvertible:function(){return !this._q(this.determinant(),0)},isValid:function(){return !this._q(this.a*this.d,0)},clone:function(c){var b=this,a=new Matrix();a.a=b.a;a.b=b.b;a.c=b.c;a.d=b.d;a.e=b.e;a.f=b.f;if(!c){a.context=b.context}return a},isEqual:function(a){var b=this,c=b._q;return(c(b.a,a.a)&&c(b.b,a.b)&&c(b.c,a.c)&&c(b.d,a.d)&&c(b.e,a.e)&&c(b.f,a.f))},toArray:function(){var a=this;return[a.a,a.b,a.c,a.d,a.e,a.f]},toCSS:function(){return"matrix("+this.toArray()+")"},toJSON:function(){var a=this;return'{"a":'+a.a+',"b":'+a.b+',"c":'+a.c+',"d":'+a.d+',"e":'+a.e+',"f":'+a.f+"}"},toString:function(){return""+this.toArray()},_q:function(a,b){return Math.abs(a-b)<1e-14},_x:function(){var a=this;if(a.context){a.context.setTransform(a.a,a.b,a.c,a.d,a.e,a.f)}return a}};