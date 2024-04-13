
(function (window, angular, undefined) {

    "use strict";

    angular.module("ui.libraries").factory('$upload', function () {

        var instance = {

            // 分片上传大文件
            uploadBigFile: function (currentPath, file, processback, callback) {
                var filepath = file.webkitRelativePath || file.name;

                var sharedSize = 10 * 1024 * 1024;
                var sharedCount = Math.ceil(file.size / sharedSize);

                var uploadSlice = function (i) {
                    var formData = new FormData();
                    var start = i * sharedSize;
                    var end = Math.min(file.size, start + sharedSize);

                    formData.append('data', file.slice(start, end));
                    formData.append('path', currentPath);
                    formData.append('filename', encodeURIComponent(file.name));
                    formData.append('filepath', encodeURIComponent(filepath));

                    formData.append('total', sharedCount);
                    formData.append('index', i);
                    formData.append('size', sharedSize);

                    fetch("/handler/uploadSlice", {
                        method: "POST",
                        body: formData
                    }).then(function (response) {
                        response.json().then(function (res) {

                            // 全部完成
                            if (i + 1 >= sharedCount) {
                                callback(res, filepath);
                            }

                            // 完成单个
                            else {
                                processback((i + 1) / sharedCount, "大文件分片上传中(" + (i + 1) + "/" + sharedCount + ")[上传成功]" + filepath);

                                // 上传下一片
                                uploadSlice(i + 1);
                            }
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
                };

                uploadSlice(0);
            },

            // 上传单个文件
            uploadFile: function (currentPath, file, processback, callback) {
                if (file.size > 10 * 1024 * 1024) {
                    this.uploadBigFile(currentPath, file, processback, callback);
                    return;
                }

                var filepath = file.webkitRelativePath || file.name;
                var formData = new FormData();

                formData.append('file', file);
                formData.append('path', currentPath);
                formData.append('filename', encodeURIComponent(file.name));
                formData.append('filepath', encodeURIComponent(filepath));

                fetch("/handler/upload", {
                    method: "POST",
                    body: formData
                }).then(function (response) {
                    response.json().then(function (res) {
                        callback(res, filepath);
                    });
                }).catch(function (err) {
                    console.log(err);
                });
            },

            // 上传多文件
            uploadMultFile: function (currentPath, files, processback, callback) {
                var index = -1;

                var hadLen = 0;
                var updateProcess = function (res, filepath) {
                    hadLen += 1;
                    processback(hadLen / files.length, "#" + hadLen + "/" + files.length + " [上传成功] " + filepath);
                    if (hadLen == files.length) {
                        callback();
                    }
                };

                var doUploadCallback = function () {
                    index += 1;

                    if (index == files.length - 1) {
                        instance.uploadFile(currentPath, files[index], processback, updateProcess);
                    } else {
                        instance.uploadFile(currentPath, files[index], processback, function (res, filepath) {
                            updateProcess(res, filepath);
                            doUploadCallback();
                        });
                    }
                };

                if (files.length > 0) {
                    doUploadCallback();
                }
            }

        };

        return instance;
    });

})(window, window.angular);
