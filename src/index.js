import "./styles/styles.scss";

import * as utils from "./js/utils";
import arcs from "./js/arcs";

// det data
utils.getJson(init, "data/top50.json");

function init(json) {
  const data = utils.transformData(JSON.parse(json));
  arcs(data);
}
