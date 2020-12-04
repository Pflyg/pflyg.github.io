const nearley = require("nearley");
const grammar = require("./goedel.js");

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Parse something!
parser.feed("if x then a := 0 else a:=1 fi");

// parser.results is an array of possible parsings.
console.log(parser.results); // [[[[ "foo" ],"\n" ]]]
/*

return grammar;
});

//*/
