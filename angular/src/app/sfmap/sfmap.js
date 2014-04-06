angular.module( 'ngBoilerplate.sfmap', [
  'ui.state',
  'ApiService'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'sfmap', {
    url: '/',
    views: {
      "main": {
        controller: 'SfmapCtrl',
        templateUrl: 'sfmap/sfmap.tpl.html'
      }
    },
    data:{ pageTitle: 'San Francisco Map' }
  });
})

.controller( 'SfmapCtrl', function SfmapController( $scope, Api ) {

  $scope.map = null;
  $scope.markers = [];
  $scope.infoWindow = null;

  ///////////////
  // Typeahead
  ///////////////
  var fetchMovie = function(q, cb) {
    var matches = [];
    Api.typeahead(q, function(resp) {
      _.each(resp.pkg, function(movie) {
        matches.push({
          title: movie.value.title,
          director: movie.value.director,
          year: movie.value.year,
          locations: movie.value.locations

        });
      });
      cb(matches);
    });
  };

  var initalizeTypeahead = function() {
    $('#typeahead-wrap .typeahead').typeahead(null, {
      name: 'movie',
      source: fetchMovie,
      displayKey: 'title'
    }).on('typeahead:selected', function($e, movie) {
      $scope.$apply(function() {
        setMovie(movie);
      });
      $('#typeahead-wrap .typeahead').blur();
    }).on('typeahead:cursorchanged', function($e, movie) {
      $scope.$apply(function() {
        setMovie(movie);
      });
    });
  };

  var setMovie = function(movie) {
    if ($scope.movie == movie) {
      return;
    }
    $scope.movie = movie;
    clearMarkers($scope.markers);
    drawMarkers($scope.map, movie.locations);
  };

  //////////////////////
  // END of Typeahead
  //////////////////////


  /////////////////
  // Google Maps
  /////////////////
  var initalizeMap = function() {
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(37.7833, -122.4167), // Lat, Lng of SF
        mapTypeId: google.maps.MapTypeId.ROADMAP,

        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        panControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,

        styles: [
          {"featureType":"poi","stylers":[{"visibility":"simplified"}]},
          {"featureType":"road","stylers":[{"visibility":"simplified"}]},
          {"featureType":"water","stylers":[{"visibility":"simplified"}]},
          {"featureType":"transit","stylers":[{"visibility":"simplified"}]},
          {"featureType":"landscape","stylers":[{"visibility":"simplified"}]},
          {"featureType":"road.local","stylers":[{"visibility":"on"}]},
          {"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},
          {"featureType":"road.arterial","stylers":[{"visibility":"off"}]},
          {"featureType":"water","stylers":[{"color":"#5f94ff"},{"lightness":26},{"gamma":5.86}]},
          {"featureType":"road.highway","stylers":[{"weight":0.6},{"saturation":-85},{"lightness":61}]},
          {"featureType":"landscape","stylers":[{"hue":"#0066ff"},{"saturation":74},{"lightness":100}]}
        ]
    };

    $scope.map = new google.maps.Map(document.getElementById("google-map-wrap"), mapOptions);
    google.maps.event.addListener($scope.map, 'click', function() {
      closeInfoWindow();
    });
  };

  var clearMarkers = function(markers) {
    _.each(markers, function(marker) {
      marker.setMap(null);
    });
    $scope.markers = [];
  };

  var closeInfoWindow = function() {
    if ($scope.infoWindow) {
      $scope.infoWindow.close();
      $scope.infoWindow = null;
    }
  };

  var drawMarkers = function(map, locations) {
    var bounds = new google.maps.LatLngBounds();
    _.each(locations, function(location) {
      var latLng = new google.maps.LatLng(location.geo_lat, location.geo_lng);
      var marker = new google.maps.Marker({
        position: latLng,
        title: location.name,
        map: map,
        animation: google.maps.Animation.DROP
      });
      bounds.extend(latLng);

      // Create infowindow
      var infoWindow = new google.maps.InfoWindow({
        content: location.name
      });
      google.maps.event.addListener(marker, 'click', function() {
        closeInfoWindow();
        infoWindow.open(map, marker);
        $scope.infoWindow = infoWindow;
      });

      $scope.markers.push(marker);
    });
    map.fitBounds(bounds);

    // Set to minimum zoom
    var listener = google.maps.event.addListenerOnce(map, "idle", function() {
      if (map.getZoom() > 16) { map.setZoom(16); }
    });

  };
  ////////////////////////
  // END of Google Maps
  ////////////////////////

  $scope.showInfowindow = function(index) {
    google.maps.event.trigger($scope.markers[index], 'click');
  };

  initalizeTypeahead();
  initalizeMap();
})

;
