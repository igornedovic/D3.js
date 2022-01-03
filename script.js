var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50,
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var series = ["Actual", "Ideal"];
// Calculate the color based on the number of series
var color = d3.scale.category10();
color.domain(series);
// A formatter for counts.
var formatCount = d3.format(",.0f");
// calculations for plotting ideal/normal distribution curve
var numBuckets = 20;
var numberOfDataPoints = 1000;
var mean = 20;
var stdDeviation = 5;
// Generate a 1000 data points using normal distribution with mean=20, deviation=5
var normalDistributionFunction = d3.random.normal(mean, stdDeviation);
var actualData = d3.range(numberOfDataPoints).map(normalDistributionFunction);
var sum = d3.sum(actualData);
var probability = 1 / numberOfDataPoints;
var variance = sum * probability * (1 - probability);
var idealData = getProbabilityData(actualData, mean, variance);
var max = d3.max(actualData);
var min = d3.min(actualData);
// x axis scaler function
var x = d3.scale.linear().range([0, width]).domain([min, max]);
// Generate a histogram using twenty uniformly-spaced bins.
var dataBar = d3.layout.histogram().bins(numBuckets)(actualData);
var yMax = d3.max(dataBar, function (d) {
  return d.length;
});
var y = d3.scale.linear().domain([0, yMax]).range([height, 0]);
var xAxis = d3.svg.axis().scale(x).ticks(10).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
// normalized X Axis scaler function
var xNormal = d3.scale
  .linear()
  .range([0, width])
  .domain(
    d3.extent(idealData, function (d) {
      return d.q;
    })
  );
// normalized Y Axis scaler function
var yNormal = d3.scale
  .linear()
  .range([height, 0])
  .domain(
    d3.extent(idealData, function (d) {
      return d.p;
    })
  );
// line plot function
var linePlot = d3.svg
  .line()
  .x(function (d) {
    return xNormal(d.q);
  })
  .y(function (d) {
    return yNormal(d.p);
  });
// Attach to body
var svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.bottom + ")")
// draw histogram bars
var bar = svg
  .selectAll(".bar")
  .data(dataBar)
  .enter()
  .append("g")
  .attr("class", "bar")
  .attr("transform", function (d) {
    return "translate(" + x(d.x) + "," + y(d.y) + ")";
  });
bar
  .append("rect")
  .attr("x", 1)
  .attr("width", function (d) {
    return x(d.dx) - x(0) <= 0 ? 0 : x(d.dx) - x(0) - 1;
  })
  .attr("height", function (d) {
    return height - y(d.y);
  })
  .attr("fill", function () {
    return color(series[0]);
  });
bar
  .append("text")
  .attr("dy", ".75em")
  .attr("y", -12)
  .attr("x", (x(dataBar[0].dx) - x(0)) / 2)
  .attr("text-anchor", "middle")
  .text(function (d) {
    return formatCount(d.y);
  });
// draw ideal normal distribution curve
var lines = svg
  .selectAll(".series")
  .data([1]) // only plot a single line
  .enter()
  .append("g")
  .attr("class", "series");
// Add the Ideal lines
lines
  .append("path")
  .datum(idealData)
  .attr("class", "line")
  .attr("d", linePlot)
  .style("stroke", function () {
    return color(series[1]);
  })
  .style({ "stroke-width": "2px", fill: "none" });
// Add the X Axis
svg
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);
// Add the Y Axis
svg.append("g").attr("class", "y axis").call(yAxis);
function getProbabilityData(normalizedData, m, v) {
  var data = [];
  // probabily - quantile pairs
  for (var i = 0; i < normalizedData.length; i += 1) {
    var q = normalizedData[i],
      p = probabilityDensityCalculation(q, m, v),
      el = {
        q: q,
        p: p,
      };
    data.push(el);
  }
  data.sort(function (x, y) {
    return x.q - y.q;
  });
  return data;
}
// The probability density of the normal distribution
// https://en.wikipedia.org/wiki/Normal_distribution
function probabilityDensityCalculation(x, mean, variance) {
  var m = Math.sqrt(2 * Math.PI * variance);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
}
