/*
    Description: A game of searching for cities in the Czech Republic
    Version: 0.0.5
    Author: Filip Kalousek
    Author URI: www.twentio.cz
*/

Vue.component(('map-main'), {
    template: `
        <div class="app-data">
            <div class="maps" v-bind:class="{ showed: showed }">
                <div class="mapa" id="main-map"></div>
                <div class="panaroma" id="main-pan"></div>
            </div>
            <div v-if="gameOver" class="over">

                <div class="results">
                    <h2>Tvé skóre: {{ actualScore }} z {{maximumScore}}</h2>
                    <p>Uhádnutá města:</p>
                    <ul>
                        <li v-for="guessed in guessedCities">
                            {{guessed}}
                        </li>
                    </ul>
                    <p>Neuhádnutá města:</p>
                    <ul>
                        <li v-for="unreleased in unreleasedCities">
                            {{unreleased}}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="side-wrapper">
                <div class="informations">
                    <h3>Informační panel</h3>
                    <p v-if="message.length > 0"><b>Výsledek</b>: {{message}}</p>
                    <p><b>Město</b>: {{resultCity}}</p>
                    <div class="score">
                        <p>
                        <b>Počet bodů</b>: {{ actualScore }} z {{maximumScore}}
                        </p>
                    </div>
                </div>
                <div class="timer">
                    <div class="base-timer">
                        <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g class="base-timer__circle">
                            <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                            <path
                            :stroke-dasharray="circleDasharray"
                            class="base-timer__path-remaining"
                            :class="remainingPathColor"
                            d="
                                M 50, 50
                                m -45, 0
                                a 45,45 0 1,0 90,0
                                a 45,45 0 1,0 -90,0
                            "
                            ></path>
                        </g>
                        </svg>
                        <span class="base-timer__label">{{ formattedTimeLeft }}</span>
                    </div>
                </div>
                <div class="copy">
                    <div class="content-copy">
                        <p>vytvořilo</p>
                        <a href="https://twentio.cz"><img src="https://twentio.cz/assets/logo/logo.svg"></a>
                    </div>
                    <div class="content-copy">
                        <p>za pomoci</p>
                        <a href="https://mapy.cz"><img src="https://api.mapy.cz/img/api/logo.svg"></a>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            showed: false,
            score: [],
            index: 0,
            selectedCoords: [],
            actualLayer: null,
            actualMarker: null,
            message: '',
            circleLayer: null,
            gameOver: false,
            guessedCities: [],
            unreleasedCities: [],
            resultCity: 'Pozorně sleduj!',
            mapPoints: [{
                    coords: [16.3109993, 49.8705186],
                    panoramaId: 59070154,
                    name: 'Litomyšl',
                    radius: 15
                },
                {
                    coords: [16.6111074, 49.9119302],
                    panoramaId: 58098546,
                    name: 'Lanškroun',
                    radius: 30
                },
                {
                    coords: [15.8327123, 50.2090749],
                    panoramaId: 68669620,
                    name: 'Hradec Králové',
                    radius: 15
                },
                {
                    coords: [16.4680344, 49.7562868],
                    panoramaId: 59262006,
                    name: 'Svitavy',
                    radius: 30
                },
                {
                    coords: [16.2659757, 49.7143888],
                    panoramaId: 59204394,
                    name: 'Polička',
                    radius: 30
                },
                {
                    coords: [15.7792888, 50.0384971],
                    panoramaId: 68222468,
                    name: 'Pardubice',
                    radius: 10
                },
                {
                    coords: [14.4213925, 50.0875035],
                    panoramaId: 68069556,
                    name: 'Staroměstské náměstí',
                    radius: 5
                },
                {
                    coords: [12.8663186, 50.2302053],
                    panoramaId: 54970771,
                    name: 'Karlovy Vary',
                    radius: 30
                },
                {
                    coords: [17.3080903, 49.5596000],
                    panoramaId: 58879911,
                    name: 'Olomouc',
                    radius: 30
                },
                {
                    coords: [18.0101420, 49.5947645],
                    panoramaId: 50723794,
                    name: 'Nový Jičín',
                    radius: 30
                },
                {
                    coords: [14.4750107, 48.9742668],
                    panoramaId: 57177087,
                    name: 'České Budějovice',
                    radius: 30
                },
            ],

            timePassed: 0,
            timerInterval: null,

            TIME_LIMIT: 10,
            FULL_DASH_ARRAY: 283,
            COLOR_CODES: {
                info: {
                    color: "green"
                },
                warning: {
                    color: "orange",
                    threshold: 10
                },
                alert: {
                    color: "red",
                    threshold: 5
                }
            }
        }
    },
    created() {
        //definuju si kam sahat, protoze this.data nefunguje
        const x = this;

        //nacte se mapa podle toho jeslije stranka nactena
        window.addEventListener('load', function () {

            x.startTimer();

            //schova se panaroma, zobrazi se mapa po intervalu 10s
            setTimeout(() => {
                x.showed = true;
            }, 10000);

            //definujeme globalni promenne - smap mapa, centrovani mapy
            var m;
            var czechCenter = SMap.Coords.fromWGS84(15.4075142, 49.7919411);
            //vytvoreni sceny 
            var panoramaScene = new SMap.Pano.Scene(document.getElementById("main-pan"), {
                //options -> moznosts definovat parametry viz. https://api.mapy.cz/doc/SMap.Pano.Scene.html#SMap.Pano.Scene
                //v tomto priklade, zakazeme moznost se pohybovat, a pouze muzeme posouvat kameru 360°
                nav: false
            });

            //vytvori by default panorama scenu z aktualniho levelu a je moznost mu nastavit parametry
            //viz. https://api.mapy.cz/doc/SMap.Pano.Scene.html#show
            SMap.Pano.get(x.mapPoints[x.index].panoramaId).then((place) => panoramaScene.show(place, {

                //parametry jsou dane pouze ukazkove
                yaw: 2.35,
                fov: 1,
                pitch: -0.214,
            }), () => {
                alert('Panorama se nepodařilo zobrazit !');
            });

            //kontrolovani pokud aktualni level neni vetsi nez pocet map (levelu)
            if (x.mapPoints.length - 1 >= x.index) {
                setTimeout(() => {
                    //vytvorime mapu dle document by id - vyuzite czechCenter - vycentrovana ceska republika
                    m = new SMap(JAK.gel("main-map"), czechCenter, 8);
                    //pridame zakladni vrstvu
                    m.addDefaultLayer(SMap.DEF_BASE).enable();
                    //pridame moznost se hybat
                    m.addDefaultControls();


                    var kliknuto = function (signal) {

                        //kontrola ze neni vytvorenych vic vrstev a zakazuje moznost vytvorit vic vrstev
                        //tim je myslena cesta - svg
                        if (x.actualLayer == null) {
                            //ziska se event a  jeho data se predaji do cocrds = souradnice , ktera zavola funkci odpoved
                            var event = signal.data.event;
                            var coords = SMap.Coords.fromEvent(event, m);
                            new SMap.Geocoder.Reverse(coords, odpoved);
                        }
                    }

                    //zavola se pouze pri kliknuti na mapu
                    var odpoved = function (geocoder) {
                        //ziskame data z naplanovane trasy
                        var results = geocoder.getResults();

                        //ulozime do dat  vybrane souradnice na ktere jsme klikly
                        x.selectedCoords = [results.coords.x, results.coords.y]

                        //vytvorime si array, kde budeme mit 2 hodnoty vybrane souradnice a souradnice z dat
                        //tzv. z veci, ktere jsou ulozene v datech
                        var coords = [
                            SMap.Coords.fromWGS84(x.selectedCoords[0], x.selectedCoords[1]),
                            SMap.Coords.fromWGS84(x.mapPoints[x.index].coords[0], x.mapPoints[x.index].coords[1])
                        ];

                        var nalezeno = function (route) {
                            //vytvorime vrstvu na ktere nam vznikne svg ktere znazornuje cestu
                            var vrstva = new SMap.Layer.Geometry();
                            m.addLayer(vrstva).enable();

                            var coords = route.getResults().geometry;
                            var g = new SMap.Geometry(SMap.GEOMETRY_POLYLINE, null, coords);
                            vrstva.addGeometry(g);
                            x.actualLayer = vrstva;
                        }

                        // nove volani - staticka metoda, predame pole se souradnicemi a chceme vratit hlavne geometrii trasy
                        SMap.Route.route(coords, {
                            geometry: true,
                            //parametr na typ cesty viz. https://api.mapy.cz/doc/SMap.Route.html#SMap.Route
                            criterion: "fast"
                        }).then(nalezeno);

                        //vytvorime novou routu, ktera bude pracovat dale
                        new SMap.Route(coords, function (route) {

                            //ziskame data z cesty
                            let results = route.getResults();

                            //ziskame si pocet metru a vydelime je na km
                            let result = results.length / 1000;

                            //rozhodujeme zda typ uzivatele byl v radiusu (narocnost kola)
                            if (result >= x.mapPoints[x.index].radius) {
                                //pridame zpravu se zaokr. hodnotamy
                                x.message = 'Netrefil jsi město o ' + Math.round((result - x.mapPoints[x.index].radius)) + ' km';

                                //kvuli debugu logneme  data
                                console.log('netrefil jsi se');

                                //vytvorime div, do ktereho vnorime dalsi div
                                const znacka = JAK.mel('div');

                                //vytvorim div nastavim mu css, kde se ma zobrazovat
                                const popisek = JAK.mel(
                                    'div', {
                                        innerText: 'Netrefil jsi město o ' + Math.round((result - x.mapPoints[x.index].radius)) + ' km'
                                    }, {
                                        position: 'relative',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '5px',
                                        padding: '8px 1rem',
                                        left: '-4rem',
                                        top: '-4rem',
                                        display: 'flex',
                                        background: 'rgb(255, 255, 255)',
                                        width: '150px',
                                        height: '90px',
                                        boxShadow: 'rgba(0, 0, 0, 0.43) 0px 0px 14px 0px'
                                    }
                                );

                                //vnorim popisek do hlavni znacky
                                znacka.appendChild(popisek);

                                //vytvorim marker (znacku), ktera bude div a vlozim do ni marker
                                const vrstvaMarker = new SMap.Layer.Marker();
                                m.addLayer(vrstvaMarker);
                                vrstvaMarker.enable();


                                //pridam aktuani vrstvu do dat, abych ji potom mohl smazat
                                x.actualMarker = vrstvaMarker;

                                //z dat si vemu celou cestu naplanovou a vemu si kde je zhruba polovina cesty
                                var halfPoints = Math.round(results.geometry.length / 2);

                                //natypuju je do smap souradnice
                                var halfCoords = SMap.Coords.fromWGS84(results.geometry[halfPoints].x, results.geometry[halfPoints].y)

                                //mapa ze priblizi pri spatnem typu tam kde je zhruba polovina cesty
                                m.setCenterZoom(halfCoords, 10, true);

                                //pridam marker do zhruba poloviny cesty
                                const marker = new SMap.Marker(halfCoords, null, {
                                    url: znacka
                                });
                                vrstvaMarker.addMarker(marker);


                                //vytvorim novou vrstvu na geometrii
                                var layerCircle = new SMap.Layer.Geometry();
                                m.addLayer(layerCircle);
                                layerCircle.enable();

                                /* vypocet souradnic bodu na kruznici  */
                                var radius = x.mapPoints[x.index].radius; /* polomer v km */

                                var lon = x.mapPoints[x.index].coords[0];
                                var lat = x.mapPoints[x.index].coords[1];

                                const equator = 6378 * 2 * Math.PI; /* delka rovniku (km) */
                                var yrad = Math.PI * lat / 180; /* zemepisna sirka v radianech */
                                var line = equator * Math.cos(yrad); /* delka rovnobezky (km) na ktere lezi stred kruznice */
                                var angle = 360 * radius / line; /* o tento uhel se po rovnobezce posuneme */

                                var centerCircle = SMap.Coords.fromWGS84(lon, lat);

                                // cervena kružnice
                                var point = SMap.Coords.fromWGS84(lon + angle, lat);
                                var options = {
                                    color: "#f00",
                                    opacity: 0.1,
                                    outlineColor: "#f00",
                                    outlineOpacity: 0.5,
                                    outlineWidth: 3
                                };
                                var circle = new SMap.Geometry(SMap.GEOMETRY_CIRCLE, null, [centerCircle, point], options);
                                layerCircle.addGeometry(circle);

                                //pridam aktuani vrstvu do dat, abych ji potom mohl smazat
                                x.circleLayer = layerCircle;

                                //pridam do dat spatne uhodnutych mest nazev mesta
                                x.unreleasedCities.push(x.mapPoints[x.index].name);

                            } else {

                                //kvuli debugu logneme  data
                                console.log('trefil jsi se')

                                //pridame zpravu se zaokr. hodnotamy
                                x.message = 'Trefil jsi město, ale bylo to těsný kdybys minul o ' + Math.round(x.mapPoints[x.index].radius) + ' km, netrefil by jsi se!';

                                //neodecitam nulove body, tak je pridam a vydelim na desetine cislo abych nemel 30 b ale jen 3, dle narocnosti
                                //toho daneho "levelu"
                                x.score.push(x.mapPoints[x.index].radius / 10)

                                //pridam do dat uhodnutych mest nazev mesta
                                x.guessedCities.push(x.mapPoints[x.index].name);


                                var layer = new SMap.Layer.Geometry();
                                m.addLayer(layer);
                                layer.enable();

                                /* vypocet souradnic bodu na kruznici  */
                                var radius = x.mapPoints[x.index].radius; /* polomer v km */

                                var lon = x.mapPoints[x.index].coords[0];
                                var lat = x.mapPoints[x.index].coords[1];

                                const equator = 6378 * 2 * Math.PI; /* delka rovniku (km) */
                                var yrad = Math.PI * lat / 180; /* zemepisna sirka v radianech */
                                var line = equator * Math.cos(yrad); /* delka rovnobezky (km) na ktere lezi stred kruznice */
                                var angle = 360 * radius / line; /* o tento uhel se po rovnobezce posuneme */

                                var centerCircle = SMap.Coords.fromWGS84(lon, lat);

                                // modrá kružnice
                                var point = SMap.Coords.fromWGS84(lon + angle, lat);
                                var options = {
                                    color: "blue",
                                    opacity: 0.1,
                                    outlineColor: "blue",
                                    outlineOpacity: 0.5,
                                    outlineWidth: 3
                                };

                                //pridam vrstvu s vypocitanym radiusem
                                var circle = new SMap.Geometry(SMap.GEOMETRY_CIRCLE, null, [centerCircle, point], options);
                                layer.addGeometry(circle);

                                //ulozim vrstvu (je to objekt) abych ho pote mohl smazat
                                x.circleLayer = layer;

                                //protoze je zde spravna odpoved natypuju si na smap souradnice a vycentruju mapu
                                var rightGuessedCoords = SMap.Coords.fromWGS84(x.mapPoints[x.index].coords[0], x.mapPoints[x.index].coords[1])

                                //viz. https://api.mapy.cz/doc/SMap.html#setCenterZoom
                                //m.setCenterZoom(souradnice, priblizeni, animace: ano / ne )
                                // cim vetzi cislo tim vetsi priblizeni max. 19, min. 2
                                m.setCenterZoom(rightGuessedCoords, 12, true);
                            }
                            //zobrazim, na informacnim panelu spravne mesto
                            x.resultCity = x.mapPoints[x.index].name;
                            setTimeout(() => {
                                //zkontroluju si jeste jestli hra neskoncila
                                if (x.mapPoints.length - 2 >= x.index) {
                                    //pridam si index
                                    x.index += 1;
                                    //zmenim zobrazeni  ze se zobrazi mapa
                                    x.showed = !x.showed;

                                    //resetuju timer a zapnu ho
                                    x.timePassed = 0;
                                    x.startTimer();

                                    //prepisu nastaveni panaromata a dam mu souradnice z dalsiho kola
                                    SMap.Pano.get(x.mapPoints[x.index].panoramaId).then((place) => panoramaScene.show(place, {
                                        yaw: 2.35,
                                        fov: 1,
                                        pitch: -0.214,
                                    }), () => {
                                        alert('Panorama se nepodařilo zobrazit !');
                                    });

                                    //zmenim zpravy, ktere se zobrazuji na informacnim panelu
                                    x.message = '';
                                    x.resultCity = 'Pozorně sleduj!';

                                    //smazu z mapy vrstvy - radius a naplanovanou cestu 
                                    m.removeLayer(x.actualLayer);
                                    m.removeLayer(x.circleLayer);

                                    //smazu z mapy vrstvy popisek, ale pri spravne odpovedi se nevytvari, tak to musim zkontrolovat
                                    if (x.actualMarker !== null) {
                                        m.removeLayer(x.actualMarker);
                                    }

                                    //behem panaromatu vycentruji mapu by default
                                    m.setCenterZoom(czechCenter, 8, true);

                                    //dam datum default hodnotu
                                    x.actualLayer = null;
                                    x.actualMarker = null;

                                    //zavolam timeout ktery pobezi behem panaromatu aby se zase vypnul jako na zacatku
                                    setTimeout(() => {
                                        x.showed = !x.showed;
                                    }, 10000);
                                } else {
                                    x.gameOver = true;
                                }
                            }, 10000);
                        });
                    }

                    //zavedeme na mapu eventlitener, ktery spusti metodu
                    var signals = m.getSignals();
                    signals.addListener(window, "map-click", kliknuto);
                    //nastavime ze mapa bude mit defaultni kurzor "pointer" viz. https://www.w3schools.com/cssref/pr_class_cursor.asp
                    // v dokumentaci seznam vice parametru viz. https://api.mapy.cz/doc/SMap.html#setCursor
                    m.setCursor("pointer");


                }, 10000);
            }
        });
    },

    //timer vytvoren pomoc: https://medium.com/js-dojo/how-to-create-an-animated-countdown-timer-with-vue-89738903823f
    computed: {

        //vypocitam aktualni skore, jsou tam pouze kladne hodnoty, protoze davame pouze spravny typ
        actualScore: function () {
            let sum = 0;
            this.score.forEach(function (item) {
                sum += (parseFloat(item));
            });

            return sum;
        },

        //vypocitam ze vsech levelu jejich hodnotu a nastavim to jako maximalni pocet bodu
        maximumScore: function () {
            let sum = 0;
            this.mapPoints.forEach(function (item) {
                sum += (parseFloat(item.radius / 10));
            });

            return sum;
        },

        circleDasharray() {
            return `${(this.timeFraction * this.FULL_DASH_ARRAY).toFixed(0)} 283`;
        },

        formattedTimeLeft() {
            const timeLeft = this.timeLeft;
            const minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;

            if (seconds < 10) {
                seconds = `0${seconds}`;
            }

            return `${minutes}:${seconds}`;
        },

        timeLeft() {
            return this.TIME_LIMIT - this.timePassed;
        },

        timeFraction() {
            const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
            return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
        },

        remainingPathColor() {
            const {
                alert,
                warning,
                info
            } = this.COLOR_CODES;

            if (this.timeLeft <= alert.threshold) {
                return alert.color;
            } else if (this.timeLeft <= warning.threshold) {
                return warning.color;
            } else {
                return info.color;
            }
        }
    },
    watch: {
        timeLeft(newValue) {
            if (newValue === 0) {
                this.onTimesUp();
            }
        }
    },
    methods: {
        onTimesUp() {
            clearInterval(this.timerInterval);
        },

        startTimer() {
            this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
        },
        addExtraTime(){
            this.timePassed -= 2;
        }
    },
})

var app = new Vue({
    el: '#app',
    data: {}
})