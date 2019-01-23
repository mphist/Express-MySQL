var connection = require('../lib/db');
var bcrypt = require('bcrypt-nodejs');

module.exports = function(router) {
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

    passport.serializeUser(function(user, done) {
        console.log('serailize ', user);
        console.log('serialzie2', JSON.parse(user))
        done(null, JSON.parse(user).id);
    });
    
    passport.deserializeUser(function(id, done) {
        console.log('deserialize ', id);
        connection.query(`SELECT * FROM authData WHERE JSON_EXTRACT(jdoc, '$.id') = ?`, [id], (err, rows) => {
            done(err, rows[0]);
        });   
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw'
    },
        function(username, password, done) {

            console.log(username, password);
            var query = connection.query(`SELECT * FROM authData WHERE JSON_EXTRACT(jdoc, '$.id') = ?`, [username], (err, rows) => {
                if (err) {
                    throw err;
                } else {
                    if (rows[0]) {
                        console.log('query result', rows[0].jdoc)
                        console.log(username, JSON.parse(rows[0].jdoc).id)
                        if (username === JSON.parse(rows[0].jdoc).id) {
                            var hash = JSON.parse(rows[0].jdoc).password;
                            bcrypt.compare(password, hash, function(err, res) {
                                console.log('login', password, hash);
                                // res == true
                                if (res) {
                                    return done(null, rows[0].jdoc)
                                } else {
                                    console.log('wrong password');
                                    return done(null, false, { message: 'Incorrect password.' });
                                }
                            });
                        } else {
                            console.log('wrong id');
                            return done(null, false, { message: 'Incorrect id.' });
                        }
                    } else {
                        console.log('nonexistent id');
                        return done(null, false, { message: "Id doesn't exist." });
                    }           
                }  
            });
            console.log(query.sql);
        }
    ));
    return passport;
}