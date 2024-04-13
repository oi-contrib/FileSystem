
(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").factory('$fetch', ['$rootScope', function ($rootScope) {

        return {

            post: function (url, params) {
                return new Promise(function (resolve, reject) {
                    fetch(url, {
                        method: "post",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(params)
                    }).then(function (response) {
                        response.json().then(function (res) {
                            if (res.code == '000000') {
                                resolve(res);
                            } else if (res.code == '-1') {
                                reject(res);
                                $rootScope.goto("login");

                                setTimeout(function () {
                                    alert("权限不足，未登录或登录失效！");
                                }, 200);
                            } else {
                                alert(res.msg);
                                reject(res);
                            }
                        });
                    });
                });
            },

            get: function (url) {
                return new Promise(function (resolve, reject) {
                    fetch(url, {
                        method: "GET"
                    }).then(function (response) {
                        response.json()
                            .then(function (res) {
                                if (res.code == '000000') {
                                    resolve(res);
                                } else if (res.code == '-1') {
                                    reject(res);
                                    $rootScope.goto("login");

                                    setTimeout(function () {
                                        alert("权限不足，未登录或登录失效！");
                                    }, 200);
                                } else {
                                    alert(res.msg)
                                    reject(res);
                                }
                            });
                    });
                });
            }

        };

    }]);

})(window, window.angular);
