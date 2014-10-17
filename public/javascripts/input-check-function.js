checkExist = function(dir,type,name){
    //dir尚未给出
    var illegal = true;
    switch(type){
        case 'name':
            illegal = checkExistName(dir,type,name);
            break;
        /*
        case '类名':
            type = 'name';
            dir = icd.class;
            illegal = checkExistClassName(dir,type,name);
            break;
        case '名称':
            //Name Reform
            //type = 'className';
            type = 'name';
            dir = icd.class[statusArray.class.id].attribute;
            illegal = checkExistAttributeName(dir,type,name);
            break;
        */
        case 'type':
            illegal = checkExistAttributeType(dir,type,name);
            break;
        case 'visibility':
            illegal = checkExistAttributeVisibility(dir,type,name);
            break;
        case "multiplicity":
            var regex = /^([0-9]*|(\*))(\.\.([0-9]*|(\*)))?$/;
            illegal = !regex.test(name);
            break;
        case "default": case "constraint":case 'ordering':case "uniqueness":case "readOnly":case "union":case "subsets":case "redefines":case "composite":
            illegal = false;
            break;
        default:
            if(dir[name] != undefined) illegal=true;
            else illegal = false;
            break;
    }
    if(illegal){
        switch(type){
            case "type":
                //alert("Please input basic type or Classes written by yourself！\n Only recommended items are allowed.");
                break;
            case 'visibility':
                alert("Only four types recommended are allowed");
                break;
            case 'multiplicity':
                alert("Please input according to multiple specifications. \n [lower..Upper]")
                break;
            default : alert("Name already existed");
        }
    }
    return illegal;
};

checkExistName = function(dir,type,name){
    for(var elem in dir){
        if(dir[elem][type][name] != undefined)
            return true;
    }
    return false;
}

checkExistClassName = function(dir,type,name){
    for(var elem in dir){
        if(dir[elem][type][name] != undefined)
            return true;
    }
    return false;
}

checkExistAttributeName = function(dir,type,name){
    for(var elem in dir){
        if(dir[elem][type][name] != undefined)
            return true;
    }
    return false;
}

checkExistAttributeType = function(dir,type,name){
    var legalList = {};
    for(var i=0;i<m_attribute.type.length;i++){
        legalList[m_attribute.type[i]] = 1;
    }
    for(var id in icd.class){
        for(var className in icd.class[id].name){
            if(legalList[className] === undefined){
                legalList[className] = 1;
            }
        }
    };
    if(legalList[name] === undefined) return true;
    else return false;
}


checkExistAttributeVisibility = function(dir,type,name){
    var legalList = {};
    for(var i=0;i<m_attribute.visibility.length;i++){
        legalList[m_attribute.visibility[i]] = 1;
    }
    if(legalList[name] === undefined) return true;
    else return false;
}