app.controller("itemListCtrl", function ($scope, $location) {
    // Queries
    console.log("in itemListCtrl");
    Parse.Object.extend({
        className: "AppPage",
        attrs: ['page', 'name', 'title', 'type'],
        getPageObject: function() {
            var x = angular.fromJson(this.getPage());
            return x;
        }

    });

    var query = new Parse.Query("AppPage");
    query.find()
        .then(function (result) {
            $scope.appPages = result;
        });
// Cloud Code is patched too!
//        Parse.Cloud.run("myCloudCodeFunction", function (results) {
//            $scope.data = results;
//        });


});