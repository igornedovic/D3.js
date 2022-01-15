document.querySelector(".btn").addEventListener("click", function () {
  d3.selectAll("svg").remove();

  const margin = {
      gore: 20,
      desno: 20,
      dole: 30,
      levo: 50,
    },
    sirina = 900 - margin.levo - margin.desno,
    visina = 700 - margin.gore - margin.dole;

  const prikaz = ["Stvarni", "Idealni"];
  // drugacije boje u odnosu na to sta se prikazuje
  const boje = d3.scale.category10();
  boje.domain(prikaz);

  // format za broj na osi
  const format = d3.format(",.0f");

  const nizBrojeva = 1000;
  const prosek = 20;
  const stDevijacija = 5;
  const normalnaRaspodela = d3.random.normal(prosek, stDevijacija);
  // generise 1000 brojeva [0,1,...,999] i svaki broj mapira u novu vrednost funkcijom normalnaRaspodela.
  // nove vrednosti se cuvaju u nizu stvarniPodaci
  const stvarniPodaci = d3.range(nizBrojeva).map(normalnaRaspodela);
  // histogram sa dvadeset uniformno dodeljenih stubica
  const podaciZaStubice = d3.layout.histogram().bins(20)(stvarniPodaci);

  const min = d3.min(stvarniPodaci);
  const max = d3.max(stvarniPodaci);

  // funkcija za skaliranje vrednosti na x-osi
  const x = d3.scale.linear().range([0, sirina]).domain([min, max]);

  const yMax = d3.max(podaciZaStubice, function (d) {
    return d.length;
  });
  // funkcija za skaliranje vrednosti na y-osi
  const y = d3.scale.linear().domain([0, yMax]).range([visina, 0]);

  const xOsa = d3.svg.axis().scale(x).ticks(10).orient("bottom");
  const yOsa = d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

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

  function funkcijaGustineRaspodele(x, prosek, varijansa) {
    const m = Math.sqrt(2 * Math.PI * varijansa);
    const e = Math.exp(-Math.pow(x - prosek, 2) / (2 * varijansa));
    return e / m;
  }

  // normalizovana x-osa za prikaz vrednosti krive
  const xN = d3.scale
    .linear() // skaliranje vrednosti tako da odnos ulaznih i izlaznih podataka bude linearan
    .range([0, sirina])
    .domain(
      d3.extent(idealniPodaci, function (d) {
        return d.podatak;
      })
    );

  // normalizovana y-osa za prikaz vrednosti krive
  const yN = d3.scale
    .linear()
    .range([visina, 0])
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

  // Dodavanje svg elementa na platno
  const svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", sirina + margin.levo + margin.desno)
    .attr("height", visina + margin.gore + margin.dole)
    .append("g")
    .attr("transform", "translate(" + margin.levo + "," + margin.gore + ")");

  // Kreiranje placeholdera za stubice
  const stubic = svg
    .selectAll(".stubic")
    .data(podaciZaStubice)
    .enter()
    .append("g")
    .attr("class", "stubic")
    .attr("transform", function (d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    });

  // Jedan stubic predstavlja vertikalni pravougaonik
  stubic
    .append("rect")
    .attr("x", 1)
    .attr("width", function (d) {
      return x(d.dx) - x(0) <= 0 ? 0 : x(d.dx) - x(0) - 1;
    })
    .attr("height", function (d) {
      return visina - y(d.y);
    })
    .attr("fill", function () {
      return boje(prikaz[0]);
    });

  // Pozicioniranje vrednosti (tekst) na vrhu svakog stubica
  stubic
    .append("text")
    .attr("dy", ".75em")
    .attr("y", -12)
    .attr("x", (x(podaciZaStubice[0].dx) - x(0)) / 2)
    .attr("text-anchor", "middle")
    .text(function (d) {
      return format(d.y);
    });

  // Crtanje idealne krive normalne raspodele (Gausova kriva)
  const kriva = svg
    .selectAll(".prikaz")
    .data([1]) // samo jedna linija
    .enter()
    .append("g")
    .attr("class", "prikaz");

  // Dodavanje krive na platno
  kriva
    .append("path") // path element za krive linije (moze bilo koji oblik da se napravi pomocu path)
    .datum(idealniPodaci)
    .transition()
    .delay(2000)
    .attr("class", "line")
    .attr("d", skicaKrive)
    .style("stroke", function () {
      return boje(prikaz[1]);
    })
    .style({ "stroke-width": "4px", fill: "none" });

  // Dodavanje x-ose na platno
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + visina + ")")
    .call(xOsa);

  // Dodavanje y-ose na platno
  svg.append("g").attr("class", "y axis").call(yOsa);
});
