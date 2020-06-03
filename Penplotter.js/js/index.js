import "./gcg.js";
import { Point } from "./classes.js";

var refs = {
  outputTA: document.getElementById("gcode-output"),
  codeTA: document.getElementById("code"),
  executeButton: document.getElementById("execute"),
  saveButton: document.getElementById("save"),
  saveSelect: document.getElementById("save-select"),
  dlButton: document.getElementById("dl"),
  dlSvg: document.getElementById("dl-svg"),
  optionContainer: document.getElementById("options")
}
var code, cmInstance, paneInstance;
var bgCol = "#e7f0c3";
var primCol = "#32afa9";
var secCol = "#ff8364";
var gSize = 500;
var border = 50;


function init(){
  code = localStorage.getItem("code");
  refs.codeTA.textContent = code;

  cmInstance = initCodeMirror();
  paneInstance = initOptions();
  cmInstance.setOption("extraKeys", {
    "Ctrl-Enter": makeCode
  });
  updateSelect();
  initEvents();
  setDefaults();
  //makeCode();
}
init();

function updateSelect() {
  var saved = localStorage.getItem("saved");
  if(saved)saved=JSON.parse(saved);
  else return;
  var options = '<option value="%DEF%">Default</option>';
  for(let key in saved){
    options += "<option value=\"" + key +  "\">" + key + "</option>";
  }
  refs.saveSelect.innerHTML = options;
}

function initEvents() {
  var unsavedChanges = false;

  refs.saveButton.addEventListener("click", function(ev) {
    var name = prompt("Save under what name?")
    if(!name)return;
    var saved = localStorage.getItem("saved");
    if(saved)saved=JSON.parse(saved);
    else saved = {};
    saved[name] = code;
    localStorage.setItem("saved", JSON.stringify(saved));
    unsavedChanges = false;
    updateSelect();
  });
  refs.saveSelect.addEventListener("change", function(e) {
    var val = e.target.value;
    e.target.value = "%DEF%";
    if(val == "%DEF%")return;
    setTimeout(() => {
      if(unsavedChanges){
        var conf = confirm("You have unsaved changes that will be lost. Continue?");
        if(!conf)return;
      }
      var code = JSON.parse(localStorage.getItem("saved"))[val];
      if(!code)return;
      cmInstance.setValue(code);

    }, 1);
  });
  refs.executeButton.addEventListener("click", makeCode);
  refs.dlButton.addEventListener("click", () => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(refs.outputTA.textContent));
    element.setAttribute('download', "code.gcode");
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  });
  refs.dlSvg.addEventListener("click", () => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(toSVG()));
    element.setAttribute('download', "svg.svg");
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  });
  cmInstance.on("change", (instance) => {
    code = instance.getValue();
    unsavedChanges = true;
    localStorage.setItem("code", instance.getValue());
  });
}
function setDefaults() {
  createCanvas(gSize + 2*border, gSize + 2*border);
  background(bgCol);
  Utils.drawGrid(10, 10, 50);
  center();
  stroke(primCol);
  noFill();
  strokeWeight(1);
}

function makeCode() {
  clear();
  ///<anonymous>:(\d+):/.exec(err.stack)
  try {
    cmInstance.getDoc().clearGutter("CodeMirror-error");
    eval(code);
  }catch(e) {
    let eLine1 = /<anonymous>:(\d+):/.exec(e.stack);
    let eLine2 = (/eval:(\d+):/).exec(e.stack);
    let eLine = eLine1 || eLine2;
    let div = document.createElement("div");
    div.classList.add("CodeMirror-error-el");
    if(eLine && eLine[1]){
      cmInstance.getDoc().setGutterMarker(parseInt(eLine[1]) - 1, "CodeMirror-error", div);
    }else{
      cmInstance.doc.setGutterMarker(cmInstance.doc.size - 1, "CodeMirror-error", div);
    }
    throw e;
  }
  finishGCode();
  var gcode = getGCode();
  refs.outputTA.textContent = gcode;
  refs.dlButton.textContent = "Download GCode(" + gcode.length + ")";
}

