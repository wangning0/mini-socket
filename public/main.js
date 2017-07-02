var socket = io('http://localhost:9000?from=13&to=12');
socket.on('connect', function () {
    console.log(socket);
    socket.emit('join', '进来了');
});

$('.submit').click(function() {
    var data = $('.usernameInput').val()
    socket.emit('new message', data);
    $('.usernameInput').val('');
});

 socket.on('new message', function (userName, msg) {
    console.log(userName, msg);
 });