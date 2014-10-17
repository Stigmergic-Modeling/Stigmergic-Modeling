var log4js = require('log4js');

var m_logger;
exports.setLogger = function(log){
    m_logger = log;
    return m_logger;
};

exports.getLogger=function(level){
    m_logger.setLevel(level);
    return m_logger;
};

exports.generateLogData = function(level,collection,func,doc){
    m_logger.setLevel(level);
    var json = {
        collection : collection,
        func : func,
        doc : doc
    }
    //m_logger.info(json);
    m_logger.info(JSON.stringify(json))
    /*
    m_logger.info("{ collection: "+collection
        +" ,func: "+func
        +" ,doc: "+doc
        +" }");
    */
}