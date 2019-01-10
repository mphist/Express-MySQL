module.exports = function(router) {
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

    var authData = {
        id: 'hooni88',
        password: 'test',
        nickname: 'hooni'
    };

    passport.serializeUser(function(user, done) {
        console.log('serailize ', user);
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        console.log('deserialize ', id);
        done(null, authData);
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw'
    },
        function(username, password, done) {
            console.log(username, password);
            if (username === authData.id) {
                if (password === authData.password) {
                    return done(null, authData)
                } else {
                    console.log('wrong password');
                    return done(null, false, { message: 'Incorrect password.' });
                }
            } else {
                console.log('wrong id');
                return done(null, false, { message: 'Incorrect id.' });
            }
        }
    ));
    return passport;
}