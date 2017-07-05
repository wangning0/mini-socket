module.exports = {
	message: {
		username: {
			type: String
		},
        msg: [{
            name: {
                type: String
            },
            message: {
                type: Array
            }
        }]
	},
	roomMessage: {
		roomId: {
			type: String
		},
		roomChatCount: {
			type: Number
		},
		msg: [{
            name: {
                type: String
            },
            message: {
                type: String
            }
        }]
	}
}