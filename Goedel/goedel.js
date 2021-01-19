// Generated automatically by nearley, version 2.19.9
// http://github.com/Hardmath123/nearley
var grammar = (function () {
function id(x) { return x[0]; }

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
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "OUT", "symbols": ["_", "BEXPR", "_"], "postprocess": d => d[1]},
    {"name": "BEXPR", "symbols": ["EXPR"], "postprocess": id},
    {"name": "BEXPR", "symbols": ["KK"], "postprocess": id},
    {"name": "EXPR", "symbols": ["ADD"], "postprocess": id},
    {"name": "EXPR", "symbols": ["SUB"], "postprocess": id},
    {"name": "EXPR", "symbols": ["CON"], "postprocess": id},
    {"name": "EXPR", "symbols": ["WHL"], "postprocess": id},
    {"name": "EXPR", "symbols": ["ADD2"], "postprocess": id},
    {"name": "EXPR", "symbols": ["SUB2"], "postprocess": id},
    {"name": "EXPR", "symbols": ["CON2"], "postprocess": id},
    {"name": "EXPR", "symbols": ["IF"], "postprocess": id},
    {"name": "ASSIGN$string$1", "symbols": [{"literal":":"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ASSIGN", "symbols": ["ASSIGN$string$1"]},
    {"name": "ASSIGN", "symbols": [{"literal":"≔"}]},
    {"name": "VAR", "symbols": [/[a-z]/, "VARC"], "postprocess": 
        d => (BigInt(val(d[0] + d[1])))
        },
    {"name": "VARNOTNULL", "symbols": ["VAR"], "postprocess": id},
    {"name": "VARNOTNULL", "symbols": ["VAR", "_", {"literal":"≠"}, "_", {"literal":"0"}], "postprocess": d => d[0]},
    {"name": "VARNOTNULL$string$1", "symbols": [{"literal":"="}, {"literal":"!"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VARNOTNULL", "symbols": ["VAR", "_", "VARNOTNULL$string$1", "_", {"literal":"0"}], "postprocess": d => d[0]},
    {"name": "VARNOTNULL$string$2", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VARNOTNULL", "symbols": ["VAR", "_", "VARNOTNULL$string$2", "_", {"literal":"0"}], "postprocess": d => d[0]},
    {"name": "VARNOTNULL$string$3", "symbols": [{"literal":"<"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VARNOTNULL", "symbols": ["VAR", "_", "VARNOTNULL$string$3", "_", {"literal":"0"}], "postprocess": d => d[0]},
    {"name": "VARC$ebnf$1", "symbols": []},
    {"name": "VARC$ebnf$1", "symbols": ["VARC$ebnf$1", /[\w]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "VARC", "symbols": ["VARC$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {}},
    {"name": "NUM$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "NUM$ebnf$1", "symbols": ["NUM$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NUM", "symbols": ["NUM$ebnf$1"], "postprocess": (d) => (BigInt(d[0].join("")))},
    {"name": "ADD", "symbols": ["VAR", "_", "ASSIGN", "_", "VAR", "_", {"literal":"+"}, "_", "VAR"], "postprocess": d => addSub(0n, d)},
    {"name": "ADD2", "symbols": ["VAR", "_", "ASSIGN", "_", "VAR", "_", {"literal":"+"}, "_", "NUM"], "postprocess":  d => {
        	var vl = BigInt(newval());
        	return konkat(con(vl, d[8]), instr(0n, pair(d[0], pair(d[4], vl))))
        }},
    {"name": "SUB", "symbols": ["VAR", "_", "ASSIGN", "_", "VAR", "_", {"literal":"-"}, "_", "VAR"], "postprocess": d => addSub(1n, d)},
    {"name": "SUB2", "symbols": ["VAR", "_", "ASSIGN", "_", "VAR", "_", {"literal":"-"}, "_", "NUM"], "postprocess":  d => {
        	var vl = BigInt(newval());
        	return konkat(con(vl, d[8]), instr(1n, pair(d[0], pair(d[4], vl))))
        }},
    {"name": "CON", "symbols": ["VAR", "_", "ASSIGN", "_", "NUM"], "postprocess": d => (con(d[0], d[4]))},
    {"name": "CON2", "symbols": ["VAR", "_", "ASSIGN", "_", "VAR"], "postprocess": d => (con2(d[0], d[4]))},
    {"name": "WHL$subexpression$1", "symbols": [/[wW]/, /[hH]/, /[iI]/, /[lL]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "WHL$subexpression$2", "symbols": [/[dD]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "WHL$subexpression$3", "symbols": [/[oO]/, /[dD]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "WHL", "symbols": ["WHL$subexpression$1", "_", "VARNOTNULL", "_", "WHL$subexpression$2", "_", "BEXPR", "_", "WHL$subexpression$3"], "postprocess": 
        d => whl(d[2], d[6])
        },
    {"name": "KK", "symbols": ["EXPR", "_", "BEXPR"], "postprocess": 
        d => {return konkat(d[0], d[2])}
        },
    {"name": "IF$subexpression$1", "symbols": [/[iI]/, /[fF]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "IF$subexpression$2", "symbols": [/[tT]/, /[hH]/, /[eE]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "IF$subexpression$3", "symbols": [/[eE]/, /[lL]/, /[sS]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "IF$subexpression$4", "symbols": [/[fF]/, /[iI]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "IF", "symbols": ["IF$subexpression$1", "_", "VARNOTNULL", "_", "IF$subexpression$2", "_", "BEXPR", "_", "IF$subexpression$3", "_", "BEXPR", "_", "IF$subexpression$4"], "postprocess": 
        d => ifelse(d[2], d[6], d[10])
        }
]
  , ParserStart: "OUT"
}
return grammar;
});