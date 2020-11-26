import { setSearchObj, dispatch_search } from "./search.js";
import { setStreamObj, streamStart } from "./stream.js";

import tweetsComp from './comp_tweets.js';

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
            <label for="streamOff"> Stream </label>
            <label id="streamSwitch" class="switch">
                <input type="checkbox" id="streamOff" name="streamOff" value="false">
                <span class="slider round" @click="changeSearch"></span>
            </label>
            <label for="keyWord" class="text">Key-word </label>
            <input autocomplete="off" type="text" name="keyWord" id="keyWord" />
            <br> 
            <label for="user" class="text">User </label>
            <input autocomplete="off" type="text" name="user" id="user" />
            <br>

            <label for="pdi" class="text">Point of interest </label>
            <input autocomplete="off" type="text" name="pdi" id="pdi" placeholder="e.g. Università di Bologna" size="22" /> <br>
            
            <label for="coordinates" class="text">Coordinates (lat, long) </label>
            <input autocomplete="off" type="text" name="coordinates" id="coordinates" placeholder="e.g. 45.4773,9.1815" size="22" @change="updateCircleOnMap()" @keyup.enter="updateCircleOnMap()"/> <br>
            
            <div id="map"></div><br>

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
            <button id="searchBtn" @click="onClickSearch()">SEARCH</button>
        </div>
    </div>
    `,
    methods: {
        changeSearch() {
          if(!$("#streamOff").is(":checked")) {
              $("#coordinates").val("");
              $("#coordinates").attr("placeholder", "e.g. 41.83,12.48,45.519.14");
              $("#pdi").val("");
              $("#pdi").prop("disabled", true);
          }
          else {
              $("#coordinates").val("");
              $("#coordinates").attr("placeholder", "e.g. 45.4773,9.1815");
              $("#pdi").prop("disabled", false);
          }
        },
        onClickSearch() {
            let newSearchObj = {
                keyword: $('#keyWord').val(),  
                user: $('#user').val(),
                center: $('#coordinates').val().replace(/\s+/g, ''),
                radius: $('#radius').val(),
                pdi: $('#pdi').val(),
                images_only: $('#images-only').prop('checked'),
                coordinates_only: $('#coordinates-only').prop('checked')
            };

            let success;

            if(!$("#streamOff").is(":checked")) {
                setSearchObj(newSearchObj);
                success = dispatch_search();
            }
            /* if streaming is active */
            else {
                setStreamObj(newSearchObj);
                success = streamStart();
            }

            if(success) {
                this.$router.push('tweets', () => {
                    setTimeout(() => {
                        tweetsComp.methods.setFilters();
                        tweetsComp.methods.clearTitleAndTweets()
                    }, 0);
                });
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
            });

            //set up the drawing tool
            const drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.MARKER,
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
    },

    mounted() {
        this.initMap();
        this.initAutocomplete();
    }
}