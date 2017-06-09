var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var Q = 0



app.get('/', function(req, res) {
	res.sendfile('root/index.html')
})

io.on('connection', function(data){

	data.send(Q + " Ke Counter / Teller NO " )
	//console.log("Connection Berhasil")
})

//console.log("server jalan");
server.listen(80)