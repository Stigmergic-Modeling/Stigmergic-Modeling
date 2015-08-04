// tests

var model = new Model();

model.addNode([0], ['Course', 'C++']);
//console.log(model[0]);

model.addNode([0], ['Date', '2015']);
//console.log(model[0]);

model.modifyNodeName([0], 'Course', 'Student');
//console.log(model[0]);

model.modifyNodeValue([0], 'Student', 'LiLei');
//model.print();

model.removeSubModel([0], 'Student');
//console.log(model[0]);

model.addNode([0], ['College', 'PKU']);
var subModel = model.getSubModel([0]);
//console.log(subModel);

var model2 = new Model();
model2.addClass('Time');
//model2.print();

model2.addAttr('Time', 'hour', {position: '@', direction: 0});
model2.addAttr('Time', 'second', {position: 'hour', direction: 0});
//model2.print();

model2.modifyAttrName('Time', 'hour', 'xiaoshi');
model2.modifyAttrName('Time', 'xiaoshi', 'hour');
//model2.print();

model2.addPropOfA('Time', 'second', ['type', 'string']);
//model2.print();

model2.modifyPropOfA('Time', 'second', 'type', 'int');
//model2.print();

model2.insertOrderElem(0, 'Time', 'hour', '@', 0);
model2.insertOrderElem(0, 'Time', 'minute', 'hour', 0);
model2.insertOrderElem(0, 'Time', 'second', 'hour', 1);
//model2.print();

model2.removeOrderElem(0, 'Time', 'hour');
//model2.print();

model2.moveOrderElem(0, 'Time', 'second', -2);
model2.moveOrderElem(0, 'Time', 'second', 1);
//model2.print();

model2.addRelGrp('Time-Date');
//model2.print();

model2.addRelation('Time-Date', 'ID43209432409', {position: '@', direction: 0});
//model2.print();

model2.addPropOfR('Time-Date', 'ID43209432409', ['type', 'string']);
//model2.print();

model2.modifyClassName('Time', 'NewYorkTimes');
//model2.print();

model2.modifyRelGrpName('Time-Date', 'Date-Time');
//model2.print();

model2.modifyRelID('Date-Time', 'ID43209432409', 'ID9999999999');
//model2.print();

model2.modifyPropOfR('Date-Time', 'ID9999999999', 'type', 'int');
//model2.print();

var prop = model2.getProp(1, 'Date-Time', 'ID9999999999', 'type');
//console.log('\n' + prop);

var existance1 = model2.doesNodeExist(0, 'Time');
var existance2 = model2.doesNodeExist(2, 'NewYorkTimes', 'second');
//console.log('\n' + existance1);
//console.log('\n' + existance2);

var model3 = new Model(model);
//model3.print();

model.modifyClassName('Course', 'Student');
model.addClass('KDKDKD');
//model.print();
//model3.print();

console.log('\nDone!');