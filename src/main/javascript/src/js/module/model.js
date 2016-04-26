define(function (require, exports, module) {

    module.exports = Model;

    /*  ----------------------------------  *
     *
     *  用于前端显示的个体模型（ICM）的构造函数
     *
     *  ----------------------------------  */

    function Model(modelPassIn) {

        /*  ---------------------------------------------------------------  *
         *
         *  模型是一个树状结构。树中的节点有三种类型：
         *
         *  1、数组元素的序号（分类：类、属性、属性顺序、关系组、关系、关系顺序、特性）
         *  2、对象名值对的名（枚举：类名、属性名、关系组ID、关系ID）
         *  3、对象名值对（端点枚举：{特性名：特性值}、{顺序：顺序数组}）
         *
         *  model
         *    |
         *    |-- 0(class)
         *    |     |
         *    |     |-- class1 :
         *    |     |     |
         *    |     |     |-- 0(attribute)
         *    |     |     |     |
         *    |     |     |     |-- attribute1 :
         *    |     |     |     |     |
         *    |     |     |     |      -- 0(property)
         *    |     |     |     |           |
         *    |     |     |     |           |-- { property1 : value1 }
         *    |     |     |     |            -- { property2 : value2 }
         *    |     |     |     |
         *    |     |     |      -- attribute2 :
         *    |     |     |           |
         *    |     |     |            -- 0(property)
         *    |     |     |                 |
         *    |     |     |                 |-- { property3 : value3 }
         *    |     |     |                  -- { property4 : value4 }
         *    |     |     |
         *    |     |      -- 1(order)
         *    |     |           |
         *    |     |            -- { 'order' : [attribute1, attribute2] }
         *    |     |
         *    |      -- class2 :
         *    |           |
         *    |           |-- 0(attribute)
         *    |           |     |
         *    |           |     |-- attribute3 :
         *    |           |     |     |
         *    |           |     |      -- 0(property)
         *    |           |     |           |
         *    |           |     |           |-- { property5 : value5 }
         *    |           |     |            -- { property6 : value6 }
         *    |           |     |
         *    |           |      -- attribute4 :
         *    |           |           |
         *    |           |            -- 0(property)
         *    |           |                 |
         *    |           |                 |-- { property7 : value7 }
         *    |           |                  -- { property8 : value8 }
         *    |           |
         *    |            -- 1(order)
         *    |                 |
         *    |                  -- { 'order' : [attribute3, attribute4] }
         *    |
         *    |-- 1(relation group)
         *    |     |
         *    |     |-- relationGroup1 :
         *    |     |     |
         *    |     |     |-- 0(relation)
         *    |     |     |     |
         *    |     |     |     |-- relation1 :
         *    |     |     |     |     |
         *    |     |     |     |      -- 0(property)
         *    |     |     |     |           |
         *    |     |     |     |           |-- { property1 : value1 }
         *    |     |     |     |            -- { property2 : value2 }
         *    |     |     |     |
         *    |     |     |      -- relation2 :
         *    |     |     |           |
         *    |     |     |            -- 0(property)
         *    |     |     |                 |
         *    |     |     |                 |-- { property3 : value3 }
         *    |     |     |                  -- { property4 : value4 }
         *    |     |     |
         *    |     |      -- 1(order)
         *    |     |           |
         *    |     |            -- { 'order' : [relation1, relation2] }
         *    |     |
         *    |      -- relationGroup2 :
         *    |           |
         *    |           |-- 0(relation)
         *    |           |     |
         *    |           |     |-- relation3 :
         *    |           |     |     |
         *    |           |     |      -- 0(property)
         *    |           |     |           |
         *    |           |     |           |-- { property5 : value5 }
         *    |           |     |            -- { property6 : value6 }
         *    |           |     |
         *    |           |      -- relation4 :
         *    |           |           |
         *    |           |            -- 0(property)
         *    |           |                 |
         *    |           |                 |-- { property7 : value7 }
         *    |           |                  -- { property8 : value8 }
         *    |           |
         *    |            -- 1(order)
         *    |                 |
         *    |                  -- { 'order' : [relation3, relation4] }
         *    |
         *    |-- 2 (name to id mapping) :
         *    |     |
         *    |     |-- clazz :
         *    |     |     |
         *    |     |     |-- class1 :
         *    |     |     |     |
         *    |     |     |     |-- id : xxx
         *    |     |     |     |
         *    |     |     |      -- attribute :
         *    |     |     |           |
         *    |     |     |           |-- attribute1 : xxx
         *    |     |     |           |
         *    |     |     |           |-- attribute2 : xxx
         *    |     |     |           |
         *    |     |     |            -- attribute3 : xxx
         *    |     |     |
         *    |     |      -- class2 :
         *    |     |           |
         *    |     |           |-- id : xxx
         *    |     |           |
         *    |     |            -- attribute :
         *    |     |                 |
         *    |     |                 |-- attribute1 : xxx
         *    |     |                 |
         *    |     |                 |-- attribute2 : xxx
         *    |     |                 |
         *    |     |                  -- attribute3 : xxx
         *    |     |
         *    |      -- relation :
         *    |
         *     -- 3 (id to real id mapping)
         *          |
         *          |-- id1 : realId1
         *          |
         *          |-- id2 : realId2
         *          |
         *           -- id3 : realId3
         *
         *
         *
         *
         *  ---------------------------------------------------------------  */

        'use strict';

        var icm = this;

        // class
        this[0] = {};

        // relationGroup
        this[1] = {};

        // name to id
        this[2] = {
            clazz: {},
            relation: {}
        };

        // this[2] 的格式示例：
        //
        //this[2] = {
        //    "clazz": {
        //        "Course": {
        //            "id": 1,
        //            "attribute": {
        //                "name": 2,
        //                    "code": 3,
        //                    "credit": 4
        //            }
        //        }
        //    },
        //    "relation": {}
        //};

        // ID to REAL ID mapping （为了解决前端临时ID与后端持久化ID不一致的问题，上一版本中MongoDB没有这个问题，现在Neo4j有这问题）
        // 每次刷新页面，id 和 real id 都更新（很自然）；每次保存，只有 real id 更新（需要在 ajax 成功后手动更新 mapping）
        // 在生成 change log 时，要用这个 mapping，使得后端能正确识别 id
        // 前端生成的临时 id 是不会被后端识别的
        // 这个映射中永远只保存不一致的 id，若 id 变为一致的，则从此映射中删除
        this[3] = {};

        // 用于存放临时数据
        this.temp = {};

        // log
        this.operationLog = [];
        this.operationLogHistory = [];  // 用于保存 log 的历史，便于回滚

        // 记录在“保存操作”区间内有哪些类的属性或哪些关系组中的关系发生了顺序变化，便于生成 AttRelOrderChanges。此记录便于后端更新数据。
        this.attRelOrderChanged = [{}, {}];  // 第一个对象中保存 class 名，第二个对象中保存 relationGroup 名
        this.attRelOrderChangedHistory = [];

        // 如果传入了参数，则用传入参数初始化模型
        if (arguments.length > 0) {
            this[0] = JSON.parse(JSON.stringify(modelPassIn.classes));
            this[1] = JSON.parse(JSON.stringify(modelPassIn.relationshipGroups));
            this[2] = JSON.parse(JSON.stringify(modelPassIn.name2IdMapping));
            this[3] = JSON.parse(JSON.stringify(modelPassIn.id2IdMapping));

            // 将后端格式转化为前端格式
            for (var key in this[0]) {
                if (this[0].hasOwnProperty(key)) {
                    var tempClassInIcm = this[0][key];
                    tempClassInIcm[0] = tempClassInIcm.attributes;
                    tempClassInIcm[1] = tempClassInIcm.orderInIcm;
                    delete tempClassInIcm.attributes;
                    delete tempClassInIcm.orderInIcm;
                }
            }
            for (key in this[1]) {
                if (this[1].hasOwnProperty(key)) {
                    var tempRelGrpInIcm = this[1][key];
                    tempRelGrpInIcm[0] = tempRelGrpInIcm.relationships;
                    tempRelGrpInIcm[1] = tempRelGrpInIcm.orderInIcm;
                    delete tempRelGrpInIcm.relationships;
                    delete tempRelGrpInIcm.orderInIcm;
                }
            }
        }

        // 使用动态原型模式，在构造函数内部定义原型方法
        if (!(this.getSubModel instanceof Function)) {

            /*  ------- *
             *  底层方法
             *  ------- */

            // 行走到模型中指定 path 的端点，返回从这个点开始生长的子模型
            Model.prototype.getSubModel = function (path) {

                if (!(path instanceof Array)) {
                    throw new TypeError('Model.getSubModel(): The first argument must be an array.');
                }

                var subModel = this[path.shift()];

                while (0 !== path.length) {  // 顺路径前进
                    subModel = subModel[path.shift()];

                    if (undefined === subModel) {
                        throw new ReferenceError('Model.getSubModel(): Path does not exist in model.');
                    }
                }

                return subModel;
            };

            // 在某路径的端点之下增加一个端点
            Model.prototype.addNode = function (path, pairsKV, CCMId, addType) {

                if (!(path instanceof Array)) {
                    throw new TypeError('Model.addNode(): The first argument must be an array.');
                }
                if (!(pairsKV instanceof Array) || (2 !== pairsKV.length)) {
                    throw new TypeError('Model.addNode(): The second argument must be an array with two elements.');
                }

                this.log('ADD', path, [pairsKV[0], pairsKV[1], CCMId, addType]);

                var subModel = this.getSubModel(path);

                subModel[pairsKV[0]] = pairsKV[1];
            };

            // 修改某路径的端点的 key
            Model.prototype.modifyNodeName = function (path, oldKey, newKey) {

                if (!(path instanceof Array)) {
                    throw new TypeError('Model.modifyNodeName(): The first argument must be an array.');
                }

                if (oldKey !== newKey) {  // 仅在新旧两 key 不同时才执行下面的替换操作

                    this.log('MOD_KEY', path, [oldKey, newKey]);

                    var subModel = this.getSubModel(path);

                    subModel[newKey] = subModel[oldKey];
                    delete subModel[oldKey];
                }
            };

            // 修改某路径的端点的 value （一般用于树叶节点）
            Model.prototype.modifyNodeValue = function (path, key, newValue) {

                if (!(path instanceof Array)) {
                    throw new TypeError('Model.modifyNodeValue(): The first argument must be an array.');
                }

                this.log('MOD_VAL', path, [key, newValue]);

                var subModel = this.getSubModel(path);

                subModel[key] = newValue;
            };

            // 删除某路径端点的子模型
            Model.prototype.removeSubModel = function (path, key, noLog) {

                if (!(path instanceof Array)) {
                    throw new TypeError('Model.removeSubModel(): The first argument must be an array.');
                }

                if (undefined === noLog || false === noLog) {  // 不传入 noLog 参数或 noLog 为 false 时，打印 log
                    this.log('RMV', path, key);
                }

                if (1 === path.length) {  // 当删除类或关系组时
                    this.attRelOrderChanged[path[0]][key] = 0;  // 表示该 classRelGrp 内的元素顺序有变
                }

                var subModel = this.getSubModel(path);

                delete subModel[key];
            };

            // 在顺序数组中某位置插入新元素
            Model.prototype.insertOrderElem = function (flagCRG, classRelGrpName, attrRelName, position, direction) {

                if (0 !== flagCRG && 1 !== flagCRG) {
                    throw new RangeError('Model.insertOrderElem(): The first argument must be 0 or 1.');
                }
                if (0 !== direction && 1 !== direction) {  // direction: 0,前插 1,后插
                    throw new RangeError('Model.insertOrderElem(): The fifth argument must be 0 or 1.');
                }

                this.log('INS_ORD', [flagCRG, classRelGrpName], [attrRelName, position, direction]);
                this.attRelOrderChanged[flagCRG][classRelGrpName] = 1;  // 表示该 classRelGrp 内的元素顺序有变

                var order = this.getSubModel([flagCRG, classRelGrpName, 1, 'order']);

                if ('@' === position) {  // 在尾部插入
                    order.push(attrRelName);
                } else {  // 在中间插入
                    order.splice(order.indexOf(position) + direction, 0, attrRelName);
                }
            };

            // 在顺序数组中修改某元素的名称
            Model.prototype.modifyOrderElem = function (flagCRG, classRelGrpName, attrRelName, newName) {

                if (0 !== flagCRG && 1 !== flagCRG) {
                    throw new RangeError('Model.removeOrderElem(): The first argument must be 0 or 1.');
                }

                this.log('MOD_ORD', [flagCRG, classRelGrpName], [attrRelName, newName]);
                this.attRelOrderChanged[flagCRG][classRelGrpName] = 1;  // 表示该 classRelGrp 内的元素顺序有变

                var order = this.getSubModel([flagCRG, classRelGrpName, 1, 'order']);

                order.splice(order.indexOf(attrRelName), 1, newName);  // 替换
            };

            // 在顺序数组中删除某元素
            Model.prototype.removeOrderElem = function (flagCRG, classRelGrpName, attrRelName) {

                if (0 !== flagCRG && 1 !== flagCRG) {
                    throw new RangeError('Model.removeOrderElem(): The first argument must be 0 or 1.');
                }

                this.log('RMV_ORD', [flagCRG, classRelGrpName], attrRelName);
                this.attRelOrderChanged[flagCRG][classRelGrpName] = 1;  // 表示该 classRelGrp 内的元素顺序有变

                var order = this.getSubModel([flagCRG, classRelGrpName, 1, 'order']);

                order.splice(order.indexOf(attrRelName), 1);  // 删除
            };

            // 在顺序数组中某元素前移或后移
            Model.prototype.moveOrderElem = function (flagCRG, classRelGrpName, attrRelName, direction) {

                if (0 !== flagCRG && 1 !== flagCRG) {
                    throw new RangeError('Model.insertOrderElem(): The first argument must be 0 or 1.');
                }
                if (typeof direction !== 'number') {  // direction: -n，前移n个位置  +n，后移n个位置
                    throw new TypeError('Model.insertOrderElem(): The forth argument must be a number');
                }

                this.log('MOV_ORD', [flagCRG, classRelGrpName], [attrRelName, direction]);
                this.attRelOrderChanged[flagCRG][classRelGrpName] = 1;  // 表示该 classRelGrp 内的元素顺序有变

                var order = this.getSubModel([flagCRG, classRelGrpName, 1, 'order']);
                var index = order.indexOf(attrRelName);

                order.splice(index, 1); // 删除
                order.splice(index + direction, 0, attrRelName); // 插入
            };

            // 修改 OrderChangeRecord 的 key（由改名引发）
            Model.prototype.modifyOrderChangeRecord = function (type, oldName, newName) {
                // type : 0 表示 class，1 表示 relation group

                delete icm.attRelOrderChanged[type][oldName];
                icm.attRelOrderChanged[type][newName] = 1;
            };

            // 修改 name 到 id 映射的 key（由改名引发）
            Model.prototype.modifyNameIdMapping = function (type, oldName, newName, className) {

                var path =[];
                if ('class' === type) {
                    path = [2, 'clazz'];
                } else if ('attribute' === type) {
                    path = [2, 'clazz', className, 'attribute'];
                } else {
                    throw new RangeError('Model.modifyNameIdMapping(): Operation type undefined.');
                }

                var obj = icm.getSubModel(path);
                obj[newName] = obj[oldName];
                delete obj[oldName];
            };

            // 向控制台输出模型
            Model.prototype.print = function () {

                console.log('\n Class:\n');  // 第一个 \n 后边的空格可以使在 Chrome 下的显示更整齐
                console.log(this[0]);
                console.log('Relation Group:\n');
                console.log(this[1]);
            };

            // 记录操作日志
            Model.prototype.log = function (op, path, args) {

                /*  -------------------------------------------------------- *
                 *  日志条目的格式：
                 *
                 *  增加
                 *  ADD_CLS class classCCMId addingType (fresh, binding)
                 *  ADD_RLG relationGroup
                 *  ADD_ATT class attribute attributeCCMId addingType (fresh, binding)
                 *  ADD_RLT relationGroup relation relationCCMId addingType (fresh, binding)
                 *  ADD_POA class attribute property value
                 *  ADD_POR relationGroup relation property value
                 *
                 *  修改key
                 *  MOD_CLS classOld classNew
                 *  MOD_RLG relationGroupOld relationGroupNew
                 *  MOD_ATT class attributeOld attributeNew
                 *  // MOD_RLT relationGroup relationOld relationNew
                 *
                 *  修改value
                 *  MOD_POA class attribute property value
                 *  MOD_POR relationGroup relation property value
                 *
                 *  删除
                 *  RMV_CLS class
                 *  RMV_RLG relationGroup
                 *  RMV_ATT class attribute
                 *  RMV_RLT relationGroup relation
                 *  RMV_POA class attribute property
                 *  RMV_POR relationGroup relation property
                 *
                 *  插入order元素
                 *  ODI_ATT class attribute position direction
                 *  ODI_RLT relationGroup relation position direction
                 *
                 *  修改order元素名称
                 *  ODE_ATT class attributeOld attributeNew
                 *  // ODE_RLT relationGroup relationOld relationNew
                 *
                 *  删除order元素
                 *  ODR_ATT class attribute
                 *  ODR_RLT relationGroup relation
                 *
                 *  移动order元素
                 *  ODM_ATT class attribute position direction
                 *  ODM_RLT relationGroup relation position direction
                 *
                 *  -------------------------------------------------------- */

                var item = [Date.now()];

                switch (op) {
                    case 'ADD':
                        item.push('ADD');

                        if (1 === path.length) {

                            if (0 === path[0]) {
                                item.push('CLS');
                                item.push(args[0]);  // class name
                                item.push(icm[3][args[2]] || args[2]);  // class ccm id
                                item.push(args[3]);  // adding type

                            } else {
                                item.push('RLG');
                                item.push(args[0]);
                            }

                        } else if (3 === path.length) {

                            if (0 === path[0]) {
                                item.push('ATT');
                            } else {
                                item.push('RLT');
                            }

                            item.push(path[1]);
                            item.push(icm[3][args[0]] || args[0]);  // attribute name / relation icm id
                            item.push(icm[3][args[2]] || args[2]);  // attribute ccm id / relation ccm id
                            item.push(args[3]);  // adding type

                        } else if (5 === path.length) {

                            if (0 === path[0]) {
                                item.push('POA');
                            } else {
                                item.push('POR');
                            }

                            item.push(path[1]);  // class name / relation group name
                            item.push(icm[3][path[3]] || path[3]);  // attribute name / relation icm id
                            item.push(args[0]);

                            if (0 === path[0]) {
                                if (args[1] === 'True') args[1] = '#true';
                                if (args[1] === 'False') args[1] = '#false';
                                item.push(args[1]);

                            } else {
                                var propertyValueE0 = args[1][0].toString();  // 将数组转换成字符串
                                var propertyValueE1 = args[1][1].toString();
                                if (propertyValueE0 === 'True') propertyValueE0 = '#true';
                                if (propertyValueE0 === 'False') propertyValueE0 = '#false';
                                if (propertyValueE1 === 'True') propertyValueE1 = '#true';
                                if (propertyValueE1 === 'False') propertyValueE1 = '#false';
                                item.push(propertyValueE0);
                                item.push(propertyValueE1);
                            }


                        } else {

                            throw new Error('Model.log(): Unexpected path length.');
                        }
                        break;

                    case 'MOD_KEY':
                        item.push('MOD');

                        if (1 === path.length) {

                            if (0 === path[0]) {
                                item.push('CLS');
                            } else {
                                item.push('RLG');
                            }

                            item.push(args[0]);
                            item.push(args[1]);

                        } else if (3 === path.length) {

                            if (0 === path[0]) {
                                item.push('ATT');
                            } else {
                                // MOD_RLT 暂时没有这个需求
                            }

                            item.push(path[1]);
                            item.push(args[0]);
                            item.push(args[1]);

                        } else {

                            throw new Error('Model.log(): Unexpected path length.');
                        }
                        break;

                    case 'MOD_VAL':
                        item.push('MOD');

                        if (5 === path.length) {

                            if (0 === path[0]) {
                                item.push('POA');
                            } else {
                                item.push('POR');
                            }

                            item.push(path[1]);
                            item.push(icm[3][path[3]] || path[3]);
                            item.push(args[0]);

                            if (0 === path[0]) {
                                if (args[1] === 'True') args[1] = '#true';
                                if (args[1] === 'False') args[1] = '#false';
                                item.push(args[1]);

                            } else {
                                propertyValueE0 = args[1][0].toString();  // 将数组转换成字符串
                                propertyValueE1 = args[1][1].toString();
                                if (propertyValueE0 === 'True') propertyValueE0 = '#true';
                                if (propertyValueE0 === 'False') propertyValueE0 = '#false';
                                if (propertyValueE1 === 'True') propertyValueE1 = '#true';
                                if (propertyValueE1 === 'False') propertyValueE1 = '#false';
                                item.push(propertyValueE0);
                                item.push(propertyValueE1);
                            }

                        } else {

                            throw new Error('Model.log(): Unexpected path length.');
                        }
                        break;

                    case 'RMV':
                        item.push('RMV');

                        if (1 === path.length) {

                            if (0 === path[0]) {
                                item.push('CLS');
                            } else {
                                item.push('RLG');
                            }

                            item.push(args);

                        } else if (3 === path.length) {

                            if (0 === path[0]) {
                                item.push('ATT');
                            } else {
                                item.push('RLT');
                            }

                            item.push(path[1]);
                            item.push(icm[3][args] || args);  // attribute name / relation icm id

                        } else if (5 === path.length) {

                            if (0 === path[0]) {
                                item.push('POA');
                            } else {
                                item.push('POR');
                            }

                            item.push(path[1]);
                            item.push(icm[3][path[3]] || path[3]);  // attribute name / relation icm id
                            item.push(args);

                        } else {

                            throw new Error('Model.log(): Unexpected path length.');
                        }
                        break;

                    case 'INS_ORD':
                        item.push('ODI');

                        if (0 === path[0]) {
                            item.push('ATT');
                        } else {
                            item.push('RLT');
                        }

                        item.push(path[1]);
                        item.push(icm[3][args[0]] || args[0]);  // attribute name / relation icm id
                        item.push(args[1]);
                        item.push(args[2]);

                        break;

                    case 'MOD_ORD':
                        item.push('ODE');

                        if (0 === path[0]) {
                            item.push('ATT');
                        } else {
                            // ODE_RLT 暂时无此需求
                        }

                        item.push(path[1]);
                        item.push(args[0]);
                        item.push(args[1]);

                        break;

                    case 'RMV_ORD':
                        item.push('ODR');

                        if (0 === path[0]) {
                            item.push('ATT');
                        } else {
                            item.push('RLT');
                        }

                        item.push(path[1]);
                        item.push(icm[3][args] || args);  // attribute name / relation icm id

                        break;

                    case 'MOV_ORD':
                        item.push('ODM');

                        if (0 === path[0]) {
                            item.push('ATT');
                        } else {
                            item.push('RLT');
                        }

                        item.push(path[1]);
                        item.push(icm[3][args[0]] || args[0]);  // attribute name / relation icm id
                        item.push(args[1]);

                        break;

                    default:
                        throw new Error('Model.log(): Unexpected operation code.');
                }

                console.log(item);
                this.operationLog.push(item);

            };

            // 输出日志
            Model.prototype.getLog = function () {

                return this.operationLog;
            };

            // 清空日志
            Model.prototype.clearLog = function () {

                this.operationLog.push([Date.now(), 'UPD', 'NUM']);  // 清空日志前加入结束标志（通知后端更新模型数据）
                this.operationLogHistory.push([Date.now(), this.operationLog]); // 保存 log 的历史，便于回滚
                this.operationLog = [];  // 清空当前 log
            };

            // 检测日志是否为空
            Model.prototype.isLogEmpty = function () {

                return 0 === this.operationLog.length;
            };

            // 获取最终状态的顺序数组，便于后端更新数据
            Model.prototype.getAttRelOrderChanges = function () {

                /*  -------------------------------------------------------- *
                 *  顺序数组的格式：
                 *
                 *  changes:
                 *    |
                 *    |-- classes:
                 *    |     |
                 *    |     |-- class1:
                 *    |     |     |
                 *    |     |      -- [ (attribute order array) ]
                 *    |     |
                 *    |      -- class2:
                 *    |           |
                 *    |            -- [ (attribute order array) ]
                 *    |
                 *     -- relationGroups:
                 *          |
                 *          |-- relationGroup1:
                 *          |     |
                 *          |      -- [ (relation order array) ]
                 *          |
                 *           -- relationGroup2:
                 *                |
                 *                 -- [ (relation order array) ]
                 *
                 *
                 *  -------------------------------------------------------- */

                var attRel = this.attRelOrderChanged;
                var changes = {
                    classes: {},
                    relationGroups: {}
                };

                // 获取“此刻属性顺序有变化的类”的最终状态的顺序数组，便于后端更新数据
                for (var cls in attRel[0]) {
                    if (attRel[0].hasOwnProperty(cls)) {

                        if (1 === attRel[0][cls]) {  // class 未被删除
                            changes.classes[cls] = this[0][cls][1]['order'];
                        } else {  // class 已被删除
                            //changes.classes[cls] = [];
                            if (changes.classes[cls] !== void 0) {
                                delete changes.classes[cls];  // 服务器端现在不需要class的空数组
                            }
                        }
                    }
                }

                // 获取“此刻关系顺序有变化的关系组”的最终状态的顺序数组，便于后端更新数据
                for (var rlg in attRel[1]) {
                    if (attRel[1].hasOwnProperty(rlg)) {

                        if (1 === attRel[1][rlg]) {  // relationGroups 未被删除
                            changes.relationGroups[rlg] = this[1][rlg][1]['order'];
                        } else {  // relationGroups 已被删除
                            //changes.relationGroups[rlg] = [];
                            if (changes.relationGroups[rlg] !== void 0) {
                                delete changes.relationGroups[rlg];  // 服务器端现在不需要relationGroup的空数组
                            }
                        }
                    }
                }

                return changes;
            };

            // 清空 顺序变动记录
            Model.prototype.clearAttRelOrderChanges = function () {

                this.attRelOrderChangedHistory.push([Date.now(), this.attRelOrderChanged]); // 保存 顺序变动记录 的历史，便于回滚
                this.attRelOrderChanged = [{}, {}];  // 清空当前 顺序变动记录
            };

            /**
             * 更新 ID Mappings （从前端临时 ID 映射到后端数据库真正的 ID）
             * @param idMappings
             */
            Model.prototype.updateIdMapping = function (idMappings) {
                for (var frontId in idMappings) {
                    if (idMappings.hasOwnProperty(frontId)) {
                        icm[3][frontId] = idMappings[frontId];
                    }
                }
            };


            /*  ------- *
             *  高层方法
             *  ------- */

            // 增加类
            Model.prototype.addClass = function (className, classCCMId, addingType) {

                this.addNode([0], [className, [{}, {'order': []}]], classCCMId, addingType);  // 空括号很重要

                // 更新name2id映射
                //console.log('classId', classId);
                this[2]['clazz'][className] = {id: classCCMId, attribute: {}};
            };

            // 增加类的属性
            Model.prototype.addAttr = function (className, attrName, pos, attrCCMId, addingType) {

                if (!(pos instanceof Object)) {
                    throw new TypeError('Model.addAttr(): The third argument must be an object.');
                }

                this.addNode([0, className, 0], [attrName, [{}]], attrCCMId, addingType);  // 空括号很重要
                this.insertOrderElem(0, className, attrName, pos.position, pos.direction);  // 将 attribute 插入到指定位置
                this[2]['clazz'][className]['attribute'][attrName] = attrCCMId;  // 更新name2id映射
            };

            // 增加类的属性的特性
            Model.prototype.addPropOfA = function (className, attrName, propKV) {

                if (!(propKV instanceof Array)) {
                    throw new TypeError('Model.addPropOfA(): The third argument must be an array.');
                }

                this.addNode([0, className, 0, attrName, 0], propKV);
            };

            // 增加关系组
            Model.prototype.addRelGrp = function (relGrpName) {

                this.addNode([1], [relGrpName, [{}, {'order': []}]]);  // 空括号很重要
            };

            // 增加关系组中的关系
            Model.prototype.addRelation = function (relGrpName, relID, pos, relationCCMId, addingType) {

                if (!(pos instanceof Object)) {
                    throw new TypeError('Model.addAttr(): The third argument must be an object.');
                }

                this.addNode([1, relGrpName, 0], [relID, [{}]], relationCCMId, addingType);  // 空括号很重要
                this.insertOrderElem(1, relGrpName, relID, pos.position, pos.direction);  // 将 attribute 插入到指定位置
            };

            // 增加关系的特性
            Model.prototype.addPropOfR = function (relGrpName, relID, propKV) {

                if (!(propKV instanceof Array)) {
                    throw new TypeError('Model.addPropOfR(): The third argument must be an array.');
                }

                this.addNode([1, relGrpName, 0, relID, 0], propKV);
            };

            // 修改类名
            Model.prototype.modifyClassName = function (oldName, newName) {

                this.modifyNodeName([0], oldName, newName);  // 修改 this[0] 中的 key
                this.modifyOrderChangeRecord(0, oldName, newName);  // 修改 this.attRelOrderChanged 中的 key
                this.modifyNameIdMapping('class', oldName, newName);  // 修改 name-id mapping （this[2]）中的 key
            };

            // 修改类的属性名
            Model.prototype.modifyAttrName = function (className, oldName, newName) {

                this.modifyNodeName([0, className, 0], oldName, newName);  // 修改 this[0][xxx][0] 中的 key
                this.modifyOrderElem(0, className, oldName, newName);
                this.modifyNameIdMapping('attribute', oldName, newName, className);  // 修改 name-id mapping （this[2]）中的 key
            };

            // 修改类的属性的特性的 value （没有修改特性 key 的需求）
            Model.prototype.modifyPropOfA = function (className, attrName, propName, newValue) {

                this.modifyNodeValue([0, className, 0, attrName, 0], propName, newValue);
            };

            // 修改关系组名
            Model.prototype.modifyRelGrpName = function (oldName, newName) {

                this.modifyNodeName([1], oldName, newName);
                this.modifyOrderChangeRecord(1, oldName, newName);  // 修改 this.attRelOrderChanged 中的 key
            };

            // 修改关系组中的关系的ID
            Model.prototype.modifyRelID = function (relGrpName, oldID, newID) {

                this.modifyNodeName([1, relGrpName, 0], oldID, newID);  // 修改 attribute 的 key
                this.modifyOrderElem(1, relGrpName, oldID, newID);
            };

            // 修改关系组中的关系的特性的 value （没有修改特性 key 的需求）
            Model.prototype.modifyPropOfR = function (relGrpName, relID, propName, newValue) {

                this.modifyNodeValue([1, relGrpName, 0, relID, 0], propName, newValue);
            };

            // 获取特性的 value
            Model.prototype.getProp = function (flagCRG, classRelGrpName, attrRelName) {

                return this.getSubModel([flagCRG, classRelGrpName, 0, attrRelName, 0]);
            };

            // 检验某元素是否存在
            Model.prototype.doesNodeExist = function (caseOfElem, name, additionalName) {

                // case [ 0: class, 1: relation group, 2: attribute ]
                // 当 case 不是 2 时，不需要传入第三个参数 additionalName

                try {
                    switch (caseOfElem) {
                        case 0:
                            this.getSubModel([0, name]);
                            break;

                        case 1:
                            this.getSubModel([1, name]);
                            break;

                        case 2:
                            if (3 !== arguments.length) {
                                throw new SyntaxError('doesNodeExist(): The third argument is required when testing an attribute.');
                            }
                            this.getSubModel([0, additionalName, 0, name]);  // additionalName 是类名，不要与 name (attribute name) 颠倒顺序
                            break;

                        default:
                            throw new TypeError('doesNodeExist(): The first argument must be 0, 1 or 2.');
                    }

                    return true;  // getSubModel 没有抛出错误，意味着 node 存在

                } catch (error) {

                    if (error instanceof ReferenceError) {

                        return false;  // getSubModel 抛出 ReferenceError，意味着 node 不存在
                    } else {
                        throw error;
                    }

                }
            };

            /**
             * 获取类名（字典序）
             * @returns {Array}
             */
            Model.prototype.getClassNames = function() {
                var classNames = [];
                var modelClasses = this[0];

                for (var modelClass in modelClasses) { // 类名读入数组
                    if (modelClasses.hasOwnProperty(modelClass)) {
                        classNames.push(modelClass);
                    }
                }

                classNames.sort(); // 排序

                return classNames;
            };

            /**
             * 获取关系组名（字典序）
             * @returns {Array}
             */
            Model.prototype.getRelGrpNames = function() {
                var relgrpNames = [];
                var modelRelgrps = this[1];

                for (var modelRelgrp in modelRelgrps) { // 类名读入数组
                    if (modelRelgrps.hasOwnProperty(modelRelgrp)) {
                        relgrpNames.push(modelRelgrp);
                    }
                }

                relgrpNames.sort(); // 排序

                return relgrpNames;
            };

            /**
             * 由className获取classId
             * @param className
             * @returns {*}
             */
            Model.prototype.getClassId = function (className) {
                if (!this[2]['clazz'][className]) {
                    return null;
                }
                return this[2]['clazz'][className].id;
            };


        }
    }


});