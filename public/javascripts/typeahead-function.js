var TypeAheadState = {
    relationTYpe : {}
}

getTypeaHead = function(type){
    var dir={},source;
    switch(type){
        case 'class':
            dir.icd = icd['class'];
            dir.ccd = ccd['class'];
            //source = getTypeaHeadClass(dir);
            source = getTypeaHeadName(dir);
            break;
        case 'className':
            //Name Reform
            //dir.icd = icd['class'][statusArray.class.id]['className'];
            //dir.ccd = ccd['class'][statusArray.class.id]['className'];
            dir.icd = icd['class'][statusArray.class.id]['name'];
            dir.ccd = ccd['class'][statusArray.class.id]['name'];
            source = getTypeaHeadClassName(dir);
            break;
        case 'attribute':
            dir.icd = icd['class'][statusArray.class.id]['attribute']
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'];
            //source = getTypeaHeadAttribute(dir);
            source = getTypeaHeadName(dir);
            break;
        //Name Reform
        //case "attributeName":
        case "name":
        case "default":
        case "propertyStrings":
        case "constraint":
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            source = getTypeaHeadAttributeElem(dir);
            break;
        case "multiplicity":
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            source = getTypeaHeadAttributeElemMulti(dir);
            break;
        case 'visibility':
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            source = getTypeaHeadAttributeVisibility(dir);
            break;
        case "type":
            dir.icd = icd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            dir.ccd = ccd['class'][statusArray.class.id]['attribute'][statusArray.attribute.id][type];
            source = getTypeaHeadAttributeType(dir);
            break;
        case 'relation':
            source = getTypeaHeadRelation();//这个仅仅和当前元素相关
            break;
        case 'relationType-name':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeName(dir);
            break;
        //大量重复信息
        case 'relationType-role1':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElem(dir,'role',0);
            break;
        case 'relationType-role2':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElem(dir,'role',1);
            break;
        case 'relationType-multiplicity1':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElemMulti(dir,'multiplicity',0);
            break;
        case 'relationType-multiplicity2':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElemMulti(dir,'multiplicity',1);
            break;
        case 'relationType-subsets1':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElem(dir,'subsets',0);
            break;
        case 'relationType-subsets2':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElem(dir,'subsets',1);
            break;
        case 'relationType-redefines1':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElem(dir,'redefines',0);
            break;
        case 'relationType-redefines2':
            dir.icd = icd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            dir.ccd = ccd['relation'][statusArray.relation.id][TypeAheadState.relationTYpe.type];
            source = getTypeaHeadRelationTypeElem(dir,'redefines',1);
            break;
    }
    return source;
}

getTypeaHeadName = function(dir){
    //可以加一个原始项orig
    var array=[];
    var repeatKeyList = {};
    var repeatValueList = {};
    var msg=[];

    for(var key in dir.icd){
        repeatKeyList[key] = 1;
        for(var value in dir.icd[key]['name']){
            if(regex.test(value) === false){
                repeatValueList[value] = 1;
            }
        }
    }
    for(var key in dir.ccd){
        if(repeatKeyList[key] != undefined) continue;//如果已经被引用过了
        for(var value in dir.ccd[key]['name']){
            if(regex.test(value) === false){
                if(repeatValueList[value] != undefined) continue;//如果已经被引用过了
                array.push([value,dir.ccd[key]['name'][value]._nor]);
            }
        }
    }
    array.sort(function(a,b){return (b[1] - a[1]);});
    for(var i=0;i<array.length;i++){
        if(repeatValueList[array[i][0]] === undefined){
            repeatValueList[array[i][0]] = 1;
            msg.push(array[i][0]);
        }
    }
    return msg;
}

