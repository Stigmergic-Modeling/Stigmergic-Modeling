ajax_classAdd = function(data){
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: data,
        dataType: 'json',
        async: true,
        success: function(doc){
            icd = doc.icd ;
            getSourceNav();
            if(doc.count != 1) return alert("创建失败，请刷新页面后重新尝试");
            //创建
            var item_val = data.data.new.value;
            var item_id = icdGetId('class',icd['class'],item_val);
            var header_class = $(".nav.nav-list.bs-docs-sidenav").children(".nav-header-relation");
            var html = getHtml.navLi(item_id,'class',item_val);
            $(header_class).before(html);
            $(header_class).prev().trigger('click');

            statusArray.class.id = item_id;
            var sortData = {
                statusArray:statusArray,
                type : 'attributeSort',
                process : 'add'
            };
            ajax_attributeSort(sortData);
        }
    });
}

ajax_classNameRevise = function(data){
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: {
            statusArray:statusArray,
            type : 'className',
            process : 'revise',
            data: data
        },
        dataType: 'json',
        async:false,
        success: function(doc){
            icd = doc.icd;
            if(doc.count != 1) return alert("Fail! Please refresh the page and try it again");
            //进行relation的修改，改完过后再trigger
            reviseRelationName(data.new);
            getSourceNav();
            $(".bs-docs-sidenav .active").trigger("click");
        }
    })
}

reviseRelationName = function(className){
    var list = $(".nav-classdiagram").children("ul").children("li");
    var mutex = 1;

    for(var i=0;i<list.length;i++){
        //to relation
        if($(list).eq(i).hasClass("nav-header-relation")) {mutex = 0;continue}
        if(mutex) continue;
        //if compared
        var id = $(list).eq(i).attr('name');
        statusArray.relation.id = id;
        id = id.split("-");
        var j;
        if(id[0]===statusArray.class.id){
            j=0;
        }else if(id[1]===statusArray.class.id){
            j=1
        }else continue;
        //changeName
        var valueOld,valueNew;
        for(var key in icd['relation'][statusArray.relation.id]['name']){
            //changeName
            valueOld = key;
            key = key.split("-");
            key[j] = className;
            valueNew = key[0]+"-"+key[1];

            var data ={
                old:valueOld,
                sub :icd['relation'][statusArray.relation.id]['name'][valueOld],
                new:valueNew
            }
            ajax_reviseRelationName(data,$(list).eq(i));
        }
    }
}

ajax_reviseRelationName = function(data,itemGroup){
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: {
            statusArray:statusArray,
            type : 'relationName',
            process : 'revise',
            data: data
        },
        dataType: 'json',
        async:false,
        success: function(doc){
            icd = doc.icd;
            data.new = data.new.split("-");
            var showName=getShowName(data.new);
            var head= '<i class="icon-chevron-right" title="click to remove"></i><i class="icon-remove-sign-right"></i>';
            $(itemGroup).children("a").html(head+showName);
        }
    })
}

ajax_attributeAdd = function(data,itemGroup){
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: data,
        dataType: 'json',
        async: true,
        success: function(doc){
            icd = doc.icd;
            getSourceNav();
            if(doc.count != 1) return alert("操作失败，请刷新页面后重新尝试");

            //这一块是完整的添加逻辑...
            $.ajax({
                url: '/post/html/icd-element-attribute',
                type: 'post',
                data: {},
                success: function(html){
                    if(itemGroup.length === 0){
                        $(".content-detail .accordion").append(html);
                        itemGroup = $(".content-detail .accordion").children().last();
                    }else if($(itemGroup).hasClass("active")){
                        $(itemGroup).after(html);
                        itemGroup = $(itemGroup).next()
                    }else{
                        $(".content-detail .accordion").append(html);
                        itemGroup = $(".content-detail .accordion").children().last();
                    }

                    var item_val = data.data.new.value;
                    var item_id = icdGetId('attribute',icd['class'][statusArray.class.id]["attribute"],item_val);
                    icd_element_attribute_show($(itemGroup),item_id,icd['class'][statusArray.class.id]["attribute"][item_id]);
                }
            });
        }
    });
}

ajax_delete = function(data,item){
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: data,
        dataType: 'json',
        async: false,
        success: function(doc){
            if(data.type === 'cd'){
                alert("Project Delete Successfully");
                return location.href = '/';
            }
            icd =doc.icd;
            if(doc.count != 1) return alert("Operation Fail. Please refresh page and try it later");
            else $(item).remove();
            getSourceNav();
            if(data.type === 'class') removeRelation(data.data.new.value);
        }
    });
};

removeRelation = function(className){
    for(var i=0;i<source_nav.length;i++){
        var tmp = source_nav[i].split("-");
        if(tmp.length != 2) continue;//说明不是relation

        if(tmp[0]===className || tmp[1]===className){
            var list = $(".nav-classdiagram").children("ul").children("li");
            var length = list.length;
            var item =null;
            for(var j=0;j<length;j++){
                if($(list).eq(j).attr('name') === undefined) continue;
                if(source_nav[i] === $(list).eq(j).text()){
                    item = $(list).eq(j);
                    var id = $(list).eq(j).attr('name');
                    var data =  {
                        statusArray:statusArray,
                        type : 'relation',
                        process : 'remove',
                        data: {
                            new: {
                                id : id,
                                value :source_nav[i]
                            },
                            sub: icd['relation'][id]
                        }
                    }
                    ajax_delete(data,$(list).eq(j));
                }
            }
        }
    }
}

ajax_relationAdd = function(data,itemGroup){
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: data,
        dataType: 'json',
        async: true,
        success: function(doc){
            icd = doc.icd;
            getSourceNav();
            if(doc.count != 1) return alert("操作失败，请刷新页面后重新尝试");
            var item_id = data.data.new.id;
            var showName=getShowName(data.data.new.value.split("-"));
            var html = getHtml.navLi(item_id,'relation',showName);
            $(".nav.nav-list.bs-docs-sidenav").append(html)
            $(".nav.nav-list.bs-docs-sidenav").children().last().trigger('click');
        }
    });
}

ajax_relationTypeAdd = function(data,itemGroup){
    var relationElem  = statusArray.relationType
    $.ajax({
        url: '/post/data/icd-element',
        type: 'post',
        data: data,
        dataType: 'json',
        async: false,
        success: function(doc){
            if(doc.count != 1) return alert("操作失败，请刷新页面后重新尝试");
            if(m_relationTypeRevise){
                m_relationTypeRevise = false;
            }
            if(relationElem.type === 'association' && relationElem.id === '&default'){
                var item_id = icdGetId('relationType',doc.icd['relation'][statusArray.relation.id]["association"],icd['relation'][statusArray.relation.id]["association"]);
                relationElem.id = item_id;
            }
            icd = doc.icd;
            icd_content_relationType_show(itemGroup,relationElem);
        }
    });
}

ajax_getHtml = function(url,list,subfunction){
    $.ajax({
        url: url,
        type: 'post',
        data: {},
        async: false,   //这样很蛋疼饿
        success: function(html){
            $(list).append(html);
            //subfunction();
        }
    });
}

ajax_attributeSort = function(data){
    $.ajax({
        url: '/post/data/icd-attributeSort',
        type: 'post',
        data: data,
        dataType: 'json',
        async: true,
        success: function(doc){
            switch(data.process){
                case 'add':
                    break;
                case 'get':
                    icd_element_attribute_sort(doc.sortList);
                    break;
                case 'revise':
                    break;
            }
        }
    });
}