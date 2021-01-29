const public = this;

Vue.component(('map-main'), {
    template: `
        <div class="app-data">
            <div class="maps" v-bind:class="{ showed: showed }">
                <div class="mapa" id="main-map"></div>
                <div class="panorama"></div>
            </div>
            <div class="side-wrapper">
                <div class="settings">
                    <h3>Informační panel</h3>
                    <p v-if="message.length > 0"><b>Výsledek</b>: {{message}}</p>
                    <p><b>Město</b>: {{resultCity}}</p>
                </div>
                <div class="copy">
                    <p>vytvořilo</p>
                    <a href="https://twentio.cz"><img src="https://twentio.cz/assets/logo/logo.svg"></a>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            showed: false,
            index: null,
            selectedCoords: [],
            actualLayer: null,
            actualMarker: null,
            message: '',
            resultCity: '???',
            mapPoints: [{
                    coords: [16.3109993, 49.8705186],
                    panoramaId: 59070154,
                    name: 'Litomyšl'
                },
                {
                    coords: [16.6111074, 49.9119302],
                    panoramaId: 58098546,
                    name: 'Lanškroun'
                },
                {
                    coords: [15.8327123, 50.2090749],
                    panoramaId: 68669620,
                    name: 'Hradec Králové'
                },
                {
                    coords: [16.4680344, 49.7562868],
                    panoramaId: 59262006,
                    name: 'Svitavy'
                },
                {
                    coords: [16.2659757, 49.7143888],
                    panoramaId: 59204394,
                    name: 'Polička'
                },
                {
                    coords: [15.7792888, 50.0384971],
                    panoramaId: 68222468,
                    name: 'Pardubice'
                },
                {
                    coords: [14.4213925, 50.0875035],
                    panoramaId: 68069556,
                    name: 'Staroměstské náměstí'
                },
                {
                    coords: [12.8663186, 50.2302053],
                    panoramaId: 54970771,
                    name: 'Karlovy Vary'
                },
                {
                    coords: [17.3080903, 49.5596208],
                    panoramaId: 15288806,
                    name: 'Olomouc'
                },
                {
                    coords: [18.0101420, 49.5947645],
                    panoramaId: 50723794,
                    name: 'Nový Jičín'
                },
                {
                    coords: [14.4743047, 48.9744512],
                    panoramaId: 15288806,
                    name: 'České Budějovice'
                },
            ]
        }
    },
    created() {
        this.index = 0;

        setTimeout(() => {
            this.showed = true;
        }, 5000);

        const x = this;

        //nacte se mapa podle toho jeslije stranka nactena
        window.addEventListener('load', function () {

            var m;
            var center;
            var panoramaScene = new SMap.Pano.Scene(document.querySelector(".panorama"));

            setTimeout(() => {
                center = SMap.Coords.fromWGS84(15.4075142, 49.7919411);
                m = new SMap(JAK.gel("main-map"), center, 8);
                m.addDefaultLayer(SMap.DEF_BASE).enable();
                m.addDefaultControls();

                var kliknuto = function (signal) {
                    var event = signal.data.event;
                    var coords = SMap.Coords.fromEvent(event, m);
                    new SMap.Geocoder.Reverse(coords, odpoved);
                }

                var odpoved = function (geocoder) {
                    var results = geocoder.getResults();
                    x.selectedCoords = [results.coords.x, results.coords.y]

                    var coords = [
                        SMap.Coords.fromWGS84(x.selectedCoords[0], x.selectedCoords[1]),
                        SMap.Coords.fromWGS84(x.mapPoints[x.index].coords[0], x.mapPoints[x.index].coords[1])
                    ];

                    var nalezeno = function (route) {
                        var vrstva = new SMap.Layer.Geometry();
                        m.addLayer(vrstva).enable();

                        var coords = route.getResults().geometry;
                        var g = new SMap.Geometry(SMap.GEOMETRY_POLYLINE, null, coords);
                        vrstva.addGeometry(g);
                        x.actualLayer = vrstva;
                    }

                    // nove volani - staticka metoda, predame pole se souradnicemi a chceme vratit hlavne geometrii trasy
                    SMap.Route.route(coords, {
                        geometry: true
                    }).then(nalezeno);

                    new SMap.Route(coords, function (route) {
                        let results = route.getResults();
                        let result = results.length / 1000 * 2;

                        let pubY = this;
                        if (result >= 50) {
                            x.message = 'prohral jsi o ' + Math.round((result - 50)) + ' km';

                            const znacka = JAK.mel('div');
                            const obrazek = JAK.mel('img', {
                                src: SMap.CONFIG.img + '/marker/drop-red.png'
                            }, {
                                opacity: '0'
                            });

                            znacka.appendChild(obrazek);

                            //const text = JAK.mel('p', { innerT: 'assets/logo/mark.svg' }, { width: '30px', bottom: '-15px', position: 'absolute' });

                            const text = document.createTextNode('prohral jsi o ' + Math.round((result - 50)) + ' km')

                            const popisek = JAK.mel(
                                'div', {
                                    position: 'relative',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    background: 'rgb(255, 255, 255)',
                                    width: '150px',
                                    height: '90px',
                                    boxShadow: 'rgba(0, 0, 0, 0.43) 0px 0px 14px 0px'
                                }
                            );
                            popisek.appendChild(text);
                            znacka.appendChild(popisek);

                            const vrstvaMarker = new SMap.Layer.Marker();
                            m.addLayer(vrstvaMarker);
                            vrstvaMarker.enable();

                            x.actualMarker = vrstvaMarker;

                            var halfPoints = Math.round(results.geometry.length / 2);

                            var halfCoords = SMap.Coords.fromWGS84(results.geometry[halfPoints].x, results.geometry[halfPoints].y)

                            const marker = new SMap.Marker(halfCoords, null, {
                                url: znacka
                            });


                            vrstvaMarker.addMarker(marker);

                        } else {
                            x.message = 'vyhral jsi, ale bylo to těsný kdybys minul o ' + Math.round((50 - result)) + ' km, prohral by jsi';
                        }

                        x.resultCity = x.mapPoints[x.index].name;
                        setTimeout(() => {
                            x.index += 1;

                            x.showed = !x.showed;

                            SMap.Pano.get(x.mapPoints[x.index].panoramaId).then((place) => panoramaScene.show(place, {
                                yaw: 2.35,
                                fov: 1,
                                pitch: -0.214,
                            }), () => {
                                alert('Panorama se nepodařilo zobrazit !');
                            });

                            x.message = 'Kde to asi je?'
                            x.resultCity = '?????';

                            m.removeLayer(x.actualLayer);
                            m.removeLayer(x.actualMarker);
                            x.actualLayer == null;
                            x.actualMarker == null;
                            setTimeout(() => {
                                x.showed = !x.showed;
                            }, 5000);
                        }, 5000);
                    });
                }
                var signals = m.getSignals();
                signals.addListener(window, "map-click", kliknuto);
            }, 5000);


            SMap.Pano.get(x.mapPoints[x.index].panoramaId).then((place) => panoramaScene.show(place, {
                yaw: 2.35,
                fov: 1,
                pitch: -0.214,
            }), () => {
                alert('Panorama se nepodařilo zobrazit !');
            });
        })
    },
    methods: {
        selectPlace: function () {

        }
    },
})

var app = new Vue({
    el: '#app',
    data: {}
})