function createQuad(params) {
  const { x0, x1, y0, xCenter, svgWidth, svgHeight } = params;
  const points = [
    [x0, y0],
    [xCenter, svgWidth],
    [x1, svgHeight],
  ];
  const path = d3.path();
  path.moveTo(x0, y0);
  var quart = svgWidth / 4;

  path.quadraticCurveTo(...points[1], ...points[2]);
  return path;
}

function pathIn(d, params) {
  const { x0, x1, y0, xCenter, svgHeight, yScale } = params;
  const points = [
    [x0, y0],
    [xCenter, yScale(d.sales_total)],
    [x1, svgHeight],
  ];
  const path = d3.path();
  path.moveTo(x0, y0);
  path.quadraticCurveTo(...points[1], ...points[2]);
  return path;
}

function pathOut(d, params) {
  const { x0, x1, y0, xCenter, svgHeight } = params;
  const points = [
    [x0, y0],
    [xCenter, svgHeight],
    [x1, svgHeight],
  ];
  const path = d3.path();
  path.moveTo(x0, y0);
  path.quadraticCurveTo(...points[1], ...points[2]);
  return path;
}

export { createQuad, pathIn, pathOut };
