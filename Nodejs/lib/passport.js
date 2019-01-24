var connection = require('../lib/db');
var bcrypt = require('bcrypt-nodejs');

module.exports = function(router) {
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

    passport.serializeUser(function(user, done) {
        console.log('serailize ', user);
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        console.log('deserialize ', id);
        connection.query(`SELECT * FROM authData WHERE info ->> 'id' = $1`, [id], (err, result) => {
            done(err, result.rows[0]);
        });   
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw'
    },
        function(username, password, done) {

            console.log(JSON.stringify(username), password);
            var query = connection.query(`SELECT * FROM authData WHERE info ->> 'id' = $1`, [username], (err, result) => {
                if (err) {
                    throw err;
                } else {
                    if (result.rows[0]) {
                        console.log('query result', result.rows[0])
                        console.log('what is this', username, result.rows[0].info.id)
                        if (username === result.rows[0].info.id) {
                            var hash = result.rows[0].info.password;
                            bcrypt.compare(password, hash, function(err, res) {
                                console.log('login', password, hash);
                                // res == true
                                if (res) {
                                    return done(null, result.rows[0].info)
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
            //console.log('wanna see sql',query);
        }
    ));
    return passport;
}