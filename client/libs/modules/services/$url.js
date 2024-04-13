
(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").factory('$url', function () {

        return {

            urlFormat: function () {
                var temp = (window.location.hash + "#").split("#")[1].replace(/^\//, '').replace(/\/$/, '').split("?")

                var routerTemp = temp[0].split('/');
                var paramTemp = (window.location.search.replace(/^\?/, "") + (temp[1] ? ("&" + temp[1]) : "")).replace(/^\&/, "");

                var paramResult, paramArray;
                if (paramTemp == "") {
                    paramResult = {};
                } else {
                    paramArray = paramTemp.split("&"), paramResult = {};
                    paramArray.forEach(function (item) {
                        var temp = item.split("=");
                        paramResult[temp[0]] = temp[1];
                    })
                }

                var resultData = {
                    router: routerTemp[0] == '' ? [] : routerTemp,
                    params: paramResult,
                    origin: window.location.origin
                };

                return resultData;
            }

        };

    });

})(window, window.angular);
