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

// format za brojeve
var format = d3.format(",.0f");

const width = 1000 - margin.left - margin.right;
const height = 750 - margin.top - margin.bottom;

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

const xOsa = d3.svg.axis().scale(x).ticks(10).orient("bottom");
const yOsa = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));

// generisanje idealne krive koja reprezentuje normalne raspodele
const suma = d3.sum(stvarniPodaci);
const verovatnoca = 1 / nizBrojeva;
const varijansa = suma * verovatnoca * (1 - verovatnoca);
const idealniPodaci = vratiIdealnePodatke(stvarniPodaci, prosek, varijansa);

function vratiIdealnePodatke(stvarniPodaci, prosek, varijansa) {
  let paroviPodataka = [];

  for (let i = 0; i < stvarniPodaci.length; i++) {
    const podatak = stvarniPodaci[i];
    const verovatnoca = funkcijaGustineRaspodele(podatak, prosek, varijansa);
    const par = {
      podatak: podatak,
      verovatnoca: verovatnoca,
    };

    paroviPodataka.push(par);
  }

  paroviPodataka.sort((x, y) => x.podatak - y.podatak); // sortiranje rastuce
  return paroviPodataka;
}

// normalizovana x-osa za prikaz vrednosti krive
const xN = d3.scale
  .linear() // skaliranje vrednosti tako da odnos ulaznih i izlaznih podataka bude linearan
  .range([0, width])
  .domain(
    d3.extent(idealniPodaci, function (d) {
      return d.podatak;
    })
  ); // niz minimuma i maksimuma za svaki podatak

// normalizovana y-osa za prikaz vrednosti krive
const yN = d3.scale
  .linear()
  .range([height, 0])
  .domain(
    d3.extent(idealniPodaci, function (d) {
      return d.verovatnoca;
    })
  );

// skica krive
const skicaKrive = d3.svg
  .line()
  .x(function (d) {
    return xN(d.podatak);
  })
  .y(function (d) {
    return yN(d.verovatnoca);
  });

// funkcija gustine raspodele verovatnoca normalne raspodele
function funkcijaGustineRaspodele(x, prosek, varijansa) {
  const m = Math.sqrt(2 * Math.PI * varijansa);
  const e = Math.exp(-Math.pow(x - prosek, 2) / (2 * varijansa));
  return e / m;
}

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// kreiranje placeholdera za stubice
const stubic = svg
  .selectAll(".bar")
  .data(podaciZaStubice)
  .enter()
  .append("g")
  .attr("class", "bar")
  .attr("transform", function (d) {
    return "translate(" + x(d.x) + "," + y(d.y) + ")";
  });

// jedan stubic predstavlja vertikalni pravougaonik
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

// pozicioniranje vrednosti (tekst) na vrhu svakog stubica
stubic
  .append("text")
  .attr("dy", ".75em")
  .attr("y", -12)
  .attr("x", (x(podaciZaStubice[0].dx) - x(0)) / 2)
  .attr("text-anchor", "middle")
  .text(function (d) {
    return format(d.y);
  });

// crtanje idealne krive normalne raspodele (Gausova kriva)
const kriva = svg
  .selectAll(".prikaz")
  .data([1]) // samo jedna linija
  .enter()
  .append("g")
  .attr("class", "prikaz");

// dodavanje krive na platno
kriva
  .append("path") // path element za krive linije (moze bilo koji oblik da se napravi pomocu path)
  .data(idealniPodaci)
  .attr("class", "line")
  .attr("d", skicaKrive)
  .style("stroke", function () {
    return boje(prikaz[1]);
  })
  .style({ "stroke-width": "2px", fill: "none" });

// dodavanje x-ose na platno
svg.append("g")
  .attr("class", "x axis")
  .attr("tansform", "translate(0," + height + ")")
  .call(xOsa);

// dodavanje y-ose na platno
svg.append("g")
  .attr("class", "y axis")
  .call(yOsa);