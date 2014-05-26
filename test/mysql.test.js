var should = require('should'),
DatabaseCleaner = require('../lib/database-cleaner'),
databaseCleaner = new DatabaseCleaner('mysql');

var config = require('./mysql.config');

var mysql = require('mysql'), 
client = mysql.createConnection(config);
pool_client = mysql.createPool(config);
database = client.config.database;

describe('mysql', function() {
    beforeEach(function(done) {
        prepareData(done);
    });

    afterEach(function(done) {
        dropData(done);
    });

    describe('client', function() {

        it('should fire callback.', function(done) {
            databaseCleaner.clean(client);
            databaseCleaner.clean(client, done);
        });

        it('should delete all records', function(done) {
            databaseCleaner.clean(client, function(err, res) {
                if(err) console.log(err);
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

    describe('pool client', function() {
        it('should delete all records', function(done) {
            databaseCleaner.clean(pool_client, function(err, res) {
                if(err) console.log(err);
                pool_client.query("SELECT * FROM test1", function(err, result_test1) {
                    pool_client.query("SELECT * FROM test2", function(err, result_test2) {
                        result_test1.length.should.equal(0);
                        result_test2.length.should.equal(0);
                        pool_client.end();
                        done();
                    });
                });
            });
        });
    });

});

function prepareData(done) {
    client.query('CREATE DATABASE IF NOT EXISTS ' + database, function(err, res) {
        if(err) console.log(err);
        client.query('USE ' + database, function(err, res) {
            if(err) console.log(err);
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
}

function dropData(done) {
    client.query("DROP TABLE IF EXISTS test1", function(err) {
        if(err) console.log(err);
        client.query("DROP TABLE IF EXISTS test2", function(err) {
            if(err) console.log(err);
            done();
        });
    });
}
