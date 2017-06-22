$(document).ready(function() {
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var video = document.querySelector('video');
    var stream;
    navigator.mediaDevices.getUserMedia({video:true}).then( function(localMediaStream) {
        stream = localMediaStream;
        video.src = window.URL.createObjectURL(localMediaStream);
    });

    var canvas = document.getElementById('canvas');
    var form = document.getElementById('form');
    var context = canvas.getContext('2d');
    var snap = document.getElementById('snap');
    var submit = document.getElementById('submit');

    snap.addEventListener('click', function() {
        context.drawImage(video, 0, 0, 320, 240);
        stream.getVideoTracks().forEach(function(s) { s.stop()});
        form.style.display = 'block';
        video.style.display = 'none';
        snap.style.display = 'none';
    })

    submit.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(canvas.toDataURL());

        $.ajax({
            url: "https://us-central1-image-recognition-171007.cloudfunctions.net/translateImage",
            data: canvas.toDataURL(),
            dataType: "text",
            contentType: "text/plain",
            method: "POST",
            processData: false,
            success:  function(data) {
                $("#result").html(data);
            }
        })
    })
}
else {
    console.log("no media");
}
});