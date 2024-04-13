(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").directive('uiRightmenu', ['$parse', function ($parse) {
        return {

            // 标明该指令可以在模板中用于元素E、属性A、类C和注释M或组合
            restrict: 'A',

            // link在每个实例都执行一遍，compile全程只会执行一遍
            link: function ($scope, element, attrs, ctrl) {

                // 电脑右键
                element.bind("contextmenu", function (event) {
                    $scope.$event = event;
                    $parse(attrs.uiRightmenu)($scope);
                });

                // 手机长按
                var timer = null;
                element.bind("touchstart", function (event) {
                    timer = setTimeout(function () {

                        event.clientX = event.touches[0].clientX;
                        event.clientY = event.touches[0].clientY;

                        $scope.$event = event;
                        $parse(attrs.uiRightmenu)($scope);
                    }, 500);
                }).bind("touchend", function (event) {
                    clearTimeout(timer);
                });
            }
        };
    }]);

})(window, window.angular);
