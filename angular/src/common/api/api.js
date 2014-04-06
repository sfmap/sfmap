angular.module( 'ApiService', [] )

.config(function( $httpProvider ) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.factory('Api', function( $http ) {

  var api = 'http://api.inch.im/';
  // var api = 'http://127.0.0.1:5000/';

  return {

    typeahead: function(query, success, error) {
      var config = {
        method: 'GET',
        url: api + 'ta/' + query
      };
      $http(config).success(_.isFunction(success) ? success : angular.noop)
                   .error(_.isFunction(error) ? error : angular.noop);
    }

  };
})

;

