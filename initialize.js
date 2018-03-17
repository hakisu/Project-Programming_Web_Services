var debugLog = true;

var dbName = 'pms';

if (debugLog) console.log('Initialization of \'' + dbName + '\'');

var mongojs = require('mongojs');
var db = mongojs(dbName);

db.dropDatabase();

var persons = db.collection('persons');
var projects = db.collection('projects');
var tasks = db.collection('tasks');

var personsExample = [
    {
        _id: mongojs.ObjectId('000000000000000000000001'),
        firstName: 'Dmitrii',
        lastName: 'Mitroshenkov',
        email: 'dm@dm.com',
        password: 'dm',
        roles: 'ASMW'
    },
    {
        _id: mongojs.ObjectId('000000000000000000000002'),
        firstName: 'Chowdhury',
        lastName: 'Joy Barua',
        email: 'jb@jb.com',
        password: 'jb',
        roles: 'SM'
    },
    {
        _id: mongojs.ObjectId('000000000000000000000003'),
        firstName: 'Adrian',
        lastName: 'Gryza',
        email: 'ag@ag.com',
        password: 'ag',
        roles: 'M'
    },
    {
        _id: mongojs.ObjectId('000000000000000000000004'),
        firstName: 'Myroslav',
        lastName: 'Dmukhivskyi',
        email: 'md@md.com',
        password: 'md',
        roles: 'M'
    },
    {
        _id: mongojs.ObjectId('000000000000000000000005'),
        firstName: 'Patryk',
        lastName: 'Dudka',
        email: 'pd@pd.com',
        password: 'pd',
        roles: 'AW'
    },
    {
        _id: mongojs.ObjectId('000000000000000000000006'),
        firstName: 'Igor',
        lastName: 'Gwiazdowski',
        email: 'ig@ig.com',
        password: 'ig',
        roles: 'W'
    },
    {
        _id: mongojs.ObjectId('000000000000000000000007'),
        firstName: 'Adrian',
        lastName: 'Bus',
        email: 'ab@ab.com',
        password: 'ab',
        roles: ''
    }
];
if (debugLog) console.log('Creating new collection \'persons\'');
for (var i in personsExample) {
    if (debugLog) {
        console.log(JSON.stringify(personsExample[i]));
    }

    persons.insert(personsExample[i]);

}

var projectsExample = [
    {
        _id: mongojs.ObjectId('000000000000000000000001'),
        name: 'Customer Portal',
        description: 'http://www.customerportal.com',
        managerId: mongojs.ObjectId('000000000000000000000003')
    },
    {
        _id: mongojs.ObjectId('000000000000000000000002'),
        name: 'Co Messenger',
        description: 'Business oriented communication system',
        managerId: mongojs.ObjectId('000000000000000000000003')
    },
    {
        _id: mongojs.ObjectId('000000000000000000000003'),
        name: 'BT-SMS',
        description: 'Bug tracking system based on SMS',
        managerId: mongojs.ObjectId('000000000000000000000002')
    }
];
if (debugLog) console.log('Creating new collection \'projects\'');
for (var i in projectsExample) {
    if (debugLog) {
        console.log(JSON.stringify(projectsExample[i]));
    }
    projects.insert(projectsExample[i]);

}

var tasksExample = [
    {
        _id: mongojs.ObjectId('000000000000000000000001'),
        projectId: mongojs.ObjectId('000000000000000000000002'),
        description: 'Study',
        workersIds: [mongojs.ObjectId('000000000000000000000004'), mongojs.ObjectId('000000000000000000000006')],
        dependsOnIds: [],
        deadline: new Date('2017-12-26T17:00:00.000Z'),
        status: 0
    },
    {
        _id: mongojs.ObjectId('000000000000000000000002'),
        projectId: mongojs.ObjectId('000000000000000000000002'),
        description: 'Schemas preparation',
        workersIds: [mongojs.ObjectId('000000000000000000000006')],
        dependsOnIds: [mongojs.ObjectId('000000000000000000000001')],
        deadline: new Date("2018-01-31T17:00:00.000Z"),
        status: 0
    },
    {
        _id: mongojs.ObjectId('000000000000000000000003'),
        projectId: mongojs.ObjectId('000000000000000000000003'),
        description: 'Project manifest',
        workersIds: [mongojs.ObjectId('000000000000000000000005')],
        dependsOnIds: [],
        deadline: new Date("2018-01-30T17:00:00.000Z"),
        status: 0
    }
];

if (debugLog) console.log('Creating new collection \'tasks\'');
for (let i in tasksExample) {
    if (debugLog) {
        console.log(JSON.stringify(tasksExample[i]));
    }
    tasks.insert(tasksExample[i]);
}

/* My code */
const dialogs = db.collection('Dialogs');
const messages = db.collection('Messages');
const emails = db.collection('Emails');

let dialogsExample = {
    _id: mongojs.ObjectId('000000000000000000000001'),
    usersIds: [mongojs.ObjectId('000000000000000000000003'), mongojs.ObjectId('000000000000000000000007')]
};
let messagesExample = [
    {
        sender: 'Eryk',
        sentTime: new Date(),
        dialogId: mongojs.ObjectId('000000000000000000000001'),
        data: 'Hi test'
    },
    {
        sender: 'Tomasz',
        sentTime: new Date(),
        dialogId: mongojs.ObjectId('000000000000000000000001'),
        data: 'same person still'
    },
    {
        sender: 'Eryk',
        sentTime: new Date(),
        dialogId: mongojs.ObjectId('000000000000000000000001'),
        data: 'response from second user3211111111111 1111111111111 111111111111 111111111111 1111111111111111 1111111111111111111 111111111 1111111111111 11111111111111 111111111111111 1111111111111111111111111 111111111111111'
    }
];
let emailsExample = [
    {
        senderId: mongojs.ObjectId('000000000000000000000003'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'first mail??',
        data: 'email  -test'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    },
    {
        senderId: mongojs.ObjectId('000000000000000000000002'),
        receiverId: mongojs.ObjectId('000000000000000000000001'),
        sentTime: new Date(),
        title: 'second mail?',
        data: 'email  od innego uzytkownika'
    }
];

dialogs.insert(dialogsExample);
for (let i in messagesExample) {
    messages.insert(messagesExample[i]);
}
for (let i in emailsExample) {
    emails.insert(emailsExample[i]);
}

if (debugLog) {
    console.log('Dialogs and messages collections established successfully.');
}


if (debugLog) console.log('End of initialization');