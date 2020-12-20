# How to use
Just input your code into the editor on the right and execute it with `Execute` or pressing `CTRL + Enter`. This generates the SVG / GCode. If you reload the page your code will stay (it is saved locally) and loaded automatically. The `Save` button makes it possible to save multiple scripts for later use. You can load them by using the `Load Saved` select below. There are also some GCode-related options you can change in the bottom right. To **debug your script** you should use your browser console (try `F12` for Chromium based browsers and `CTRL+K` for Firefox)

To download your GCode use the `Download as file` button. This tool always makes it so that the entire drawing is centered and scaled down on the build plate / draw area (you need to set options `Draw Area` and `Center` for this to work). The option `Center` should always be were your **pen** is centered. If you use a 3d printer as a plotter most likely your build volume and draw area will differ, because your pen will most likely not be were you nozzle sits.

A thing to note is that **everything will be clipped to the drawing box**.



# API

The API of this tool was originally inspired by P5.js (initially I wanted to use exactly the same API). But while doing development I noticed that the syntax is a bit too simplistic for these purposes. So now the class-style and p5-style expressions coexist happily.

## Classes
### Point
Most of the methods listed here are chainable
 - `constructor (x, y)`
   - As this class is used a lot in this tool, there is an alternative shorter constructor: `new Point (x, y)` is the same as `P(x, y)`. Note that the `new` keyword is missing in the second way
 - `property: x` X coordinate
 - `property: y` Y coordinate
 - `add (Point b)`
   - Adds the coordinates of Point b to the current Point (like vector addition)
 - `sub (Point b)`
   - Subtracts the coordinates of Point b from the current Point (like vector subtraction)
 - `mult (factor)`
   - Multiplies the coordinates of the current Point by `factor`
 - `rotate (angle [degrees])`
   - Rotates the current Point by `angle` around origin (like vector rotation)
 - `normalise ()`
   - Divides the current Point by it's length (vector normalisation)
 - `len ()`
   - Returns the distance to the origin
 - `len ()`
   - Returns the distance to the origin squared
 - `dist (Point b)`
   - Returns the distance to Point `b`
 - `dist2 (Point b)`
   - Returns the squared distance to Point `b`
 - `isEqual (Point b)`
   - Returns true if the coordinates of the current Point are equal to those of Point `b`
 - `clone ()`
   - Returns a clone of the current Point


### Polygon
 - `property: points`
   - An array of Points representing the vertices of the Polygon
 - `constructor (Array [Point])`
   - Accepts an array of points in the Format `Point`, or `[x, y]`
 - `toPointArray ()`
   - Returns the polygon as an array of points in the format `[x, y]`. Mostly used internally
 - `draw ()`
   - Draws the polygon with the current settings
 - `hatch (density = 4, angle [degrees] = 0)`
   - Hatches the polygon with lines (current settings) with distance `density` to each other and `angle`
 - `union (Polygon b)`
   - Returns a new Polygon which is the union of the current Polygon and Polygon `b`
 - `diff (Polygon b)`
   - Returns a new Polygon which contains the current Polygon minus Polygon `b` (Returns an array of polygons if the results has multiple unconnected regions)
 - `intersect (Polygon b)`
   - Returns a new Polygon which is the intersection of the current Polygon and Polygon `b` (Returns an array of polygons if the results has multiple unconnected regions)
 - `containsPoint (Point p)`
   - Tests and returns whether Point p is contained in the polygon. Points lying on the edges are thought of as being in the polygon
 - `clipLine (Point from, Point to)`
   - Returns an array of Line objects clipped by the polygon
 - `diff (Polygon b)`
   - Returns a new Polygon which is the current Polygon minus Polygon `b`
 - `forEachLine (Function func)`
   - Executes a function `func` for each of the individual lines in the Polygon with the arguments `(Point p1, Point p2)`
 - `clone ()`
   - Returns a clone of the current Polygon

