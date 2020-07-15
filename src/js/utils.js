function getJson(callback, dataUrl) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", dataUrl, true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState === XMLHttpRequest.DONE) {
      if (xobj.status == 200) {
        callback(xobj.responseText);
      } else {
        alert("Error loading data.");
      }
    }
  };
  xobj.send(null);
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

export { getJson, transformData };
