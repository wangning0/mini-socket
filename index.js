// const express = require('express');
// const app = express();
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// const port = process.env.PORT || 9000;
// const Redis = require('ioredis');
// const redis = new Redis();
// const { hash } = require('./utils');

// server.listen(port, () => {
//     console.log(`监听端口是${port}`);
// });

// app.use(express.static(__dirname + '/public'));

// // 获取当前未读消息的接口


// io.on('connection', function (socket) {
//   const fromId = socket.handshake.query.from;
//   const toId = socket.handshake.query.to;
//   console.log(fromId, toId);
//   const checkExistRoom = hash(toId, fromId);
//   console.log(checkExistRoom, toId, fromId );
//   let roomId;
//   const connect = async (checkExistRoom) => {
//     roomId = await getRoomId(checkExistRoom);
//     socket.on('join', function (username) {
//         redis.get(`${roomId}Count`).then(result => {
//             if(result) {
//                 redis.get(roomId).then(res => {
//                     if(res) {
//                         const r = JSON.parse(res);
//                         r && r.map(item => {
//                             io.to(roomId).emit('new message', item);
//                         })
//                     }
//                 })
//                 redis.set(roomId, '');
//                 redis.set(`${roomId}Count`, Number(result) + 1);
//             } else {
//                 redis.set(`${roomId}Count`, 1);
//             }
//         });
//         socket.join(roomId);
//     });
//     socket.on('new message', function (data) {
//         redis.get(`${roomId}Count`).then(result => {
//             if(result == 1) {
//                 redis.get(roomId).then(res => {
//                     if(res) {
//                         const r = JSON.parse(res);
//                         r.push(data);
//                         redis.set(roomId, JSON.stringify(r))
//                     } else {
//                         redis.set(roomId, JSON.stringify([data]))
//                     }
//                 })
//             } else {
//                 io.to(roomId).emit('new message', data);
//                 redis.set(roomId, '');
//             }
//         })
//     });
//     socket.on('disconnect', function () {
//         redis.get(`${roomId}Count`).then(result => {
//             redis.set(`${roomId}Count`, Number(result) - 1);
//         })
//     });
    
// };

//     function getRoomId(checkExistRoom) {
//         return new Promise((res, rej) => {
//             redis.get(checkExistRoom).then(result => {
//                 console.log(result);
//                 if(result || result == '') {
//                     res(checkExistRoom);
//                 } else {
//                     console.log(fromId, toId, hash(fromId, toId));
//                     redis.get(hash(fromId, toId)).then(result => {
//                         if(!result) {
//                             redis.set(hash(fromId, toId), '');
//                         }
//                     })
//                     res(hash(fromId, toId));
//                 }
//             })
//         })
//     }

//     connect(checkExistRoom);


// });