var app = angular.module('app', ['ui.router', 'parse-angular', 'parse-angular.enhance', 'ui.bootstrap', 'ng-uploadcare', 'ngClipboard', 'decipher.tags']);

app.config(['ngClipProvider', function (ngClipProvider) {
    ngClipProvider.setPath("components/zeroclipboard/dist/ZeroClipboard.swf");
}]);


app.service('itemsService', function ($q) {
    Parse.Object.extend({
        className: "AppPage",
        attrs: ['page', 'name', 'title', 'type', 'user', 'published', 'hashtags'],
        getPageObject: function () {
            return angular.fromJson(this.getPage());
        },
        setPageObject: function (pageObject) {
            this.setPage(angular.toJson(pageObject));
        },
        setUser: function (user) {
            this.set('user', user);
        }
    });

    return {
        getItemsQuery: function () {
            var query = new Parse.Query("AppPage");
            query.equalTo("published", true);
            return query;
        },
        getItemsWithHashQuery: function (term) {
            var query = this.getItemsQuery();
            var searchTerm = term.split(" ");
            query.containsAll("hashtags",searchTerm);
            return query;
        }
        ,
        getItems: function () {
            var dfd = $q.defer();
            var query = this.getItemsQuery();
            query.find().then(function (result) {
                dfd.resolve(result);
            });

            return dfd.promise
        },


        getItemsWithTerm: function (term) {
            var dfd = $q.defer();
            var queryName = this.getItemsQuery();
            var queryTitle = this.getItemsQuery();
            var queryHash =  this.getItemsWithHashQuery(term);
            queryName.contains("name", term);
            queryTitle.contains("title", term);
            var query = Parse.Query.or(queryName, queryTitle,queryHash);
            query.limit(5);
            query.find().then(function (result) {
                dfd.resolve(result);
            });

            return dfd.promise

        }, getTitles: function (searchTerm) {
            var dfd = $q.defer();
            this.getItemsWithTerm(searchTerm).then(function (result) {
                dfd.resolve(result.map(function (item) {
                    return item.getTitle()
                }));
            });
            return dfd.promise
        },
        getUserItems: function () {
            var dfd = $q.defer();
            var query = new Parse.Query("AppPage");
            query.equalTo("user", Parse.User.current());
            query.find().then(function (result) {
                dfd.resolve(result);
            });

            return dfd.promise
        },

        getItem: function (itemId) {
            var dfd = $q.defer();
            var query = new Parse.Query("AppPage");
            query.get(itemId).then(function (result) {
                dfd.resolve(result
                )
            });
            return dfd.promise;
        },

        createNewItem: function () {
            var dfd = $q.defer();

            var appPage = new Parse.Object("AppPage");
            appPage.setPageObject(new Object())
            appPage.save(null, {
                success: function (object) {
                    console.log("Created new item with id " + object.id);
                    dfd.resolve(object)
                },
                error: function (model, error) {
                }
            });
            return dfd.promise;
        },
        getCreatorImg: function (item) {
            var dfd = $q.defer();

            var appPage = new Parse.Object("AppPage");
            appPage.setPageObject(new Object())
            appPage.save(null, {
                success: function (object) {
                    console.log("Created new item with id " + object.id);
                    dfd.resolve(object)
                },
                error: function (model, error) {
                }
            });
            return dfd.promise;
        }


    }
})


app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/itemList");
    $stateProvider
        .state('base', {
            abstract: true,
            url: "/",
            templateUrl: "partials/baseView.html",
            resolve: {
                loginService: 'loginService',
                itemsService: 'itemsService'
            },
            controller: 'loginCtrl'
        })
        .state('base.itemList', {
            url: "itemList",
            controller: 'itemsProviderCtrl',
            resolve: {
                items: function (itemsService) {
                    return itemsService.getItems();
                }
            },

            views: {
                'itemList': {
                    templateUrl: "partials/itemList.html",
                    controller: 'itemsProviderCtrl'

                },
                'create': {
                    controller: 'createCtrl',
                    templateUrl: "partials/createPanel.html",
                    resolve: {
                        itemsService: function (itemsService) {
                            return itemsService;
                        }
                    }
                }
            }
        }).state('base.profile', {
            url: "profile",
            views: {
                'userInfo': {
                    templateUrl: "partials/userInfo.html",
                    controller: "userInfoCtrl"
                },
                'itemList': {
                    templateUrl: "partials/itemList.html",
                    controller: "itemsProviderCtrl",
                    resolve: {
                        items: function (itemsService) {
                            return itemsService.getUserItems();
                        }
                    }
                }
            }
        }).state('base.itemList.item', {
            url: "/:itemId",
            abstract: true,
            backdrop: true,

            resolve: {
                item: function (itemsService, $stateParams) {
                    console.log("Item id is " + $stateParams.itemId);
                    return itemsService.getItem($stateParams.itemId);
                },
                loginService: 'loginService',
                itemService: 'itemService'
            },

            onEnter: ['$stateParams', '$state', '$modal', 'item', 'loginService', 'itemService', function ($stateParams, $state, $modal, item, loginService, itemService) {
                console.log('Passed item as ' + item.id);
                $modal.open({
                    templateUrl: 'partials/itemBase.html',
                    animation: true,
                    abstract: true,
                    size: 'lg',

                    controller: 'itemBaseCtrl',

                    resolve: {
                        item: function () {
                            return item;
                        },
                        loginService: function () {
                            return loginService;
                        }
                    }

                }).result.finally(function () {
                        $state.go('base.itemList', [], []);

                    });
            }]

        }).state('base.itemList.item.view', {
            abstract: true,
            url: '/view'
        }).state('base.itemList.item.view.slides', {
            abstract: false,
            url: '/slides',
            views: {
                'slides@': {
                    templateUrl: 'partials/slides.html',
                    controller: 'slidesCtrl'
                }
            }
        }).state('base.itemList.item.view.results', {
            abstract: false,
            url: '/results',
            views: {
                'slides@': {
                    templateUrl: 'partials/results.html',
                    controller: 'resultsCtrl'
                }
            }
        }).state('base.itemList.item.edit', {
            abstract: true,
            url: '/edit',
            views: {
                'itemTabs@': {
                    templateUrl: 'partials/itemTabs.html',
                    controller: 'itemTabsCtrl'
                }
            }
        }).state('base.itemList.item.edit.slides', {
            abstract: false,
            url: '/slides',
            views: {
                'slides': {
                    templateUrl: 'partials/slides.html',
                    controller: 'slidesCtrl'
                }
            }
        }).state('base.itemList.item.edit.cover', {
            abstract: false,
            url: '/cover',
            views: {
                'cover': {
                    templateUrl: 'partials/cover.html',
                    controller: 'coverCtrl'
                }
            }

        }).state('base.itemList.item.edit.results', {
            abstract: false,
            url: '/results',
            views: {
                'results': {
                    templateUrl: 'partials/results.html',
                    controller: 'resultsCtrl'
                }
            }

        })
})
;


