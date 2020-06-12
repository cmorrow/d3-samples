// det data
getJson(createVis, "data/top50.json");

function createVis(json) {
  const el = d3.select("#vis").on("mousemove", positionOverlay);
  const visEl = document.getElementById("vis");
  const svgHeight = visEl.clientHeight;
  const svgWidth = visEl.clientWidth;

  const yScale = d3.scaleLinear();
  const margin = 50,
    x0 = margin,
    y0 = svgHeight,
    x1 = svgWidth - margin * 2,
    y = svgHeight,
    xCenter = svgWidth / 2,
    pathYDown = 100,
    topY = -(svgHeight - margin);

  const downTime = 1000,
    defaultTime = 2000,
    overlayXOffset = 35,
    overlayYOffset = 20;

  const data = transformData(JSON.parse(json));

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

  // set scales
  const minSale = d3.min(data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  const maxSale = d3.max(data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });

  console.log(`minSale: ${minSale}`);
  console.log(`maxSale: ${maxSale}`);
  console.log(`svgHeight: ${svgHeight}`);

  // init lines straight on bottom
  const overlay = el.select("#overlay");
  const visPaths = svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .classed("visible", true)
    .classed("gradient-stroke", true)
    .attr("d", createLine);

  const mousePaths = svg
    .selectAll("path.hidden")
    .data(data)
    .enter()
    .append("path")
    .on("mouseover", pathMouseOver)
    .on("mouseout", pathMouseOut)
    .on("click", pathClick)
    .classed("hidden", true)
    .attr("d", createLine);

  yScale.domain([maxSale, minSale]).range([topY, svgHeight]);

  // transition paths up from bottom
  visPaths.data(data).transition().duration(defaultTime).attr("d", pathIn);
  mousePaths.data(data).transition().duration(defaultTime).attr("d", pathIn);

  function update() {
    // do stuff
  }

  function pathClick(d, index) {
    visPaths.transition().duration(downTime).attr("d", pathOut);
    mousePaths.transition().duration(downTime).attr("d", pathOut);
  }

  function positionOverlay(d, i) {
    const mousePos = d3.mouse(this);
    overlay.style("left", `${mousePos[0] + overlayXOffset}px`);
    overlay.style("top", `${mousePos[1] - overlayYOffset}px`);
  }

  function pathMouseOver(d, index) {
    const pathData = d;
    overlay.classed("active", true);
    visPaths.each(function (d, i) {
      if (i === index) {
        d3.select(this).classed("hover", true).classed("muted", false);
      } else {
        d3.select(this).classed("hover", false);
      }
      overlay
        .classed("active", true)
        .select(".title")
        .html(pathData.item_description);

      const salesString = numToCurrency.format(pathData.sales_total);

      overlay.select(".number").html(salesString);
    });
  }

  function pathMouseOut(d, index) {
    console.log("mouse out");
    visPaths.classed("hover", false);
    overlay.classed("active", false);
  }

  function createLine(d) {
    //   const x1 = 200;
    const y1 = 400;
    const points = [
      [x0, y0],
      [xCenter, svgWidth],
      [x1, svgHeight],
    ];
    const path = d3.path();
    path.moveTo(x0, y0);
    path.quadraticCurveTo(...points[1], ...points[2]);
    return path;
  }

  function pathIn(d) {
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

  function pathDown(d) {
    const points = [
      [x0, y0],
      [xCenter, yScale(d.sales_total) + pathYDown],
      [x1, svgHeight],
    ];
    const path = d3.path();
    path.moveTo(x0, y0);
    path.quadraticCurveTo(...points[1], ...points[2]);
    return path;
  }

  function pathOut(d) {
    // { cpx: xCenter, cpy: 400 },
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
}

// function pathClick(d, index) {
//   visPaths.each(function (d, i) {
//     if (i === index) {
//       d3.select(this).classed("active", true);
//       d3.select(this).classed("muted", false);
//     } else {
//       d3.select(this)
//         .classed("muted", true)
//         .transition()
//         .duration(downTime)
//         .attr("d", pathDown);
//     }
//   });
//   //   d3.select(this).classed("active", true);
//   mousePaths.each(function (d, i) {
//     if (i !== index) {
//       d3.select(this).transition().duration(downTime).attr("d", pathDown);
//     }
//   });
// }

function transformData(data) {
  const newData = data.map((obj) => {
    return {
      item_description: obj.item_description,
      sales_total: Math.round(Number(obj.sales_total)),
    };
  });
  return newData;
}

const numToCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function getJson(callback, dataUrl) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", dataUrl, true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}
