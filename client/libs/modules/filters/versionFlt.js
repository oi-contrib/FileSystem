(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").filter('versionFlt', function () {
        return function (input) {
            return input + window.systemInfo.version;
        };
    });

})(window, window.angular);
