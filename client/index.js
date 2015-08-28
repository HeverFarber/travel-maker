var app = angular.module('travel', []);

app.controller('TravelController', ['$scope', '$compile', function ($scope, $compile) {

    $scope.tracks = [{
        title: 'טיול משפחה - יום א'
    }, {
        title: 'טיול משפחה - יום ב'
    }];
    $scope.sites = JSON.parse('[{"location":{"G":31.768,"K":35.213},"name":"Jerusalem, Israel"},{"location":{"G":32.085,"K":34.781},"name":"Tel Aviv-Yafo, Israel"},{"location":{"G":32.084,"K":34.887},"name":"Petah Tikva, Israel"}]');

    $scope.removeItem = function (arr, index) {
        arr.splice(index, 1);
    };

    $scope.addTrack = function () {
        $scope.tracks.push({
            title: "מסלול חדש - הקלק לשנות"
        });
    };

    $scope.addSite = function (place) {
        $scope.sites.push(place);
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

        $scope.sites.forEach(function (site) {
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
            point.marker.setPosition(site.location);
            point.marker.setVisible(true);

            var content = '<div class="text-center"><strong>' + index + " " + site.name + '</strong>';

            point.infowindow.setContent(content);
            point.infowindow.open($scope.map, point.marker);

            if (index - 1 > 0 && index - 1 < $scope.sites.length - 1)
                waypoints.push({
                    location: {
                        lat: site.location.G,
                        lng: site.location.K
                    },
                    stopover:true
                });


            $scope.route.push(point);
            index++;
        });
        
        $scope.directionsDisplay.setMap($scope.map);

        $scope.directionsService.route({
            origin: {
                lat: $scope.sites[0].location.G,
                lng: $scope.sites[0].location.K
            },
            destination: {
                lat: $scope.sites[$scope.sites.length-1].location.G,
                lng: $scope.sites[$scope.sites.length-1].location.K
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

    document.addEventListener("mapLoaded", $scope.initMap);
}]);

function initMap() {
    document.dispatchEvent(new CustomEvent("mapLoaded"));
}