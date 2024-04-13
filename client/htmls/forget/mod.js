ctrlapp.register.controller('ForgetController', ['$scope', '$url', '$fetch', function ($scope, $url, $fetch) {

    $scope.initMethod = function () {
        $scope.params = {
            username: "",
            email: "",
            emailcode: "",
            password1: "",
            password2: ""
        };

    };

    //  发送验证邮件
    $scope.sendEmail = function () {
        if ($scope.params.email) {
            $fetch.post("/verification/email", {
                type: "forget",
                email: $scope.params.email
            }).then(function (res) {
                alert(res.msg);
            });
        } else {
            alert("邮箱不可以为空！");
        }
    };

    // 修改密码
    $scope.resetPassword = function () {
        if (!$scope.params.username) {
            alert("用户名不可以为空！");
        } else if (!$scope.params.email) {
            alert("邮箱不可以为空！");
        } else if (!$scope.params.emailcode) {
            alert("邮箱验证码不可以为空！");
        } else if (!$scope.params.password1) {
            alert("密码不可以为空！");
        } else if ($scope.params.password1 != $scope.params.password2) {
            alert("两次密码不一致！");
        } else {
            $fetch.post("/verification/resetPassword", $scope.params).then(function (res) {
                alert(res.msg);
                $scope.goto("login");
            });
        }

    };

}]);
