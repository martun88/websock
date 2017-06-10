var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/root'));

// app.get('/', function(req, res) {
// 	res.sendFile('index.html', { root: path.join(__dirname, 'root') })
// })

var counters = []
var maxCounter = 4;
var queueNum = 0

io.on('connection', function(socket){
	var addedCounter = false

	// pada saat client emits 'antrian baru', command ini dijalankan
	socket.on('new queue', function () {
		// memberitahu client untuk mengeksekusi 'new queue'
		socket.broadcast.emit('new queue', {
			counter: socket.counter,
			antrian: ++queueNum
		});
	});

	// pada saat client emits 'tambah counter', command ini dijalankan
	socket.on('add counter', function () {
		if (addedCounter || maxCounter == counters.length ) {
			socket.broadcast.emit('counter full', {
				counter: socket.counter,
				countersNum: counters.length
			});
		}

		// simpan counter pada socket session untuk masing2 client
		socket.counter = counters.length + 1;
		counters.push(socket.counter);
		addedCounter = true;
		socket.emit('login', {
			countersNum: counters.length
		});
		
		// mengumumkan (kepada semua client) jika counter online
		socket.broadcast.emit('counter online', {
			counter: socket.counter,
			countersNum: counters.length
		});
	});

	// ketika counter disconnect.. lakukan ini
	socket.on('disconnect', function () {
		if (addedCounter) {
			var idxCounter = counters.indexOf(socket.counter);
			if (idxCounter > -1 && counters.length > idxCounter) {
				counters.splice(idxCounter, 1);
			}

			// mengumumkan (kepada semua client) jika counter offline
			socket.broadcast.emit('counter offline', {
				counter: socket.counter,
				countersNum: counters.length
			});
		}
	});

	// data.send(Q + " Ke Counter / Teller NO " )
	//console.log("Connection Berhasil")
})

//console.log("server jalan");
server.listen(8000)