ctrlapp.register.controller('LoginController', ['$scope', '$fetch', function ($scope, $fetch) {

    $scope.initMethod = function () {
        $scope.params = {
            username: "",
            password: ""
        };
    };

    // 登录
    $scope.doLogin = function () {
        if (!$scope.params.username) {
            alert("用户名不可以为空！");
        } else if (!$scope.params.password) {
            alert("密码不可以为空！");
        } else {
            $fetch.post("/verification/login", $scope.params).then(function (res) {
                sessionStorage.setItem('isLogin', 'yes');
                sessionStorage.setItem('userinfo', JSON.stringify(res.data));
                $scope.goto("index");
            });
        }
    };

}]);
