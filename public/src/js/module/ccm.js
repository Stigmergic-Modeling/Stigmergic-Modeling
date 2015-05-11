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
                    "Student": 1
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
        var clazz = this.clazz, classNames = [], classCluster;

        // TODO: 利用传入的icm，把去重功能写在这里，而不是外部
        for (classCluster in clazz) {
            if (clazz.hasOwnProperty(classCluster)) {

                // 收集
                classNames.push(Object.keys(clazz[classCluster].name));
            }
        }

        // 扁平化
        return Array.prototype.concat.apply([], classNames);
    };

    CCM.prototype.getClasses = function(icm) {

    };


});