function initOptions() {
  var GC_DEFAULTS = {
    precision: 3,
    feed: 5000,
    swapX: true,
    liftAmount: 3,
    initialWaitTime: 3,
    drawHeight: 0,
    penLiftHeight: 2,
    center: [88.7, 70.9],
    buildArea: [130, 130, 300]
  }
  var other = {
    center: {x : 88.7, y: 70.9},
    drawX: 130,
    drawY: 130
  };
  var saveOptions;

  var savedOpts = localStorage.getItem("params");
  const GC_PARAMS = Object.assign({}, GC_DEFAULTS, savedOpts ? JSON.parse(savedOpts) : undefined);
  //Necessary hack for nonsupported properties
  other.center = new Point(GC_PARAMS.center[0], GC_PARAMS.center[1]);
  other.drawX = (GC_PARAMS.buildArea[0]);
  other.drawY = (GC_PARAMS.buildArea[1]);
  
  const pane = new Tweakpane({container: refs.optionContainer});
  pane.addInput(other, "center", {
    label: "Center"
  }).on("change", (val) => {
    GC_PARAMS.center[0] = val.x;
    GC_PARAMS.center[1] = val.y;
    saveOptions();
  });
  pane.addInput(other, "drawX", {
    label: "Draw Area Size [X] (mm)"
  }).on("change", (val) => {
    GC_PARAMS.buildArea[0] = val;
    saveOptions();
  });
  pane.addInput(other, "drawY", {
    label: "Draw Area Size [Y] (mm)"
  }).on("change", (val) => {
    GC_PARAMS.buildArea[1] = val;
    saveOptions();
  });
  pane.addSeparator();
  pane.addInput(GC_PARAMS, 'precision', {
    step: 1,
    label: 'Decimal Precision',
    min: 1,
    max: 20
  });
  pane.addInput(GC_PARAMS, 'drawHeight', {
    step: 0.1,
    min: 0,
    max: 100,
    label: "Draw Height (mm)"
  });
  pane.addInput(GC_PARAMS, 'initialWaitTime', {
    step: 1,
    min: 0,
    max: 30,
    label: "Initial Wait Time (s)"
  });
  pane.addInput(GC_PARAMS, 'swapX', {label:"Swap X Axis ?"});
  pane.addInput(GC_PARAMS, 'penLiftHeight', {
    min: 0,
    max: 100,
    step: 0.1,
    label: "Pen Lift Height (mm)"
  });
  pane.addInput(GC_PARAMS, 'feed', {
    min: 100,
    step: 100,
    max: 20000,
    label: "Draw Speed"
  });
  
  saveOptions = () => {
    setGCodeOptions(GC_PARAMS);
    localStorage.setItem("params", JSON.stringify(GC_PARAMS));
    //makeCode();
  };
  pane.on("change", saveOptions);
  const btn = pane.addButton({
    title: 'Defaults',
  }).on('click', (value) => {
    Object.assign(GC_PARAMS, GC_DEFAULTS);
    pane.refresh();
  });
  return pane;
}

function initCodeMirror(){
  var CM = CodeMirror(function(elt) {
    refs.codeTA.parentNode.replaceChild(elt, refs.codeTA);
  }, {
    value: refs.codeTA.value,
    lineNumbers: true,
    mode: 'javascript',
    lint: {
      esversion: 6,
      laxcomma: true
    },
    theme: 'ayu-mirage',
    autoCloseBrackets: true,
    lineWrapping: true,
    foldGutter: true,
    tabSize: 2,
    gutters: ["CodeMirror-foldgutter", "CodeMirror-error", "CodeMirror-linenumbers"],
    matchBrackets: true
  });
  return CM;
}