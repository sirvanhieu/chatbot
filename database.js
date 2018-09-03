/////Search engine functions create new, update, delete data in mongoDb
MongoClient = require('mongodb').MongoClient;
mongodb = require('mongodb');
config = require('config');

MONGO_URL = (process.env.MESSENGER_APP_SECRET) ?
	process.env.MESSENGER_APP_SECRET :
	config.get('mongoUrl');
DATA_BASE_NAME = (process.env.MESSENGER_APP_SECRET) ?
	process.env.MESSENGER_APP_SECRET :
	config.get('databasename');
SERVER_URL = (process.env.SERVER_URL) ?
	(process.env.SERVER_URL) :
	config.get('serverURL');



var dbQueryCounter = 0;
var maxDbIdleTime = 5000;
module.exports = {
	getConnection: function (callback) {

		MongoClient.connect(MONGO_URL, function (err, client) { //conn =client;
			//console.log("Create:",client);
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				//console.log("Create conn 2:");
				callback(client);
			}
		});

	},

	findMembersByGroup: function (pipeline, options, client, callback) {

		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('Members');
		collection.aggregate(pipeline, options).toArray(function (err, results) {
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},

	getListMember: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('JMembers');
		// Find some documents
		collection.find(query).sort({
			"Pic": -1, "Vote":-1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},

	findMembers: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('JMembers');
		// Find some documents
		collection.find(query).sort({
			"_id": 1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(null, results);
			}
		});
	},

	findPic: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('Pictures');
		// Find some documents
		collection.find(query).sort({
			"Keyid": 1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(null);
			} else {
				console.log("findPic:", results);
				callback(results);
			}
		});
	},

	findMemberVote: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('VoteLog');
		console.log("findMemberVote query:", query);
		// Find some documents
		collection.find(query).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(null);
			} else {
				//console.log("findMemberVote:", results);
				callback(results);
			}
		});
	},

	findMembersKey: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('JMembers');
		// Find some documents
		collection.find(query).sort({
			"KeyId": -1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				if (results.length > 0) {
					callback(null, results[0].KeyId);
				} else {
					callbanck(null, 0)
				};
			}
		});
	},

	votePic: function (voteId, picId, idPost, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('VoteLog');
		var objVote = {
			"VoteId": voteId,
			"PicId": picId
		};
		console.log('Update Pic Vote');
		const piccoll = db.collection('Pictures');
		piccoll.updateOne({
			'KeyId': picId
		}, {
			$inc: {
				Vote: 1
			},
		}, function (err, res) {

			if (err) {
				console.log("Vote Update err:", err);
				callback(err);
			} else {
				console.log('Update Member Vote');
				const memcoll = db.collection('JMembers');
				memcoll.updateOne({
					'_id': idPost
				}, {
					$inc: {
						Vote: 1
					},
				}, function (err, res) {

					if (err) {
						console.log("Vote Update err:", err);
						callback(err);
					} else {
						console.log('Insert Vote Log');
						collection.insertOne(objVote, function (err, res) {
							//neu xay ra loi
							if (err) {
								console.log("Vote Insert err:", err);
								callback(err);
							} else {}
							callback(null, res);
							//	console.log('Vote Insert vote :', objVote);
							//console.log("Vote Insert:", res);
							//callback(res);
						});

					}
				});
			}
		});


	},

	insertMembers: function (objMember, client, callback) {
		var mydate = new Date();
		var inputDate = new Date(mydate.toISOString());
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('JMembers');
		//var objCallback = null;
		var key = 1;
		collection.find({
			'_id': objMember._id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					collection.find().sort({
						"KeyId": -1
					}).toArray(function (err, results2) {
						//    assert.equal(err, null);
						if (err) {
							console.log("Get max err:", err);
						} else {
							if (results2.length > 0) {
								key = results2[0].KeyId;
								console.log('Max', key);
							} else {
								key = 1;
							}
						}
						key += 1;
						console.log('Key2 ', key);
						var objMember1 = {
							"_id": objMember._id,
							"Name": objMember.Name,
							"Birthday": objMember.Birthday,
							"Phone": objMember.Phone,
							"Email": objMember.Email,
							"ImgUrl": objMember.ImgUrl,
							"Vote": 0,
							"Pic": 0,
							"KeyId": key
						};


						collection.insertOne(objMember1, function (err, res) {
							//neu xay ra loi
							if (err) throw err;
							//neu khong co loi			
							//console.log('Them thanh cong :',objMember);
							//callback(objMember.Key);
							callback(null, key);
						});
					});
				} else {
					var objMemberUpdate = {
						$set: {
							"Name": objMember.Name,
							"Birthday": objMember.Birthday,

							"Phone": objMember.Phone,
							"Email": objMember.Email,
							"ImgUrl": objMember.ImgUrl
						}
					};
					collection.updateOne({
						'_id': objMember._id
					}, objMemberUpdate, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						//console.log('Them thanh cong :',objMember);
						console.log("Update:", objMemberUpdate);
						callback(null, results[0].KeyId);
					});
					//callback(null, res);

				}

			}
		});

	},

	findPicKey: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('Pictures');
		// Find some documents
		collection.find(query).sort({
			"KeyId": -1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				//console.log("pic key:", results);

				callback(null, results);

			};
		});
	},


	insertPic: function (objProduct, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Pictures');
		const collmem = db.collection('JMembers');
		//var objCallback = null;
		console.log("objProduct :", objProduct);
		collmem.updateOne({
			_id: objProduct.IdPost
		}, {
			$inc: {
				Pic: 1
			},
		}, function (err, res) {

			if (err) {
				console.log("Update pic:", err);
				callback(err);
			} else {
				collection.insertOne(objProduct, function (err, res) {
					//neu xay ra loi
					if (err) throw err;
					//neu khong co loi			
					//console.log('Them thanh cong :',objMember);
					callback(null, res);
				});
			}
		})

	},


	updateAvatarMemeber: function (psid, url, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		var objMemberUpdate = {
			$set: {
				"ImgUrl": url
			}
		};
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(null, res);
		});
	},


	// Toanva process User - End

}
