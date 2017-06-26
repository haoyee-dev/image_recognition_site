/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var videoElement = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
var selectors = [videoSelect];

function gotDevices(deviceInfos) {

    // Handles being called several times to update labels. Preserve values.
    var values = selectors.map(function (select) {
        return select.value;
    });

    selectors.forEach(function (select) {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });

    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;

        if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
            videoSelect.appendChild(option);
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
    }

    selectors
        .forEach(function (select, selectorIndex) {
            if (Array.prototype.slice.call(select.childNodes).some(function (n) {
                return n.value === values[selectorIndex];
            })) {
                select.value = values[selectorIndex];
            }
        });
}

navigator
    .mediaDevices
    .enumerateDevices()
    .then(gotDevices)
    .catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
        element
            .setSinkId(sinkId)
            .then(function () {
                console.log('Success, audio output device attached: ' + sinkId);
            })
            .catch(function (error) {
                var errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = 'You need to use HTTPS for selecting audio output device: ' + error;
                }
                console.error(errorMessage);

                // Jump back to first output device in the list as it's the default.
                audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;

    // Refresh button list in case labels have become available
    return navigator
        .mediaDevices
        .enumerateDevices();
}

function start() {
    if (window.stream) {
        window
            .stream
            .getTracks()
            .forEach(function (track) {
                track.stop();
            });
    }

    //    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;
    var constraints = {
        video: {
            deviceId: videoSource
                ? {
                    exact: videoSource
                }
                : undefined
        }
    };

    navigator
        .mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .then(gotDevices)
        .catch(handleError);
}

videoSelect.onchange = start;

start();
submitImage();

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

function submitImage() {
    var canvas = document.getElementById('canvas');
    var video = document.getElementById('video');
    var imageDiv = document.getElementById('imageDiv');
    var videoDiv = document.getElementById('videoDiv');
    var context = canvas.getContext('2d');
    var snap = document.getElementById('snap');
    var submit = document.getElementById('submit');
    var reset = document.getElementById('reset');
    var resultDiv = document.getElementById('resultDiv');
    var loadingDiv = document.getElementById('loadingDiv');

    snap.addEventListener('click', function () {
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        stream
            .getVideoTracks()
            .forEach(function (s) {
                s.stop()
            });
        imageDiv.style.display = 'block';
        snap.style.display = 'none';
        videoDiv.style.display = 'none';
    });

    submit.addEventListener('click', function (e) {
        e.preventDefault();
        console.log(canvas.toDataURL());
        loadingDiv.style.display = 'block';

        var result = document.getElementById('result');

        $.ajax({
            url: "https://us-central1-image-recognition-171007.cloudfunctions.net/translateImage",
            data: canvas.toDataURL(),
            dataType: "text",
            contentType: "text/plain",
            method: "POST",
            processData: false,
            success: function (data) {
                resultDiv.style.display = 'block';
                loadingDiv.style.display = 'none';
                if (data.length <= 0) {
                    result.innerHTML = "No result"
                }
                else {
                    result.innerHTML = data;
                }
                console.log(data);
            },
            error: function (err) {
                resultDiv.style.display = 'block';
                loadingDiv.style.display = 'none';
                result.innerHTML = err;
                console.log(err);
            }
        })
    });

    reset.addEventListener('click', function (e) {
        imageDiv.style.display = 'none';
        snap.style.display = 'block';
        videoDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        start();
    });
}