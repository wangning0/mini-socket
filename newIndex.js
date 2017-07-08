const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 9001;
const db = require('./db');
const dbModels = require('./dbModels');
db.openDb();
const { hash } = require('./utils');

server.listen(port, () => {
    console.log(`监听端口是${port}`);
});

// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

app.use(express.static(__dirname + '/public'));


app.all('/getUnreads', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/getUnreads', (req, res) => {
    const username = req.query.username;
    db.findOneMessage(dbModels.getModel('message'), {
        username: username
    }, (err, docs) => {
        if(docs && docs.length) {
            const data = docs[0].msg.map(item => {
                return {
                    name: item.name,
                    message: item.message[0] || ''
                }
            })
            res.send({
                code: 0,
                msg: '',
                data: data
            })
        } else {
           res.send({
                code: 0,
                msg: '',
                data: []
            }) 
        }
    })
})

// 获取当前未读消息的接口

io.on('connection', function(socket) {
    const fromId = socket.handshake.query.from.toString();
    const toId = socket.handshake.query.to;
    const checkExistRoom = hash(toId, fromId);
    db.findOneMessage(dbModels.getModel('roomMessage'), {
        roomId: checkExistRoom
    }, function (err, doc) {
        let roomId;
        // console.log(doc);
        // 第一次进入两个人的聊天界面
        if(!doc.length) {
            roomId = hash(fromId, toId);
            db.findOneMessage(dbModels.getModel('roomMessage'), {
               roomId: roomId 
            }, (err, doc) => {
                if(!doc.length) {
                    db.create(dbModels.getModel('roomMessage'), {
                        roomId: roomId,
                        roomChatCount: 0,
                        msg: []
                    }, (err, doc) => {
                        //console.log('chenggong');
                    })
                }
            })
           // console.log(roomId, 111);
            
        } else {
            roomId = checkExistRoom;
        }

        socket.on('join', (username) => {
            console.log(2121);
            db.findOneMessage(dbModels.getModel('message'), {
                username: username
            }, function(err, doc) {
                if(doc && !doc.length) {
                    db.create(dbModels.getModel('message'), {
                        username: username,
                        msg: []
                    }, (err, doc) => {})
                }
            })
            
            db.findOneMessage(dbModels.getModel('roomMessage'), {
                roomId: roomId
            }, function (err, doc) {
                console.log(doc);
                if(!doc.length || !doc[0].roomChatCount) {
                    db.update(dbModels.getModel('roomMessage'), {
                        roomId: roomId
                    }, {
                        roomChatCount: 1
                    }, (err, doc) => {})
                } else {
                    db.update(dbModels.getModel('roomMessage'), {
                        roomId: roomId
                    }, {
                        roomChatCount: Number(doc[0].roomChatCount) + 1
                    }, (err, doc) => {})
                    console.log(doc[0].msg, 2121);
                    if(doc[0].msg) {
                        const r = doc[0].msg;
                        r && r.map(item => {
                            io.to(roomId).emit('new message', item);
                        })
                        console.log(doc[0].msg,322);
                        db.findOneMessage(dbModels.getModel('message'), {
                            username: fromId
                        }, function (err, doc) {
                            const data = doc && doc[0] && doc[0].msg;
                            const newMessage = data && data.filter(item => {
                                return item.name != toId
                            });
                            console.log(newMessage, 111);
                            db.update(dbModels.getModel('message'), {
                                username: fromId
                            }, {
                                msg: newMessage
                            }, (err, doc) => {})
                        })
                        db.update(dbModels.getModel('roomMessage'), {
                            roomId: roomId
                        }, {
                            msg: []
                        }, (err, doc) => {})
                    }
                }
            })
            socket.join(roomId);
        })

        socket.on('new message', function (data) {
            db.findOneMessage(dbModels.getModel('roomMessage'), {
                roomId: roomId
            }, function (err, doc) {
                if(doc && doc.length) { 
                    const r = doc[0].msg;
                    r.push(data);
                    if(doc[0].roomChatCount == 1) {
                        db.findOneMessage(dbModels.getModel('message'), {
                            username: toId
                        }, function (err, doc) {
                            console.log(doc,21);
                            if(doc && doc.length) {
                                console.log('....')
                                // const fromIdData = doc[0].msg[fromId] || [];
                                let count = 0;
                                const newMessage = doc[0].msg.map(item => {
                                    if(item.name == fromId) {
                                        const newItemMessage = item.message;
                                        newItemMessage.push(data.message);
                                        return {
                                            name: item.name,
                                            message: newItemMessage
                                        };
                                    } else {
                                        count++;
                                        return item;
                                    }
                                })
                                console.log(count, doc[0].msg.length);
                                if(count == doc[0].msg.length) {
                                    newMessage.push({
                                        name: fromId,
                                        message: [data.message]
                                    })
                                }
                                db.update(dbModels.getModel('message'), {
                                    username: toId
                                    }, {
                                        msg: newMessage
                                    }, (err, doc) => {})
                            } else {
                                console.log('??');
                                db.create(dbModels.getModel('message'), {
                                    username: toId,
                                    msg: [{
                                        name: data.name,
                                        message: [data.message]
                                    }]
                                }, (err, doc) => {console.log(err,2112)})
                            }
                        })
                    } else {
                        io.to(roomId).emit('new message', data);
                        // db.update(dbModels.getModel('roomMessage'), {
                        //    roomId: roomId 
                        // }, {
                        //     msg: []
                        // }, (err, doc) => {})
                    }
                     db.update(dbModels.getModel('roomMessage'), {
                        roomId: roomId 
                    }, {
                        msg: r
                    }, (err, doc) => {})
                }
            })
        });

        socket.on('disconnect', function () {
            db.findOneMessage(dbModels.getModel('roomMessage'), {
                roomId: roomId
            }, (err, doc) => {
                if(doc && doc.length) {
                    const count = doc[0].roomChatCount;
                    db.update(dbModels.getModel('roomMessage'), {
                        roomId: roomId
                    }, {
                        roomChatCount: count - 1
                    }, (err, doc) => {})
                }
            })
        });
    })
})

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
    // socket.on('new message', function (data) {
    //     redis.get(`${roomId}Count`).then(result => {
    //         if(result == 1) {
    //             redis.get(roomId).then(res => {
    //                 if(res) {
    //                     const r = JSON.parse(res);
    //                     r.push(data);
    //                     redis.set(roomId, JSON.stringify(r))
    //                 } else {
    //                     redis.set(roomId, JSON.stringify([data]))
    //                 }
    //             })
    //         } else {
    //             io.to(roomId).emit('new message', data);
    //             redis.set(roomId, '');
    //         }
    //     })
    // });
    // socket.on('disconnect', function () {
    //     redis.get(`${roomId}Count`).then(result => {
    //         redis.set(`${roomId}Count`, Number(result) - 1);
    //     })
    // });
    
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
