define(function (require, exports, module) {

    var $ = require('../lib/jquery');

    module.exports = CCM;

    /*  ----------------------------------  *
     *
     *  用于前端推荐的群体模型（CCM）的构造函数
     *
     *  ----------------------------------  */

    function CCM(ccmId) {

        /*  ----------------------------------  *
         *
         *  CCM (this)
         *    |
         *    |-- ccmId : < ccmId >
         *    |
         *    |-- clazz
         *    |     |
         *    |     |-- < class ID >
         *    |     |     |
         *    |     |     |-- name
         *    |     |     |     |
         *    |     |     |     |-- < class name >
         *    |     |     |     |     |
         *    |     |     |     |      -- ref : < name reference number >
         *    |     |     |     |
         *    |     |     |     |-- < class name >
         *    |     |     |     |     |
         *    |     |     |     |      -- ref : < name reference number >
         *    |     |     |     |
         *    |     |     |      -- < class name >
         *    |     |     |           |
         *    |     |     |            -- ref : < name reference number >
         *    |     |     |
         *    |     |     |-- attribute
         *    |     |     |     |
         *    |     |     |      -- [ attribute ID list ] (attribute ID is the same as relationship ID)
         *    |     |     |
         *    |     |      -- ref : < class reference number >
         *    |     |
         *    |      -- < class ID >
         *    |           |
         *    |           |-- name
         *    |           |     |
         *    |           |     |-- < class name >
         *    |           |     |     |
         *    |           |     |      -- ref : < name reference number >
         *    |           |     |
         *    |           |     |-- < class name >
         *    |           |     |     |
         *    |           |     |      -- ref : < name reference number >
         *    |           |     |
         *    |           |      -- < class name >
         *    |           |           |
         *    |           |            -- ref : < name reference number >
         *    |           |
         *    |           |-- attribute
         *    |           |     |
         *    |           |      -- [ attribute ID list ] (attribute ID is the same as relationship ID)
         *    |           |
         *    |            -- ref : < class reference number >
         *    |
         *    |-- relgrp
         *    |     |
         *    |     |-- < classA ID - classB ID > (dictionary order)
         *    |     |     |
         *    |     |      -- relationship
         *    |     |           |
         *    |     |            -- [ relationship ID list ]
         *    |     |
         *    |     |
         *    |      -- < classA ID - classB ID > (dictionary order)
         *    |           |
         *    |            -- relationship
         *    |                 |
         *    |                  -- [ relationship ID list ]
         *    |
         *     -- relationship
         *          |
         *          |-- < relationship ID >
         *          |     |
         *          |     |-- type
         *          |     |     |
         *          |     |     |-- < relationship type >
         *          |     |     |     |
         *          |     |     |      -- ref : < type reference number >
         *          |     |     |
         *          |     |     |-- < relationship type >
         *          |     |     |     |
         *          |     |     |      -- ref : < type reference number >
         *          |     |     |
         *          |     |      -- < relationship type >
         *          |     |           |
         *          |     |            -- ref : < type reference number >
         *          |     |
         *          |     |-- name
         *          |     |     |
         *          |     |     |-- < relationship name >
         *          |     |     |     |
         *          |     |     |      -- ref : < name reference number >
         *          |     |     |
         *          |     |     |-- < relationship name >
         *          |     |     |     |
         *          |     |     |      -- ref : < name reference number >
         *          |     |     |
         *          |     |      -- < relationship name >
         *          |     |           |
         *          |     |            -- ref : < name reference number >
         *          |     |
         *          |     |-- property
         *          |     |     |
         *          |     |     |-- < property name >
         *          |     |     |     |
         *          |     |     |     |-- E0
         *          |     |     |     |     |
         *          |     |     |     |     |-- < property value >
         *          |     |     |     |     |     |
         *          |     |     |     |     |      -- ref : < property value reference number >
         *          |     |     |     |     |
         *          |     |     |     |     |-- < property value >
         *          |     |     |     |     |     |
         *          |     |     |     |     |      -- ref : < property value reference number >
         *          |     |     |     |     |
         *          |     |     |     |      -- < property value >
         *          |     |     |     |           |
         *          |     |     |     |            -- ref : < property value reference number >
         *          |     |     |     |
         *          |     |     |      -- E1
         *          |     |     |           |
         *          |     |     |           |-- < property value >
         *          |     |     |           |     |
         *          |     |     |           |      -- ref : < property value reference number >
         *          |     |     |           |
         *          |     |     |           |-- < property value >
         *          |     |     |           |     |
         *          |     |     |           |      -- ref : < property value reference number >
         *          |     |     |           |
         *          |     |     |            -- < property value >
         *          |     |     |                 |
         *          |     |     |                  -- ref : < property value reference number >
         *          |     |     |
         *          |     |      -- < property name >
         *          |     |           |
         *          |     |           |-- E0
         *          |     |           |     |
         *          |     |           |     |-- < property value >
         *          |     |           |     |     |
         *          |     |           |     |      -- ref : < property value reference number >
         *          |     |           |     |
         *          |     |           |     |-- < property value >
         *          |     |           |     |     |
         *          |     |           |     |      -- ref : < property value reference number >
         *          |     |           |     |
         *          |     |           |      -- < property value >
         *          |     |           |           |
         *          |     |           |            -- ref : < property value reference number >
         *          |     |           |
         *          |     |            -- E1
         *          |     |                 |
         *          |     |                 |-- < property value >
         *          |     |                 |     |
         *          |     |                 |      -- ref : < property value reference number >
         *          |     |                 |
         *          |     |                 |-- < property value >
         *          |     |                 |     |
         *          |     |                 |      -- ref : < property value reference number >
         *          |     |                 |
         *          |     |                  -- < property value >
         *          |     |                       |
         *          |     |                        -- ref : < property value reference number >
         *          |     |
         *          |      -- ref : < relationship reference number >
         *          |
         *           -- < relationship ID >
         *                |
         *                |-- type
         *                |     |
         *                |     |-- < relationship type >
         *                |     |     |
         *                |     |      -- ref : < type reference number >
         *                |     |
         *                |     |-- < relationship type >
         *                |     |     |
         *                |     |      -- ref : < type reference number >
         *                |     |
         *                |      -- < relationship type >
         *                |           |
         *                |            -- ref : < type reference number >
         *                |
         *                |-- name
         *                |     |
         *                |     |-- < relationship name >
         *                |     |     |
         *                |     |      -- ref : < name reference number >
         *                |     |
         *                |     |-- < relationship name >
         *                |     |     |
         *                |     |      -- ref : < name reference number >
         *                |     |
         *                |      -- < relationship name >
         *                |           |
         *                |            -- ref : < name reference number >
         *                |
         *                |-- property
         *                |     |
         *                |     |-- < property name >
         *                |     |     |
         *                |     |     |-- E0
         *                |     |     |     |
         *                |     |     |     |-- < property value >
         *                |     |     |     |     |
         *                |     |     |     |      -- ref : < property value reference number >
         *                |     |     |     |
         *                |     |     |     |-- < property value >
         *                |     |     |     |     |
         *                |     |     |     |      -- ref : < property value reference number >
         *                |     |     |     |
         *                |     |     |      -- < property value >
         *                |     |     |           |
         *                |     |     |            -- ref : < property value reference number >
         *                |     |     |
         *                |     |      -- E1
         *                |     |           |
         *                |     |           |-- < property value >
         *                |     |           |     |
         *                |     |           |      -- ref : < property value reference number >
         *                |     |           |
         *                |     |           |-- < property value >
         *                |     |           |     |
         *                |     |           |      -- ref : < property value reference number >
         *                |     |           |
         *                |     |            -- < property value >
         *                |     |                 |
         *                |     |                  -- ref : < property value reference number >
         *                |     |
         *                |      -- < property name >
         *                |           |
         *                |           |-- E0
         *                |           |     |
         *                |           |     |-- < property value >
         *                |           |     |     |
         *                |           |     |      -- ref : < property value reference number >
         *                |           |     |
         *                |           |     |-- < property value >
         *                |           |     |     |
         *                |           |     |      -- ref : < property value reference number >
         *                |           |     |
         *                |           |      -- < property value >
         *                |           |           |
         *                |           |            -- ref : < property value reference number >
         *                |           |
         *                |            -- E1
         *                |                 |
         *                |                 |-- < property value >
         *                |                 |     |
         *                |                 |      -- ref : < property value reference number >
         *                |                 |
         *                |                 |-- < property value >
         *                |                 |     |
         *                |                 |      -- ref : < property value reference number >
         *                |                 |
         *                |                  -- < property value >
         *                |                       |
         *                |                        -- ref : < property value reference number >
         *                |
         *                 -- ref : < relationship reference number >
         *
         *
         *  ----------------------------------  */

        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(ccmId);
        }

        this.ccmId = ccmId;

        // 示例数据
        this.clazz = {
            "101": {
                "name": {
                    "A": {"ref": 1},
                    "B": {"ref": 1},
                    "C": {"ref": 1}
                },
                "attribute": ["201"],
                "ref": 1
            },
            "102": {
                "name": {
                    "D": {"ref": 1},
                    "E": {"ref": 1},
                    "F": {"ref": 1}
                },
                "attribute": ["202", "203"],
                "ref": 1
            }
        };

        this.relgrp = {
            "101-102": {  // 规则：把 ID 小的放在前面
                "relationship": ["204"]
            }
        };

        this.relationship = {
            "201": {  // 每个 attribute 可能在多个 class 中出现
                "type": {
                    "Composition": {"ref": 1},
                    "Attribute": {"ref": 1}
                },
                "name": {
                    "hasA": {"ref": 1}
                },
                "property": {
                    "role": {
                        "E0": {
                            "whole": {"ref": 1}
                        },
                        "E1": {
                            "part": {"ref": 1}
                        }
                    },
                    "clazz": {
                        "E0": {
                            "101": {"ref": 1}
                        },
                        "E1": {
                            "102": {"ref": 1},
                            "_string": {"ref": 2}
                        }
                    },
                    "multiplicity": {
                        "E0": {
                            "1": {"ref": 1},
                            "*": {"ref": 1},
                            "1..*": {"ref": 1}
                        },
                        "E1": {
                            "1": {"ref": 1},
                            "*": {"ref": 1}
                        }
                    }
                },
                "ref": 1
            },
            "202": {
                "type": {
                    "Composition": {"ref": 1},
                    "Attribute": {"ref": 1}
                },
                "name": {
                    "hasA": {"ref": 1}
                },
                "property": {
                    "role": {
                        "E0": {
                            "whole": {"ref": 1}
                        },
                        "E1": {
                            "part": {"ref": 1}
                        }
                    },
                    "clazz": {
                        "E0": {
                            "101": {"ref": 1}
                        },
                        "E1": {
                            "102": {"ref": 1},
                            "_string": {"ref": 2}
                        }
                    },
                    "multiplicity": {
                        "E0": {
                            "1": {"ref": 1},
                            "*": {"ref": 1},
                            "1..*": {"ref": 1}
                        },
                        "E1": {
                            "1": {"ref": 1},
                            "*": {"ref": 1}
                        }
                    }
                },
                "ref": 1
            },
            "203": {
                "type": {
                    "Composition": {"ref": 1},
                    "Attribute": {"ref": 1}
                },
                "name": {
                    "hasA": {"ref": 1}
                },
                "property": {
                    "role": {
                        "E0": {
                            "whole": {"ref": 1}
                        },
                        "E1": {
                            "part": {"ref": 1}
                        }
                    },
                    "clazz": {
                        "E0": {
                            "101": {"ref": 1}
                        },
                        "E1": {
                            "102": {"ref": 1},
                            "_string": {"ref": 2}
                        }
                    },
                    "multiplicity": {
                        "E0": {
                            "1": {"ref": 1},
                            "*": {"ref": 1},
                            "1..*": {"ref": 1}
                        },
                        "E1": {
                            "1": {"ref": 1},
                            "*": {"ref": 1}
                        }
                    }
                },
                "ref": 1
            },
            "204": {
                "type": {
                    "Composition": {"ref": 1},
                    "Attribute": {"ref": 1}
                },
                "name": {
                    "hasA": {"ref": 1}
                },
                "property": {
                    "role": {
                        "E0": {
                            "whole": {"ref": 1}
                        },
                        "E1": {
                            "part": {"ref": 1}
                        }
                    },
                    "clazz": {
                        "E0": {
                            "101": {"ref": 1}
                        },
                        "E1": {
                            "102": {"ref": 1},
                            "_string": {"ref": 2}
                        }
                    },
                    "multiplicity": {
                        "E0": {
                            "1": {"ref": 1},
                            "*": {"ref": 1},
                            "1..*": {"ref": 1}
                        },
                        "E1": {
                            "1": {"ref": 1},
                            "*": {"ref": 1}
                        }
                    }
                },
                "ref": 2
            }
        };

    }

    /**
     * 更新前端 CCM
     */
    CCM.prototype.getCCM = function (icmName) {
        var ccm = this;
        var url = '/' + icmName + '/getccm?ccmId=' + ccm.ccmId;

        $.ajax({
            type: 'GET',
            url: url,
            //contentType: 'application/json',
            dataType: 'json'
        })
                .done(function (collectiveModel) {
                    ccm.clazz = collectiveModel.clazz;
                    ccm.relgrp = collectiveModel.relgrp;
                    ccm.relationship = collectiveModel.relationship;
                    console.log('collectiveModel', collectiveModel);
                })
                .fail(function () {
                    console.log('getCCM failed');
                });
    };

    /**
     * 获取 CCM 中所有类名，用于输入框下拉列表推荐
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
     * 获取 CCM 中某 classCluster 所有属性名，用于输入框下拉列表推荐
     * @param icm
     * @param classCluster (class ID)
     * @param className
     * @returns {*}
     */
    CCM.prototype.getAttributeNames = function (icm, classCluster, className) {
        if (!this.clazz[classCluster]) {
            return [];
        }

        var attributeIds = this.clazz[classCluster].attribute,  // attribute ID 的数组
                attributeNames = [],
                attributeHash = {},
                i, ilen, j, jlen,
                names, name;

        for (i = 0, ilen = attributeIds.length; i < ilen; i++) {
            var attributeInfo = this.relationship[attributeIds[i]];
            var attributeRoleE1 = attributeInfo.property.role.E1;
            names = Object.keys(attributeRoleE1);

            for (j = 0, jlen = names.length; j < jlen; j++) {
                if (!icm[0][className] || !(names[j] in icm[0][className][0])) {  // 去重 TODO 使用正确的className （？有问题吗）

                    // 收集
                    if (!attributeHash[names[j]] || attributeHash[names[j]] < attributeRoleE1[names[j]].ref) {  // 自身去重
                        attributeHash[names[j]] = attributeRoleE1[names[j]].ref;
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
     * 获取 CCM 中所有的类（及其 attributes 的基本信息，即属性名和属性类型）
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
        var classIdNameMappingInICM = {};  // 用于记录每个 ICM class node 中用户所选的名字
        var classIdNameMappingInCCM = {};  // 用于记录每个 ICM class node 中引用数最高的名字

        for (cName in icm[0]) {
            if (icm[0].hasOwnProperty(cName)) {
                classNamesInICM[cName] = true;  // 构造 classNamesInICM
            }
        }

        for (cName in classNamesInICM) {
            if (classNamesInICM.hasOwnProperty(cName)) {
                var id = classInICM[cName].id;
                classIdsInICM[id] = true;  // 构造 classIdsInICM
                classIdNameMappingInICM[id] = cName;  // 用于记录每个 ICM class node 中用户所选的名字
            }
        }

        // 第一遍，先提取所有可能被推荐的（与 ICM 不同id且不同名，名指引用数最高的名）CCM 类的 id, name, ref
        for (classCluster in this.clazz) {
            if (this.clazz.hasOwnProperty(classCluster)) {

                // 获取引用数最多的名字（后端传来的数据中已经过滤掉内置类型）
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
                    continue;  // 与当前 ICM class 名称相同的 CCM class 不会被推荐  TODO: 只要id不同，就换第二高引用的名字来推荐该类，除非该类只有一个名字（与icm中重名）
                }
                classIdNameMappingInCCM[clazz.id] = clazz.name;  // 用于记录每个 ICM class node 中引用数最高的名字
                classes.push(clazz);
            }
        }

        // 第二遍，提取可能被推荐类的属性（属性名和属性类型）
        for (var i = 0; i < classes.length; i++) {

            clazz = classes[i];
            var attributeIds = this.clazz[clazz.id].attribute;
            clazz.attribute = [];
            for (var j = 0; j < attributeIds.length; j++) {
                var attributeInfo = this.relationship[attributeIds[j]];
                var attributeNames = attributeInfo.property.role.E1;
                var attributeTypes = attributeInfo.property.clazz.E1;

                // 获取该 attribute 引用数
                tmpObj = {};
                tmpObj.ref = attributeInfo.ref;

                // 获取该 attribute 引用数最高的名称
                maxRef = 0;
                for (var attributeName in attributeNames) {
                    if (attributeNames.hasOwnProperty(attributeName)) {
                        if (attributeNames[attributeName].ref > maxRef) {
                            tmpObj.name = attributeName;
                            maxRef = attributeNames[attributeName].ref;
                        }
                    }
                }

                // 获取该 attribute 引用数最高的类型（如果存在的话）
                if (!$.isEmptyObject(attributeTypes)) {

                    // 获取最大引用数 type 的 id
                    maxRef = 0;
                    var attTypeId = '';
                    for (var attributeTypeClassId in attributeTypes) {
                        if (attributeTypes.hasOwnProperty(attributeTypeClassId)) {
                            if (attributeTypes[attributeTypeClassId].ref > maxRef) {
                                attTypeId = attributeTypeClassId;
                                maxRef = attributeTypes[attributeTypeClassId].ref;
                            }
                        }
                    }

                    // 由 class id 获取 class name
                    if ('_' === attTypeId.charAt(0)) {  // 内置类，attributeIds 实际内容为 '_string' 等
                        tmpObj.type = attTypeId.slice(1);
                    } else {
                        if (attTypeId in classIdNameMappingInICM) {  // 在 ICM 中，直接去该用户对其的命名
                            tmpObj.type = classIdNameMappingInICM[attTypeId];
                        } else if (attTypeId in classIdNameMappingInCCM) {  // 在 CCM 中且不为“禁止推荐的类”，取引用数最高的名字
                            tmpObj.type = classIdNameMappingInCCM[attTypeId];
                        } else {  // 禁止推荐的类 TODO: 这里如何处理有待考察
                            tmpObj.type = '';
                        }
                    }
                }

                clazz.attribute.push(tmpObj);
            }
        }

        return classes;
    };

    /**
     * 获取 CCM 中某 classCluster 的属性
     * @param icm
     * @param classCluster (class ID)
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
     * 获取 CCM 中的 relationships
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