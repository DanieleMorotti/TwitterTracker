
import {searchObj} from './search.js'
import tweetComp, {lastTweetsList} from './comp_tweets.js'
import {addMapPostPreview,post} from './autopost.js'

var map;

export default {
    name: 'map_view',
    template: `
        <div>
          <div id="data-view-map"></div>
          <div id="map_view_container"> </div>
          <button class="mapShare" @click="createModal">Posta</button>
        </div>
    `,
    methods: {
        //Method to invoke when a marker is clicked, it open a modla displaying the original tweet
        expandTweet(url) {
            //Work-around to get modal window benefits by clicking a temporary button
            let button = $(`<button id="modal-show-btn" data-toggle="modal" data-target="#tweetModal" style="display:none;"></button>`);
            button.on("click", () => tweetComp.methods.showTweetInModal(url));
            $('#map_view_container').append(button);
            $('#modal-show-btn').click();
            $('#modal-show-btn').remove();
        },

        //Method used to check wheter or not the point found is free from other markers
        //If the coordinates are already used for another marker on the map, they are incremented or decremented (randomly) 
        //by .05 and checked again, otherwise the point is added to the list of used coordinates
        validatePoint(point, list) {
            let valid = true;
            if (list.length > 0) {
                list.forEach((el) => {
                    if (el.lat.toFixed(2) == point.lat.toFixed(2) || el.lng.toFixed(2) == point.lng.toFixed(2)) {
                        point.lat += .05 * (Math.random() < 0.5 ? -1 : 1);
                        point.lng += .05 * (Math.random() < 0.5 ? -1 : 1);
                        valid = false;
                    }
                });
            }
            if (valid) {
                list.push(point);
            } else {
                this.validatePoint(point, list);
            }
        },

        //Take a map as parameter on wich markers are gonna be placed
        drawDataOnMapView(tweets) {
            let already_used_coordinates = [];
            tweets.forEach(tweet => {
                //For each tweet we pick the middle point of
                //the bounding box and make a marker to display on the map
                if (tweet.coordinates) {
                    let yCenter = (Number(tweet.coordinates[0][1][0]) + Number(tweet.coordinates[0][3][0])) / 2;
                    let xCenter = (Number(tweet.coordinates[0][1][1]) + Number(tweet.coordinates[0][3][1])) / 2;
                    let LatLng = { lat: xCenter, lng: yCenter };

                    //Validation of the defined point
                    this.validatePoint(LatLng, already_used_coordinates);

                    let marker = new google.maps.Marker({
                        position: LatLng,
                        map
                    });

                    //Event to invoke expandTweet when a click occur on the marker
                    let url = "https://twitter.com/" + tweet.username + "/status/" + tweet.id;
                    marker.addListener("click", () => { this.expandTweet(url); });

                    //If there is at least one image we use that one as the marker 
                    if (tweet.images.length > 0) {
                        let url = tweet.images[0];
                        let img = new Image();
                        img.src = url;
                        //We create an Image object and wait for it to load
                        //after that the width to be used is calculated on a height of 50px
                        img.onload = function () {
                            let height = img.height;
                            let width = img.width;
                            let new_width = (50 * width) / height;

                            let image = {
                                url: url,
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(new_width / 2, 20),
                                scaledSize: new google.maps.Size(new_width, 50),
                                class: 'image_marker'
                            };
                            marker.setIcon(image);
                        }
                    }
                }
            });
        },
        createModal(){
            let center = map.getCenter().toString().slice(1,-1);
            let zoom = map.getZoom();
            addMapPostPreview($('#imgPreview'),center,zoom);
            $("#postBtn").off();
            $("#postBtn").on("click",()=>post('map'));
            $('#postModal').modal('show');
        }
    },
    //When the map window is activated from the main sidebar a map is created with the same center of the main one
    activated() {
        var center = (searchObj && searchObj.center) ? searchObj.center : '41.885453,12.498221';
        map = new google.maps.Map(document.getElementById("data-view-map"), {
            center: { lat: Number(center.split(',')[0]), lng: Number(center.split(',')[1]) },
            zoom: 5,
            streetViewControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ["hybrid" , "roadmap"],
            }
        });
        map.setMapTypeId('hybrid');
        if (lastTweetsList) 
            this.drawDataOnMapView(lastTweetsList);
	}
}