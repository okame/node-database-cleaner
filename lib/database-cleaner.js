module.exports = DatabaseCleaner = function(type) {
  var cleaner = {};

  cleaner['mongodb'] = function(db, callback) {
    db.collections( function (skip, collections) {
      var count = collections.length;
      if (count < 1) { return callback.apply(); }

      collections.forEach(function (collection) {
        collection.drop(function () {
          if (--count <= 0 && callback) {
            callback.apply();
          }
        });
      });
    });
  };
  
  cleaner['redis'] = function(db, callback) {
    db.flushdb(function(err, results) {
      callback.apply();
    });
  };

  cleaner['couchdb'] = function(db, callback) {
    db.destroy(function (err, res) {
      db.create(function (err, res) {
        callback.apply();
      });
    });
  };

  cleaner['mysql'] = function(db, _callback) {
    var callback = _callback || function(){};
    db.query('show tables', function(err, tables) {
      if(err) console.log(err);
      var count  = 0;
      var length = tables.length;
      var database = db.config.database || db.config.connectionConfig.database;

      if(!database) {
          throw new Error('Database:'+database+ ' cannot be found.');
      }

      tables.forEach(function(table) {
        var table_name = table['Tables_in_'+database];
        if (table_name != 'schema_migrations') {
          db.query("DELETE FROM " + table_name, function(err, res) {
            count++;
            if (count >= length) {
              callback.call({}, err, res);
            }
          });
        } else {
          count++;
          if (count >= length) {
             callback.call({}, err, res);
          }
        }
      });
    });
  };

  this.clean = function (db, callback) {
    cleaner[type](db, callback);
  };
};
