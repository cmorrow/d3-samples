import * as utils from "./utils";
import * as path from "./path";

const view = {
  data: {},
  currentView: "arcs",
  minSale: 0,
  maxSale: 0,
  listView: null,
  overlay: null,
  viewLinks: null,
};

const arcs = {
  svg: null,
  visPaths: null,
  mousePaths: null,
  svgHeight: 0,
  svgWidth: 0,
  margin: 50,
  pathYDown: 100,
  downTime: 1000,
  defaultTime: 2000,
  overlayXOffset: 35,
  overlayYOffset: 20,
  get topY() {
    return -(this.svgHeight - this.margin);
  },
  get xCenter() {
    return this.svgWidth / 2;
  },
  get x0() {
    return this.margin;
  },
  get x1() {
    return this.svgWidth - this.margin * 2;
  },
  get y0() {
    return (this.y = this.svgHeight);
  },
};

export default function init(data) {
  // init static values
  view.viewLinks = d3.select("#views").selectAll("a").on("click", navClick);
  view.visElement = d3.select("#vis").on("mousemove", positionOverlay);
  view.listView = d3.select("#listView");
  view.overlay = view.visElement.select("#overlay");
  view.yScale = d3.scaleLinear();
  view.xScale = d3.scaleLinear();

  view.data = data;
  // set scales
  view.minSale = d3.min(view.data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  view.maxSale = d3.max(view.data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  // build arc vis
  buildArcs();

  window.onresize = function () {
    if (view.currentView === "arcs") {
      buildArcs(true);
    }
  };
}

// private functions
function buildArcs(reset) {
  // update dimensions
  updateDimensions();

  if (reset) {
    arcs.svg.remove();
  }
  view.listView.classed("none", true);
  view.overlay.classed("none", false);
  view.listItem = view.listView.selectAll(".item");

  arcs.svg = d3
    .select("div#vis")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .classed("svg-content", true);

  const svgDefs = arcs.svg.append("defs");

  const gradient = svgDefs.append("linearGradient").attr("id", "gradient");
  gradient.append("stop").attr("class", "stop-left").attr("offset", "0");
  gradient.append("stop").attr("class", "stop-middle").attr("offset", "50%");
  gradient.append("stop").attr("class", "stop-right").attr("offset", "100%");

  // visible lines
  arcs.visPaths = arcs.svg
    .selectAll("path")
    .data(view.data)
    .enter()
    .append("path")
    .classed("visible", true)
    .classed("gradient-stroke", true)
    .attr("d", path.createQuad(arcs));

  // transparent lines for mouse hover
  arcs.mousePaths = arcs.svg
    .selectAll("path.hidden")
    .data(view.data)
    .enter()
    .append("path")
    .on("mouseover", pathMouseOver)
    .on("mouseout", pathMouseOut)
    .on("click", pathClick)
    .classed("hidden", true)
    .attr("d", path.createQuad(arcs));

  updateArcs();
}

async function updateArcs() {
  updateDimensions();
  arcs.pathParams = {
    x0: arcs.x0,
    x1: arcs.x1,
    y0: arcs.y0,
    svgHeight: arcs.svgHeight,
    svgWidth: arcs.svgWidth,
    xCenter: arcs.xCenter,
    yScale: view.yScale,
  };
  arcs.svg.style("opacity", 0).transition().duration(1000).style("opacity", 1);

  // set scales
  view.minSale = d3.min(view.data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });
  view.maxSale = d3.max(view.data, (d) => {
    const num = Number(d.sales_total);
    return num;
  });

  arcs.svg.attr("viewBox", `0 0 ${arcs.svgWidth} ${arcs.svgHeight}`);
  view.overlay.classed("none", false).classed("active", false);

  view.yScale
    .domain([view.maxSale, view.minSale])
    .range([arcs.topY, arcs.svgHeight]);

  // transition paths up from bottom
  arcs.mousePaths
    .transition()
    .duration(arcs.defaultTime)
    .ease(d3.easeBack)
    .attr("d", (d) => path.pathIn(d, arcs.pathParams));
  await arcs.visPaths
    .transition()
    .duration(arcs.defaultTime)
    .ease(d3.easeBack)
    .attr("d", (d) => path.pathIn(d, arcs.pathParams));
}

function updateDimensions() {
  const visEl = view.visElement.nodes()[0];
  arcs.svgHeight = visEl.clientHeight;
  arcs.svgWidth = visEl.clientWidth;
}

function buildList() {
  view.listView.classed("none", false);
  let row, item;
  let list = view.listView.selectAll("div.item");
  view.xScale.domain([view.minSale, view.maxSale]).range([0, 100]);
  view.listView.classed("none", false);
  // enter
  if (list.nodes().length === 0) {
    list = d3.select("#listView .items").selectAll("div.item").data(view.data);
    item = list.enter().append("div").classed("item", true);
    row = item.append("div").classed("row", true);

    row
      .append("div")
      .classed("col title", true)
      .html((d) => d.item_description);

    row
      .append("div")
      .classed("col sales", true)
      .html((d) => utils.numToCurrency.format(d.sales_total));

    item
      .append("div")
      .classed("bar-bg", true)
      .append("div")
      .classed("bar", true)
      .style("width", "0")
      .transition()
      .duration(arcs.defaultTime)
      .style("width", (d) => `${view.xScale(d.sales_total)}%`);
  }

  // update
  item = d3.select("#listView").selectAll(".item");
  row = item.select(".row");

  row
    .style("opacity", 0)
    .transition()
    .duration(arcs.defaultTime)
    .style("opacity", 1);

  item
    .select(".bar-bg")
    .style("opacity", 0)
    .transition()
    .duration(arcs.defaultTime)
    .style("opacity", 1);

  item
    .select(".bar")
    .style("width", "0")
    .transition()
    .duration(arcs.defaultTime)
    .style("width", (d) => `${view.xScale(d.sales_total)}%`);

  // update
}

// view transitions
function viewChange() {
  updateNav();
  if (view.currentView == "list") {
    showListView();
  } else {
    showArcView();
  }
}

function updateNav() {
  // view.viewLinks.classed("active", false);
  view.viewLinks.each(function (d, i) {
    const el = d3.select(this);
    el.classed("active", () => el.attr("rel") === view.currentView);
  });
}

async function showArcView() {
  arcs.svg.style("opacity", 0);
  // transition list view out
  await listViewOut();
  updateArcs();
}

async function showListView() {
  view.viewLinks.select(".arcs").classed("active", false);
  view.viewLinks.select(".list").classed("active", true);
  arcs.svg.transition().duration(1000).style("opacity", 0);
  arcs.mousePaths
    .transition()
    .duration(arcs.downTime)
    .attr("d", (d) => path.pathOut(d, arcs.pathParams));
  await arcs.visPaths
    .transition()
    .duration(arcs.downTime)
    .attr("d", (d) => path.pathOut(d, arcs.pathParams))
    .end();
  view.overlay.classed("none", true);
  buildList();
}

async function listViewOut() {
  const items = view.listView.selectAll("div.item");

  const textFade = items
    .select(".row")
    .style("opacity", 1)
    .transition()
    .duration(arcs.defaultTime)
    .style("opacity", 0)
    .end();

  const barWidth = items
    .select(".bar")
    .transition()
    .duration(arcs.defaultTime)
    .style("width", "0%")
    .end();

  const bgFade = items
    .select(".bar-bg")
    .style("opacity", 1)
    .transition()
    .duration(arcs.defaultTime)
    .style("opacity", 0)
    .end();

  await Promise.all([textFade, barWidth, bgFade]);
  view.listView.classed("none", true);
}

// mouse events
function navClick() {
  d3.event.preventDefault;
  const viewLinks = d3.select("#views").selectAll("a");
  view.currentView = this.getAttribute("rel");
  viewLinks.classed("active", () => {
    console.log(this.getAttribute("rel"));
    return this.getAttribute("rel") === view.currentView;
  });
  viewChange();
}

function pathClick() {
  view.currentView = "list";
  viewChange();
}

function pathMouseOver(d, index) {
  const pathData = d;
  view.overlay.classed("active", true);
  arcs.visPaths.each(function (d, i) {
    if (i === index) {
      d3.select(this).classed("hover", true).classed("muted", false);
    } else {
      d3.select(this).classed("hover", false);
    }
    view.overlay
      .classed("active", true)
      .select(".title")
      .html(pathData.item_description);

    const salesString = utils.numToCurrency.format(pathData.sales_total);

    view.overlay.select(".number").html(salesString);
  });
}

function pathMouseOut(d, index) {
  arcs.visPaths.classed("hover", false);
  view.overlay.classed("active", false);
}

function positionOverlay(d, i) {
  const mousePos = d3.mouse(this);
  view.overlay.style("left", `${mousePos[0] + arcs.overlayXOffset}px`);
  view.overlay.style("top", `${mousePos[1] - arcs.overlayYOffset}px`);
}
