OUT -> _ BEXPR _ {% d => d[1] %}
BEXPR -> EXPR {% id %}
| KK {% id %}
EXPR -> ADD {% id %}
| SUB {% id %}
| CON {% id %}
| WHL {% id %}
| ADD2 {% id %}
| SUB2 {% id %}
| CON2 {% id %}
| IF {% id %}

VAR -> [a-z] VARC {%
	d => (BigInt(val(d[0] + d[1])))
%}
VARC -> [\w]:* {% d => d[0].join("")%}

_ -> [\s]:* {% function(d) {} %}

NUM -> [0-9]:+ {% (d) => (BigInt(d[0].join(""))) %}
ADD -> VAR _ ":=" _ VAR _ "+" _ VAR {% d => addSub(0n, d)%}
ADD2 -> VAR _ ":=" _ VAR _ "+" _ NUM {% d => {
	var vl = BigInt(newval());
	return konkat(con(vl, d[8]), instr(0n, pair(d[0], pair(d[4], vl))))
}%}
SUB -> VAR _ ":=" _ VAR _ "-" _ VAR {% d => addSub(1n, d)%}
SUB2 -> VAR _ ":=" _ VAR _ "-" _ NUM {% d => {
	var vl = BigInt(newval());
	return konkat(con(vl, d[8]), instr(1n, pair(d[0], pair(d[4], vl))))
}%}
CON -> VAR _ ":=" _ NUM {% d => (con(d[0], d[4]))%}
CON2 -> VAR _ ":=" _ VAR {% d => (con2(d[0], d[4]))%}
WHL -> "while"i _ VAR _ "do"i _ BEXPR _ "od"i {%
	d => whl(d[2], d[6])
%}
KK -> EXPR _ BEXPR {%
  d => {return konkat(d[0], d[2])}
%}
IF -> "if"i _ VAR _ "then"i _ BEXPR _ "else"i _ BEXPR _ "fi"i {%
 d => ifelse(d[2], d[6], d[10])
%}

@{%
var counter = 1n;
var vars = {};
var nvar;
function nullvar() {
  if (!nvar)nvar = newval();
  return nvar;
}
function newval() {
	return counter++;
}
function con2(xi, xj) {
  return add(xi, xj, nullvar());
}
function ifelse(xi, p1, p2) {
 var temp = newval();
 var temp2 = newval();
return konkat(
     con(temp, 1n),
     konkat(
       whl(xi, konkat(
         p1,
         konkat(con2(temp2, xi),
         konkat(con(temp, 0n),
         con(xi, 0n)))
       )),
      konkat(
        con2(xi, temp2),
        whl(temp,
          konkat(
            p2,
            con(temp, 0n)
          )
        )
      )
     )
  );
}
function konkat(p1, p2) {
  return instr(4n, pair(p1, p2));
}
function con(varnum, con) {
  return instr(2n, pair(varnum, con));
}
function whl (varnum, p) {
  return instr(3n, pair(varnum, p));
}
function pair(x, y) {
	return ((x + y) * (x + y + 1n))/2n + y;
}
function instr(r, m) {
	return 5n*m + r;
}

function val(name) {
	if (vars.hasOwnProperty(name)) return vars[name];
	var nv = newval();
	vars[name] = nv;
	return nv;
}
function add(xi, x1, x2) {
	return instr(0n, 
		pair(xi, pair(x1, x2))
	)
}
function addSub(type, d) {
	return instr(type, 
		pair(d[0], pair(d[4], d[8]))
	)
}
%}