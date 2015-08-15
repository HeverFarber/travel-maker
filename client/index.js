var app = angular.module('travel', []);

app.controller('TravelController', ['$scope', function ($scope) {

    $scope.tracks = [{
        title: 'טיול משפחה - יום א'
    }, {
        title: 'טיול משפחה - יום ב'
    }];
    $scope.sites = [{
        name: 'עין פאשחה',
        time: '12:20'
    }, {
        name: 'אושר עד',
        time: '12:20'
    }];

    $scope.addTrack = function () {
        $scope.tracks.push({
            title: "מסלול חדש - הקלק לשנות"
        });
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
        autocomplete.bindTo('bounds', map); 
        
        
    };
}]);

var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 8
    });
}