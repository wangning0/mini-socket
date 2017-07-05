const dbModels = require('./dbModels');
const mongoose = require('mongoose');

module.exports = {
    openDb: () => {
        mongoose.connect('mongodb://localhost:27017/chat');
        mongoose.connection.on('open', function() {
			console.log('数据库连接成功');
		});
		mongoose.connection.on('error', function(err) {
			console.log('数据库连接失败:%s', err);
		})
    },
    create: (model, data, cb) => {
        model.create(data, (err, msg) => {
            console.log('success');
            cb(err, msg)
        })
    },
    remove: (model, conditions, cb) => {
        model.remove(conditions, (err, msg) => {
            cb(err, msg)
        })
    },
    update: (model, conditions, updateData, cb) => {
        model.findOneAndUpdate(conditions, updateData, (err, msg) => {
            cb(err, msg)
        })
    },
    findOneMessage: (model, conditions, cb) => {
        model.find(conditions, (err, msg) => {
            console.log(44);
            cb(err, msg);
        })
    }

}