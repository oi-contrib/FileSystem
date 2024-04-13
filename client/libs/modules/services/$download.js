
(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").factory('$download', function () {

        return {

            // 下载单个文件
            downloadFile: function (filename, filepath) {
                var aEl = document.createElement("a");
                aEl.href = "/" + window.systemInfo.data.folder + "/" + filepath;
                aEl.download = filename;
                aEl.click();
            }

        };

    });

})(window, window.angular);
