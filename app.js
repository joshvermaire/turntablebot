var Bot    = require('ttapi');
var AUTH   = 'auth+live+1a85d504c00feb6e6c815f3e4d9a6319ef65354a';
var USERID = '4f533573a3f751580f004897';
var ROOMID = '4f4db9770c4cc87adc0cad76';

var bot = new Bot(AUTH, USERID);

bot.debug = true;

bot.on('ready',        function (data) { bot.roomRegister(ROOMID); });
bot.on('roomChanged',  function (data) { console.log('The bot has changed room.', data); });

bot.on('speak',        function (data) { console.log('Someone has spoken', data); });
bot.on('update_votes', function (data) { console.log('Someone has voted',  data); });
bot.on('registered',   function (data) { console.log('Someone registered', data); });
