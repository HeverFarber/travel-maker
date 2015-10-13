var app = angular.module('travel', []);

app.controller('TravelController', ['$scope', '$compile','$http', function ($scope, $compile, $http) {

    /*$scope.tracks = [{
        title: 'טיול משפחה - יום א'
    }, {
        title: 'טיול משפחה - יום ב'
    }];*/
    //$scope.sites = JSON.parse('[{"location":{"G":31.768,"K":35.213},"name":"Jerusalem, Israel"},{"location":{"G":32.085,"K":34.781},"name":"Tel Aviv-Yafo, Israel"},{"location":{"G":32.084,"K":34.887},"name":"Petah Tikva, Israel"}]');

    $scope.removeItem = function (arr, index) {
        arr.splice(index, 1);
        
        $scope.putTrack();
    };

    $scope.addTrack = function () {
        $scope.tracks.push({
            title: "מסלול חדש - הקלק לשנות",
            sites:[]
        });

        $scope.putTrack();
    };
    
    $scope.setSites = function(track){
        $scope.currentTrack = track;
    }; 

    $scope.loadTrack = function () {
        $.get('/track', function (data) {
            $scope.tracks = data;
            $scope.setSites($scope.tracks[0]);
            $scope.$apply();
        });
    };

    $scope.putTrack = function () {
        $http.post('/track', {
            tracks: $scope.tracks
        }).then(function (msg) {
            //console.log(msg);
        });
    };

    $scope.addSite = function (place) {
        place.time = "00:00";
        place.location = {G:place.location.lat(),K:place.location.lng()};
        $scope.currentTrack.sites.push(place);
        
        $scope.putTrack();
    };
    
    $scope.tsp = function(){
        $http.post('/tsp', {
            locations: $scope.currentTrack.sites
        }).then(function (order) {
            var newOrder = [];
            
            order.data.forEach(function (node){
                newOrder.push($scope.currentTrack.sites[node]);
            });
            
            $scope.currentTrack.sites = newOrder;
            
            $scope.putTrack();
        });
    };

    $scope.drawPlanning = function () {

        if ($scope.plane) {
            $scope.cleanPlanning();
            return;
        }

        $scope.cleanMarker();
        $scope.plane = true;

        var index = 1;
        $scope.route = [];
        var waypoints = [];

        $scope.currentTrack.sites.forEach(function (site) {
            var point = {};

            point.infowindow = new google.maps.InfoWindow();
            point.marker = new google.maps.Marker({
                map: $scope.map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            point.marker.setIcon( /** @type {google.maps.Icon} */ ({
                url: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            //point.marker.setPosition(site.location);
            //point.marker.setVisible(true);

            var content = '<div class="text-center"><strong>' + index + " " + site.name + '</strong>';

            //point.infowindow.setContent(content);
            //point.infowindow.open($scope.map, point.marker);

            if (index - 1 > 0 && index - 1 < $scope.currentTrack.sites.length - 1)
                waypoints.push({
                    location: {
                        lat: site.location.G || site.location.J,
                        lng: site.location.K || site.location.M
                    },
                    stopover: true
                });


            $scope.route.push(point);
            index++;
        });

        $scope.directionsDisplay.setMap($scope.map);

        $scope.directionsService.route({
            origin: {
                lat: $scope.currentTrack.sites[0].location.G || $scope.currentTrack.sites[0].location.J,
                lng: $scope.currentTrack.sites[0].location.K || $scope.currentTrack.sites[0].location.M
            },
            destination: {
                lat: $scope.currentTrack.sites[$scope.currentTrack.sites.length - 1].location.G || $scope.currentTrack.sites[$scope.currentTrack.sites.length - 1].location.J,
                lng: $scope.currentTrack.sites[$scope.currentTrack.sites.length - 1].location.K || $scope.currentTrack.sites[$scope.currentTrack.sites.length - 1].location.M
            },
            waypoints: waypoints,
            travelMode: google.maps.TravelMode["DRIVING"]
        }, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(response);
            }
        });
    };

    $scope.cleanPlanning = function () {
        $scope.route.forEach(function (point) {
            point.infowindow.close();
            point.marker.setMap(null);
        });

        $scope.directionsDisplay.setMap(null);

        $scope.route = undefined;
        $scope.plane = undefined;
    };

    $scope.setMarker = function (place) {

        $scope.cleanMarker();

        $scope.marker.setIcon( /** @type {google.maps.Icon} */ ({
            url: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        $scope.marker.setPosition(place.location);
        $scope.marker.setVisible(true);

        var content = '<div class="text-center"><strong>' + place.name + '</strong><br><button ng-click="addSite(place)">הוסף לאתרים</button></div>';

        $scope.infowindow.setContent($compile(content)($scope)[0]);
        $scope.infowindow.open($scope.map, $scope.marker);

        $scope.place = place;
    };

    $scope.cleanMarker = function () {
        $scope.infowindow.close();
        $scope.marker.setVisible(false);

        $scope.place = undefined;
    };

    $scope.showSearch = function () {
        var input = document.createElement("input");
        input.setAttribute('class', 'search-box');
        input.setAttribute('placeholder', 'חפש מקום');
        input.id = 'search-box';
        $('#map').prepend(input);
        $scope.search = true;
        input.focus();

        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', $scope.map);

        autocomplete.addListener('place_changed', function () {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("האתר שנבחר חסר מיקום");
                return;
            }

            $scope.map.setCenter(place.geometry.location);
            $scope.map.setZoom(14); // Why 17? Because it looks good.
            $scope.setMarker({
                location: place.geometry.location,
                name: place.formatted_address
            });
        });
    };

    $scope.initMap = function () {
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 31.046051,
                lng: 34.851612
            },
            zoom: 8
        });

        $scope.infowindow = new google.maps.InfoWindow();
        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            anchorPoint: new google.maps.Point(0, -29)
        });
        $scope.geocoder = new google.maps.Geocoder;

        google.maps.event.addListener($scope.map, 'click', function (event) {

            $scope.geocoder.geocode({
                'location': event.latLng
            }, function (results, status) {
                $scope.setMarker({
                    location: event.latLng,
                    name: (results[0] ? results[0].formatted_address : "Unknown")
                });
            });
        });

        $scope.directionsDisplay = new google.maps.DirectionsRenderer;
        $scope.directionsService = new google.maps.DirectionsService;

        setTimeout($scope.showSearch, 1000);
    };

    document.addEventListener("mapLoaded", function (){
        window.onload = $scope.initMap;
    });

    $scope.loadTrack();
}]);

function initMap() {
    document.dispatchEvent(new CustomEvent("mapLoaded"));
}