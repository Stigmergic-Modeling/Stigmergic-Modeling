/**
 * using to find element in concept diagram
 */

//sa names for statusArray
saAttribute = function(attributeid){
    statusArray['attribute']["id"] = attributeid;
    var attributeNameDir = icd['class'][statusArray.class.id]['attribute'][attributeid]["attributeName"];
    for(var key in attributeNameDir){
        statusArray['attribute']["value"] = attributeNameDir[key]["_value"];
    }
}



//2Layer means for some specificated condition that in DataBase the source used write in the 2subLayer
getSource2Layer = function(icd_dir,ccd_dir,label){
    var subLabelName;
    var array = [], msg = [];
    switch(label){
        case '类':
        case '类名':
            subLabelName = 'className';
            break;
        case '属性':
        case '名称':
            subLabelName = 'attributeName';
            break;
    }
    var exitList = {};
    //添加icd中元素名称
    for(var key1 in icd_dir){
        for(var key2 in icd_dir[key1][subLabelName]){
            exitList[icd_dir[key1][subLabelName][key2]['_value']] = 1;
        }
    };

    for(var key1 in ccd_dir){
        for(var key2 in ccd_dir[key1][subLabelName]){
            if(exitList[key2] === undefined){
                var item = ccd_dir[key1][subLabelName][key2];
                array.push([item._value,item._nor]);
            }
        }
    }
    array.sort(function(a,b){a[1]-b[1];});
    for(var i=0;i<array.length;i++){
        msg.push(array[i][0]);
    }

    return uniqueArray(msg);
};

uniqueArray = function(arraySource){
    var obj = {};
    var arrayTarget = [];
    var length = arraySource.length;

    for(var i=0;i<length;i++){
        if(obj[arraySource[i]] === undefined){
            arrayTarget.push(arraySource[i]);
        }
    }
    return arrayTarget
}
