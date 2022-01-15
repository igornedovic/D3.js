const sirina = 1000;
const visina = 1000;
const platno = d3
  .select(".canvas")
  .append("svg")
  .attr("width", sirina)
  .attr("height", visina);

d3.json("srbija.json", function (podaci) {
  const grupa = platno.selectAll("g").data(podaci.features).enter().append("g");

  const projekcija = d3.geo
    .mercator()
    .center([20.75, 43.85])
    .scale(8500)
    .translate([sirina / 2, visina / 2]);
  const path = d3.geo.path().projection(projekcija);

  const povrsine = grupa
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

  grupa
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
