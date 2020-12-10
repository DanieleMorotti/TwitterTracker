import tweetsComp from './comp_tweets.js';
import { dispatch_search, searchObj, setSearchObj } from "./search.js";
import { streamStart } from "./stream.js";


// map used to draw the search area
export var map = null;
// current search area on the map
var search_area = null;
// saving the last shape i drew, so when I draw a new shape I remove the previous one
var shape = null;

// number of decimal digits in the coordinates
const DECIMAL_DIGITS = 5;
// color of the search area
const SEARCH_AREA_COLOR = "#00FF00";

export default {
    name: 'search',

    data() {
        return{
            value: 100,
            stream: false
        }
    },

    template: `
    <div id="filterComp">
        <div id="inputFields">
            <div class="flex-container">
                <div class="flex-left">
                    <div class="float-container">
                        <div class="float-left">

                            <input type="checkbox" id="styles_switch" class="switch-input" name="styles_switch" value="false" style="display:none">
                            <label for="styles_switch" class="switch-label" style="font-size: 14.5px;"> Stream </label>
                            <span class="toggle" @click="changeSearch"></span>

                            <label for="tweet-count" style="font-size: 14.5px;"> Tweets to show </label>
                            <input id="tweet-count" maxlength=3 type="number" max=500 min=10 step=10 value=250 onkeydown="return false"></input><br>
                            <label for="keyWord" class="text">Key-word </label><br>
                            <input autocomplete="off" type="text" name="keyWord" id="keyWord" /><br>
                            <label for="user" class="text">User </label><br>
                            <input autocomplete="off" type="text" name="user" id="user" /><br>
                            
                        </div>
                        <div class="float-right">
                            <label for="pdi" class="text">Point of interest </label><br>
                            <input autocomplete="off" type="text" name="pdi" id="pdi" placeholder="e.g. Università di Bologna" size="22" /> <br>
                            
                            <label for="coordinates" class="text">Coordinates (lat, long) </label><br>
                            <input autocomplete="off" type="text" name="coordinates" id="coordinates" placeholder="e.g. 45.4773,9.1815" size="22" @change="updateCircleOnMap()" @keyup.enter="updateCircleOnMap()"/> <br>
                        </div>

                        
                    </div>
                    <br>
                    <label for="radius" class= "text">Radius </label>
                    <input style="display:inline" id="radius" type="range" min="10" max="1000" step="10"  v-model="value" name="radius" @change="updateCircleOnMap()"/>
                    <label style="display:inline"><span v-text="value" id="radiusValue"></span> km</label>
                    <br>
        
                    <input type="checkbox" id="images-only">            
                    <label for="images-only">Show only tweets containing images</label>
                    <br>
        
                    <input type="checkbox" id="coordinates-only">            
                    <label for="coordinates-only">Show only geo-localized tweets </label>
                    <br>
                    <div id="map"></div><br> 
                    <button id="searchBtn" @click="onClickSearch()">SEARCH</button>
                    <button id="trendsBtn" @click="openTrendNav" title="trends" style="transform: scale(1.1)"><i class="fab fa-slack-hash"></i></button>

                </div>
                <div class="flex-right">
                    <div id="Trends">
                        <button class="closeBtn" @click="closeTrendNav">x</button>
                        <div class="title"><h3>Trending today</h3></div>
                        <ul id="trends-list">
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    `,
    methods: {
        changeSearch() {
            if(!$("#styles_switch").is(":checked")) {
                $("#tweet-count").prop("disabled", true);
                $("#tweet-count").val("");
            }
            else {
                $("#tweet-count").prop("disabled", false);
                $("#tweet-count").val("250");
            }

        },
        onClickSearch() {
            let newSearchObj = {
                count: $('#tweet-count').val(),
                keyword: $('#keyWord').val(),  
                user: $('#user').val(),
                center: $('#coordinates').val().replace(/\s+/g, ''),
                radius: $('#radius').val(),
                pdi: $('#pdi').val(),
                images_only: $('#images-only').prop('checked'),
                coordinates_only: $('#coordinates-only').prop('checked'),
            };

            let success, stream = false;

            setSearchObj(newSearchObj);
            if(!$("#styles_switch").is(":checked")) {
                success = dispatch_search();
            }
            /* if streaming is active */
            else {
                stream = true;
                success = streamStart();
            }

            if (success) {
                this.$router.push('tweets', () => {
                    setTimeout(() => {
                        tweetsComp.methods.setFilters();
                        tweetsComp.methods.clearTitleAndTweets(stream)
                    }, 0);
                });
            } else {
                //TODO: avvisare in caso di fail
            }
        },
        clearPDI() {
            $('#pdi').val('');
        },
        // Initalize the map used to draw the search area
        initMap() {
            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 41.885453, lng: 12.498221 },
                zoom: 5,
                streetViewControl: false,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                    mapTypeIds: ["roadmap", "terrain","hybrid"],
                }
            });

            //set up the drawing tool
            const drawingManager = new google.maps.drawing.DrawingManager({
                //drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: true,
                drawingControlOptions: {
                    //set the position of the tool and the shapes you can draw
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.CIRCLE
                    ],
                },
                circleOptions: {
                    strokeColor: SEARCH_AREA_COLOR,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: SEARCH_AREA_COLOR,
                    fillOpacity: 0.35,
                    editable: true,
                    clickable: false,
                    zIndex: 1
                },
            });
            drawingManager.setMap(map);

            let obj = this;
            //after the end of the draw action
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {

                //delete if drawn all the old circles on the map
                if(shape)shape.setMap(null);
                if(search_area)search_area.setMap(null);

                shape = event.overlay;
            
                if (event.type == 'circle') {
                    //to remove the parenthesis from the coordinates string
                    let center = shape.getCenter();
                    let radius = shape.getRadius();
                    
                    let maxRadius = $('#radius').prop('max');
                    //if the radius > max ray in m i set to the max in m
                    if(radius > maxRadius*1000){
                        shape.setRadius(maxRadius*1000);
                        radius = maxRadius;
                    }
                    else{
                        radius = parseInt(radius/1000);
                    }

                    obj.updateCenterAndRadius(center.lat(), center.lng(), radius);
                }

                /*The shape can be moved or resized, added eventlisteners to manage this actions*/
                obj.setEventListeners(shape, 'radius_changed', 'center_changed');

            });
        },

        //Init autcomplete for the point of interest text input
        initAutocomplete() {
            // Create the search box and link it to the UI element.
            var input = document.getElementById('pdi');
            var autocomplete = new google.maps.places.Autocomplete(input);
            /*  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);*/

            // Bias the SearchBox results towards current map's viewport.
            autocomplete.bindTo('bounds', map);
            // Set the data fields to return when the user selects a place.
            autocomplete.setFields(['name', 'geometry']);

            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.

            let obj = this;
            autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var bounds = new google.maps.LatLngBounds();

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
                map.fitBounds(bounds);

                let loc = place.geometry.location;
                let default_radius = 2;

                obj.updateCenterAndRadius(loc.lat(), loc.lng(), default_radius);
                obj.drawCircleOnMap(loc.lat(), loc.lng(), default_radius, '#00FF00'); 
            });
        },


        // Draw Searched area on the map
        drawCircleOnMap(lat, lng,  r) {
            if (shape) shape.setMap(null);
            if (search_area) search_area.setMap(null);

            //initialized the radius of the circle and the center
            let radius = 1000 * r;
            let center =  { 
                lat: lat, 
                lng : lng
            }

            // Add the circle for these coordinates to the map.
            search_area = new google.maps.Circle({
                strokeColor: SEARCH_AREA_COLOR,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: SEARCH_AREA_COLOR,
                fillOpacity: 0.35,
                map : map,
                center: center,
                radius: radius,
                editable: true
            });
            
            /*The shape can be moved or resized, added eventlisteners to manage this actions*/
            this.setEventListeners(search_area,'radius_changed','center_changed');
        },

        updateCircleOnMap() {
            let coordinates = $('#coordinates').val();
            let radius = $('#radiusValue').text();

            let lat = parseFloat(coordinates.split(',')[0]);
            let lng = parseFloat(coordinates.split(',')[1]);

            if (radius && !isNaN(lat) && !isNaN(lng))
                this.drawCircleOnMap(lat, lng, radius);
            //Still have to test if this statement makes problem, for now, if coordinates changes the PDI is cleared
            this.clearPDI();
        },

        updateCenter(lat, lng) {
            $('#coordinates').val(lat.toFixed(DECIMAL_DIGITS) + ', ' + lng.toFixed(DECIMAL_DIGITS));
        },

        updateRadius(radius) {
            $('#radius').val(radius);
            $('#radiusValue').text(radius);
        },

        updateCenterAndRadius(lat, lng, radius) {
            this.updateCenter(lat, lng);
            this.updateRadius(radius);
        },

        setEventListeners(el, event1, event2){
            let obj = this;
            el.addListener(event1, function(e) {
                let newRadius = el.getRadius();
                let maxRadius = $('#radius').prop('max');
                //if the radius > max radius in m i set to the max in m
                if(newRadius > maxRadius*1000){
                    el.setRadius(maxRadius*1000);
                    newRadius = maxRadius;
                }
                else{
                    newRadius = parseInt(newRadius/1000);
                }
                obj.updateRadius(newRadius);
            });
        
            el.addListener(event2, function(e){
                let newCenter = el.getCenter();
                obj.updateCenter(newCenter.lat(), newCenter.lng());
            });
        },
        openTrendNav() {
            $('.flex-right').css("display","block")
            $('.flex-left').css("display","none")
        },
        closeTrendNav() {
            if($('.flex-left').css('display') == 'none') {
                $('.flex-left').css("display","block")
                $('.flex-right').css("display","none")
            }
        }
    },

    activated() {
        //Request trends
        $.ajax({    
            method: "GET",
            url: "/trends",
            success: (data) => {
                for(let i = 0; i < data.length; i++) {
                    let t = data[i];
                    
                    let el = $(`<li> <p>${t.name}</p> </li>`)
                    if(t.count > 0)
                        el.prepend(`<p class="tweet-number">${(t.count > 1000 ? (t.count / 1000).toFixed(1) + 'K' : '< 1000') + ' Tweets'}</p>`);

                    el.on("click", () => {
                        this.closeTrendNav();
                        setSearchObj({
                            count: 250,
                            keyword: t.query
                        });
                        dispatch_search();

                        this.$router.push('tweets', () => {
                            setTimeout(() => {
                                tweetsComp.methods.setFilters();
                                tweetsComp.methods.clearTitleAndTweets()
                            }, 0);
                        });
                    });

                    $('#trends-list').append(el);
                }
            }
        });
    },

    mounted() {
        this.initMap();
        this.initAutocomplete();
    }
}