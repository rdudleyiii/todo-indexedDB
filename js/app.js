(function() {

  // 'global' variable to store reference to the database
  var db, input, ul;

  databaseOpen(function() {
    input = document.querySelector('input');
    ul = document.querySelector('ul');
    document.body.addEventListener('submit', onSubmit);
    document.body.addEventListener('click', onClick);

    databaseTodosGet(renderAllTodos);
  });

  function renderAllTodos (todos) {
    var html = "";
    
    todos.forEach(function (todo) {
      html += todoToHtml(todo);
    });
    ul.innerHTML = html;
  }

  function todoToHtml (todo) {
    return '<li class="list-group-item"><div class="col-xs-11 col-sm-11 col-md-11">' + todo.text + '</div><span id="' + todo.timeStamp + '" class="glyphicon glyphicon-trash delete"></span></li>';
  }

  function onClick (e) {
    var _id = document.getElementById(e.srcElement.id);
    
    if ( _id != null 
      && _id.hasAttribute('id') ) {
      databaseTodosDelete(parseInt(_id.getAttribute('id'), 10), function() {
        databaseTodosGet(renderAllTodos);
      });
    }
  }

  function onSubmit (e) {
    e.preventDefault();
    databaseTodosAdd(input.value, function () {
      databaseTodosGet(renderAllTodos);
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

  function databaseTodosGet (callback) {
    var trans = db.transaction(['todo'], 'readonly');
    var store = trans.objectStore('todo');

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

  function databaseTodosDelete (id, callback) {
    var trans = db.transaction(['todo'], 'readwrite');
    var store = trans.objectStore('todo');
    var req = store.delete(id);
    
    trans.oncomplete = function(e) {
      callback();
    };
    req.onerror = databaseError;
  }

  function databaseError(e) {
    console.error('An IndexedDB error has occurred', e);
  }


}());