//原生系列
/*
function getTypeaHeadClass(dir){
    //get icd Elem
    var existList = {}
    for(var id in dir.icd){
        //Name Reform
        //for(var name in dir.icd[id].className){
        for(var name in dir.icd[id].name){
            existList[name] = 1;
        }
    }
    //get ccd Elem
    var array = []
    for(var id in dir.ccd){
        //Name Reform
        //for(var name in dir.ccd[id].className){
        for(var name in dir.ccd[id].name){
            if(existList[name] === undefined){
                //Name Reform
                //array.push([name,dir.ccd[id].className[name]["_nor"]]);
                array.push([name,dir.ccd[id].name[name]["_nor"]]);
            }
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    return uniqueArray(array);
};
*/
function getTypeaHeadClassName(dir){
    //get icd Elem
    var existList = {}
    for(var name in dir.icd){
        existList[name] = 1;
    }
    delete existList[statusArray.class.value];
    //get ccd Elem
    var array = []
    for(var name in dir.ccd){
        if(existList[name] === undefined){
            array.push([name,dir.ccd[name]["_nor"]]);
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    return uniqueArray(array);
};
/*
function getTypeaHeadAttribute(dir){
    //get icd Elem
    var existList = {}
    for(var id in dir.icd){
        //Name Reform
        //for(var name in dir.icd[id].attributeName){
        for(var name in dir.icd[id].name){
            existList[name] = 1;
        }
    }
    //get ccd Elem
    var array = []
    for(var id in dir.ccd){
        //Name Reform
        //for(var name in dir.ccd[id].attributeName){
        for(var name in dir.ccd[id].name){
            if(existList[name] === undefined){
                //Name Reform
                //array.push([name,dir.ccd[id].attributeName[name]["_nor"]]);
                array.push([name,dir.ccd[id].name[name]["_nor"]]);
            }
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    return uniqueArray(array);
};
*/
function getTypeaHeadAttributeElem(dir){
    //get icd Elem
    var existList = {}
    for(var name in dir.icd){
        existList[name] = 1;
    }
    delete existList[statusArray.attributeElem.id];
    //get ccd Elem
    var array = []
    for(var name in dir.ccd){
        if(existList[name] === undefined){
            array.push([name,dir.ccd[name]["_nor"]]);
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    return uniqueArray(array);
};


function getTypeaHeadAttributeElemMulti(dir){
    var existList = {}
    for(var name in dir.icd){
        existList[name] = 1;
    }
    //排除当前节点信息
    var tmp = statusArray.attributeElem.id.split("..");
    if(tmp.length != 1) tmp = tmp[0] +"-"+tmp[1] ;
    delete existList[tmp];
    //get ccd Elem
    var array = []
    for(var name in dir.ccd){
        if(existList[name] === undefined){
            array.push([name,dir.ccd[name]["_nor"]]);
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    array = uniqueArray(array);

    for(var i=0;i<array.length;i++){
        array[i] = multiTransform.changeToPost(array[i]);
    }

    return array;
};


function getTypeaHeadAttributeType(dir){
    //get icd Elem
    var existList = {}
    var legalList = {};
    for(var i=0;i<m_attribute.type.length;i++){
        legalList[m_attribute.type[i]] = 1;
    }
    for(var id in icd.class){
        for(var name in icd.class[id].name){
            if(legalList[name] === undefined){
                legalList[name] = 1;
            }
        }
    };
    //get ccd Elem
    var array = [];
    for(var name in dir.ccd){
        if(existList[name] === undefined){
            array.push([name,dir.ccd[name]["_nor"]]);
            existList[name] = 1;
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    for(var key in legalList){
        if(existList[key] === undefined){
            array.push([key,0]);
        }
    }
    return uniqueArray(array);
};

function getTypeaHeadAttributeVisibility(dir){
    //get icd Elem
    var existList = {}
    var legalList = {};
    for(var i=0;i<m_attribute.visibility.length;i++){
        legalList[m_attribute.visibility[i]] = 1;
    }
    //get ccd Elem
    var array = [];
    for(var name in dir.ccd){
        if(existList[name] === undefined){
            array.push([name,dir.ccd[name]["_nor"]]);
            existList[name] = 1;
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    for(var key in legalList){
        if(existList[key] === undefined){
            array.push([key,0]);
        }
    }
    return uniqueArray(array);
};

function getTypeaHeadRelationTypeElem(dir,elemType,index){
    //第四步，读取推荐
    var array = [];
    if(TypeAheadState.relationTYpe.type != 'association'){
        //不等的时候，和他的排列顺序有关，如father和children肯定不一样
        var number = index+1;
        for(var elemValue in dir.ccd[TypeAheadState.relationTYpe.id].order[TypeAheadState.relationTYpe.order][elemType+number]){
            if(elemValue === '&default') continue;
            array.push([elemValue,dir.ccd[TypeAheadState.relationTYpe.id].order[TypeAheadState.relationTYpe.order][elemType+number][elemValue]._nor]);
        }

    }else{
        //association时，两侧的内容可能是一样的
        for(var order in dir.ccd[TypeAheadState.relationTYpe.id].order){
            if(dir.ccd[TypeAheadState.relationTYpe.id].order[order] === undefined) continue;
            var number = (parseInt(order)+parseInt(TypeAheadState.relationTYpe.order)+parseInt(index))%2+1;
            for(var elemValue in dir.ccd[TypeAheadState.relationTYpe.id].order[order][elemType+number]){
                if(elemValue === '&default') continue;
                //里面的推荐内容会得到相应的修改;
                array.push([elemValue,dir.ccd[TypeAheadState.relationTYpe.id].order[order][elemType+number][elemValue]._nor]);
            }
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    return uniqueArray(array);
}

function getTypeaHeadRelationTypeElemMulti(dir,elemType,index){
    //第四步，读取推荐
    var array = [];
    if(TypeAheadState.relationTYpe.type != 'association'){
        //不等的时候，和他的排列顺序有关，如father和children肯定不一样
        var number = index+1;
        for(var elemValue in dir.ccd[TypeAheadState.relationTYpe.id].order[TypeAheadState.relationTYpe.order][elemType+number]){
            if(elemValue === '&default') continue;
            array.push([elemValue,dir.ccd[TypeAheadState.relationTYpe.id].order[TypeAheadState.relationTYpe.order][elemType+number][elemValue]._nor]);
        }

    }else{
        //association时，两侧的内容可能是一样的
        for(var order in dir.ccd[TypeAheadState.relationTYpe.id].order){
            if(dir.ccd[TypeAheadState.relationTYpe.id].order[order] === undefined) continue;
            var number = (parseInt(order)+parseInt(TypeAheadState.relationTYpe.order)+parseInt(index))%2+1;
            for(var elemValue in dir.ccd[TypeAheadState.relationTYpe.id].order[order][elemType+number]){
                if(elemValue === '&default') continue;
                //里面的推荐内容会得到相应的修改;
                array.push([elemValue,dir.ccd[TypeAheadState.relationTYpe.id].order[order][elemType+number][elemValue]._nor]);
            }
        }
    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    array = uniqueArray(array);

    for(var i=0;i<array.length;i++){
        array[i] = multiTransform.changeToPost(array[i]);
    }
    return array;
}

function getTypeaHeadRelationTypeName(dir){
    //get icd Elem
    var array = [];
    if(TypeAheadState.relationTYpe.type === 'association'){
        //不等的时候，和他的排列顺序有关，如father和children肯定不一样
        for(var relationTypeName in dir.ccd[TypeAheadState.relationTYpe.id].name){
            if(elemValue === '&default') continue;
            array.push([relationTypeName,dir.ccd[TypeAheadState.relationTYpe.id].name[relationTypeName]._nor]);
        }

    }
    array.sort(function(a,b){return(b[1] - a[1])}); //从大到小排序
    return uniqueArray(array);
}

function getTypeaHeadRelation(){
    var array=[];
    var list = $(".nav-classdiagram").children("ul").children("li");
    var length = list.length;
    var layer = 0;
    for(var i=0;i<length;i++){
        if($(list).eq(i).attr('name') === undefined) {layer++;continue;}
        if(layer != 2) continue;
        array.push($(list).eq(i).text());
    }
    return array;
}

function setTypeTypeAheadState(accordionGroup){
    //确定order
    var trs = $(accordionGroup).find("tbody").children("tr");
    var class1 = $(trs).eq(2).find(".show").eq(0).children("p").text();
    var class2 = $(trs).eq(2).find(".show").eq(1).children("p").text();

    var classes = statusArray.relation.value.split('-');
    if((class1===classes[1]) & (class2===classes[0])) TypeAheadState.relationTYpe.order = '1'; //逆序
    if((class1===classes[0]) & (class2===classes[1])) TypeAheadState.relationTYpe.order = '0'; //顺序 避免重名时候的干扰

   //确定id
    if(TypeAheadState.relationTYpe.type != 'association'){
        TypeAheadState.relationTYpe.id = TypeAheadState.relationTYpe.order;
    }else{
        TypeAheadState.relationTYpe.id = $(accordionGroup).children("input[type='hidden']").val();
    }
}

function uniqueArray(arraySource){
    var obj = {};
    var arrayTarget = [];
    var length = arraySource.length;

    for(var i=0;i<length;i++){
        if(obj[arraySource[i][0]] === undefined){
            obj[arraySource[i][0]] = 1;
            arrayTarget.push(arraySource[i][0]);
        }
    }
    return arrayTarget
}