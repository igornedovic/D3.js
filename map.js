var width = 1000;
var height = 1000;
var canvas = d3
  .select(".canvas")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json("serbia.json", function (data) {
  var group = canvas.selectAll("g").data(data.features).enter().append("g");

  var projection = d3.geo
    .mercator()
    .center([20.75, 43.85])
    .scale(8500)
    .translate([width / 2, height / 2]);
  var path = d3.geo.path().projection(projection);

  var areas = group
    .append("path")
    .attr("d", path)
    .attr("class", "area")
    .attr("fill", "steelblue")
    .on("mouseover", function (d, i) {
      d3.select(this).transition().duration("50").attr("fill", "yellow");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).transition().duration("50").attr("fill", "steelblue");
    });

  group
    .append("text")
    .attr("x", function (d) {
      return path.centroid(d)[0];
    })
    .attr("y", function (d) {
      return path.centroid(d)[1];
    })
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.properties.name;
    });
});
