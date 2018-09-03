var express = require('express');
var mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
var objDb = require('../database.js');
var util = require('util');
const multer = require('multer');
var cloudinary = require('cloudinary');
var fs = require('fs');
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fieldSize: 2 * 1024 * 1024
	}
});
var keyId = 0;
var router = express.Router();
const {
	MessengerClient
} = require('messaging-api-messenger');
var config = require('config');

const SERVER_URL = (process.env.SERVER_URL) ?
	(process.env.SERVER_URL) :
	config.get('serverURL');
// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
	process.env.MESSENGER_APP_SECRET :
	config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
	(process.env.MESSENGER_VALIDATION_TOKEN) :
	config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
	(process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
	config.get('pageAccessToken');
const IMAGE_CLOUD_NAME = (process.env.SERVER_URL) ?
	(process.env.SERVER_URL) :
	config.get('image_cloud_name');
const IMAGE_API_KEY = (process.env.SERVER_URL) ?
	(process.env.SERVER_URL) :
	config.get('image_api_key');
const IMAGE_API_SECRET = (process.env.SERVER_URL) ?
	(process.env.SERVER_URL) :
	config.get('image_api_secret');
//const client = MessengerClient.connect();
const client = MessengerClient.connect({
	accessToken: PAGE_ACCESS_TOKEN,
	version: '3.1',
});
cloudinary.config({
	cloud_name: IMAGE_CLOUD_NAME,
	api_key: IMAGE_API_KEY,
	api_secret: IMAGE_API_SECRET
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

router.get('/setup', function (req, res, next) {

	client.setGetStarted('GET_STARTED');

});



router.get('/facebook', function (req, res, next) {

	console.log("get facebook")
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log("Validating webhook facebook : ", req.query['first_name']);
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log("Không xác nhận. Đảm bảo rằng token hợp lệ phù hợp.");
		res.sendStatus(403);
	}

});

router.post('/facebook', function (req, res, next) {

	var data = req.body;
	console.log("Res Post facebook");

	// Checks this is an event from a page subscription
	if (data.object === 'page') {

		// Iterates over each entry - there may be multiple if batched
		data.entry.forEach(function (pageEntry) {
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			if (pageEntry.messaging) {
				pageEntry.messaging.forEach(function (messagingEvent) {
					var senderID = messagingEvent.sender.id;
					//console.log("face event", messagingEvent.postback.payload);
					if (messagingEvent.message) {
						//console.log("Res Post facebook 1");
						receivedMessage(messagingEvent);


					} else if (messagingEvent.delivery) {
						console.log("Res Post delivery");
						////receivedDeliveryConfirmation(messagingEvent);
					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'GET_STARTED') {
						/*client.sendAttachment(senderID, {
							type: 'image',
							payload: {
								url: 'http://static.tapchitaichinh.vn/660x450/Uploaded/tranhuyentrang/2014_02_25/nhat%20ban.jpg',
							},
						});*/
						client.getUserProfile(senderID).then(user => {
							client.sendText(senderID, 'Chào ' + user.first_name + ', bạn có muốn tham gia cuộc thi ảnh giao lưu Việt Nam - Nhật Bản do Hội LHTN Việt Nam tổ chức không?', {
								quick_replies: [{
									content_type: 'text',
									title: 'Chắc chắn rồi',
									payload: 'MENU',
								}, ],
							});
						});

						//present user with some greeting or call to action


					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'POST_INFO') {
						client.sendSenderAction(senderID, 'typing_on');
						client.sendImage(senderID, 'https://sirhieu.herokuapp.com/images/ftt.png').then(() => {
							client.sendText(senderID, 'Bạn hiểu chưa nhỉ? Mình cùng tiếp tục nhé', {
								quick_replies: [{
									content_type: 'text',
									title: 'Ok',
									payload: 'MENU',
								}, ],
							});
						});

					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'POST_RULE') {
						client.sendSenderAction(senderID, 'typing_on');
						client.sendImage(senderID, 'https://sirhieu.herokuapp.com/images/ftl.jpg').then(() => {
							client.sendText(senderID, 'Bạn hiểu chưa nhỉ? Mình cùng tiếp tục nhé', {
								quick_replies: [{
									content_type: 'text',
									title: 'Ok',
									payload: 'MENU',
								}, ],
							});
						});



					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'MENU') {
						client.sendSenderAction(senderID, 'typing_on');
						client.sendGenericTemplate(
							senderID, [{
								title: 'THÔNG TIN',
								image_url: 'https://sirhieu.herokuapp.com/images/tt.jpg',
								subtitle: 'Thông tin cuộc thi',
								default_action: {
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/images/tt.jpg',
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: '',
									/*'https://sirhieu.herokuapp.com/',*/
								},
								buttons: [{
									type: 'postback',
									title: 'Thông tin cuộc thi',
									payload: 'POST_INFO',
								}, {
									type: 'postback',
									title: 'Thể lệ cuộc thi',
									payload: 'POST_RULE',
								}, ],
							}, {
								title: 'GỬI BÀI THI',
								image_url: 'https://sirhieu.herokuapp.com/images/gb.jpg',
								subtitle: 'Gửi ảnh dự thi',
								default_action: {
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/images/gb.jpg',
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: '',
									/*'https://sirhieu.herokuapp.com/',*/
								},
								buttons: [{
									title: 'Đăng ký',
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/register.html?psid=' + senderID,
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: 'https://sirhieu.herokuapp.com/register.html?psid=' + senderID,
								}, {
									title: 'Gửi ảnh',
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/iproducts.html?psid=' + senderID,
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: 'https://sirhieu.herokuapp.com/iproducts.html?psid=' + senderID,
								}, {
									title: 'Quản lý ảnh',
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/qla.html?psid=' + senderID,
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: 'https://sirhieu.herokuapp.com/qla.html?psid=' + senderID,
								}, ],
							}, {
								title: 'BÌNH CHỌN',
								image_url: 'https://sirhieu.herokuapp.com/images/bc.jpg',
								subtitle: 'Bình chọn ảnh đẹp',
								default_action: {
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/images/bc.jpg',
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: '',
									/*'https://sirhieu.herokuapp.com/',*/
								},
								buttons: [{
									title: 'Bình chọn',
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/vote.html?psid=' + senderID,
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: 'https://sirhieu.herokuapp.com/vote.html?psid=' + senderID,
								}, {
									title: 'Bảng xếp hạng',
									type: 'web_url',
									url: 'https://sirhieu.herokuapp.com/ranktbl.html?psid=' + senderID,
									messenger_extensions: true,
									webview_height_ratio: 'tall',
									fallback_url: 'https://sirhieu.herokuapp.com/ranktbl.html?psid=' + senderID,
								}, ],
							}, ], {
								image_aspect_ratio: 'square'
							}
						);

					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'CODE') {

						/*var query = {
							_id: senderID
						};*/
						console.log("key", keyId);
						/*objDb.getConnection(function (client) {
							objDb.findMembersKey(query, client, function (err, results) {
								if (err) {
									console.log('Find: ', err);
								} else {
									console.log(results);

								}
							});
						});*/
						var msg = 'Mã số dự thi của bạn là ' + keyId;
						client.sendText(senderID, msg, {
							quick_replies: [{
								content_type: 'text',
								title: 'Menu',
								payload: 'MENU',
							}, ],
						});

					} else {
						console.log("Facebook Webhook received unknown messagingEvent: ", messagingEvent);
					}
					////// Cập nhật lại thời gian hết hạn của member để đếm số thành viên đang hoạt động với bót


				});
			} else {
				console.log("Messaging undefined");
			}

		});

		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}


});

router.post('/registerspostback', upload.single('somefile'), (req, res) => {

	try {
		let body = req.body;
		//req.session.psid = body.psid;
		var mydate = new Date();
		var inputDate = new Date(mydate.toISOString());
		console.log('psid ', body.psid);
		client.getUserProfile(body.psid).then(user => {
			imgUrl = user.profile_pic;
			var objMember = {
				"_id": body.psid,
				"Name": body.Name,
				"Birthday": body.Birthday,
				"Phone": body.Phone,
				"Email": body.Email,
				"Vote": 0,
				"Pic": 0,
				"ImgUrl": imgUrl
			};
			console.log('Name ', body.Name);
			objDb.getConnection(function (client) {
				objDb.insertMembers(objMember, client, function (err, results) {
					//	   res.send(results);
					//console.log(results);
					if (err) {
						//client.close();
						client.sendText(body.psid, 'Echo:' + err);
					} else {

						console.log("registerspostback: ", objMember);
						keyId = results;
						//writeFile(imgName,body.DataImgAvatar,dir,body.psid);
						client.close();
						res.status(200).send('Please close this window to return to the conversation thread.');
						//res.send(objMember);
					}
				});
				//// end insert member
			});
			var returnMessage = "Tuyệt vời! Dưới đây là thông tin đầy đủ của bạn nhé:" + "\n" + "- Thí sinh: " + body.Name + "\n" + "- Sinh ngày: " + body.Birthday + "\n" + "- Số điện thoại: " + body.Phone + "\n" + "- Email: " + body.Email + "\n" + "Đúng chưa nhỉ?";
			client.sendButtonTemplate(body.psid, returnMessage, [{
				type: 'web_url',
				url: 'https://sirhieu.herokuapp.com/register.html?psid=' + body.psid,
				messenger_extensions: true,
				webview_height_ratio: 'tall',
				fallback_url: 'https://sirhieu.herokuapp.com/register.html?psid=' + body.psid,
				title: 'Điền lại',
			}, {
				type: 'postback',
				title: 'Chính xác',
				payload: 'CODE',
			}, ]);
			/// end con

		});
	} catch (err) {
		console.error("registerspostback:", err);
		res.send(null);
	}
});

router.post('/getListPic', (req, res) => {

	var psid = req.query.psid;
	console.log("getListPic psid: ", psid);

	var query = {
		IdPost: psid
	};
	console.log("getListPic query: ", query);
	objDb.getConnection(function (client) {
		objDb.findPic(query, client, function (results) {
			client.close();
			res.send(results);

			//console.log(results);

		});
		client.close();
		// res.send(null);
	});
});

router.post('/getListMember', (req, res) => {

	var psid = req.query.psid;
	//console.log("getListPic psid: ");

	var query = {};
	//console.log("getListMember query: ", query);
	objDb.getConnection(function (client) {
		objDb.getListMember(query, client, function (results) {
			console.log('list member', results.length);
			client.close();
			res.send(results);

			//console.log(results);

		});
		client.close();
		// res.send(null);
	});
});

router.post('/getListPic4vote', (req, res) => {

	var psid = req.query.psid;
	console.log("getListPic4vote psid: ", psid);
	var mydate = new Date();
	var uploadDate = mydate.toLocaleDateString('en-US');
	console.log(uploadDate);
	var query = {
		UploadDate: uploadDate
	};
	console.log(query);
	console.log("getListPic4vote query: ", query);
	objDb.getConnection(function (client) {
		objDb.findPic(query, client, function (results) {
			client.close();
			res.send(results);

			//console.log(results);

		});
		client.close();
		// res.send(null);
	});
});


router.post('/votepic', (req, res) => {

	try {
		let body = req.body;
		var returnMessage = "";
		//console.log(body.BlockStatus);

		returnMessage = "Bạn đã vote cho ảnh có mã số " + body.PicId;
		console.log('Vote id', body.VoteId);
		console.log('Pic id', body.PicId);
		var query = {
			VoteId: body.VoteId,
			PicId: body.PicId
		};

		objDb.getConnection(function (client) {
			objDb.findMemberVote(query, client, function (results) {
				console.log("check vote", results);
				if (results.length > 0) {
					res.send("Thông báo: Bạn đã vote cho ảnh này");
				} else {
					objDb.votePic(body.VoteId, body.PicId, body.IdPost, client, function (err, rs) {

						if (err) {
							//sendTextMessage(body.psid, 'Echo:' + err);
							console.log("votePic ERR:", err);
							//client.close();
							res.send(err);
						} else {
							console.log("votePic:", returnMessage);
							client.close();
							res.send(returnMessage);
						}
					});
				};
			});
		});
		/// end con
	} catch (err) {
		console.error("votePic:", err);
		res.send(null);
	}
});


router.post('/ipicpostback', upload.single('somefile'), (req, res) => {

	try {
		let body = req.body;
		var mydate = new Date();

		var inputDate = new Date(mydate.toISOString());
		var imgName = body.psid + mydate.getFullYear() + mydate.getMonth() + mydate.getDate() + mydate.getHours() + mydate.getMinutes() + mydate.getSeconds() + body.ImgName;
		var UploadDate = mydate.toLocaleDateString('en-US');
		var dir = __dirname.replace('routes', '') + 'public/uploads';
		console.log("test:", body.ImgName);
		var key = 1;
		var reg = 0;
		//var dir ='uploads';



		var returnMessage;
		//console.log(returnMessage);
		var imgUrl = imgName;

		var query = {
			_id: body.psid
		};
		console.log('query', query);
		objDb.getConnection(function (client) {
			objDb.findMembers(query, client, function (err, results) {
				reg = results.length;
				console.log('Reg', reg);
				if (results.length == 1) {
					writeFileProduct(imgName, body.DataImg, dir, body.psid, function (err, results) {
						if (results) {
							//console.log("Cloudinary :",results);
							imgUrl = results.secure_url;



							objDb.findPicKey({}, client, function (err, results) {
								if (err) {
									key = 1;
								} else {
									key = results[0].KeyId + 1;
								}
								console.log('key:', key);
								var objProduct = {
									"IdPost": body.psid,

									"ImageData": imgName,
									"ImgUrl": imgUrl,

									"Description": body.Description,
									"Hashtag": body.Hashtag,
									"Vote": 0,
									"KeyId": key,
									"UploadDate": UploadDate,
									"InputDate": inputDate
								};
								objDb.insertPic(objProduct, client, function (err, results) {
									//	   res.send(results);
									//console.log(results);
									if (err) {
										client.sendText(body.psid, 'Echo:' + err);
									} else {
										console.log("insertPic : ", results);

										/*client.sendText(body.psid, "Cảm ơn bạn. Ảnh của bạn vừa gửi ");
										client.sendAttachment(body.psid, {
											type: 'image',
											payload: {
												url: imgUrl,
											},
										});*/

										//sendOneQuick(body.psid, returnMessage, "Chuẩn", "cfp", "OkLike.png");
										// sendBackProduct(body.psid, returnMessage);
										//});
										client.close();
									}

									res.status(200).send('Please close this window to return to the conversation thread.');
								}); //end ins
							sendButton(body.psid,reg);
							}); // end fin
						} //end if
					}); //end write

				} else {res.send('Bạn chưa đăng ký dự thi. Mời bạn đăng ký trước khi gửi ảnh!');};
			}); //end fin mem



		});



	} catch (err) {
		console.error("ipicpostback:", err);
		res.status(200).send(err);
	}

});

function sendButton(senderId,reg) {
	if (reg == 1) {
		client.sendButtonTemplate(senderId, 'Gửi ảnh thành công. Bạn có muốn tiếp tục gửi ảnh không?', [{
			type: 'web_url',
			url: 'https://sirhieu.herokuapp.com/iproducts.html?psid=' + senderId,
			messenger_extensions: true,
			webview_height_ratio: 'tall',
			fallback_url: 'https://sirhieu.herokuapp.com/iproducts.html?psid=' + senderId,
			title: 'Gửi ảnh',
		}, {
			type: 'web_url',
			url: 'https://sirhieu.herokuapp.com/qla.html?psid=' + senderId,
			messenger_extensions: true,
			webview_height_ratio: 'tall',
			fallback_url: 'https://sirhieu.herokuapp.com/qla.html?psid=' + senderId,
			title: 'Quản lý ảnh',
		}, {
			type: 'postback',
			title: 'Menu',
			payload: 'MENU',
		}, ]);
	}; /*else {
		client.close();
		client.sendButtonTemplate(senderId, 'Bạn chưa đăng ký dự thi. Bạn có muốn đăng ký không?', [{
			type: 'web_url',
			url: 'https://sirhieu.herokuapp.com/register.html?psid=' + senderId,
			messenger_extensions: true,
			webview_height_ratio: 'tall',
			fallback_url: 'https://sirhieu.herokuapp.com/register.html?psid=' + senderId,
			title: 'Đăng ký',
		}, ]);
	};*/

};

function writeFileProduct(fileName, data, newPath, psid, callback) {
	console.log("writeFileProduct: writeFile", newPath + "/" + fileName);
	try {
		var buf = new Buffer(data, 'base64');
		console.log("writeFileProduct: read buf");
		var res;
		fs.writeFile(newPath + "/" + fileName, buf, function (err) {
			if (err) {
				console.log("writeFileProduct error :", err);
				callback(err, res);
			} else {

				console.log('File is uploaded :', newPath + "/" + fileName);
				var link = newPath.replace('/app/public', 'https://sirhieu.herokuapp.com') + "/" + fileName;
				cloudinary.v2.uploader.upload(link, {
						public_id: "VJ/" + fileName.replace('.', '')
					},
					function (error, result) {
						console.log("Cloudinary err:", error);
						fs.unlink(newPath + "/" + fileName, function (error) {
							if (error) {
								console.log("writeFileProduct cloudinary.v2.uploader error :", error);
							}
							console.log('Deleted : ', newPath + "/" + fileName);
						});
						callback(error, result);
						console.log("Cloudinary:", result);
					});
			}
		});
	} catch (err) {

		console.error("writeFileProduct:", err);
	}

};



function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;
	let response;
	console.log("Received message for user %d and page %d at %d with message:",
		senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));
	var isEcho = message.is_echo;
	var messageId = message.mid;
	var appId = message.app_id;
	var metadata = message.metadata;
	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;
	var quickReply = message.quick_reply;
	var msg = "x";
	/*var fname = client.getUserProfile(senderID).first_name;*/

	if (isEcho) {
		// Just logging message echoes to console
		console.log("Received echo for message %s and app %d with metadata %s",
			messageId, appId, metadata);
		return;
	} else if (quickReply) {

		var quickReplyPayload = quickReply.payload;

		console.log("Quick reply for message %s with payload %s",
			messageId, quickReplyPayload);
		switch (quickReplyPayload) {
			case 'EXIT':
				msg = 'Cám ơn bạn. Hẹn gặp lại sớm nhé!';
				client.sendText(senderID, msg);
				break;
			case 'MENU':
				/*client.sendButtonTemplate(senderID, 'What do you want to do next?', [{
					type: 'web_url',
					url: 'https://sirhieu.herokuapp.com/images/nb.jpg',
					title: 'Show Website',
				}, {
					type: 'postback',
					title: 'Start Chatting',
					payload: 'USER_DEFINED_PAYLOAD',
				}{
					type: 'postback',
					title: 'bbb Chatting',
					payload: 'USER_DEFINED_PAYLOAD',
				}, ]);*/
				client.sendSenderAction(senderID, 'typing_on');
				client.sendGenericTemplate(
					senderID, [{
						title: 'THÔNG TIN',
						image_url: 'https://sirhieu.herokuapp.com/images/tt.jpg',
						subtitle: 'Thông tin cuộc thi',
						default_action: {
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/images/tt.jpg',
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: '',
							/*'https://sirhieu.herokuapp.com/',*/
						},
						buttons: [{
							type: 'postback',
							title: 'Thông tin cuộc thi',
							payload: 'POST_INFO',
						}, {
							type: 'postback',
							title: 'Thể lệ cuộc thi',
							payload: 'POST_RULE',
						}, ],
					}, {
						title: 'GỬI BÀI THI',
						image_url: 'https://sirhieu.herokuapp.com/images/gb.jpg',
						subtitle: 'Gửi ảnh dự thi',
						default_action: {
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/images/gb.jpg',
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: '',
							/*'https://sirhieu.herokuapp.com/',*/
						},
						buttons: [{
							title: 'Đăng ký',
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/register.html?psid=' + senderID,
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: 'https://sirhieu.herokuapp.com/register.html?psid=' + senderID,
						}, {
							title: 'Gửi ảnh',
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/iproducts.html?psid=' + senderID,
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: 'https://sirhieu.herokuapp.com/iproducts.html?psid=' + senderID,
						}, {
							title: 'Quản lý ảnh',
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/qla.html?psid=' + senderID,
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: 'https://sirhieu.herokuapp.com/qla.html?psid=' + senderID,
						}, ],
					}, {
						title: 'BÌNH CHỌN',
						image_url: 'https://sirhieu.herokuapp.com/images/bc.jpg',
						subtitle: 'Bình chọn ảnh đẹp',
						default_action: {
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/images/bc.jpg',
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: '',
							/*'https://sirhieu.herokuapp.com/',*/
						},
						buttons: [{
							title: 'Bình chọn',
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/vote.html?psid=' + senderID,
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: 'https://sirhieu.herokuapp.com/vote.html?psid=' + senderID,
						}, {
							title: 'Bảng xếp hạng',
							type: 'web_url',
							url: 'https://sirhieu.herokuapp.com/ranktbl.html?psid=' + senderID,
							messenger_extensions: true,
							webview_height_ratio: 'tall',
							fallback_url: 'https://sirhieu.herokuapp.com/ranktbl.html?psid=' + senderID,
						}, ],
					}, ], {
						image_aspect_ratio: 'square'
					}
				);
				break;
		}
	} else if (messageText) {

		switch (messageText.toLowerCase()) {
			case 'giá xe':
				client.sendMessage(senderID, {
					text: 'Hanoi (KV1) -> Noibai: 200k,Noibai -> Hanoi (KV1): 250k',
				});
				client.sendAttachment(senderID, {
					type: 'image',
					payload: {
						url: 'https://scontent.fhan3-2.fna.fbcdn.net/v/t1.0-9/31081528_568961726811775_3035050846015455232_n.jpg?_nc_cat=0&oh=275c0f15fc0d56e03fee30afc9bea818&oe=5C060612',
					},
				});
				break;
			case 'liên hệ':
				client.sendMessage(senderID, {
					text: 'MKmart hotline: 091.128.5465 / 1900545465!',
				});
				break;
			default:
				client.getUserProfile(senderID).then(user => {
					client.sendText(senderID, 'Chào ' + user.first_name + ', bạn có muốn tham gia cuộc thi ảnh giao lưu Việt Nam - Nhật Bản do Hội LHTN Việt Nam tổ chức không?', {
						quick_replies: [{
							content_type: 'text',
							title: 'Chắc chắn rồi',
							payload: 'MENU',
						}, ],
					});
				});
				break;

		}

	}
};

module.exports = router;
