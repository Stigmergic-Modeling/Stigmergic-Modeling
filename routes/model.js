/*
 * workspace 页面 get 方法
 */
exports.enterWorkspace = function(req, res){
    res.render('workspace', {
        title: 'workspace' + req.params.model,
        user : req.session.user,
        model: req.params.model,
        success : '',
        error : ''
    });
};

/*
 * info 页面 get 方法
 */
exports.getInfo = function(req, res){
    res.render('model_info', {
        title: 'Model Info' + req.params.model,
        user : req.session.user,
        model: req.params.model,
        success : '',
        error : ''
    });
};