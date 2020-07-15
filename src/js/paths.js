// create line; bellCurve
function createQuad(options) {
  const { x0, x1, y0, xCenter, svgWidth, svgHeight } = options;
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

export { createQuad };
