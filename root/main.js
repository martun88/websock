$(function() {
  var $window = $(window);

  var $loginPage = $('.login.page'); // The login page
  var $mainPage = $('.main.page'); // The main page

  var $counterButton = $('#asCounter'); // The Counter button
  var $guestButton = $('#asGuest'); // The Guest button

  var $statusContainer = $('#status'); // The status Container
  var $availableContainer = $('#available'); // The available Container
  var $counterContainer = $('#counters-container'); // The Counter Container
  var $lastContainer = $('#last'); // The Last Numbering Container

  var counter;
  var connected = false;

  var socket = io();

  function sendNewQueue () {
    if (connected) {
      // beritahu server untuk mengeksekusi 'new queue' dan kirim
      socket.emit('new queue');
    }
  }

  function addCounter (isCounter) {
    $loginPage.fadeOut();
    $mainPage.show();

    socket.emit('add counter', isCounter);
  }

  function updateQueue (data) {
    if (data.isCounter) {
      updateStatus($('<div>').text("Counter No : " + data.counter).append($('<button>').addClass('waves-effect waves-light btn right')
                                                                                       .text('Selanjutnya >>')
                                                                                       .click(function(){ sendNewQueue(); })));
    }
    else {
      updateStatus("Antrian");
    }
    updateDetail(data);
  }

  function updateDetail (data) {
    updateAvailable("Counter Tersedia: " + data.countersNum);
    updateCounterContainer(data.counters);
    updateLast("Nomor Selanjutnya: " + (data.antrian + 1));
  }

  function updateStatus (text) {
    $statusContainer.html($('<div>').html(text));
  }

  function updateAvailable (text) {
    $availableContainer.html($('<span>').text(text));
  }

  function updateLast (text) {
    $lastContainer.html($('<span>').text(text));
  }

  function updateCounterContainer (counters) {
    $divContainer = $('<div>').addClass('row');
    if (counters.length > 0) {
      for(var i = 0; i < counters.length; i++) {
        $divContainer.append($('<div>').addClass('col m6 l3').append($('<div>').addClass('card-panel').append($('<h2>').addClass('center-align').text(counters[i]['lastNum']))
                                                                                                   .append($('<h5>').addClass('center-align').text("Counter " + counters[i]['counter'])))
                            );
      }
    }
    $counterContainer.html($divContainer);
  }

  $window.keydown(function (event) {
    if (event.which === 13) {
      if (counter) {
        sendNewQueue();
      }
      else {
        addCounter(true);
      }
    }
  });

  $counterButton.click(function () {
    addCounter(true);
  });

  $guestButton.click(function () {
    addCounter(false);    
  });

  socket.on('login', function (data) {
    connected = true;
    // Update data queue
    console.log(data);
    counter = data.counter;
    updateQueue(data);
  });

  socket.on('counter online', function (data) {
    updateDetail(data);
  });

  socket.on('counter offline', function (data) {
    updateDetail(data);
  });

  socket.on('new queue', function (data) {
    updateDetail(data);
  });

  socket.on('disconnect', function () {
    updateStatus('you have been disconnected');
  });

  socket.on('reconnect', function () {
    updateStatus('you have been reconnected');
    if (counter) {
      socket.emit('add counter', counter);
    }
  });

  socket.on('reconnect_error', function () {
    updateStatus('attempt to reconnect has failed');
  });
});