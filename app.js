var Bot    = require('ttapi');
var AUTH   = 'auth+live+ae8a604b1f77142d97ec7548ff12c5c75b2836f1';
var USERID = '4f4d361c590ca26d6c000507';
var ROOMID = '4f4db9770c4cc87adc0cad76';

var bot = new Bot(AUTH, USERID);

bot.debug = true;

bot.on('ready',        function (data) { bot.roomRegister(ROOMID); });
bot.on('roomChanged',  function (data) { console.log('The bot has changed room.', data); });

bot.on('speak',        function (data) { console.log('Someone has spoken', data); });
bot.on('update_votes', function (data) { console.log('Someone has voted',  data); });
bot.on('registered',   function (data) { console.log('Someone registered', data); });
