define(function (require, exports, module) {

    var $ = require('../lib/jquery');

    module.exports = CCM;

    /*  ----------------------------------  *
     *
     *  用于前端推荐的群体模型（CCM）的构造函数
     *
     *  ----------------------------------  */

    function CCM(ccmId) {

        /*  ------------------------------------------------------------------------------------------------------  *
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
         *  ------------------------------------------------------------------------------------------------------  */

        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(ccmId);
        }

        // 用于存放临时数据
        this.temp = {};

        // CCM ID
        this.ccmId = ccmId;

        // 类 + 属性 ID
        this.clazz = {};

        // 关系组 + 关系 ID
        this.relgrp = {};

        // 关系 + 属性
        this.relationship = {};


        // 示例数据
        //
        //this.clazz = {
        //    "101": {
        //        "name": {
        //            "A": {"ref": 1},
        //            "B": {"ref": 1},
        //            "C": {"ref": 1}
        //        },
        //        "attribute": ["201"],
        //        "ref": 1
        //    },
        //    "102": {
        //        "name": {
        //            "D": {"ref": 1},
        //            "E": {"ref": 1},
        //            "F": {"ref": 1}
        //        },
        //        "attribute": ["202", "203"],
        //        "ref": 1
        //    }
        //};
        //
        //this.relgrp = {
        //    "101-102": {  // 规则：把 ID 小的放在前面
        //        "relationship": ["204"]
        //    }
        //};
        //
        //this.relationship = {
        //    "201": {  // 每个 attribute 可能在多个 class 中出现
        //        "type": {
        //            "Composition": {"ref": 1},
        //            "Attribute": {"ref": 1}
        //        },
        //        "name": {
        //            "hasA": {"ref": 1}
        //        },
        //        "property": {
        //            "role": {
        //                "E0": {
        //                    "whole": {"ref": 1}
        //                },
        //                "E1": {
        //                    "part": {"ref": 1}
        //                }
        //            },
        //            "clazz": {
        //                "E0": {
        //                    "101": {"ref": 1}
        //                },
        //                "E1": {
        //                    "102": {"ref": 1},
        //                    "_string": {"ref": 2}
        //                }
        //            },
        //            "multiplicity": {
        //                "E0": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1},
        //                    "1..*": {"ref": 1}
        //                },
        //                "E1": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1}
        //                }
        //            }
        //        },
        //        "ref": 1
        //    },
        //    "202": {
        //        "type": {
        //            "Composition": {"ref": 1},
        //            "Attribute": {"ref": 1}
        //        },
        //        "name": {
        //            "hasA": {"ref": 1}
        //        },
        //        "property": {
        //            "role": {
        //                "E0": {
        //                    "whole": {"ref": 1}
        //                },
        //                "E1": {
        //                    "part": {"ref": 1}
        //                }
        //            },
        //            "clazz": {
        //                "E0": {
        //                    "101": {"ref": 1}
        //                },
        //                "E1": {
        //                    "102": {"ref": 1},
        //                    "_string": {"ref": 2}
        //                }
        //            },
        //            "multiplicity": {
        //                "E0": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1},
        //                    "1..*": {"ref": 1}
        //                },
        //                "E1": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1}
        //                }
        //            }
        //        },
        //        "ref": 1
        //    },
        //    "203": {
        //        "type": {
        //            "Composition": {"ref": 1},
        //            "Attribute": {"ref": 1}
        //        },
        //        "name": {
        //            "hasA": {"ref": 1}
        //        },
        //        "property": {
        //            "role": {
        //                "E0": {
        //                    "whole": {"ref": 1}
        //                },
        //                "E1": {
        //                    "part": {"ref": 1}
        //                }
        //            },
        //            "clazz": {
        //                "E0": {
        //                    "101": {"ref": 1}
        //                },
        //                "E1": {
        //                    "102": {"ref": 1},
        //                    "_string": {"ref": 2}
        //                }
        //            },
        //            "multiplicity": {
        //                "E0": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1},
        //                    "1..*": {"ref": 1}
        //                },
        //                "E1": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1}
        //                }
        //            }
        //        },
        //        "ref": 1
        //    },
        //    "204": {
        //        "type": {
        //            "Composition": {"ref": 1},
        //            "Attribute": {"ref": 1}
        //        },
        //        "name": {
        //            "hasA": {"ref": 1}
        //        },
        //        "property": {
        //            "role": {
        //                "E0": {
        //                    "whole": {"ref": 1}
        //                },
        //                "E1": {
        //                    "part": {"ref": 1}
        //                }
        //            },
        //            "clazz": {
        //                "E0": {
        //                    "101": {"ref": 1}
        //                },
        //                "E1": {
        //                    "102": {"ref": 1},
        //                    "_string": {"ref": 2}
        //                }
        //            },
        //            "multiplicity": {
        //                "E0": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1},
        //                    "1..*": {"ref": 1}
        //                },
        //                "E1": {
        //                    "1": {"ref": 1},
        //                    "*": {"ref": 1}
        //                }
        //            }
        //        },
        //        "ref": 2
        //    }
        //};

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
     * 获取 CCM 中所有的类，用于整体页面右侧栏中，【同一 ID 的类不会出现多次】（及其 attributes 的基本信息，即属性名和属性类型）
     * @param icm
     * @returns {Array}
     */
    CCM.prototype.getClasses = function(icm) {
        var classCluster, maxRef, names, className, tmpObj,
                clazz, classes = [],
                cName,
                classInICM = icm[2]['clazz'],
                classNamesInICM = {},  // icm中class名，用于去重
                classIdsInICM ={};  // icm中classID，用于去重
        var ccm = this;
        var classIdNameMappingInICM = {};  // 用于记录每个 ICM class node 中用户所选的名字
        var classIdNameMappingInCCM = {};  // 用于记录每个 CCM class node 中引用数最高的名字

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
        ccm.temp.classIdNameMapping = classIdNameMappingInCCM;  // 更新每个 ICM class node 中用户所选的名字
        icm.temp.classIdNameMapping = classIdNameMappingInCCM;  // 更新每个 CCM class node 中引用数最高的名字

        return classes;
    };

    /**
     * 获取 CCM 中所有的类，用于 Add Class modal 右侧栏中，【同一 ID 的类可能出现多次，有几个名字出现几次（不包括 ICM 中已有的名字）】
     * （及其 attributes 的基本信息，即属性名和属性类型）
     * @param icm
     * @returns {Array}
     */
    CCM.prototype.getClassesMultiName = function(icm) {
        var classCluster, maxRef, names, className, tmpObj,
            clazz, classes = [],
            cName,
            classInICM = icm[2]['clazz'],
            classNamesInICM = {},  // icm中class名，用于去重
            classIdsInICM ={};  // icm中classID，用于去重
        var ccm = this;
        var classIdNameMappingInICM = {};  // 用于记录每个 ICM class node 中用户所选的名字
        var classIdNameMappingInCCM = {};  // 用于记录每个 CCM class node 中引用数最高的名字

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
                if (clazz.id in classIdsInICM) {
                    continue;  // 与当前 ICM class ID 相同的 CCM class 不会被推荐
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
        ccm.temp.classIdNameMapping = classIdNameMappingInCCM;  // 更新每个 ICM class node 中用户所选的名字
        icm.temp.classIdNameMapping = classIdNameMappingInCCM;  // 更新每个 CCM class node 中引用数最高的名字

        // 第三遍，复制有多个名字的类为多份
        var classesTobeReturned = [];
        var classNum = classes.length;
        for (i = 0; i < classNum; i++) {
            clazz = classes[i];
            names = this.clazz[clazz.id].name;

            for (className in names) {  // 将该类以不同名称加入到最终结果中
                if (names.hasOwnProperty(className)) {

                    // 与当前 ICM class 名称相同的 CCM class 不会被推荐 （但可能以其他名字被推荐）
                    if (className in classNamesInICM) {
                        continue;
                    }

                    // 换名
                    classes[i].name = className;

                    // 深拷贝到结果数组中
                    var newObject = $.extend(true, {}, classes[i]);
                    classesTobeReturned.push(newObject);
                }
            }
        }

        return classesTobeReturned;
    };

    /**
     * 获取 CCM 中某 classCluster 的属性
     * @param icm
     * @param classCluster (class ID)
     * @param className
     * @returns {Array}
     */
    CCM.prototype.getAttributes = function (icm, classCluster, className) {
        var attribute, res, tmpObj, property, attrName,
                attrInICM = icm[2]['clazz'][className]['attribute'],
                attrNamesInICM = {},  // icm中该class中的attribute名，用于去重
                attrIdsInICM ={};  // icm中该class中的attribute ID，用于去重
        var ccm = this;

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

        var attributeIds = this.clazz[classCluster].attribute;  // CCM 中该类的 attribute ID 数组
        res = [];
        for (var i = 0; i < attributeIds.length; i++) {
            var attributeInfo = this.relationship[attributeIds[i]];

            tmpObj = {
                id: attributeIds[i],  // 记录id，用于采用推荐时绑定
                ref: attributeInfo.ref  // 这个 ref 是该 relationship 作为关系的引用数和作为属性的引用数之和
            };
            for (property in attributeInfo.property) {  // relationship 的 type 和 name 对于 attribute 来说是没用的，所以可以直接看 .property 里的特性
                if (attributeInfo.property.hasOwnProperty(property)) {
                    var attributeProperty = attributeInfo.property[property].E1;
                    var propertyName, propertyValue;

                    // 选出该属性特性引用数最多的取值
                    var maxRef = 0;
                    for (var value in attributeProperty) {
                        if (attributeProperty.hasOwnProperty(value)) {
                            if (attributeProperty[value].ref > maxRef) {
                                propertyValue = value;
                                maxRef = attributeProperty[value].ref;
                            }
                        }
                    }

                    // 将 relationship 中的特性命名换为 attribute 中的叫法
                    if ('role' === property) {
                        propertyName = 'name';
                    } else if ('clazz' === property) {
                        propertyName = 'type';
                        if ('_' === propertyValue.charAt(0)) {  // 对于内置类型，去掉前面的下划线
                            propertyValue = propertyValue.slice(1);
                        } else {  // 对非内置类型，由 class ID 获取引用数最高的 class name

                            // 插入一个特别属性，记录类型的类ID，用于“自动创建类型类”功能的类绑定
                            tmpObj['typeClassId'] = propertyValue;

                            // 由于ccm.getClasses()方法会在页面初始化后被调用，因此下面用到的 icm.temp 和 ccm.temp 中的 id-name 映射已经被初始化了
                            if (propertyValue in icm.temp.classIdNameMapping) {  // 在 ICM 中，直接取该用户对其的命名
                                propertyValue = icm.temp.classIdNameMapping[propertyValue];
                            } else if (propertyValue in ccm.temp.classIdNameMapping) {  // 在 CCM 中且不为“禁止推荐的类”，取引用数最高的名字
                                propertyValue = ccm.temp.classIdNameMapping[propertyValue];
                            } else {  // 禁止推荐的类 TODO: 这里如何处理有待考察
                                propertyValue = '';
                            }
                        }
                    } else {
                        propertyName = property;
                    }

                    // 将特性加入属性对象
                    tmpObj[propertyName] = propertyValue;
                }
            }
            if (tmpObj.name in attrNamesInICM || tmpObj.id in attrIdsInICM) {
                continue;  // 与当前 ICM attribute 名称或ID相同的 CCM attribute 不会被推荐
            }

            // 将属性对象加入属性列表
            res.push(tmpObj);
        }

        return res;
    };

    /**
     * 获取 CCM 中的 relationships
     * @param icm
     * @param relgrpName
     * @returns {Array}
     */
    CCM.prototype.getRelationsByRelGrp = function (icm, relgrpName) {
        var ccm = this;
        var relation, res, tmpObj, property, i, j,
                relationIdsInICM ={};  // icm中该class中的relation ID，用于去重
        var relgrpId = relgrpName2Id(icm, relgrpName);

        if (icm[1][relgrpName]) {  // 该 relationship group 可能尚不存在（由全局推荐获得）
            for (relation in icm[1][relgrpName][0]) {
                if (icm[1][relgrpName][0].hasOwnProperty(relation)) {
                    relationIdsInICM[relation] = true;  // 构造 relationIdsInICM
                }
            }
        }

        if (!this.relgrp[relgrpId]) {  // 若 CCM 中尚没有 relgrpId 中两个 class 节点之间的关系，则返回空
            return [];
        }

        // 获取 ICM 中 class 的 ID 和 CCM 引用数 （或 ICM className）
        var classIdsInICM = {};
        for (var className in icm[2].clazz) {
            if (icm[2].clazz.hasOwnProperty(className)) {
                var clazz = icm[2].clazz[className];
                classIdsInICM[clazz.id] = className;  // 记录 classId 和其 ICM className
            }
        }

        return extractRelationshipInfo(ccm, this.relgrp[relgrpId].relationship, relationIdsInICM, classIdsInICM);

        function relgrpName2Id(icm, relgrpName) {
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
    };


    CCM.prototype.getRelations = function (icm) {

        var ccm = this;
        var classIdsInICM ={};
        var attributeIdsInICM ={};
        var relationIdsInICM = {};

        // 获取 ICM 中 class 和 attribute 的 ID 和 CCM 引用数 （或 ICM className）
        for (var className in icm[2].clazz) {
            if (icm[2].clazz.hasOwnProperty(className)) {
                var clazz = icm[2].clazz[className];
                classIdsInICM[clazz.id] = className;  // 记录 classId 和其 ICM className
                for (var attributeName in clazz.attribute) {
                    if (clazz.attribute.hasOwnProperty(attributeName)) {
                        var attributeId = clazz.attribute[attributeName];
                        if (attributeId in icm[3]) {  // 若有后端 ID 映射，则换成后端 ID
                            attributeId = icm[3][attributeId];
                        }
                        if (attributeId in ccm.relationship) {
                            attributeIdsInICM[attributeId] = ccm.relationship[attributeId].ref;  // 记录 attributeId 和其 CCM 引用数
                        }
                    }
                }
            }
        }

        // 获取 ICM 中 relationship 的 ID 和 CCM 引用数
        for (var relgrpName in icm[1]) {
            if (icm[1].hasOwnProperty(relgrpName)) {
                var relationGroup = icm[1][relgrpName];
                for (var relationId in relationGroup[0]) {
                    if (relationGroup[0].hasOwnProperty(relationId)) {
                        if (relationId in icm[3]) {  // 若有后端 ID 映射，则换成后端 ID
                            relationId = icm[3][relationId];
                        }
                        if (relationId in ccm.relationship) {
                            relationIdsInICM[relationId] = ccm.relationship[relationId].ref;  // 记录 relationId 和其 CCM 引用数
                        }
                    }
                }
            }
        }

        var candidateRelationship = {};  // 用对象而不是数组可防止获取的 relationshipId 重复

        // 构造 relationship 推荐候选集
        for (var relationshipGroup in ccm.relgrp) {
            if (ccm.relgrp.hasOwnProperty(relationshipGroup)) {
                var classId = relationshipGroup.split('-');

                if (classId[0] in classIdsInICM && classId[1] in classIdsInICM) {  // 两端的类都已在 ICM 中存在
                    for (var i = 0; i < ccm.relgrp[relationshipGroup].relationship.length; i++) {
                        var relationshipId = ccm.relgrp[relationshipGroup].relationship[i];

                        // 过滤掉已经存在于 ICM 中的关系（可能以 attribute 形式存在，这样的也要滤掉）
                        if (!(relationshipId in attributeIdsInICM) && !(relationshipId in relationIdsInICM)) {
                            candidateRelationship[relationshipId] = ccm.relationship[relationshipId].ref;
                        }
                    }
                }
            }
        }

        // 将候选集转换成对象数组，并排序、提取、返回值
        var recommendedRelationship = [];
        for (relationshipId in candidateRelationship) {
            if (candidateRelationship.hasOwnProperty(relationshipId)) {
                recommendedRelationship.push({
                    name: relationshipId,  // 这个实际是 ID，写成 name 是为了使用排序函数
                    ref: candidateRelationship[relationshipId]
                })
            }
        }
        var recommendedRelationshipIdSorted = getRecommendNames(recommendedRelationship);

        return extractRelationshipInfo(ccm, recommendedRelationshipIdSorted, relationIdsInICM, classIdsInICM);
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

    /**
     * 根据 relationship ID 从 CCM 中提取 relationship Information 用于推荐显示
     * @param ccm
     * @param relationshipIds
     * @param relationIdsInICM
     * @param classIdNameMapping
     * @returns {Array}
     */
    function extractRelationshipInfo(ccm, relationshipIds, relationIdsInICM, classIdNameMapping) {

        var res = [];
        for (var i = 0; i < relationshipIds.length; i++) {
            var relationshipInfo = ccm.relationship[relationshipIds[i]];
            var tmpObj = {
                id: relationshipIds[i],  // 记录id，用于采用推荐时绑定
                ref: relationshipInfo.ref
            };

            // 确定name
            var maxName = {
                name: '',
                ref: 0
            };
            var names = relationshipInfo.name;
            for (var tmpName in names) {
                if (names.hasOwnProperty(tmpName) && names[tmpName].ref > maxName.ref) {
                    maxName.name = tmpName;
                    maxName.ref = tmpName.ref;
                }
            }
            tmpObj.name = maxName.name;

            // 确定关系类型
            var relType = 'Generalization Aggregation Composition Association'.split(' ');
            var maxType = {
                type: '',
                ref: 0
            };
            for (var j = 0; j < relType.length; j++) {
                if (relationshipInfo.type[relType[j]]) {
                    if (relationshipInfo.type[relType[j]].ref > maxType.ref) {
                        maxType.type = relType[j];
                        maxType.ref = relationshipInfo.type[relType[j]].ref;
                    }
                }
            }
            tmpObj.type = maxType.type;

            // 构造用于显示的 relationship
            var tmpProp = null;
            for (var property in relationshipInfo.property) {
                if (relationshipInfo.property.hasOwnProperty(property)) {

                    // 获取 E0 端引用数最高的 property value
                    var maxPropE0 = {
                        value: '',
                        ref: 0
                    };
                    var propertyE0 = relationshipInfo.property[property].E0;
                    for (var valueE0 in propertyE0) {
                        if (propertyE0.hasOwnProperty(valueE0)) {
                            if (propertyE0[valueE0].ref > maxPropE0.ref && '_' !== valueE0.charAt(0)) {  // 后一个条件确保内置类（名字）不被选为关系的一端
                                maxPropE0.value = valueE0;
                                maxPropE0.ref = propertyE0[valueE0].ref;
                            }
                        }
                    }

                    // 获取 E1 端引用数最高的 property value
                    var maxPropE1 = {
                        value: '',
                        ref: 0
                    };
                    var propertyE1 = relationshipInfo.property[property].E1;
                    for (var valueE1 in propertyE1) {
                        if (propertyE1.hasOwnProperty(valueE1)) {
                            if (propertyE1[valueE1].ref > maxPropE1.ref && '_' !== valueE1.charAt(0)) {  // 后一个条件确保内置类（名字）不被选为关系的一端
                                maxPropE1.value = valueE1;
                                maxPropE1.ref = propertyE1[valueE1].ref;
                            }
                        }
                    }

                    // 拼接左右两端
                    tmpProp = maxPropE0.value + '-' + maxPropE1.value;

                    if (property === 'clazz') {  // 对clazz特性特殊处理，将id变换为name
                        tmpObj['class'] = clazzIds2Names(tmpProp, classIdNameMapping);
                    } else {
                        tmpObj[property] = tmpProp;
                    }
                }
            }
            if (tmpObj.id in relationIdsInICM) {
                continue;  // 与当前 ICM relation ID相同的 CCM relation 不会被推荐
            }

            res.push(tmpObj);
        }
        return res;

        // 辅助函数
        function clazzIds2Names(clazzIds, classIdNameMapping) {
            var id = clazzIds.split('-');
            return classIdNameMapping[id[0]] + '-' + classIdNameMapping[id[1]];
        }
    }

});