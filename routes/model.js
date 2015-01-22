var fs = require('fs');

/**
 * workspace 页面 get 方法
 */
exports.enterWorkspace = function(req, res){
    res.render('workspace', {
        title: 'workspace' + req.params.model,
        user : req.session.user,
        model: req.params.model,
        data: makeDataForWorkspace(req.params.user, req.params.model),  // 构造需要传入前端 js 的数据
        success : '',
        error : ''
    });
};

/**
 * info 页面 get 方法
 */
exports.getInfo = function(req, res){
    res.render('model_info', {
        title: 'Model Info' + req.params.model,
        user : req.session.user,
        model: req.params.model,
        success : '',
        error : ''
    });
};


/**
 * 构造 workspace 页面的前端 js 需要用到的数据
 */
function makeDataForWorkspace(user, modelName) {
    var data = {};

    data.user = user;
    data.modelName = modelName;

    data.model = // 测试数据。 以后需要使用 getModel(user, modelName) 函数获取 （这个 getModel 函数应该写在 /models 中）

            [
                {
                    "Course": [
                        {
                            "code": [
                                {
                                    "name": "code",
                                    "type": "string",
                                    "visibility": "public"
                                }
                            ],
                            "credit": [
                                {
                                    "name": "credit",
                                    "type": "float",
                                    "visibility": "private"
                                }
                            ],
                            "availability": [
                                {
                                    "name": "availability",
                                    "type": "CourseAvailability",
                                    "visibility": "protected",
                                    "readOnly": "True"
                                }
                            ]
                        },
                        {
                            "order": ["code", "credit", "availability"]
                        }
                    ],
                    "CourseActivity": [
                        {
                            "startTime": [
                                {
                                    "name": "startTime",
                                    "type": "Time"
                                }
                            ],
                            "endTime": [
                                {
                                    "name": "endTime",
                                    "type": "Time"
                                }
                            ]
                        },
                        {
                            "order": ["startTime", "endTime"]
                        }
                    ],
                    "Student": [
                        {
                            "code": [
                                {
                                    "name": "code",
                                    "type": "string"
                                }
                            ],
                            "enrollmentDate": [
                                {
                                    "name": "enrollmentDate",
                                    "type": "Date"
                                }
                            ]
                        },
                        {
                            "order": ["code", "enrollmentDate"]
                        }
                    ],
                    "Teacher": [
                        {
                            "facultyCode": [
                                {
                                    "name": "facultyCode",
                                    "type": "string"
                                }
                            ],
                            "title": [
                                {
                                    "name": "title",
                                    "type": "Title"
                                }
                            ]
                        },
                        {
                            "order": ["facultyCode", "title"]
                        }
                    ],
                    "User": [
                        {
                            "email": [
                                {
                                    "name": "email",
                                    "type": "string"
                                }
                            ],
                            "username": [
                                {
                                    "name": "username",
                                    "type": "string"
                                }
                            ],
                            "photo": [
                                {
                                    "name": "photo",
                                    "type": "Image"
                                }
                            ],
                            "password": [
                                {
                                    "name": "password",
                                    "type": "string"
                                }
                            ],
                            "birthDate": [
                                {
                                    "name": "birthDate",
                                    "type": "Date"
                                }
                            ],
                            "name": [
                                {
                                    "name": "name",
                                    "type": "string"
                                }
                            ]
                        },
                        {
                            "order": ["username", "password", "name", "birthDate", "email", "photo"]
                        }
                    ],
                    "Department": [
                        {
                            "name": [
                                {
                                    "name": "name",
                                    "type": "string"
                                }
                            ],
                            "code": [
                                {
                                    "name": "code",
                                    "type": "string"
                                }
                            ],
                            "requiredCreditOfM": [
                                {
                                    "name": "requiredCreditOfM",
                                    "type": "RequiredCredit"
                                }
                            ],
                            "requiredCreditOfB": [
                                {
                                    "name": "requiredCreditOfB",
                                    "type": "RequiredCredit"
                                }
                            ],
                            "requiredCreditOfD": [
                                {
                                    "name": "requiredCreditOfD",
                                    "type": "RequiredCredit"
                                }
                            ]
                        },
                        {
                            "order": ["name", "code", "requiredCreditOfB", "requiredCreditOfM", "requiredCreditOfD"]
                        }
                    ]
                },
                {
                    "Course-CourseActivity": [
                        {
                            "tempid1419265720151": [
                                {
                                    "type": [
                                        "Composition",
                                        "possess"
                                    ],
                                    "role": [
                                        "whole",
                                        "part"
                                    ],
                                    "class": [
                                        "Course",
                                        "CourseActivity"
                                    ],
                                    "multiplicity": [
                                        "1",
                                        "*"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419265720151"]
                        }
                    ],
                    "Course-Student": [
                        {
                            "tempid1419597303227": [
                                {
                                    "type": [
                                        "Association",
                                        ""
                                    ],
                                    "class": [
                                        "Course",
                                        "Student"
                                    ],
                                    "multiplicity": [
                                        "0..*",
                                        "*"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597303227"]
                        }
                    ],
                    "Course-Teacher": [
                        {
                            "tempid1419597378206": [
                                {
                                    "type": [
                                        "Association",
                                        ""
                                    ],
                                    "class": [
                                        "Course",
                                        "Teacher"
                                    ],
                                    "multiplicity": [
                                        "0..*",
                                        "1..*"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597378206"]
                        }
                    ],
                    "Student-User": [
                        {
                            "tempid1419597406622": [
                                {
                                    "type": [
                                        "Generalization",
                                        ""
                                    ],
                                    "role": [
                                        "father",
                                        "child"
                                    ],
                                    "class": [
                                        "User",
                                        "Student"
                                    ],
                                    "multiplicity": [
                                        "1",
                                        "1"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597406622"]
                        }
                    ],
                    "Teacher-User": [
                        {
                            "tempid1419597442832": [
                                {
                                    "type": [
                                        "Generalization",
                                        ""
                                    ],
                                    "role": [
                                        "father",
                                        "child"
                                    ],
                                    "class": [
                                        "User",
                                        "Teacher"
                                    ],
                                    "multiplicity": [
                                        "1",
                                        "1"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597442832"]
                        }
                    ],
                    "Course-Department": [
                        {
                            "tempid1419597640012": [
                                {
                                    "type": [
                                        "Association",
                                        ""
                                    ],
                                    "class": [
                                        "Course",
                                        "Department"
                                    ],
                                    "multiplicity": [
                                        "*",
                                        "1"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597640012"]
                        }
                    ],
                    "Department-Student": [
                        {
                            "tempid1419597702615": [
                                {
                                    "type": [
                                        "Association",
                                        ""
                                    ],
                                    "class": [
                                        "Department",
                                        "Student"
                                    ],
                                    "multiplicity": [
                                        "1..*",
                                        "*"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597702615"]
                        }
                    ],
                    "Department-Teacher": [
                        {
                            "tempid1419597718239": [
                                {
                                    "type": [
                                        "Association",
                                        ""
                                    ],
                                    "class": [
                                        "Department",
                                        "Teacher"
                                    ],
                                    "multiplicity": [
                                        "1..*",
                                        "*"
                                    ]
                                }
                            ]
                        },
                        {
                            "order": ["tempid1419597718239"]
                        }
                    ]
                }
            ];

    return data;
}

