(function() {

  // 'global' variable to store reference to the database
  var db, input;

  databaseOpen(function() {
    input = document.querySelector('input');

    document.body.addEventListener('submit', onSubmit);
    
    databaseTodosGet(function (todos) {
      console.log(todos);
    });
  });

  function onSubmit (e) {
    e.preventDefault();
    databaseTodosAdd(input.value, function () {
      input.value = '';
    });
  }

  function databaseOpen(callback) {
   // Open a database, specify the name and version
    var dbName = 'todos';
    var version = 1;
    var request = indexedDB.open(dbName, version);

    // Run migrations if necessary
    request.onupgradeneeded = function(e) {
      db = e.target.result;
      e.target.transaction.onerror = databaseError;
      db.createObjectStore('todo', { keyPath: 'timeStamp' });
    };

    request.onsuccess = function(e) {
      db = e.target.result;
      callback();
    };
    request.onerror = databaseError;
  }

  function databaseError(e) {
    console.error('An IndexedDB error has occurred', e);
  }

  function databaseTodosAdd (text, callback) {
    var trans = db.transaction(['todo'], 'readwrite');
    var store = trans.objectStore('todo');
    var req = store.put({
      text : text,
      timeStamp : Date.now()
    });

    trans.oncomplete = function (e) {
      callback();
    };

    req.onerror = databaseError;
  }

  function databaseTodosGet (callback) {
    var trans = db.transaction(['todo'], 'readonly');
    var store = trans.objectStore('todo');

    // get stuff from the store
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    var data = [];
    
    cursorRequest.onsuccess = function (e) {
      var result = e.target.result;

      if (result) {
        data.push(result.value);
        result.continue();
      } else {
        callback(data);
      }
    };
  }

}());