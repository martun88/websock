var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 5000;

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
		var temp = counters;
		var queue = ++queueNum;
		for (var i = 0; i < temp.length; i++) {
			if (temp[i]['counter'] == socket.counter) {
				temp[i]['lastNum'] = queue;
				break;
			}
		}

		socket.emit('new queue', {
			counters: counters,
			countersNum: counters.length,
			antrian: queue
		});

		socket.broadcast.emit('new queue', {
			counters: counters,
			countersNum: counters.length,
			antrian: queue
		});
	});

	// pada saat client emits 'tambah counter', command ini dijalankan
	socket.on('add counter', function (asCounter) {
		if (addedCounter) return;
		if (!asCounter || (asCounter && maxCounter == counters.length)) {
			socket.emit('login', {
				isCounter: false,
				counter: socket.counter,
				counters: counters,
				countersNum: counters.length,
				antrian: queueNum
			});
		}
		else {
			// simpan counter pada socket session untuk masing2 client
			var current = 1;
			var temp = counters;
			var obj;
			for (var i = 0; i < temp.length; i++) {
				if (temp[i]['counter'] == current) current++;
				for (var j = i + 1; j < temp.length; j++) {
					if (temp[i]['counter'] > temp[j]['counter']) {
						obj = temp[i]['counter'];
						temp[i]['counter'] = temp[j]['counter'];
						temp[j]['counter'] = obj;
					}
				}
			}
			counters = temp;

			socket.counter = current;
			counters.push({ counter : socket.counter, lastNum: 0 });
			addedCounter = true;
			socket.emit('login', {
				isCounter: true,
				counter: socket.counter,
				counters: counters,
				countersNum: counters.length,
				antrian: queueNum
			});
		}
		
		// mengumumkan (kepada semua client) jika counter online
		socket.broadcast.emit('counter online', {
			counter: socket.counter,
			counters: counters,
			countersNum: counters.length,
			antrian: queueNum
		});
	});

	// ketika counter disconnect.. lakukan ini
	socket.on('disconnect', function () {
		if (addedCounter) {
			var idxCounter = -1;
			for (var i = 0; i < counters.length; i++) {
				if (counters[i]['counter'] == socket.counter) {
					counters.splice(i, 1);
					break;
				}
			}
			
			// mengumumkan (kepada semua client) jika counter offline
			socket.broadcast.emit('counter offline', {
				counter: socket.counter,
				counters: counters,
				countersNum: counters.length,
				antrian: queueNum
			});
		}
	});

	// data.send(Q + " Ke Counter / Teller NO " )
	//console.log("Connection Berhasil")
})

console.log("Running server..");
server.listen(port);