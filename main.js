Vue.component(('map-main'), {
    template: `
       <div class="maps" v-bind:class="{ showed: showed }">
            <div class="mapa" id="main-map"></div>
            <div class="panorama"></div>
       </div>
    `,
    data() {
        return {
            showed: false,
            index: null,
            selectedCoords: [],
            actualLayer: null,
            message: '',
            mapPoints: [{
                    coords: [16.4537781, 49.9012947],
                    panoramaId: 58407976
                },
                {
                    coords: [16.3109993, 49.8705186],
                    panoramaId: 59070154
                },
                {
                    coords: [15.9043054, 50.5806696],
                    panoramaId: 65355549
                },
                {
                    coords: [15.8327123, 50.2090749],
                    panoramaId: 68669620
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


                        if (result >= 50) {
                            console.log('prohral jsi o ' + (result - 50) + ' km')

                            const znacka = JAK.mel('div');
                            const obrazek = JAK.mel('img', { src: SMap.CONFIG.img + '/marker/drop-red.png' }, { opacity: '0' });
                        
                            znacka.appendChild(obrazek);
                        
                            //const text = JAK.mel('p', { innerT: 'assets/logo/mark.svg' }, { width: '30px', bottom: '-15px', position: 'absolute' });

                            const text = document.createTextNode('prohral jsi o ' + (result - 50) + ' km')

                            const popisek = JAK.mel(
                              'div',
                              {
                                position: 'relative',
                                alignItems: 'center', justifyContent: 'center', borderRadius: '5px',
                                display: 'flex', background: 'rgb(255, 255, 255)', width: '150px',
                                height: '90px', boxShadow: 'rgba(0, 0, 0, 0.43) 0px 0px 14px 0px'
                              }
                            );
                            popisek.appendChild(text);
                            znacka.appendChild(popisek);

                            const vrstva = new SMap.Layer.Marker();
                            m.addLayer(vrstva);
                            vrstva.enable();
                        

                            var halfPoints = results.geometry.length / 2;

                            console.log(results.geometry[halfPoints])


                            var halfCoords = SMap.Coords.fromWGS84(results.geometry[halfPoints].x, results.geometry[halfPoints].y)

                            const marker = new SMap.Marker(halfCoords, null, { url: znacka });


                            vrstva.addMarker(marker);

                        } else {
                            console.log('vyhral jsi, ale bylo to těsný kdybys minul o' + (50 - result) + ' km, prohral by jsi')


                        }
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


                            m.removeLayer(x.actualLayer);
                            x.actualLayer == null;
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