var should = require('should'),
DatabaseCleaner = require('../lib/database-cleaner'),
databaseCleaner = new DatabaseCleaner('mysql');

var config = require('./mysql.config');

var mysql = require('mysql'), 
client = mysql.createConnection(config);
database = client.config.database;

describe('mysql', function() {
    beforeEach(function(done) {
        client.query('CREATE DATABASE IF NOT EXISTS ' + database, function(err, res) {
            client.query('USE ' + database, function(err, res) {
                client.config.database = database;
                client.query('CREATE TABLE test1 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function(err, res) {
                    if(err) console.log(err);
                        client.query('CREATE TABLE test2 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function(err, res) {
                            if(err) console.log(err);
                                client.query('INSERT INTO test1(title) VALUES(?)', ["foobar"], function(err, res) {
                                    if(err) console.log(err);
                                        client.query('INSERT INTO test2(title) VALUES(?)', ["foobar"], function(err, res){
                                            if(err) console.log(err);
                                                done();
                                        });
                                });
                        });
                });
            });
        });
    });

    afterEach(function(done) {
        client.query("DROP TABLE IF EXISTS test1", function(err) {
            if(err) console.log(err);
            client.query("DROP TABLE IF EXISTS test2", function(err) {
                if(err) console.log(err);
                client.end();
                done();
            });
        });
    });

    it('should delete all records', function(done) {
        databaseCleaner.clean(client, function() {
            client.query("SELECT * FROM test1", function(err, result_test1) {
                if(err) console.log(err);
                client.query("SELECT * FROM test2", function(err, result_test2) {
                    if(err) console.log(err);
                    result_test1.length.should.equal(0);
                    result_test2.length.should.equal(0);
                    done();
                });
            });
        });
    });

});
