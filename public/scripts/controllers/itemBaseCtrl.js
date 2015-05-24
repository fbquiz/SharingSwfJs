app.controller("itemBaseCtrl", function ($scope, $location,item,loginService,$state) {
// Queries
    console.log("in itemBaseCtrl");
    console.log("Current state " + $state.$current);


    $scope.selectedSlide=0;
    $scope.item=item;
    $scope.page = $scope.item.getPageObject();
    $scope.editMode = $state.includes('base.itemList.item.edit');
    $scope.myUrl = '#'+$location.url();

    $scope.shareToFacebook= function(){
        var fbpopup = window.open('https://www.facebook.com/sharer/sharer.php?u=quiz22.parseapp.com/i/'+item.id, "pop", "width=600, height=400, scrollbars=no");
    }


    $scope.toggleEdit=function(){
        $scope.editMode=!$scope.editMode;
        if($scope.editMode){
            $state.go('^.edit.slides');
        }else{
            $state.go('^.^.view');
        }
    }

    $scope.cleanUserActivity = function()
    {
        $scope.page.slides.forEach(
            function handleSlide(slide)
            {
                slide.isSuccess = undefined;
                slide.isFailed = undefined;
                slide.entities.forEach(
                    function handleEntity(entity)
                    {
                        entity.isSuccess = undefined;
                        entity.isPressed = undefined;
                        entity.isFailed = undefined;
                    }
                )

            }
        )
    }

    $scope.save = function () {
        $scope.cleanUserActivity();
        //loginService.login();
        $scope.item.setPageObject($scope.page);
        $scope.item.setUser(Parse.User.current());
        $scope.item.save(null, {
            success: function (object) {
                console.log("Saved with parse id3: " + object.id);
            },
            error: function (model, error) {
                alert("Error" + error);
            }
        });
    };

});

