var AUTH, Bot, OWNER, ROOMID, USERID, app, config, boot, bot, dj, express, moderator, port, roomData, roomUsers, vote, _;
// express = require("express");
Bot = require("ttapi");
_ = require('underscore');
config = require('./config.js')

AUTH = config.AUTH;
USERID = config.USERID;
ROOMID = config.ROOMID;
OWNER = config.OWNER;

// app = express.createServer();

bot = new Bot(AUTH, USERID);

if (process.env.NODE_ENV != 'production') {
  bot.debug = true;
}


vote = true;
dj = false;
moderator = false;
roomData = {};
roomUsers = {};

findUser = function(username) {
  var user;
  user = _.find(roomUsers, function(i) {
    return i.name.toLowerCase() === username.toLowerCase();
  });
  return user;
}

removeDj = function(senderid, username) {
  var user;
  user = findUser(username);
  if (user) {
    return bot.remDj(user.userid);
  } else {
    return bot.pm("Couldnt find that user.", senderid);
  }
};

boot = function(senderid, username, reason) {
  if (reason == null) reason = 'l8r';
  var user;
  user = findUser(username);
  if (user) {
    return bot.boot(user.userid, reason);
  } else {
    return bot.pm("Couldnt find that user.", senderid);
  }
};

bot.on("ready", function(data) {
  return bot.roomRegister(ROOMID);
});

bot.on("roomChanged", function(data) {
  var user, _i, _len, _ref;
  roomData = data.room;
  roomUsers = {};
  _ref = data.users;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    user = _ref[_i];
    roomUsers[user.userid] = user;
  }
  return console.log("The bot has changed room.", data);
});

bot.on('newsong', function(data) {
  vote = true;
  return console.log('New song', data);
});

bot.on('add_dj', function(data) {
  var djs;
  djs = roomData.metadata.djcount = roomData.metadata.djcount + 1;
  if (dj && (djs > 2)) {
    dj = false;
    bot.remDj(USERID);
    bot.speak('Ill step down for a bit');
  } else if (!dj && djs == 1) {
    dj = true
    bot.addDj()
    bot.speak('Ill join you')
  }
  return console.log('new dj here', data);
});
  
bot.on('rem_dj', function(data) {
  var djs;
  djs = roomData.metadata.djcount = roomData.metadata.djcount - 1;
  if (djs === 1) {
    if (!dj) {
      dj = true;
      bot.addDj();
      return bot.speak('If no one else is going to...');
    } else if (dj) {
      dj = false;
      bot.remDj(USERID);
      return bot.speak('Looks like were done for now');
    }
  }
});

bot.on("speak", function(data) {
  if (vote && data.text.match('bot dance')) {
    vote = false;
    return bot.bop();
  } else if (data.text.match('bot rules')) {
    return bot.speak('Just enjoy yourself or "bot dance"');
  }
});

bot.on("update_votes", function(data) {
  return console.log("Someone has voted", data);
});

bot.on("pmmed", function(data) {
  var mod, error, msg, q, query, pm;
  if (mod = _.include(roomData.metadata.moderator_id, data.senderid)) {
    q = query = data.text.split(' ');
    console.log('your a moderator', q[0]);
    msg = function(text) {
      return bot.pm(text, data.senderid);
    };
    error = function() {
      return msg('I dont know what that means');
    };
    switch (q[0]) {
      case 'help':
        msg('PM me the following commands: boot NAME REASON, removeDj NAME. I was made by Josh Vermaire(DJ Splice Array).');
      case 'boot':
        return boot(data.senderid, q[1], q[2]);
      case 'removeDj':
        var username = _.rest(q).join(' ')
        return removeDj(data.senderid, username);
      case 'skip':
        return bot.skip();
      case 'snag':
        return console.log('snag');
    }
  } else {
    msg('You must be a moderator to give me commands');
  }
});

bot.on('new_moderator', function(data) {
  roomData.metadata.moderator_id.push(data.userid);
  if (userid === USERID) {
    bot.speak('Thanks!');
    return moderator = true;
  }
});

bot.on('rem_moderator', function(data) {
  var moderators;
  moderators = roomData.metadata.moderator_id;
  moderators = _.without(moderators, data.userid);
  if (userid === USERID) return bot.speak("WHAT?? I'M MELTING! MELTING!");
});

bot.on("registered", function(data) {
  var user;
  user = data.user[0];
  roomUsers[user.userid] = user;
  bot.speak("Hey " + user.name + ". Let's drop some science.");
  if (user.userid === OWNER) {
    bot.pm("" + user.name + ". You're the best.", user.userid);
  }
  if (!moderator) {
    if (user.name.match('thatmiddleway')) {
      bot.pm('John, give me moderator status...word lyfe. PM me "help" for instructions. In chat "bot dance" or "bot rules"', user.userid);
    }
  }
  return console.log("Someone registered", data);
});

bot.on('deregistered', function(data) {
  var user;
  user = data.user[0];
  delete roomUsers[user.userid];
  return console.log("Someone deregistered", data);
});

// Dumb http server
var http = require('http');
port = process.env.PORT || 8924;
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<h1>i\'m a brilliant turntable.fm bot who knows nodejitsu.</h1>')
  res.end();
}).listen(port); // the server will listen on port 80
