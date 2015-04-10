define(function(require, exports, module) {

  var d3 = require('../lib/d3');
  var $ = require('../lib/jquery');

  // 用d3实现model可视化
  + function modelview() {
  
    
    var mywidth = document.getElementById("view").clientWidth;

    //svg的长宽
    var width = 950;
    var height = 400;

    var selectedColor = "#005499";  //选择之后圈和连线的颜色
    var lineColor = "#b4c1f3";      //连线的颜色
    var strokeColor = "#8491c3";    //不选择时圈的颜色
    var fillColor = "#73bbe2";      //点的颜色
    var nameNotSelectedFill = "#999"; //名字的颜色

    var lineWidth = 1;              //连线的宽度
    var lineSelectedWidth = 2;      //连线被选择之后的宽度

    //模型demo数据
    var model = [{
      "Course": [{
        "code": [{
          "name": "code",
          "type": "string"
        }],
        "credit": [{
          "name": "credit",
          "type": "float"
        }],
        "description": [{
          "name": "description",
          "type": "Text"
        }],
        "capacity": [{
          "name": "capacity",
          "type": "int"
        }],
        "character": [{
          "name": "character",
          "type": "CourseCharacter"
        }],
        "name": [{
          "name": "name",
          "type": "string"
        }],
        "availability": [{
          "name": "availability",
          "type": "CourseAvailability"
        }]
      }, {
        "order": ["name", "code", "credit", "description", "capacity", "character", "availability"]
      }],
      "CourseActivity": [{
        "startTime": [{
          "name": "startTime",
          "type": "Time"
        }],
        "endTime": [{
          "name": "endTime",
          "type": "Time"
        }],
        "place": [{
          "name": "place",
          "type": "string"
        }],
        "date": [{
          "name": "date",
          "type": "SchoolDate"
        }],
        "weekNum": [{
          "name": "weekNum",
          "type": "int"
        }]
      }, {
        "order": ["startTime", "endTime", "place", "date", "weekNum"]
      }],
      "CourseAvailability": [{
        "undergraduateAvailable": [{
          "name": "undergraduateAvailable",
          "type": "boolean"
        }],
        "masterStudentAvailable": [{
          "name": "masterStudentAvailable",
          "type": "boolean"
        }],
        "phDStudentAvailable": [{
          "name": "phDStudentAvailable",
          "type": "boolean"
        }]
      }, {
        "order": ["undergraduateAvailable", "masterStudentAvailable", "phDStudentAvailable"]
      }],
      "CourseCharacter": [{
        "compulsory": [{
          "name": "compulsory"
        }],
        "elective": [{
          "name": "elective"
        }],
        "limited": [{
          "name": "limited"
        }]
      }, {
        "order": ["compulsory", "elective", "limited"]
      }],
      "Date": [{
        "day": [{
          "name": "day"
        }],
        "month": [{
          "name": "month"
        }],
        "year": [{
          "name": "year"
        }]
      }, {
        "order": ["day", "month", "year"]
      }],
      "DayOfWeek": [{
        "sunday": [{
          "name": "sunday"
        }],
        "monday": [{
          "name": "monday"
        }],
        "tuesday": [{
          "name": "tuesday"
        }],
        "wednsday": [{
          "name": "wednsday"
        }],
        "thursday": [{
          "name": "thursday"
        }],
        "friday": [{
          "name": "friday"
        }],
        "saturday": [{
          "name": "saturday"
        }]
      }, {
        "order": ["sunday", "monday", "tuesday", "wednsday", "thursday", "friday", "saturday"]
      }],
      "Department": [{
        "requiredCreditOfM": [{
          "name": "requiredCreditOfM",
          "type": "RequiredCredit"
        }],
        "requiredCreditOfB": [{
          "name": "requiredCreditOfB",
          "type": "RequiredCredit"
        }],
        "requiredCreditOfD": [{
          "name": "requiredCreditOfD",
          "type": "RequiredCredit"
        }],
        "name": [{
          "name": "name",
          "type": "string"
        }],
        "code": [{
          "name": "code",
          "type": "string"
        }]
      }, {
        "order": ["name", "code", "requiredCreditOfM", "requiredCreditOfB", "requiredCreditOfD"]
      }],
      "Examination": [{
        "supervisor": [{
          "name": "supervisor",
          "type": "string"
        }]
      }, {
        "order": ["supervisor"]
      }],
      "ExerciseLesson": [{
        "teachingAssistant": [{
          "name": "teachingAssistant",
          "type": "string"
        }]
      }, {
        "order": ["teachingAssistant"]
      }],
      "Image": [{
        "height": [{
          "name": "height",
          "type": "int"
        }],
        "width": [{
          "name": "width",
          "type": "int"
        }],
        "imageURL": [{
          "name": "imageURL",
          "type": "string"
        }]
      }, {
        "order": ["height", "width", "imageURL"]
      }],
      "Lecture": [{
        "lecturer": [{
          "name": "lecturer",
          "type": "string"
        }]
      }, {
        "order": ["lecturer"]
      }],
      "MasterStudent": [{}, {
        "order": []
      }],
      "PhDStudent": [{}, {
        "order": []
      }],
      "RequiredCredit": [{
        "limitedCredit": [{
          "name": "limitedCredit",
          "type": "float"
        }],
        "electiveCredit": [{
          "name": "electiveCredit",
          "type": "float"
        }],
        "compulsoryCredit": [{
          "name": "compulsoryCredit",
          "type": "float"
        }]
      }, {
        "order": ["limitedCredit", "electiveCredit", "compulsoryCredit"]
      }],
      "SchoolCalender": [{}, {
        "order": []
      }],
      "SchoolDate": [{
        "week": [{
          "name": "week",
          "type": "Week"
        }],
        "semester": [{
          "name": "semester",
          "type": "Semester"
        }],
        "schoolYear": [{
          "name": "schoolYear",
          "type": "SchoolYear"
        }],
        "dayOfWeek": [{
          "name": "dayOfWeek",
          "type": "DayOfWeek"
        }]
      }, {
        "order": ["week", "semester", "schoolYear", "dayOfWeek"]
      }],
      "SchoolYear": [{
        "startYear": [{
          "name": "startYear",
          "type": "Year"
        }],
        "endYear": [{
          "name": "endYear",
          "type": "Year"
        }]
      }, {
        "order": ["startYear", "endYear"]
      }],
      "Semester": [{
        "spring": [{
          "name": "spring"
        }],
        "fall": [{
          "name": "fall"
        }],
        "summer": [{
          "name": "summer"
        }]
      }, {
        "order": ["spring", "fall", "summer"]
      }],
      "Student": [{
        "code": [{
          "name": "code",
          "type": "string"
        }],
        "enrollmentDate": [{
          "name": "enrollmentDate",
          "type": "Date"
        }]
      }, {
        "order": ["code", "enrollmentDate"]
      }],
      "StudentAssessment": [{
        "paperScore": [{
          "name": "paperScore",
          "type": "float"
        }],
        "attendenceScore": [{
          "name": "attendenceScore",
          "type": "float"
        }],
        "projectScore": [{
          "name": "projectScore",
          "type": "float"
        }],
        "midtermExamScore": [{
          "name": "midtermExamScore",
          "type": "float"
        }],
        "finalExamScore": [{
          "name": "finalExamScore",
          "type": "float"
        }],
        "finalAssessment": [{
          "name": "finalAssessment",
          "type": "float"
        }]
      }, {
        "order": ["paperScore", "attendenceScore", "projectScore", "midtermExamScore", "finalExamScore", "finalAssessment"]
      }],
      "Teacher": [{
        "facultyCode": [{
          "name": "facultyCode",
          "type": "string"
        }],
        "title": [{
          "name": "title",
          "type": "Title"
        }]
      }, {
        "order": ["facultyCode", "title"]
      }],
      "Text": [{
        "str": [{
          "name": "str",
          "type": "string",
          "multiplicity": "*",
          "ordering": "True"
        }]
      }, {
        "order": ["str"]
      }],
      "Time": [{
        "minute": [{
          "name": "minute"
        }],
        "hour": [{
          "name": "hour"
        }],
        "second": [{
          "name": "second"
        }]
      }, {
        "order": ["hour", "minute", "second"]
      }],
      "Title": [{
        "professor": [{
          "name": "professor"
        }],
        "associateProfessor": [{
          "name": "associateProfessor"
        }],
        "assistantProfessor": [{
          "name": "assistantProfessor"
        }],
        "lecturer": [{
          "name": "lecturer"
        }]
      }, {
        "order": ["professor", "associateProfessor", "assistantProfessor", "lecturer"]
      }],
      "Undergraduate": [{
        "email": [{
          "name": "email",
          "type": "string"
        }],
        "username": [{
          "name": "username",
          "type": "string"
        }],
        "photo": [{
          "name": "photo",
          "type": "Image"
        }],
        "password": [{
          "name": "password",
          "type": "string"
        }],
        "birthDate": [{
          "name": "birthDate",
          "type": "Date"
        }],
        "name": [{
          "name": "name",
          "type": "string"
        }]
      }, {
        "order": ["name", "birthDate", "username", "password", "email", "photo"]
      }],
      "User": [{}, {
        "order": []
      }],
      "Week": [{
        "weekOne": [{
          "name": "weekOne"
        }],
        "weekTwo": [{
          "name": "weekTwo"
        }],
        "weekThree": [{
          "name": "weekThree"
        }]
      }, {
        "order": ["weekOne", "weekTwo", "weekThree"]
      }],
      "Year": [{}, {
        "order": []
      }]
    }, {
      "PhDStudent-Student": [{
        "550ad58d004b148de2988710": [{
          "role": ["father", "child"],
          "class": ["Student", "PhDStudent"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad58d004b148de2988710"]
      }],
      "Course-CourseActivity": [{
        "550ad3f9004b1404070f6798": [{
          "type": ["Composition", ""],
          "role": ["whole", "part"],
          "class": ["Course", "CourseActivity"],
          "multiplicity": ["1", "*"]
        }]
      }, {
        "order": ["550ad3f9004b1404070f6798"]
      }],
      "Course-Department": [{
        "550ad444004b14d17ab88919": [{
          "type": ["Association", ""],
          "role": ["a", "a"],
          "class": ["Course", "Department"],
          "multiplicity": ["*", "1"]
        }]
      }, {
        "order": ["550ad444004b14d17ab88919"]
      }],
      "Course-Student": [{
        "550ad49a004b14d17ab8891a": [{
          "type": ["Association", ""],
          "role": ["a", "a"],
          "class": ["Course", "Student"],
          "multiplicity": ["0..*", "*"]
        }]
      }, {
        "order": ["550ad49a004b14d17ab8891a"]
      }],
      "Course-Teacher": [{
        "550ad4c3004b14d17ab8891b": [{
          "type": ["Association", ""],
          "role": ["a", "a"],
          "class": ["Course", "Teacher"],
          "multiplicity": ["0..*", "1..*"]
        }]
      }, {
        "order": ["550ad4c3004b14d17ab8891b"]
      }],
      "CourseActivity-Examination": [{
        "550ad4d6004b14d17ab8891c": [{
          "role": ["father", "child"],
          "class": ["CourseActivity", "Examination"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad4d6004b14d17ab8891c"]
      }],
      "CourseActivity-ExerciseLesson": [{
        "550ad4fb004b148de298870a": [{
          "role": ["father", "child"],
          "class": ["CourseActivity", "ExerciseLesson"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad4fb004b148de298870a"]
      }],
      "CourseActivity-Lecture": [{
        "550ad506004b148de298870b": [{
          "role": ["father", "child"],
          "class": ["CourseActivity", "Lecture"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad506004b148de298870b"]
      }],
      "Date-SchoolCalender": [{
        "550ad51a004b148de298870c": [{
          "type": ["Aggregation", ""],
          "role": ["owner", "ownee"],
          "class": ["Date", "SchoolCalender"],
          "multiplicity": ["1", "*"]
        }]
      }, {
        "order": ["550ad51a004b148de298870c"]
      }],
      "Teacher-User": [{
        "550ad5e3004b1407c7fd8718": [{
          "role": ["father", "child"],
          "class": ["User", "Teacher"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad5e3004b1407c7fd8718"]
      }],
      "Student-User": [{
        "550ad5dc004b1407c7fd8717": [{
          "role": ["father", "child"],
          "class": ["User", "Student"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad5dc004b1407c7fd8717"]
      }],
      "Department-Student": [{
        "550ad530004b148de298870d": [{
          "type": ["Association", ""],
          "role": ["a", "a"],
          "class": ["Department", "Student"],
          "multiplicity": ["1..*", "*"]
        }]
      }, {
        "order": ["550ad530004b148de298870d"]
      }],
      "Department-Teacher": [{
        "550ad55f004b148de298870e": [{
          "type": ["Association", ""],
          "role": ["a", "a"],
          "class": ["Department", "Teacher"],
          "multiplicity": ["1..*", "*"]
        }]
      }, {
        "order": ["550ad55f004b148de298870e"]
      }],
      "RequiredCredit-Student": [{
        "550ad56c004b148de298870f": [{
          "role": ["father", "child"],
          "class": ["Student", "RequiredCredit"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad56c004b148de298870f"]
      }],
      "SchoolCalender-SchoolDate": [{
        "550ad5af004b148de2988711": [{
          "type": ["Aggregation", ""],
          "role": ["owner", "ownee"],
          "class": ["SchoolCalender", "SchoolDate"],
          "multiplicity": ["1", "*"]
        }]
      }, {
        "order": ["550ad5af004b148de2988711"]
      }],
      "Student-Undergraduate": [{
        "550ad5cf004b1407c7fd8716": [{
          "role": ["father", "child"],
          "class": ["Student", "Undergraduate"],
          "multiplicity": ["1", "1"],
          "type": ["Generalization", ""]
        }]
      }, {
        "order": ["550ad5cf004b1407c7fd8716"]
      }]
    }];


    /**
     *  将模型数据转换为展示 model view 所需的格式
     *   存入dataset
     */

    var dataset = {
      nodes: [],
      edges: []
    };

    var nodeRecord = {}; //记录node节点标号
    var nodeNumber = 0;

    //类转存入nodes
    for (ClassVar in model[0]) {
      var myclass = {};
      myclass.name = ClassVar;
      var myAttribute = [];
      for (AttributeVar in model[0][ClassVar][0])
        myAttribute.push(model[0][ClassVar][0][AttributeVar][0]);
      myclass.attribute = myAttribute;
      dataset.nodes.push(myclass);
      nodeRecord[ClassVar] = nodeNumber;
      nodeNumber = nodeNumber + 1;
    }

    //关系转存入edges
    for (RelationVar in model[1]) {
      var myrelation = {};
      for (AttributeVar in model[1][RelationVar][0]) {
        myrelation.type = model[1][RelationVar][0][AttributeVar][0]["type"][0];
        var class1 = model[1][RelationVar][0][AttributeVar][0]["class"][1];
        var class2 = model[1][RelationVar][0][AttributeVar][0]["class"][0];
        myrelation.source = nodeRecord[class1];
        myrelation.target = nodeRecord[class2];
        myrelation.multiplicity = model[1][RelationVar][0][AttributeVar][0]["multiplicity"];
        myrelation.role = model[1][RelationVar][0][AttributeVar][0]["role"];
      }
      dataset.edges.push(myrelation);
    }

    //缩放定义
    var zoom = d3.behavior.zoom()
      .center([width / 2, height / 2])
      //.scaleExtent([1, 10])
      .on("zoom", zoomed);


    var drag = d3.behavior.drag().on("drag", dragmove);

    //定义拖拽事件触发时的函数
    function dragmove(d) {
    d3.select(this)
      .style("left", d3.event.x + "px")
      .style("top", d3.event.y + "px");
    }
    drag.on("dragstart", function() {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners
    });


    //设置svg的大小
    var svg = d3.select("#view").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .call(zoom) //调用缩放功能
      .on("mousedown.zoom", null); //防止拖拽

    //颜色为白的背景 -> 缩放时无需鼠标移到node上
    svg.append("rect")
      .attr("class", "background")
      .attr("fill", "#fff")
      .attr("width", width)
      .attr("height", height);


    //使用dataset中的nodes和edges初始化force布局
    var force = d3.layout.force()
      .nodes(dataset.nodes)
      .links(dataset.edges)
      .size([width, height])
      .linkDistance(150)
      .charge([-350])
      .start();


    //连线与edges数据绑定
    var link = svg.selectAll(".link")
      .data(dataset.edges)
      //.data(model[1]) 
      .enter().append("g")
      .attr("class", "link");

    //节点与nodes数据绑定
    var node = svg.selectAll(".node")
      .data(dataset.nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

    //节点添加文本，文本内容为节点名称
    var myname = node.append("text")
      .text(function(d) {
        return d.name;
      })
      .attr("font-size", "12")
      .attr("fill", "#666");
      // .attr("stroke-width", 0.5);


    //颜色范围
    var colors = d3.scale.category20();

    //箭头定义
    var defs = svg.append("defs");

    //Generalization箭头(空心三角)
    var genMarker = defs.append("marker")
      .attr("id", "Generalization") //箭头id
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "-5 -5 15 10")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("stroke-width", lineWidth)
      .attr("d", "M0,-5L10,0L0,5Z")
      .attr("fill", "#fff")
      .attr("stroke", lineColor);

    //连线高亮时的Generalization箭头
    var genMarkerHover = defs.append("marker")
      .attr("id", "GeneralizationHover")
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "-5 -5 15 10")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("stroke-width", lineSelectedWidth)
      .attr("stroke-linecap", "round")
      .attr("d", "M0,-5L10,0L0,5Z")
      .attr("fill", "#fff")
      .attr("stroke", selectedColor);

    //Aggregation箭头(空心菱形)
    var aggreMarker = defs.append("marker")
      .attr("id", "Aggregation")
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "-10 -5 20 10")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("stroke-width", lineWidth)
      .attr("d", "M0,-5L10,0L0,5L-10,0Z")
      .attr("fill", "#fff")
      .attr("stroke", lineColor);

    //连线高亮时的Aggregation箭头
    var aggreMarkerHover = defs.append("marker")
      .attr("id", "AggregationHover")
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "-10 -5 20 10")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("stroke-width", lineSelectedWidth)
      .attr("d", "M0,-5L10,0L0,5L-10,0Z")
      .attr("fill", "#fff")
      .attr("stroke", selectedColor);

    //Composition箭头(实心菱形)
    var comMarker = defs.append("marker")
      .attr("id", "Composition")
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "-10 -5 20 10")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("stroke-width", lineWidth)
      .attr("d", "M0,-5L10,0L0,5L-10,0Z")
      .attr("fill", lineColor)
      .attr("stroke", lineColor);

    //连线高亮时的Composition箭头
    var comMarkerHover = defs.append("marker")
      .attr("id", "CompositionHover")
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "-10 -5 20 10")
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("stroke-width", lineSelectedWidth)
      .attr("d", "M0,-5L10,0L0,5L-10,0Z")
      .attr("fill", selectedColor)
      .attr("stroke", selectedColor);


    /**
     *   Zoom缩放函数
     */

    function zoomed() {
      d3.select(this)
        .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }



    /**
     *   计算半径函数
     */
    function radiusover(d) {
      if (!d.weight) { //节点weight属性没有值初始化为1（一般就是叶子了）  
        d.weight = 1;
      }
      return d.weight * 3 + 5;                               
    }


    //记录之前一次点击的临时节点
    var tmpnode = null;
    var tmpedge = null;

    /**
     *   将所有节点和边归为非高亮状态
     *   参数：空
     */
    function noneClickStyle() {
      node.selectAll("circle")
        .attr("fill-opacity", 0.9)
        .attr("stroke-width", 1)
        .attr("stroke", strokeColor);
      node.selectAll("text")
        .attr("font-size", "12")
        .attr("fill", "#666")
        .attr("opacity", 1);
      link.selectAll("line")
        .attr("stroke", lineColor)
        .attr("stroke-width", lineWidth)
        .attr("marker-end", function(d) {
          return "url(#" + d.type + ")";
        });                            
    }

    /**
     *   高亮某节点及其文本
     *   参数：被高亮节点node
     */
    // function highlightNode(node){

    //   //高亮该节点
    //   mycircle.attr("fill-opacity", function(mynode) {
    //     if (mynode === node)
    //       return 0.9;
    //     else
    //       return 0.5;
    //   });

    //   mycircle.attr("stroke-width", function(mynode) {
    //     if (mynode === node)
    //       return 3;
    //     else
    //       return 1;
    //   });

    //   //高亮节点相关的文本
    //   myname.attr("stroke", function(mytext) {
    //     if (mytext === node)
    //       return "#444";
    //     else
    //       return "#ccc";
    //   });

    //   myname.attr("stroke-width", function(mytext) {
    //     if (mytext === node)
    //       return 0.8;
    //     else
    //       return 0.5;
    //   });
    // }

    /**
     *   高亮与某节点相连的线
     *   参数：节点node
     */
    function highlightNodeEdge(node){
      
      //将该节点与所有邻居节点存入neighbors数组
      var neighbors = [];
      neighbors.push(node);

      myline.attr("stroke", function(edge) {
        if (edge.source === node) {
          neighbors.push(edge.target);
          return selectedColor;
        } 
        else if(edge.target == node){
          neighbors.push(edge.source);
          return selectedColor;
        }
        else
          return lineColor;
      });

      myline.attr("stroke-width", function(edge) {
        if (edge.source === node || edge.target === node) {
          return lineSelectedWidth;
        } else
          return lineWidth;
      });

      myline.attr("marker-end", function(edge) {
        if (edge.source === node || edge.target === node) {
          return "url(#" + edge.type + "Hover)";
        } else
          return "url(#" + edge.type + ")";
      });

      //高亮该节点与邻居节点
      mycircle.attr("fill-opacity", function(mynode) {
        if (neighbors.indexOf(mynode) > -1)
          return 1.0;
        else
          return 0.5;
      });

      mycircle.attr("stroke-width", function(mynode) {
        if (neighbors.indexOf(mynode) > -1)
          return 2;
        else
          return 0.5;
      });

      mycircle.attr("stroke", function(mynode) {
        if (neighbors.indexOf(mynode) > -1)
          return selectedColor;
        else
          return "none";
      });

      //高亮节点相关的文本
      myname.attr("font-size", function(mytext) {
        if (neighbors.indexOf(mytext) > -1)
          return 12;
        else
          return 11;
      });

      myname.attr("fill", function(mytext) {
        if (neighbors.indexOf(mytext) > -1)
          return "#000";
        else
          return nameNotSelectedFill;
      });

      myname.attr("opacity", function(mytext) {
        if (neighbors.indexOf(mytext) > -1)
          return 1;
        else
          return 0.6;
      });

    }

    /**
     *   高亮某条边
     *   参数：被高亮的边edge
     */
    function highlightEdge(edge){

      myline.attr("stroke", function(myedge) {
        if (myedge === edge) {
          return selectedColor;
        } else
          return lineColor;
      });

      myline.attr("stroke-width", function(myedge) {
        if (myedge === edge) {
          return lineSelectedWidth;
        } else
          return lineWidth;
      });

      myline.attr("marker-end", function(myedge) {
        if (myedge === edge) {
          return "url(#" + myedge.type + "Hover)";
        } else
          return "url(#" + myedge.type + ")";
      });

    }

    /**
     *   高亮与某条边相连的节点
     *   参数：被选择的边edge
     */
    function highlightEdgeNode(edge){
      //高亮该节点
      mycircle.attr("fill-opacity", function(mynode) {
        if (mynode === edge.source || mynode === edge.target)
          return 1.0;
        else
          return 0.5;
      });

      mycircle.attr("stroke-width", function(mynode) {
        if (mynode === edge.source || mynode === edge.target)
          return 2;
        else
          return 0.5;
      });

      mycircle.attr("stroke", function(mynode) {
        if (mynode === edge.source || mynode === edge.target)
          return selectedColor;
        else
          return "none";
      });

      //高亮节点相关的文本
      myname.attr("font-size", function(mytext) {
        if (mytext === edge.source || mytext === edge.target)
          return 12;
        else
          return 11;
      });

      myname.attr("fill", function(mytext) {
        if (mytext === edge.source || mytext === edge.target)
          return "#000";
        else
          return nameNotSelectedFill;
      });

      myname.attr("opacity", function(mytext) {
        if (mytext === edge.source || mytext === edge.target)
          return 1;
        else
          return 0.6;
      });
    }

    /**
     *   点击某一节点，
     *   右侧展示详细信息
     *   并高亮相关信息
     *   参数：被点击的节点node
     */
    function clickNode(node){
      
      tmpnode = node;
      tmpedge = null;

      d3.select("#classDetail").remove();
      d3.select("#relationDetail").remove();

      //更新类的名字

      var nodeName = node.name;

      // d3.select("#tooltip")
      //   .style("left", mywidth - 350);

      d3.select("#tooltip")
        .append("div")
        .attr("id", "classDetail")
        .attr("style", "border: 1px solid");

      d3.select("#classDetail")
        .append("br");

      d3.select("#classDetail")
        .append("p")
        .attr("style", "text-align:center;font-weight:bold")
        .text(nodeName);

      d3.select("#classDetail")
        .append("hr")
        .attr("style", "border-top:1px solid #444");

      // 显示类的属性及相关信息
      d3.select("#classDetail")
        .append("span")
        .attr("id", "attributes");

      var attribute = "";
      node.attribute.forEach(function(property) {
        var propertyDetail = property.name;
        if (property.type !== undefined)
          propertyDetail = propertyDetail + " : " + property.type;
        d3.select("#attributes")
          .append("p")
          .attr("style", "padding-left:5%")
          .text(propertyDetail);
      });

      d3.select("#attributes")
        .append("hr")
        .attr("style", "border-top:1px solid #444");

      //显示类的属性
      d3.select("#tooltip").classed("hidden", false);
      d3.select("#tooltip").call(drag);
      // var tipWidth = document.getElementById("tooltip").clientWidth;
      // var tipHeight = document.getElementById("tooltip").clientHeight;
      // var tmpsvg = d3.select("#classDetail")
      //   .append("svg")
      //   .attr("width", tipWidth)
      //   .attr("height", tipHeight)
      //   .append("g");
      // tmpsvg.append("rect")
      //   .attr("class", "background")
      //   .attr("fill", "#fff")
      //   .attr("width", tipWidth)
      //   .attr("height", tipHeight)
      //   .call(drag);


      //高亮该节点及文本
      // highlightNode(node);  


      //高亮与节点相连的线
      highlightNodeEdge(node);    
    }

    /**
     *   鼠标移到某节点上
     *   高亮相关信息
     *   参数：节点node
     */
    function mouseoverNode(node){
      //高亮该节点及文本
      // highlightNode(node);  

      
      //高亮与节点相连的线
      highlightNodeEdge(node); 
    }

    /**
     *   鼠标移走
     *   恢复之前点击状态
     *   参数：无
     */
    function mouseout(){
      //先将所有节点归为无高亮状态
      noneClickStyle();

      //高亮上一次点击的节点及与其相关信息
      if (tmpnode !== null)
        //更新类的名字
        clickNode(tmpnode);
      else if(tmpedge !== null)
        clickEdge(tmpedge);
      else //如无需高亮的节点，隐藏右侧的详细信息
        d3.select("#tooltip").classed("hidden", true);
    }

    /**
     *   点击某边，
     *   右侧展示详细信息
     *   并高亮相关信息
     *   参数：被点击的边edge
     */
    function clickEdge(edge){
      
      tmpedge = edge;
      tmpnode = null;

      d3.select("#classDetail").remove();
      d3.select("#relationDetail").remove();

      var sourceName = edge.source.name;
      var targetName = edge.target.name;
      var type = edge.type;
      var multi1 = edge.multiplicity[1];
      var multi2 = edge.multiplicity[0];
      var role1 = edge.role[1];
      var role2 = edge.role[0];

      // d3.select("#tooltip")
      //   .style("left", mywidth - 350);

      d3.select("#tooltip")
        .append("div")
        .attr("id", "relationDetail")
        .attr("class", "row");

      d3.select("#relationDetail")
        .append("div")
        .attr("id", "targetClass")
        .attr("class","col-xs-12");


      d3.select("#relationDetail")
        .append("div")
        .attr("id", "relation")
        .attr("class","col-xs-6")
        .attr("style", "text-align:right;padding: 0px");


      d3.select("#relationDetail")
        .append("div")
        .attr("id", "multi")
        .attr("class","col-xs-6")
        .attr("style", "height: 180px;padding: 0px;");

      d3.select("#relationDetail")
        .append("div")
        .attr("id", "sourceClass")
        .attr("class","col-xs-12");

      d3.select("#sourceClass")
        .append("p")
        .attr("style", "text-align:center;border: 1px solid; padding: 10px")
        .text(sourceName);

      d3.select("#relation")
        .append("img")
        .attr("src", "/src/img/" + type + ".png")
        .attr("height", 180);

      d3.select("#targetClass")
        .append("p")
        .attr("style", "text-align:center;border: 1px solid; padding: 10px")
        .text(targetName);

      
      d3.select("#multi")
        .append("p")
        .text(multi1);
      
      d3.select("#multi")
        .append("p")
        .text(role1)
        .attr("style", "padding-bottom: 100px");

      d3.select("#multi")
        .append("p")
        .text(role2);

      d3.select("#multi")
        .append("p")
        .text(multi2);
       

      //显示类的属性
      d3.select("#tooltip").classed("hidden", false);
      d3.select("#tooltip").call(drag);

      //高亮该条边
      highlightEdgeNode(edge);

      //高亮与该边相连的节点
      highlightEdge(edge);      
    }

    function mouseoverEdge(edge){
      //高亮该条边
      highlightEdgeNode(edge);

      //高亮与该边相连的节点
      highlightEdge(edge);  
    }


    svg.on("click", function(d) {
      noneClickStyle();
      d3.select("#tooltip").classed("hidden", true);
      tmpnode = null; 
      tmpedge = null; 
    });


    //每个节点都绑定一个圆形显示
    var mycircle =
      node.append("circle")
      .attr("r", function(d) { //设置圆点半径                        
        return radiusover(d);
      })
      // .attr("stroke", function(d, i) {
      //   return colors(i);
      // })
      .attr("stroke", strokeColor)
      .attr("stroke-width", 1)
      .attr("fill", function(d, i) {
        return fillColor;
      })
      .attr("fill-opacity", 0.9)
      .attr("cursor", "pointer");


    mycircle.on("click", function(d) {
      d3.event.stopPropagation(); //截断svg的click事件
      clickNode(d);

    })
    //高亮当前节点及其连线，但仍然显示上一次点击的节点信息
    .on("mouseover", function(d) {
      mouseoverNode(d);
    })
    // 鼠标移走时高亮上一次点击节点及其连线，显示上一次点击的节点信息
    .on("mouseout", function(d) {
      mouseout();
    });


    d3.select("#searchButton")
      .on("click", function(){
        var searchText = $("#searchText").val();
        for(var j = 0; j < dataset.nodes.length; j ++){
          if(dataset.nodes[j].name === searchText){
            clickNode(dataset.nodes[j]);
            break;
          }
        }
      });


    //根据relation类型的不同绑定箭头

    var myline = link.append("line")
      .attr("class", function(d) {
        return "link " + d.type;
      })
      .attr("marker-end", function(d) {
        return "url(#" + d.type + ")";
      })
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    var path = link.append("path")
      .attr("stroke", "#fff")
      .attr("stroke-width", 20)
      .attr("opacity", 0.0)
      .attr("cursor", "pointer");


    path.on("click", function(d) {      
      d3.event.stopPropagation(); //截断svg的click事件
      clickEdge(d);
    })
    //高亮当前节点及其连线，但仍然显示上一次点击的节点信息
    .on("mouseover", function(d) {
      mouseoverEdge(d);
    })
    // 鼠标移走时高亮上一次点击节点及其连线，显示上一次点击的节点信息
    .on("mouseout", function(d) {
      mouseout();
    });


    //Every time the simulation "ticks", this will be called
    /**
     *   每一次tick，调用此函数
     */

    force.on("tick", function() {

      /**
       *   限制节点的移动范围在该svg大小之内
       */
      dataset.nodes.forEach(function(d, i) {
        var r = radiusover(d);
        d.x = d.x - r < 0 ? r : d.x;
        d.x = d.x + r > width ? width - r : d.x;
        d.y = d.y - r < 0 ? r : d.y;
        d.y = d.y + r * 2 > height ? height - r * 2 : d.y;
      });

      /**
       *   计算两点之间连线的起止位置，以绘出合适的箭头
       */

      link.selectAll("line")
        .attr("x1", function(d) {
          var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
          var r = radiusover(d.source);
          var rx = r * dx / dr;
          return (d.source.x + rx);
        })
        .attr("y1", function(d) {
          var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
          var r = radiusover(d.source);
          var ry = r * dy / dr;
          return (d.source.y + ry);
        })
        .attr("x2", function(d) {
          var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
          var r = radiusover(d.target);
          var rx = r * dx / dr;
          return (d.target.x - rx);
        })
        .attr("y2", function(d) {
          var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
          var r = radiusover(d.target);
          var ry = r * dy / dr;
          return (d.target.y - ry);
        });

      path.attr("d", function(d) {    
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;  
      });

      //更新节点的坐标
      node.selectAll("circle")
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });

      //更新连线上文本的坐标
      link.selectAll("text")
        .attr("x", function(d) {
          return (d.source.x + d.target.x) / 2;
        })
        .attr("y", function(d) {
          return (d.source.y + d.target.y) / 2;
        });

      //更新节点旁文字的坐标
      node.selectAll("text")
        .attr("x", function(d) {
          return d.x - radiusover(d) * 2;
        })
        .attr("y", function(d) {
          return d.y + radiusover(d) * 2;
        });
    });
   

  }();

});