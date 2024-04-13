(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").directive('uiDragUpload', ['$parse', function ($parse) {
        return {

            // 标明该指令可以在模板中用于元素E、属性A、类C和注释M或组合
            restrict: 'A',

            // link在每个实例都执行一遍，compile全程只会执行一遍
            link: function ($scope, element, attrs, ctrl) {

                element.bind("dragover", function (event) {
                    event.preventDefault();
                });

                element.bind("drop", function (event) {
                    event.preventDefault();

                    var doUploads = function (files) {
                        $scope.$files = files;
                        $parse(attrs.uiDragUpload)($scope);
                    };

                    var files = [], count = 0;
                    for (var i = 0; i < event.originalEvent.dataTransfer.files.length; i++) {
                        if (event.originalEvent.dataTransfer.files[i].type) {
                            files.push(event.originalEvent.dataTransfer.files[i]);
                        } else {
                            var readFolder = function (webkitGetAsEntry) {
                                try {
                                    count += 1;
                                    var dirReader = webkitGetAsEntry.createReader();
                                    dirReader.readEntries(function (entries) {
                                        entries.forEach(function (item) {
                                            if (item.isFile) {
                                                count += 1;
                                                item.file(function (file) {
                                                    files.push(new File([file], (webkitGetAsEntry.fullPath + "/" + file.name).replace(/^\//, ''), {
                                                        type: file.type
                                                    }));
                                                    count -= 1;
                                                    if (count == 0) doUploads(files);
                                                });

                                            } else {
                                                readFolder(item);
                                            }
                                        });
                                        count -= 1;
                                        if (count == 0) doUploads(files);
                                    });
                                } catch (err) {
                                    console.error(err);
                                }
                            };
                            readFolder(event.originalEvent.dataTransfer.items[i].webkitGetAsEntry());
                        }
                    }
                    if (count == 0) doUploads(files);
                });

            }
        };
    }]);

})(window, window.angular);
