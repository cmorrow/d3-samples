const svgHeight = 400,
  svgWidth = 800,
  margin = 50,
  x0 = margin,
  y0 = svgHeight,
  x1 = svgWidth - margin * 2,
  y = svgHeight,
  xCenter = svgWidth / 2,
  topY = -(svgHeight - margin);

const el = d3.select("#vis");
var svg = d3
  .select("div#vis")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
  .classed("svg-content", true);

const svgDefs = svg.append("defs");

const gradient = svgDefs.append("linearGradient").attr("id", "gradient");
gradient.append("stop").attr("class", "stop-left").attr("offset", "0");
gradient.append("stop").attr("class", "stop-middle").attr("offset", "50%");
gradient.append("stop").attr("class", "stop-right").attr("offset", "100%");

const data = [
  { cpx: xCenter, cpy: 0 },
  { cpx: xCenter, cpy: 150 },
  { cpx: xCenter, cpy: 400 },
  { cpx: xCenter, cpy: topY },
];
const path = d3.path();

svg
  .selectAll("path")
  .data(data)
  .enter()
  .append("path")
  .classed("gradient-stroke", true)
  //   .style("fill", "none")
  .attr("d", draw);

// svg
//   .append("path")
//   .style("stroke", "red")
//   .style("fill", "none")
//   .attr("d", drawCurve(d3.path()))
//   .node();

function draw(d) {
  //   const x1 = 200;
  const y1 = 400;
  const points = [
    [x0, y0],
    [d.cpx, d.cpy],
    [x1, svgHeight],
  ];
  const path = d3.path();
  path.moveTo(x0, y0);
  path.quadraticCurveTo(...points[1], ...points[2]);
  return path;
}
// quadraticCurveTo(cpx, cpy, x, y);

function drawCurve(context) {
  context.moveTo(10, 10); // move current point to ⟨10,10⟩
  context.lineTo(100, 10); // draw straight line to ⟨100,10⟩
  context.arcTo(150, 150, 300, 10, 40); // draw an arc, the turtle ends up at ⟨194.4,108.5⟩
  context.lineTo(300, 10); // draw straight line to ⟨300,10⟩
  // etc.
  return context; // not mandatory, but will make it easier to chain operations
}
