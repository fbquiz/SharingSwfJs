var app = angular.module('app', ['ui.router', 'parse-angular', 'parse-angular.enhance', 'ui.bootstrap', 'ng-uploadcare']);


app.service('itemsService', function ($q) {
    Parse.Object.extend({
        className: "AppPage",
        attrs: ['page', 'name', 'title', 'type', 'user'],
        getPageObject: function () {
            return angular.fromJson(this.getPage());
        },
        setPageObject: function (pageObject) {
            this.setPage(angular.toJson(pageObject));
        }
    });

    return {
        getItems: function () {
            var dfd = $q.defer();
            var query = new Parse.Query("AppPage");
            query.find().then(function (result) {
                dfd.resolve(result);
            });

            return dfd.promise
        },

        getItem: function (itemId) {
            var dfd = $q.defer()
            var query = new Parse.Query("AppPage");
            query.get(itemId).then(function (result) {
                dfd.resolve(result
                )
            });
            return dfd.promise

        }
    }
})


app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/itemList");
    $stateProvider
        .state('base', {
            abstract: true,
            url: "/",
            controller: "itemListCtrl",
            templateUrl: "partials/baseView.html",
            resolve: {
                items: function (itemsService) {
                    return itemsService.getItems();
                },
                loginService: 'loginService'
            }
        })
        .state('base.itemList', {
            url: "itemList",
            views: {
                'itemList': {
                    templateUrl: "partials/itemList.html",
                    controller: "itemListCtrl"
                }
            }
        }).state('base.itemList.item', {
            url: "/:itemId",
            abstract: true,
            backdrop: false,
            resolve: {
                item: function (itemsService, $stateParams) {
                    console.log("Item id is " + $stateParams.itemId);
                    return itemsService.getItem($stateParams.itemId);
                },
                loginService: 'loginService'
            },
            onEnter: ['$stateParams', '$state', '$modal', function ($stateParams, $state, $modal) {
                console.log('Open modal');
                $modal.open({
                    template: '<div ui-view="modal"></div>'

                }).result.finally(function () {
                        $state.go('itemList');
                    });
            }]

        }).state('base.itemList.item.view', {
            abstract: false,
            url: '/view',
            views: {
                'modal@': {
                    templateUrl: 'partials/itemViewer.html',
                    controller: "itemViewerCtrl"
                }
            }
        }).state('base.itemList.item.edit', {
            abstract: false,
            url: '/edit',
            views: {
                'modal@': {
                    templateUrl: 'partials/itemViewer.html',
                    controller: "itemEditorCtrl"
                }
            }
        })
})
;
