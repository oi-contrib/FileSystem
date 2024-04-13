(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").directive('uiDragstart', ['$parse', function ($parse) {
        return {

            // 标明该指令可以在模板中用于元素E、属性A、类C和注释M或组合
            restrict: 'A',

            // link在每个实例都执行一遍，compile全程只会执行一遍
            link: function ($scope, element, attrs, ctrl) {
                element.bind("dragstart", function (event) {
                    $scope.$event = event;
                    $parse(attrs.uiDragstart)($scope);
                });
            }
        };
    }]);

})(window, window.angular);
