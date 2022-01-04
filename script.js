const margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50,
};

const prikaz = ["Stvarni", "Idealni"];
// drugacije boje u odnosu na to sta se prikazuje
const boje = d3.scale.category10();
boje.domain(prikaz);

const width = 1200;
const height = 1000;

const nizBrojeva = 1000;
const prosek = 20;
const stDevijacija = 5;
const normalnaRaspodela = d3.random.normal(prosek, stDevijacija);
// generise 1000 brojeva [0,1,...,999] i svaki broj mapira u novu vrednost funkcijom normalnaRaspodela.
// Nove vrednosti se cuvaju u nizu stvarniPodaci
const stvarniPodaci = d3.range(nizBrojeva).map(normalnaRaspodela);
const podaciZaStubice = d3.layout.histogram().bins(20)(stvarniPodaci);

const min = d3.min(stvarniPodaci);
const max = d3.max(stvarniPodaci);

// funkcija za skaliranje vrednosti na x-osi
const x = d3.scale.linear().range([0, width]).domain([min, max]);

var yMax = d3.max(podaciZaStubice, function (d) {
  return d.length;
});
var y = d3.scale.linear().domain([0, yMax]).range([height, 0]);

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const stubic = svg
  .selectAll(".bar")
  .data(podaciZaStubice)
  .enter()
  .append("g")
  .attr("class", "bar")
  .attr("transform", function (d) {
    return "translate(" + x(d.x) + "," + y(d.y) + ")";
  });

stubic
  .append("rect")
  .attr("x", 1)
  .attr("width", function (d) {
    return x(d.dx) - x(0) <= 0 ? 0 : x(d.dx) - x(0) - 1;
  })
  .attr("height", function (d) {
    return height - y(d.y);
  })
  .attr("fill", function () {
    return boje(prikaz[0]);
  });
