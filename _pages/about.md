---
layout: default
title: About
permalink: /about/
avatar: true
navigation: true
leaflet: true
visjs: true

---

Data Scientist @ [Kernix](https://www.kernix.com/)


# :school: Education

* PhD in [Physical chemistry](https://tel.archives-ouvertes.fr/tel-01561596), Université Pierre et Marie Curie, 2013-2016.
* Master in [Materials, Processing and Modelling](http://www.cemef.mines-paristech.fr/sections/formations/masteres-specialises/ms-mapmod), École Nationale Supérieure des Mines de Paris, 2012-2013.
* [Engineer](http://www.enim.fr/)  + [Master in Materials and Production](http://www.lem3.univ-lorraine.fr/mmsp/), École Nationale d’Ingénieurs de Metz, 2010-2012.
* Engineer in Mechanical engineering. [Universidad Industrial de Santander](http://www.uis.edu.co/), 2007-2010.


<div id="visualization"></div>
<script type="text/javascript">
  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');

  // Create a DataSet (allows two way data-binding)
  var items = new vis.DataSet([
    {id: 6, content: '🇨🇴', start: '2007-04-16'},
    {id: 1, content: 'Universidad Industrial Santander', start: '2007-04-16', end: '2010-04-19', className: 'red'},
    {id: 2, content: '🇫🇷', start: '2010-04-16'},
    {id: 3, content: 'ENIM', start: '2010-04-16', end: '2012-04-19'},
    {id: 4, content: 'MINES', start: '2012-04-16', end: '2013-04-19'},
    {id: 7, content: '🗼', start: '2013-04-16'},
    {id: 5, content: 'UPMC', start: '2013-04-16', end: '2016-04-19'}
  ]);

  // Configuration for the Timeline
  var options = {};

  // Create a Timeline
  var timeline = new vis.Timeline(container, items, options);
</script>


# :star: Prix

* 2015	[Roberto Rocca Fellowship](http://www.robertorocca.org/en/fellowships/fellows15.aspx). Awarded to exceptional university graduates from developing countries to help fund studies towards the Ph.D. degree at a university outside his home country

* 2014 [Arts et Sciences](http://artsetsciences.doc-up.info/archives/edition-2014/). Artistic contest related to science, organized by Doctoral association of Sorbonne University and UPMC. 

# 🎙 Communications

* 2016	Oral presentation ([best presentation](http://eurocorr.org/EFC+Awards+and+Prizes-p-71440.html) in WP Nuclear Corrosion) EUROCORR 2016
Montpelier, France. "Pitting corrosion modelling by means of a stochastic cellular automata based model"
* 2016	Oral presentation CORROSION 2016
Vancouver, Canada. "[Corrosion modeling using 3D probabilistic cellular automata based model](http://corrosionfp.epubxp.com/i/640839-2016/51)"
* 2015	Poster EUROCORR 2015
Graz, Austria.	"Corrosion modelling by cellular automata"
* 2014	Présentation orale ACRI 2014
Krakow, Poland. "Overview of cellular automaton models for corrosion"


<div id="mapid" style="height: 300px; width: 100%;"></div>
<script type="text/javascript">
  var mymap = L.map('mapid').setView([43, -70], 2);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
	}).addTo(mymap);

var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: '/assets/flags/canada.svg',
        iconSize:     [40, 40],
        iconAnchor:   [40, 40],
        popupAnchor:  [-20, -40]
    }
});

var canadaIcon = new LeafIcon({iconUrl: '/assets/flags/canada.svg'}),
    franceIcon = new LeafIcon({iconUrl: '/assets/flags/france.svg'}),
    austriaIcon = new LeafIcon({iconUrl: '/assets/flags/austria.svg'}),
    polandIcon = new LeafIcon({iconUrl: '/assets/flags/poland.svg'});

  L.marker([49.24966, -123.11934], {icon: canadaIcon}).addTo(mymap).bindPopup('<b>CORROSION 2016</b><br /> Vancouvert, Canada').openPopup();
  L.marker([43.6108, 3.8767], {icon: franceIcon}).addTo(mymap).bindPopup('<b>EUROCORR 2016</b><br />Montperllier, France');
  L.marker([47.0707, 15.4395], {icon: austriaIcon}).addTo(mymap).bindPopup('<b>EUROCORR 2015</b><br />Graz, Austria');
  L.marker([50.0647, 19.9450], {icon: polandIcon}).addTo(mymap).bindPopup('<b>ACRI 2014</b><br />Krakow, Poland');
</script>

# 📚  Publications

Citation of my articles migth be found at {% include icon-google.html username="Google Scholar" %} or {% include icon-researchgate.html username="Research Gate" %}.

## PhD Thesis

**Cristian Felipe Perez Brokate**, [Uniform and localized corrosion modelling by means of probabilistic cellular automata](https://tel.archives-ouvertes.fr/tel-01561596), Université Pierre et Marie Curie - Paris VI, 2016.  

## Journal Articles

* Mariem Zenkri, Dung di Caprio, **Cristian Felipe Pérez-Brokate**, Damien Féron, Jacques de Lamare, Contribution of cellular automata to the understanding of corrosion phenomena, Condensed Matter Physics 20 (3), 33802

* **Cristian Felipe Pérez-Brokate**, Dung di Caprio, Damien Féron, Jacques de Lamare, Annie Chaussé, [Probabilistic cellular automata model of generalized corrosion](http://dx.doi.org/10.1080/1478422X.2017.1300748), Corrosion Engineering, Science and Technology, (Aug. 2017), pp. 186-193

* **Cristian Felipe Pérez-Brokate**, Dung di Caprio, Damien Féron, Jacques de Lamare, Annie Chaussé, [Pitting corrosion modelling by means of a stochastic cellular automata-based model](http://dx.doi.org/10.1080/1478422X.2017.1311074), Corrosion Engineering, Science and Technology, (Apr. 2017), pp. 1-6

* **Cristian Felipe Pérez-Brokate**, Dung di Caprio, Damien Féron, Jacques de Lamare, Annie Chaussé, [Three dimensional discrete stochastic model of occluded corrosion cell](http://www.sciencedirect.com/science/article/pii/S0010938X16301469), Corrosion Science 111 (Oct. 2016) pp. 230–241

* **Cristian Felipe Pérez-Brokate**, Dung di Caprio, Éric Mahé, Damien Féron, Jacques de Lamare, [Cyclic voltammetry simulations with cellular automata](http://www.sciencedirect.com/science/article/pii/S1877750315300107), Journal of Computational Science 11 (Nov. 2015) pp. 269–278

* J. X. Zou, **C. F. Pérez-Brokate**, R. Arruffat, B. Bolle, J. J. Fundenberger, X. Q. Zeng, T. Grosdidier, and W. J. Ding, [Nanostructured bulk Mg + MgO composite synthesized through arc plasma evaporation and high pressure torsion for H-storage application](http://www.sciencedirect.com/science/article/pii/S0921510713004224#), Materials Science and Engineering: B, vol. 183, (Apr. 2014), pp. 1–5

## Conference proceedings

* **C. F. Pérez-Brokate**, D. di Caprio, D. Féron, J. D. Lamare, and A. Chaussé, [Overview of Cellular Automaton Models for Corrosion](http://link.springer.com/chapter/10.1007/978-3-319-11520-7_20), in Cellular Automata, J. Wąs, G. C. Sirakoulis, and S. Bandini, Eds. Springer International Publishing, 2014, pp. 187–196.

* M. Bellet, **C. F. Pérez-Brokate**, P. Hubsch, [3D finite element thermomechanical modelling of the primary cooling for beam-blanks continuous casting](https://www.researchgate.net/profile/Michel_Bellet/publication/263446224_3D_finite_element_thermomechanical_modelling_of_the_primary_cooling_for_beam-blanks_continuous_casting/links/0c96053ad975d9afa6000000.pdf), in 8th European Continuous Casting Conference, 2014, pp. 1220.

