import "./styles/styles.scss";

import * as paths from "./js/paths";

const visEl = document.getElementById("vis");
let svgHeight = visEl.clientHeight;
let svgWidth = visEl.clientWidth;
let data, minSale, maxSale, currentView;

// arc selections
let svg, visPaths, mousePaths;
// list selections
const listView = d3.select("#listView");
let list, item;

const margin = 50,
  x0 = margin,
  pathYDown = 100,
  downTime = 1000,
  defaultTime = 2000,
  overlayXOffset = 35,
  overlayYOffset = 20;

const numToCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

// updated dimensions
let y0 = svgHeight,
  x1 = svgWidth - margin * 2,
  y = svgHeight,
  xCenter = svgWidth / 2,
  topY = -(svgHeight - margin);

const el = d3.select("#vis").on("mousemove", positionOverlay);
const overlay = el.select("#overlay");
const yScale = d3.scaleLinear();
const xScale = d3.scaleLinear();

// det data
getJson(init, "data/top50.json");
const viewLinks = d3.select("#views").selectAll("a").on("click", viewChange);

function init(json) {
  data = transformData(JSON.parse(json));
  // set scales
  minSale = d3.min(data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  maxSale = d3.max(data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  // build arc vis
  buildArcs();

  window.onresize = function () {
    if (currentView === "arcs") {
      buildArcs(true);
    }
  };
}

function viewChange() {
  d3.event.preventDefault;
  viewLinks.classed("active", false);
  this.classList.toggle("active");
  if (this.getAttribute("rel") == "list") {
    currentView = "list";
    showListView();
  } else {
    currentView = "arcs";
    showArcView();
  }
}

async function showArcView() {
  const item = listView.selectAll(".item");
  svg.style("opacity", 0);
  item
    .select(".row")
    .style("opacity", 1)
    .transition()
    .duration(defaultTime)
    .style("opacity", 0);

  item.select(".bar").transition().duration(defaultTime).style("width", "0%");

  await item
    .select(".bar-bg")
    .style("opacity", 1)
    .transition()
    .duration(defaultTime)
    .style("opacity", 0)
    .end();

  listView.classed("none", true);

  updateArcs();
}

async function showListView() {
  const viewLinks = d3.select("#views");
  viewLinks.select(".arcs").classed("active", false);
  viewLinks.select(".list").classed("active", true);
  svg.transition().duration(1000).style("opacity", 0);
  mousePaths.transition().duration(downTime).attr("d", pathOut);
  await visPaths.transition().duration(downTime).attr("d", pathOut).end();
  overlay.classed("none", true);
  buildList(data);
}

function buildArcs(reset) {
  if (reset) {
    d3.select("svg").remove();
  }
  listView.classed("none", true);
  overlay.classed("none", false);

  svg = d3
    .select("div#vis")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .classed("svg-content", true);

  const svgDefs = svg.append("defs");

  const gradient = svgDefs.append("linearGradient").attr("id", "gradient");
  gradient.append("stop").attr("class", "stop-left").attr("offset", "0");
  gradient.append("stop").attr("class", "stop-middle").attr("offset", "50%");
  gradient.append("stop").attr("class", "stop-right").attr("offset", "100%");

  // init lines straight on bottom
  const options = {
    x0,
    x1,
    y0,
    xCenter,
    svgWidth,
    svgHeight,
  };

  const points = [
    [x0, y0],
    [xCenter, svgWidth],
    [x1, svgHeight],
  ];

  visPaths = svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .classed("visible", true)
    .classed("gradient-stroke", true)
    .attr("d", paths.createQuad(options));

  mousePaths = svg
    .selectAll("path.hidden")
    .data(data)
    .enter()
    .append("path")
    .on("mouseover", pathMouseOver)
    .on("mouseout", pathMouseOut)
    .on("click", pathClick)
    .classed("hidden", true)
    .attr("d", paths.createQuad(options));

  updateArcs();
}

async function updateArcs() {
  svg.style("opacity", 0).transition().duration(1000).style("opacity", 1);
  (y0 = svgHeight),
    (x1 = svgWidth - margin * 2),
    (y = svgHeight),
    (xCenter = svgWidth / 2),
    (topY = -(svgHeight - margin));
  // set scales
  minSale = d3.min(data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  maxSale = d3.max(data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });

  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  overlay.classed("none", false).classed("active", false);

  yScale.domain([maxSale, minSale]).range([topY, svgHeight]);

  // transition paths up from bottom
  mousePaths
    .transition()
    .duration(defaultTime)
    .ease(d3.easeBack)
    .attr("d", pathIn);
  await visPaths
    .transition()
    .duration(defaultTime)
    .ease(d3.easeBack)
    .attr("d", pathIn);
}

function buildList(data) {
  listView.classed("none", false);
  let row, item;
  let list = d3.select("#listView .items").selectAll("div.item");
  xScale.domain([minSale, maxSale]).range([0, 100]);
  listView.classed("none", false);
  // enter
  if (list.nodes().length === 0) {
    list = d3.select("#listView .items").selectAll("div.item").data(data);
    item = list.enter().append("div").classed("item", true);
    row = item.append("div").classed("row", true);

    row
      .append("div")
      .classed("col title", true)
      .html((d) => d.item_description);

    row
      .append("div")
      .classed("col sales", true)
      .html((d) => numToCurrency.format(d.sales_total));

    item
      .append("div")
      .classed("bar-bg", true)
      .append("div")
      .classed("bar", true)
      .style("width", "0")
      .transition()
      .duration(defaultTime)
      .style("width", (d) => `${xScale(d.sales_total)}%`);
  }

  // update
  item = d3.select("#listView").selectAll(".item");
  row = item.select(".row");

  row
    .style("opacity", 0)
    .transition()
    .duration(defaultTime)
    .style("opacity", 1);

  item
    .select(".bar-bg")
    .style("opacity", 0)
    .transition()
    .duration(defaultTime)
    .style("opacity", 1);

  item
    .select(".bar")
    .style("width", "0")
    .transition()
    .duration(defaultTime)
    .style("width", (d) => `${xScale(d.sales_total)}%`);

  // update
}
// end buildList

function pathClick() {
  showListView();
}

function pathMouseOver(d, index) {
  console.log("pathMouseOver");
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
  visPaths.classed("hover", false);
  overlay.classed("active", false);
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

function positionOverlay(d, i) {
  const mousePos = d3.mouse(this);
  overlay.style("left", `${mousePos[0] + overlayXOffset}px`);
  overlay.style("top", `${mousePos[1] - overlayYOffset}px`);
}

function transformData(data) {
  const newData = data.map((obj) => {
    return {
      item_description: obj.item_description,
      sales_total: Math.round(Number(obj.sales_total)),
    };
  });
  return newData;
}

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
