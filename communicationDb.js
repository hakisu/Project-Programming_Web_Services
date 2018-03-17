const mongojs = require('mongojs');
const dbName = 'pms';
const db = mongojs(dbName);

module.exports = {
    /* Functions for emails */

    sendEmailData: function (response, userId) {
        let collection = db.collection('Emails');
        if (mongojs.ObjectID.isValid(userId)) {
            collection.find({receiverId: mongojs.ObjectId(userId)}, (err, docs) => {
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.write(JSON.stringify(docs));
                response.end();
            });
        } else {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHead(404, {'Content-Type': 'application/json'});
            response.end('wrong id');
        }
    },
    insertNewEmail: function (request, response) {
        let collection = db.collection('Emails');
        request.setEncoding('utf8');

        let emailContent = "";
        request.on('data', (chunk) => {
            emailContent += chunk;
        });
        request.on('end', () => {
            emailContent = JSON.parse(emailContent);
            emailContent.receiverId = mongojs.ObjectId(emailContent.receiverId);
            collection.insert(emailContent);
            console.log('New email inserted into database!');

            response.setHeader("Access-Control-Allow-Origin", "*");
            response.end();
        });
    },
    sendError: function (response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(404, 'Content-Type', 'application/json');
        response.end('404 - page not found!');
    },

    /* Functions for messages */

    getInfo: function (response) {
        let collection = db.collection('Messages');
        collection.find().toArray((err, docs) => {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHead(200, 'Content-Type', 'application/json');
            response.write(JSON.stringify(docs));
            response.end();
        });
    },
    insertMessage: function (messageObject, callback) {
        let tempUserId0 = messageObject.dialog.usersIds[0];
        let tempUserId1 = messageObject.dialog.usersIds[1];

        let collection = db.collection('Messages');
        let dialogsCollection = db.collection('Dialogs');
        messageObject.dialog.usersIds[0] = mongojs.ObjectId(messageObject.dialog.usersIds[0]);
        messageObject.dialog.usersIds[1] = mongojs.ObjectId(messageObject.dialog.usersIds[1]);

        dialogsCollection.findOne({$and: [{usersIds: {$in: [messageObject.dialog.usersIds[0]]}}, {usersIds: {$in: [messageObject.dialog.usersIds[1]]}}]}, (err, doc) => {
            messageObject.message.dialogId = doc._id;
            collection.insert(messageObject.message);

            messageObject.dialog.usersIds[0] = tempUserId0;
            messageObject.dialog.usersIds[1] = tempUserId1;
            callback();
        });
    },
    processDialog: function (messageObject, callback) {
        let dialogsCollection = db.collection('Dialogs');
        messageObject.usersIds[0] = mongojs.ObjectId(messageObject.usersIds[0]);
        messageObject.usersIds[1] = mongojs.ObjectId(messageObject.usersIds[1]);

        dialogsCollection.find({$and: [{usersIds: {$in: [messageObject.usersIds[0]]}}, {usersIds: {$in: [messageObject.usersIds[1]]}}]}, (err, docs) => {
            if (docs.length === 0) {
                let newDialogObject = {};
                newDialogObject._id = mongojs.ObjectId();
                newDialogObject.usersIds = messageObject.usersIds;
                dialogsCollection.insert(newDialogObject);
                callback(docs);
            } else {
                let messagesCollection = db.collection('Messages');
                messagesCollection.find({dialogId: docs[0]._id}, (err, docs) => {
                    callback(docs);
                });
            }
        });
    }
};