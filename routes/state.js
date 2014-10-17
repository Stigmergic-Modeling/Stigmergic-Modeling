
exports.checkLogin = function(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Not signed in/checkLogin');
        return res.redirect('/login');
    }
    if(req.session.user.state === 0)
    {
        req.flash('error', 'User is not activated！/checkLogin');
        return res.redirect('/checkmail');
    }
    next();
}

exports.checkNotLogin = function(req, res, next) {
    if (req.session.user) {
        if(req.session.user.state === 0){
            req.flash('error', 'User is not activated！/checkLogin');
            return res.redirect('/checkmail');
        }
        else{
            req.flash('error', 'Already signed in/checkNotLogin');
            var url ='/u/'+req.session.user;
            return res.redirect('/u/'+req.session.user.mail);
        }
    }
    next();
}

exports.checkNotActive = function(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Not signed in/checkNotActive');
        return res.redirect('/login');
    }
    else{
        if(req.session.user.state != 0){
            req.flash('error', 'User already activated！/checkNotActive');
            var url ='/u/'+req.session.user;
            return res.redirect('/u/'+req.session.user.mail);
        }
    }
    next();
}