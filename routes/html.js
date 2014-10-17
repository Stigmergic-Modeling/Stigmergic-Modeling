/*
 * Html
 */
var fs = require('fs');

exports.getHtml = function(req, res) {
    switch(req.params.file){
        case 'home-invite':
            switch(req.body['invited']){
                case '0':json={
                    title:"Project Public",
                    layout:"empty"
                };
                    break;
                case '1':json={
                    title:"Project Invited",
                    layout:"empty"
                };
                    break;
                case '2':json={
                    title:"Project not involved",
                    layout:"empty"
                };
                    break;
            }
            break;
        case 'icd-element': json={
            lable :  req.body['lable'],
            name : '',
            type : '',
            hasDelete : 1,
            layout:"empty"
            };
            break;
        case 'icd-element-double': json={
            lable :  req.body['lable'],
            name1 : '',
            name2 : '',
            type : 'relation',
            hasDelete : 1,
            layout:"empty"
        };
            break;
        case 'icd-element-relation-sub': json={
            lable :  req.body['lable'],
            layout: "empty"
        };
            break;
        case 'icd-element-attribute': json={
            id :  req.body['id'],
            layout: "empty"
        };
            break;
        default :  json={layout:"empty"};
    }
    res.render(req.params.file,json);
};

