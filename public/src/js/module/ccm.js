define(function (require, exports, module) {

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

        // 目前是写死的数据
        this.clazz = {
            "ID65252430": {
                "name": {
                    "Course": {
                        "ref": 5
                    },
                    "Class": {
                        "ref": 5
                    },
                    "Courses": {
                        "ref": 1
                    }
                },
                "attribute": {
                    "ID65252431": {
                        "name": {
                            "name": {
                                "ref": 1
                            }
                        },
                        "type": {
                            "string": {
                                "ref": 1
                            }
                        },
                        "multiplicity": {
                            "1..*": {
                                "ref": 1
                            }
                        },
                        "readOnly": {
                            "False": {
                                "ref": 1
                            }
                        },
                        "ref": 1
                    },
                    "ID65252432": {
                        "name": {
                            "code": {
                                "ref": 1
                            },
                            "studentNumber": {
                                "ref": 1
                            }
                        },
                        "type": {
                            "string": {
                                "ref": 1
                            }
                        },
                        "ordering": {
                            "True": {
                                "ref": 1
                            }
                        },
                        "ref": 1
                    },
                    "ID65252433": {
                        "name": {
                            "credit": {
                                "ref": 1
                            }
                        },
                        "type": {
                            "float": {
                                "ref": 1
                            }
                        },
                        "ref": 1
                    },
                    "ID65252434": {
                        "name": {
                            "character": {
                                "ref": 1
                            }
                        },
                        "type": {
                            "ID65252435": {
                                "ref": 1
                            }
                        },
                        "ref": 1
                    }
                },
                "ref": 11
            },
            "ID65252435": {
                "name": {
                    "CourseCharacter": {
                        "ref": 1
                    }
                },
                "attribute": {
                    "ID65252436": {
                        "name": {
                            "compulsory": {
                                "ref": 1
                            },
                            "mustTake": {
                                "ref": 1
                            }
                        },
                        "ref": 4
                    }
                },
                "ref": 4
            },
            "ID65252439": {
                "name": {
                    "Student": {
                        "ref": 1
                    }
                },
                "ref": 3
            }
        };

        this.relgrp = {
            "ID65252430-ID65252439": {
                "ID65252448": {
                    "type": {
                        "Composition": {
                            "ref": 1
                        }
                    },
                    "role": {
                        "whole-part": {
                            "ref": 1
                        }
                    },
                    "clazz": {
                        "ID65252430-ID65252439": {
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
     * 获取ccm中所有的类（及其attributes）
     * @param icm
     * @returns {Array}
     */
    CCM.prototype.getClasses = function(icm) {
        var classCluster, maxRef, names, className, attributes, attribute, tmpObj,
                clazz, classes = [];

        // TODO：去重

        for (classCluster in this.clazz) {
            if (this.clazz.hasOwnProperty(classCluster)) {

                // 获取引用数最多的名字
                clazz = {};
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
                            tmpObj.type = Object.keys(attributes[attribute].type)[0];
                        }

                        clazz.attribute.push(tmpObj);
                    }
                }

                classes.push(clazz);
            }
        }

        return classes;
    };

    CCM.prototype.getAttributes = function (icm, classCluster) {
        var attributes, attribute, res, tmpObj, property;

        attributes = this.clazz[classCluster].attribute;
        res = [];
        for (attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {

                // TODO: 按引用数取最高
                tmpObj = {};
                for (property in attributes[attribute]) {
                    if (attributes[attribute].hasOwnProperty(property) && property != 'ref') {
                        tmpObj[property] = Object.keys(attributes[attribute][property])[0];
                    }
                }

                res.push(tmpObj);
            }
        }
        console.log(res);
        return res;
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