## Main Functions
All of these functions exist on the global scope.
Unless disabled explicitly, all of them (that draw something) also add to the SVG Output.
Every function that takes a point as an argument has also the following alternative formats.
```
line(new Point(0, 0), new Point(10, 10)) == line([0, 0], [10, 10]) == line(0, 0, 10, 10)
```
Similarly, if a function takes a polygon as an argument, you can either pass in a `Polygon` instance or an array of `Points`
 - `setDefaults ()`
   - It is recommended to always run this function at the start of every script. It sets some default parameters. It is equivalent to the following code:
  ```
    createCanvas(600, 600);
    background("#e7f0c3");
    Utils.drawGrid();
    stroke("#32afa9");
    noFill();
    strokeWeight(1);
    center();
  ```
 - `use (src)`
   - Loads a script tag into global scope with src `src`
 - `createCanvas (width, height)`
   - Initialises the canvas and sets its dimension
 - `center ()`
   - Centers the canvas, so that it's origin lies in the center. Equivalent to `translate(width / 2, height / 2)` (meaning you shouldn't use this method twice)
 - `clear ()`
   - Clears the canvas and GCode output
 - `background (color)`
   - Sets the background color
 - `stroke (color)`
   - Sets the stroke color
 - `getStroke ()`
   - Returns the stroke color
 - `strokeWeight (color)`
   - Sets the stroke weight (default: 1)
 - `fill (color)`
   - Sets the fill color
 - `noFill ()`
   - Disables fill (default)
 - `circle (Point center, radius)`
   - Draws a circle with `radius` around `center`
 - `arc (Point center, radius, startAngle [degrees] = 0, endAngle [degrees] = 360`
   - Draws an arc with `radius` around `center`, starting at `startAngle` and ending at `endAngle`. Returns an array of Points which was used to draw the arc
 - `line (Point p1, Point p2, addToGCode = true)`
   - Draws a line from `p1` to `p2`
 - `rect (Point p1, Point p2)`
   - Draws a rectangle with top left corner `p1` and bottom right corner `p2`
 - `polygon (Polygon p)`
   - Draws the polygon `p`. Equivalent to `p.draw()`
 - `hatchPolygon (Polygon p, density, angle [degrees])`
   - Hatches the polygon `p`. Equivalent to `p.hatch(density, angle)`
 - `resetMatrix ()`
   - Resets the transformation matrix. This also reverses `center()`
 - `rotate (angle [degrees])`
   - Rotates the canvas by `angle` (for all future calls of line, circle, etc.)
 - `translate (x, y)`
   - Translates the canvas by `x` and `y` (for all future calls of line, circle, etc.)
 - `scale (scaleX, scaleY)`
   - Scales the canvas by `scaleX` in x direction and `scaleY` in y direction
 - `reverseTF(Point p)`
   - Reverses the transformation so that [0, 0] would always be the top left corner. Mostly used internally. Can only take a Point object as an argument (as opposed to array / argument form);
 - `toSVG ()`
   - Returns the SVG output as a string
 - `setGCodeOptions (Object options)`
   - Sets options for the GCode generation. It is not recommended to use this function directly. Use the provided user interface instead.

There is also the following set of functions which exist as helper functions on the global scope
 - `sin / cos / tan (angle [degrees])`
   - Returns the sine / cosine / tangens of `angle` in degrees
 - `random ()`
   - Returns a random number between 0 and 1
 - `random (max)`
   - Returns a random integer between 0 (inclusively) and max (exclusively)
 - `random (min, max)`
   - Returns a random integer between min (inclusively) and max (exclusively)
 - `midpoint (Point p1, Point p2)` (alias `mp`)
   - Returns the midpoint between p1 and p2

### Utils
Some functions are kept under this namespace. They are mostly smaller functions. There is also the alias `U` instead of `Utils`.
 - `Utils.makeNGON (Point center, n = 6, size = 200, offset [degrees] = 0)`
   - Returns a regular `n`-gon centered around `center`, with a radius of `size` (distance from center to each point), and is rotated by `offset` degrees.
 - `Utils.makeGrid (divisionsX = 10, divisionsY = 10, border = 50, color = "rgba(0, 0, 0, 0.2)", addToGCode = false)`
   - Draws a grid with `divisionsX` divisions in X direction and `divisionsY` divisions in Y direction. It's offset by `border` from each side. This grid by default is not added to the GCode.
