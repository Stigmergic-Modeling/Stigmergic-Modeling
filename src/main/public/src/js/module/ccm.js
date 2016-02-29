define(function (require, exports, module) {

    var $ = require('../lib/jquery');

    module.exports = CCM;

    /*  ----------------------------------  *
     *
     *  用于前端推荐的群体模型（CCM）的构造函数
     *
     *  ----------------------------------  */

    function CCM(ccmPassIn) {

        /*  ----------------------------------  *
         *
         *  CCM
         *    |
         *     -- clazz
         *          |
         *          |-- [class ID]
         *          |     |
         *          |     |-- name
         *
         *  ----------------------------------  */

        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(ccmPassIn);
        }

        this.clazz = {};

        this.relgrp = {
            "554b0e254102f9a612c0a472-555066cd882a296d270c5507": {
                "558366c7004b1400ebfce399": {
                    "type": {
                        "Composition": {
                            "ref": 1
                        }
                    },
                    "name": {
                        "hasA": {
                            "ref": 1
                        }
                    },
                    "role": {
                        "whole-part": {
                            "ref": 1
                        }
                    },
                    "clazz": {
                        "554b0e254102f9a612c0a472-555066cd882a296d270c5507": {
                            "ref": 1
                        }
                    },
                    "multiplicity": {
                        "1-*": {
                            "ref": 1
                        },
                        "*-*": {
                            "ref": 1
                        },
                        "1..*-*": {
                            "ref": 1
                        }
                    },
                    "ref": 2
                }
            }
        };

    }

    /**
     * 更新前端CCM
     */
    CCM.prototype.getCCM = function (icmName) {
        var ccm = this;
        var url = '/' + icmName + '/getccm';

        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json'
        })
                .done(function (collectiveModel) {
                    ccm.clazz = collectiveModel.class;
                    ccm.relgrp = collectiveModel.relationGroup;
                    console.log('collectiveModel', collectiveModel);
                })
                .fail(function () {
                    console.log('getCCM failed');
                });
    };

    /**
     * 获取CCM中所有类名，用于输入框下拉列表推荐
     * @returns {Array}
     */
    CCM.prototype.getClassNames = function(icm) {
        var clazz = this.clazz,
                classNames = [],
                classNamesHash = {},
                classCluster,
                i, len,
                names, name;

        // 获得互不重复的 names 及其 ref 数
        for (classCluster in clazz) {
            if (clazz.hasOwnProperty(classCluster)) {
                names = Object.keys(clazz[classCluster].name);

                for (i = 0, len = names.length; i < len; i++) {
                    if (!(names[i] in icm[0])) {  // 去重

                        // 收集
                        if (!classNamesHash[names[i]] || classNamesHash[names[i]] < clazz[classCluster].name[names[i]].ref) {  // 自身去重
                            classNamesHash[names[i]] = clazz[classCluster].name[names[i]].ref;
                        }
                    }
                }
            }
        }

        // 将 names 及其 ref 数，用于接下来的排序、输出
        for (name in classNamesHash) {
            if (classNamesHash.hasOwnProperty(name)) {
                classNames.push({name: name, ref: classNamesHash[name]});
            }
        }

        return getRecommendNames(classNames);
    };

    /**
     * 获取CCM中某classCluster所有属性名
     * @param icm
     * @param classCluster
     * @param className
     * @returns {*}
     */
    CCM.prototype.getAttributeNames = function (icm, classCluster, className) {
        if (!this.clazz[classCluster]) {
            return [];
        }

        var attributes = this.clazz[classCluster].attribute,
                attributeCluster,
                attributeNames = [],
                attributeHash = {},
                i, len,
                names, name;

        // 获得互不重复的 names 及其 ref 数
        for (attributeCluster in attributes) {
            if (attributes.hasOwnProperty(attributeCluster)) {
                names = Object.keys(attributes[attributeCluster].name);

                for (i = 0, len = names.length; i < len; i++) {
                    //console.log(icm);
                    if (!icm[0][className] || !(names[i] in icm[0][className][0])) {  // 去重 TODO 使用正确的className

                        // 收集
                        if (!attributeHash[names[i]] || attributeHash[names[i]] < attributes[attributeCluster].name[names[i]].ref) {  // 自身去重
                            attributeHash[names[i]] = attributes[attributeCluster].name[names[i]].ref;
                        }
                    }
                }
            }
        }

        // 将 names 及其 ref 数，用于接下来的排序、输出
        for (name in attributeHash) {
            if (attributeHash.hasOwnProperty(name)) {
                attributeNames.push({name: name, ref: attributeHash[name]});
            }
        }

        return getRecommendNames(attributeNames);
    };

    /**
     * 获取ccm中所有的类（及其attributes）
     * @param icm
     * @returns {Array}
     */
    CCM.prototype.getClasses = function(icm) {
        var classCluster, maxRef, names, className, attributes, attribute, tmpObj,
                clazz, classes = [],
                cName,
                classInICM = icm[2]['clazz'],
                classNamesInICM = {},  // icm中class名，用于去重
                classIdsInICM ={};  // icm中classID，用于去重

        for (cName in icm[0]) {
            if (icm[0].hasOwnProperty(cName)) {
                classNamesInICM[cName] = true;  // 构造 classNamesInICM
            }
        }

        for (cName in classNamesInICM) {
            if (classNamesInICM.hasOwnProperty(cName)) {
                var id = classInICM[cName].id;
                classIdsInICM[id] = true;  // 构造 classIdsInICM
            }
        }

        for (classCluster in this.clazz) {
            if (this.clazz.hasOwnProperty(classCluster)) {

                // 获取引用数最多的名字
                clazz = {};
                clazz.id = classCluster;  // 记录id，用于采用推荐时绑定
                maxRef = 0;
                names = this.clazz[classCluster].name;
                for (className in names) {
                    if (names.hasOwnProperty(className)) {
                        if (names[className].ref > maxRef) {
                            maxRef = names[className].ref;
                            clazz.name = className;
                        }
                    }
                }
                if (clazz.name in classNamesInICM || clazz.id in classIdsInICM) {
                    continue;  // 与当前 ICM class 名称相同的 CCM class 不会被推荐
                }

                // 获取所有的属性
                attributes = this.clazz[classCluster].attribute;
                clazz.attribute = [];
                for (attribute in attributes) {
                    if (attributes.hasOwnProperty(attribute)) {

                        // TODO: 按引用数取最高
                        tmpObj = {
                            name: Object.keys(attributes[attribute].name)[0],
                            ref: attributes[attribute].ref
                        };
                        if (attributes[attribute].type) {
                            var tmpValue = Object.keys(attributes[attribute].type)[0];
                            if (tmpValue !== 'int' && tmpValue !== 'string' && tmpValue !== 'float' && tmpValue !== 'boolean') {
                                tmpObj.type = 'ClassType';  // TODO 从classid映射成name（若ICM中没有该id，则需要从ccm重寻找……）
                            } else {
                                tmpObj.type = tmpValue;
                            }
                        }

                        clazz.attribute.push(tmpObj);
                    }
                }

                classes.push(clazz);
            }
        }

        return classes;
    };

    /**
     * 获取ccm中某classCluster的属性
     * @param icm
     * @param classCluster
     * @param className
     * @returns {Array}
     */
    CCM.prototype.getAttributes = function (icm, classCluster, className) {
        var attributes, attribute, res, tmpObj, property, attrName,
                attrInICM = icm[2]['clazz'][className]['attribute'],
                attrNamesInICM = {},  // icm中该class中的attribute名，用于去重
                attrIdsInICM ={};  // icm中该class中的attribute ID，用于去重

        for (attrName in icm[0][className][0]) {
            if (icm[0][className][0].hasOwnProperty(attrName)) {
                attrNamesInICM[attrName] = true;  // 构造 attrNamesInICM
            }
        }

        for (attrName in attrNamesInICM) {
            if (attrNamesInICM.hasOwnProperty(attrName)) {
                var id = attrInICM[attrName];
                attrIdsInICM[id] = true;  // 构造 attrIdsInICM
            }
        }

        if (!this.clazz[classCluster]) {
            return [];
        }

        attributes = this.clazz[classCluster].attribute;
        res = [];
        for (attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {

                // TODO: 按引用数取最高
                tmpObj = {
                    id: attribute,  // 记录id，用于采用推荐时绑定
                    ref: attributes[attribute].ref
                };
                for (property in attributes[attribute]) {
                    if (attributes[attribute].hasOwnProperty(property) && property !== 'ref') {
                        var tmpValue = Object.keys(attributes[attribute][property])[0];
                        if (property === 'type' && tmpValue !== 'int' && tmpValue !== 'string' && tmpValue !== 'float' && tmpValue !== 'boolean') {
                            tmpObj[property] = 'ClassType';
                        } else {
                            tmpObj[property] = tmpValue;
                            console.log('tmpValue', tmpValue);
                        }
                    }
                }
                if (tmpObj.name in attrNamesInICM || tmpObj.id in attrIdsInICM) {
                    continue;  // 与当前 ICM attribute 名称或ID相同的 CCM attribute 不会被推荐
                }

                res.push(tmpObj);
            }
        }

        return res;
    };

    /**
     * 获取ccm中的relations
     * @param icm
     * @param relgrpName
     * @returns {Array}
     */
    CCM.prototype.getRelations = function (icm, relgrpName) {
        var relations, relation, res, tmpObj, property, i,
                relationIdsInICM ={};  // icm中该class中的relation ID，用于去重

        var relgrpId = relgrpName2Id(relgrpName);

        for (relation in icm[1][relgrpName][0]) {  // TODO 当前版本ICM中relationName和relationId是相同的，但下一版本不同，需要转换
            if (icm[1][relgrpName][0].hasOwnProperty(relation)) {
                relationIdsInICM[relation] = true;  // 构造 relationIdsInICM
            }
        }
        //console.log('relationIdsInICM', relationIdsInICM);
        //console.log('relgrpId', relgrpId);

        if (!this.relgrp[relgrpId]) {
            return [];
        }

        relations = this.relgrp[relgrpId];
        res = [];
        for (relation in relations) {
            if (relations.hasOwnProperty(relation)) {

                // TODO: 按引用数取最高
                tmpObj = {
                    id: relation,  // 记录id，用于采用推荐时绑定
                    ref: relations[relation].ref
                };
                //console.log(relations[relation]);

                // 确定name
                var maxName = {
                    name: '',
                    ref: 0
                };
                var names = relations[relation].name;
                //console.log('Object.keys(names).length', Object.keys(names));
                //if (!(Object.keys(names).length === 1 && names[''])) {
                for (var tmpName in names) {
                    if (names.hasOwnProperty(tmpName) && names[tmpName].ref > maxName.ref) {
                        maxName.name = tmpName;
                        maxName.ref = tmpName.ref;
                    }
                }
                tmpObj.name = maxName.name;

                // 确定关系类型
                var relType = 'isGeneralization isAggregation isComposition isAssociation'.split(' ');
                var maxType = {
                    type: '',
                    ref: 0
                };
                for (i = 0; i < relType.length; i++) {
                    if (relations[relation].type[relType[i]]) {
                        console.log('relations[relation][relType[i]]', relations[relation].type[relType[i]]);
                        if (relations[relation].type[relType[i]].ref > maxType.ref) {
                            maxType.type = relType[i];
                            maxType.ref = relations[relation].type[relType[i]].ref;
                        }
                    }
                }
                tmpObj.type = maxType.type.substring(2);  //  删除‘is’

                // 确定两端哪边是E0，哪端是E1
                var ends = Object.keys(relations[relation]);
                //console.log('ends', ends);
                var nonEntity = 'ref name type'.split(' ');
                for (i = 0; i < nonEntity.length; i++) {
                    ends.splice(ends.indexOf(nonEntity[i]), 1);
                }
                //console.log('ends', ends);
                var end0 = relations[relation][ends[0]].direction;
                //console.log('end0', end0);
                if (!end0['0'] || (end0['1'] && end0['1'].ref > end0['0'].ref)) {  // 确保ends[0]与真正的END0对应
                    var tmpEndClass = ends[0];
                    ends[0] = ends[1];
                    ends[1] = tmpEndClass;
                }
                //console.log('ends', ends);

                // 构造用于显示的relation
                var tmpProp = null;
                for (property in relations[relation][ends[0]]) {
                    if (relations[relation][ends[0]].hasOwnProperty(property) && property != 'ref') {

                        // 去除我们不希望构造在关系两端的内容
                        var nonProp = 'direction name isGeneralization isAggregation isComposition isAssociation'.split(' ');
                        for (i = 0; i < nonProp.length; i++) {
                            if (property === nonProp[i]) break;
                        }
                        if (i !== nonProp.length) continue;

                        // 拼接左右两端  TODO 按引用数排序后选出
                        tmpProp = Object.keys(relations[relation][ends[0]][property])[0] + '-' +
                                  Object.keys(relations[relation][ends[1]][property])[0];

                        if (property === 'class') {  // 对clazz特性特殊处理，将id变换为name  TODO: icm模型变更成Id为key后，这里需要相应改动
                            tmpObj[property] = clazzIds2Names(tmpProp);
                        } else {
                            tmpObj[property] = tmpProp;
                        }
                    }
                }

                // DONE：调试完成后，需要将下文注释还原为代码
                if (tmpObj.id in relationIdsInICM) {
                    continue;  // 与当前 ICM relation ID相同的 CCM relation 不会被推荐
                }

                res.push(tmpObj);
            }
        }
        //console.log('relationIdsInICM', res);
        return res;

        // 辅助函数
        function relgrpName2Id(relgrpName) {
            var clazz = relgrpName.split('-');
            var id0 = icm[2]['clazz'][clazz[0]].id;
            var id1 = icm[2]['clazz'][clazz[1]].id;

            // 对于ID，也是小的在左侧
            if (id0 < id1) {
                return id0 + '-' + id1;
            } else {
                return id1 + '-' + id0;
            }

        }
        function clazzIds2Names(clazzIds) {
            var id = clazzIds.split('-');
            var clazz = relgrpName.split('-');
            var id0 = icm[2]['clazz'][clazz[0]].id;
            //var id1 = icm[2]['clazz'][clazz[1]].id;
            if (id0 === id[0]) {
                return relgrpName;
            } else if (id0 === id[1]) {
                return clazz[1] + '-' + clazz[0];
            } else {
                return 'error-error';
            }
        }
    };

    /**
     * 对象数组比较函数
     * @param key
     * @returns {Function}
     */
    function compareBy(key) {
        return function(a, b) {
            if (a[key] < b[key]) return 1;  // 小的排在前面
            if (a[key] > b[key]) return -1;
            return 0;
        }
    }

    /**
     * 获取用于 typeahead 显示的数组
     * @param namesObjArray
     * @returns {*}
     */
    function getRecommendNames(namesObjArray) {
        return namesObjArray.sort(compareBy('ref')).map(function(o) {return o.name});
    }


});