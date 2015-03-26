define(function (require, exports, module) {

    var d3 = require('../lib/d3');

    // 用d3实现model可视化
    +function modelview() {

      var w = 550;
      var h = 400;

      var newmodel = [{"Course":[{"code":[{"name":"code","type":"string"}],"credit":[{"name":"credit","type":"float"}],"description":[{"name":"description","type":"Text"}],"capacity":[{"name":"capacity","type":"int"}],"character":[{"name":"character","type":"CourseCharacter"}],"name":[{"name":"name","type":"string"}],"availability":[{"name":"availability","type":"CourseAvailability"}]},{"order":["name","code","credit","description","capacity","character","availability"]}],"CourseActivity":[{"startTime":[{"name":"startTime","type":"Time"}],"endTime":[{"name":"endTime","type":"Time"}],"place":[{"name":"place","type":"string"}],"date":[{"name":"date","type":"SchoolDate"}],"weekNum":[{"name":"weekNum","type":"int"}]},{"order":["startTime","endTime","place","date","weekNum"]}],"CourseAvailability":[{"undergraduateAvailable":[{"name":"undergraduateAvailable","type":"boolean"}],"masterStudentAvailable":[{"name":"masterStudentAvailable","type":"boolean"}],"phDStudentAvailable":[{"name":"phDStudentAvailable","type":"boolean"}]},{"order":["undergraduateAvailable","masterStudentAvailable","phDStudentAvailable"]}],"CourseCharacter":[{"compulsory":[{"name":"compulsory"}],"elective":[{"name":"elective"}],"limited":[{"name":"limited"}]},{"order":["compulsory","elective","limited"]}],"Date":[{"day":[{"name":"day"}],"month":[{"name":"month"}],"year":[{"name":"year"}]},{"order":["day","month","year"]}],"DayOfWeek":[{"sunday":[{"name":"sunday"}],"monday":[{"name":"monday"}],"tuesday":[{"name":"tuesday"}],"wednsday":[{"name":"wednsday"}],"thursday":[{"name":"thursday"}],"friday":[{"name":"friday"}],"saturday":[{"name":"saturday"}]},{"order":["sunday","monday","tuesday","wednsday","thursday","friday","saturday"]}],"Department":[{"requiredCreditOfM":[{"name":"requiredCreditOfM","type":"RequiredCredit"}],"requiredCreditOfB":[{"name":"requiredCreditOfB","type":"RequiredCredit"}],"requiredCreditOfD":[{"name":"requiredCreditOfD","type":"RequiredCredit"}],"name":[{"name":"name","type":"string"}],"code":[{"name":"code","type":"string"}]},{"order":["name","code","requiredCreditOfM","requiredCreditOfB","requiredCreditOfD"]}],"Examination":[{"supervisor":[{"name":"supervisor","type":"string"}]},{"order":["supervisor"]}],"ExerciseLesson":[{"teachingAssistant":[{"name":"teachingAssistant","type":"string"}]},{"order":["teachingAssistant"]}],"Image":[{"height":[{"name":"height","type":"int"}],"width":[{"name":"width","type":"int"}],"imageURL":[{"name":"imageURL","type":"string"}]},{"order":["height","width","imageURL"]}],"Lecture":[{"lecturer":[{"name":"lecturer","type":"string"}]},{"order":["lecturer"]}],"MasterStudent":[{},{"order":[]}],"PhDStudent":[{},{"order":[]}],"RequiredCredit":[{"limitedCredit":[{"name":"limitedCredit","type":"float"}],"electiveCredit":[{"name":"electiveCredit","type":"float"}],"compulsoryCredit":[{"name":"compulsoryCredit","type":"float"}]},{"order":["limitedCredit","electiveCredit","compulsoryCredit"]}],"SchoolCalender":[{},{"order":[]}],"SchoolDate":[{"week":[{"name":"week","type":"Week"}],"semester":[{"name":"semester","type":"Semester"}],"schoolYear":[{"name":"schoolYear","type":"SchoolYear"}],"dayOfWeek":[{"name":"dayOfWeek","type":"DayOfWeek"}]},{"order":["week","semester","schoolYear","dayOfWeek"]}],"SchoolYear":[{"startYear":[{"name":"startYear","type":"Year"}],"endYear":[{"name":"endYear","type":"Year"}]},{"order":["startYear","endYear"]}],"Semester":[{"spring":[{"name":"spring"}],"fall":[{"name":"fall"}],"summer":[{"name":"summer"}]},{"order":["spring","fall","summer"]}],"Student":[{"code":[{"name":"code","type":"string"}],"enrollmentDate":[{"name":"enrollmentDate","type":"Date"}]},{"order":["code","enrollmentDate"]}],"StudentAssessment":[{"paperScore":[{"name":"paperScore","type":"float"}],"attendenceScore":[{"name":"attendenceScore","type":"float"}],"projectScore":[{"name":"projectScore","type":"float"}],"midtermExamScore":[{"name":"midtermExamScore","type":"float"}],"finalExamScore":[{"name":"finalExamScore","type":"float"}],"finalAssessment":[{"name":"finalAssessment","type":"float"}]},{"order":["paperScore","attendenceScore","projectScore","midtermExamScore","finalExamScore","finalAssessment"]}],"Teacher":[{"facultyCode":[{"name":"facultyCode","type":"string"}],"title":[{"name":"title","type":"Title"}]},{"order":["facultyCode","title"]}],"Text":[{"str":[{"name":"str","type":"string","multiplicity":"*","ordering":"True"}]},{"order":["str"]}],"Time":[{"minute":[{"name":"minute"}],"hour":[{"name":"hour"}],"second":[{"name":"second"}]},{"order":["hour","minute","second"]}],"Title":[{"professor":[{"name":"professor"}],"associateProfessor":[{"name":"associateProfessor"}],"assistantProfessor":[{"name":"assistantProfessor"}],"lecturer":[{"name":"lecturer"}]},{"order":["professor","associateProfessor","assistantProfessor","lecturer"]}],"Undergraduate":[{"email":[{"name":"email","type":"string"}],"username":[{"name":"username","type":"string"}],"photo":[{"name":"photo","type":"Image"}],"password":[{"name":"password","type":"string"}],"birthDate":[{"name":"birthDate","type":"Date"}],"name":[{"name":"name","type":"string"}]},{"order":["name","birthDate","username","password","email","photo"]}],"User":[{},{"order":[]}],"Week":[{"weekOne":[{"name":"weekOne"}],"weekTwo":[{"name":"weekTwo"}],"weekThree":[{"name":"weekThree"}]},{"order":["weekOne","weekTwo","weekThree"]}],"Year":[{},{"order":[]}]},{"PhDStudent-Student":[{"550ad58d004b148de2988710":[{"role":["father","child"],"class":["Student","PhDStudent"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad58d004b148de2988710"]}],"Course-CourseActivity":[{"550ad3f9004b1404070f6798":[{"type":["Composition",""],"role":["whole","part"],"class":["Course","CourseActivity"],"multiplicity":["1","*"]}]},{"order":["550ad3f9004b1404070f6798"]}],"Course-Department":[{"550ad444004b14d17ab88919":[{"type":["Association",""],"role":["a","a"],"class":["Course","Department"],"multiplicity":["*","1"]}]},{"order":["550ad444004b14d17ab88919"]}],"Course-Student":[{"550ad49a004b14d17ab8891a":[{"type":["Association",""],"role":["a","a"],"class":["Course","Student"],"multiplicity":["0..*","*"]}]},{"order":["550ad49a004b14d17ab8891a"]}],"Course-Teacher":[{"550ad4c3004b14d17ab8891b":[{"type":["Association",""],"role":["a","a"],"class":["Course","Teacher"],"multiplicity":["0..*","1..*"]}]},{"order":["550ad4c3004b14d17ab8891b"]}],"CourseActivity-Examination":[{"550ad4d6004b14d17ab8891c":[{"role":["father","child"],"class":["CourseActivity","Examination"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad4d6004b14d17ab8891c"]}],"CourseActivity-ExerciseLesson":[{"550ad4fb004b148de298870a":[{"role":["father","child"],"class":["CourseActivity","ExerciseLesson"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad4fb004b148de298870a"]}],"CourseActivity-Lecture":[{"550ad506004b148de298870b":[{"role":["father","child"],"class":["CourseActivity","Lecture"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad506004b148de298870b"]}],"Date-SchoolCalender":[{"550ad51a004b148de298870c":[{"type":["Aggregation",""],"role":["owner","ownee"],"class":["Date","SchoolCalender"],"multiplicity":["1","*"]}]},{"order":["550ad51a004b148de298870c"]}],"Teacher-User":[{"550ad5e3004b1407c7fd8718":[{"role":["father","child"],"class":["User","Teacher"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad5e3004b1407c7fd8718"]}],"Student-User":[{"550ad5dc004b1407c7fd8717":[{"role":["father","child"],"class":["User","Student"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad5dc004b1407c7fd8717"]}],"Department-Student":[{"550ad530004b148de298870d":[{"type":["Association",""],"role":["a","a"],"class":["Department","Student"],"multiplicity":["1..*","*"]}]},{"order":["550ad530004b148de298870d"]}],"Department-Teacher":[{"550ad55f004b148de298870e":[{"type":["Association",""],"role":["a","a"],"class":["Department","Teacher"],"multiplicity":["1..*","*"]}]},{"order":["550ad55f004b148de298870e"]}],"RequiredCredit-Student":[{"550ad56c004b148de298870f":[{"role":["father","child"],"class":["Student","RequiredCredit"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad56c004b148de298870f"]}],"SchoolCalender-SchoolDate":[{"550ad5af004b148de2988711":[{"type":["Aggregation",""],"role":["owner","ownee"],"class":["SchoolCalender","SchoolDate"],"multiplicity":["1","*"]}]},{"order":["550ad5af004b148de2988711"]}],"Student-Undergraduate":[{"550ad5cf004b1407c7fd8716":[{"role":["father","child"],"class":["Student","Undergraduate"],"multiplicity":["1","1"],"type":["Generalization",""]}]},{"order":["550ad5cf004b1407c7fd8716"]}]}];


      var oldmodel = [{
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
      }, {
        "Course-CourseActivity": [{
          "550ad3f9004b1404070f6798": [{
            "type": ["Composition", ""],
            "role": ["whole", "part"],
            "class": ["Course", "CourseActivity"],
            "multiplicity": ["1", "*"]
          }]
        }, {
          "order": ["550ad3f9004b1404070f6798"]
        }]
      }];

      var dataset = { nodes:[], edges: [] };

      var nodeRecord = {};
      var nodeNumber = 0;

      for( ClassVar in newmodel[0]){
        var myclass = {};
        myclass.name = ClassVar;
        var myAttribute = [];
        for( AttributeVar in newmodel[0][ClassVar][0])
          myAttribute.push(newmodel[0][ClassVar][0][AttributeVar][0]);
        myclass.attribute = myAttribute;
        dataset.nodes.push(myclass);
        nodeRecord[ClassVar] = nodeNumber;
        nodeNumber = nodeNumber + 1;
      }

      for( RelationVar in newmodel[1]){
        var myrelation = {};
        for( AttributeVar in newmodel[1][RelationVar][0]){
          myrelation.type = newmodel[1][RelationVar][0][AttributeVar][0]["type"][0];
          var class1 = newmodel[1][RelationVar][0][AttributeVar][0]["class"][0];
          var class2 = newmodel[1][RelationVar][0][AttributeVar][0]["class"][1];
          myrelation.source = nodeRecord[class1];
          myrelation.target = nodeRecord[class2];
        }
        dataset.edges.push(myrelation);
      }

      var zoom = d3.behavior.zoom()
            .center([w / 2, h / 2])
            //.scaleExtent([1, 10])
            .on("zoom", zoomed);

      var svg = d3.select(".col-xs-7").append("svg")
            .attr("width", w)  
            .attr("height", h)
            .append("g")
            .call(zoom)
            .on("mousedown.zoom", null);

      svg.append("rect")
        .attr("class", "background")
        .attr("fill", "#fff")
        .attr("width", w)
        .attr("height", h);


      
      //Initialize a default force layout, using the nodes and edges in dataset
      var force = d3.layout.force()
                 .nodes(dataset.nodes)
                 .links(dataset.edges)
                 //.nodes(model[0])
                 //.links(dataset.edges)
                 .size([w, h])
                 .linkDistance(150)
                 .charge([-300])
                 .start();

      var colors = d3.scale.category20();


      var defs = svg.append("defs");
 
      var genMarker = defs.append("marker")
                          .attr("id","Generalization")
                          .attr("viewBox", "0 -5 10 10")
                          .attr("markerWidth",7)
                          .attr("markerHeight",7)
                          .attr("refX",10)
                          .attr("refY",0)
                          .attr("orient","auto") 
                          .append("svg:path") 
                          .attr("d", "M0,-5L10,0L0,5Z")
                          .attr("fill","#fff")
                          .attr("stroke","#ccc")
                          .attr("stroke-width",1.2); 

      var genMarker = defs.append("marker")
                          .attr("id","GeneralizationHover")
                          .attr("viewBox", "0 -5 10 10")
                          .attr("markerWidth",7)
                          .attr("markerHeight",7)
                          .attr("refX",10)
                          .attr("refY",0)
                          .attr("orient","auto") 
                          .append("svg:path") 
                          .attr("d", "M0,-5L10,0L0,5Z")
                          .attr("fill","#fff")
                          .attr("stroke","#444")
                          .attr("stroke-width",1.5);

      var aggreMarker = defs.append("marker")
                          .attr("id","Aggregation")
                          .attr("viewBox", "-10 -5 20 10")
                          .attr("markerWidth",12)
                          .attr("markerHeight",12)
                          .attr("refX",10)
                          .attr("refY",0)
                          .attr("orient","auto") 
                          .append("svg:path") 
                          .attr("d", "M0,-5L10,0L0,5L-10,0Z")
                          .attr("fill","#fff")
                          .attr("stroke","#ccc")
                          .attr("stroke-width",1.2);

      var aggreMarker = defs.append("marker")
                          .attr("id","AggregationHover")
                          .attr("viewBox", "-10 -5 20 10")
                          .attr("markerWidth",12)
                          .attr("markerHeight",12)
                          .attr("refX",10)
                          .attr("refY",0)
                          .attr("orient","auto") 
                          .append("svg:path") 
                          .attr("d", "M0,-5L10,0L0,5L-10,0Z")
                          .attr("fill","#fff")
                          .attr("stroke","#444")
                          .attr("stroke-width",1.5);


      var comMarker = defs.append("marker")
                          .attr("id","Composition")
                          .attr("viewBox", "-10 -5 20 10")
                          .attr("markerWidth",12)
                          .attr("markerHeight",12)
                          .attr("refX",10)
                          .attr("refY",0)
                          .attr("orient","auto")
                          .append("svg:path")  
                          .attr("d", "M0,-5L10,0L0,5L-10,0Z")
                          .attr("fill","#ccc")
                          .attr("stroke","ccc")
                          .attr("stroke-width",1.2);

      var comMarker = defs.append("marker")
                          .attr("id","CompositionHover")
                          .attr("viewBox", "-10 -5 20 10")
                          .attr("markerWidth",12)
                          .attr("markerHeight",12)
                          .attr("refX",10)
                          .attr("refY",0)
                          .attr("orient","auto")
                          .append("svg:path")  
                          .attr("d", "M0,-5L10,0L0,5L-10,0Z")
                          .attr("fill","#444")
                          .attr("stroke","000")
                          .attr("stroke-width",1.5);


      function zoomed() {
        d3.select(this)
        .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }


      var link = svg.selectAll(".link")  
                 .data(dataset.edges) 
                 //.data(model[1]) 
                 .enter().append("g")  
                 .attr("class", "link");
  
        var myline = link.append("line")
            .attr("class", function(d) { return "link " + d.type; })  
            .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1.5);


        function  radiusover (d){   
          if(!d.weight){//节点weight属性没有值初始化为1（一般就是叶子了）  
            d.weight = 1;  
          }                                                
            return d.weight * 3 + 5;     
           // return 6;                                
        }                                                                     

        function  radiuson (d){   
          if(!d.weight){//节点weight属性没有值初始化为1（一般就是叶子了）  
            d.weight = 1;  
          }                                                
            return d.weight * 3 + 10;    
            //return 6;                                
        }

          var node = svg.selectAll(".node")  
                         .data(dataset.nodes) 
                         //.data(model[0])
                         .enter().append("g")  
                         .attr("class", "node")
                         .call(force.drag);         

        var myname = node.append("text")  
            //.style("stroke", "#ccc")
            //.style("stroke-width", "0.5")
            .text(function(d) { return d.name; })
            .attr("stroke", "#ccc")
            .attr("stroke-width", 0.5);
        
        var tmpnode = null;

        svg.on("click", function(d){
            node.selectAll("circle")
                .attr("fill-opacity",0.5)
                .attr("stroke-width", 1);
            node.selectAll("text")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 0.5);
            link.selectAll("line")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 1.5)
                .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
            d3.select("#tooltip").classed("hidden",true);
            tmpnode = null;
        });

        
        var mycircle = 
        node.append("circle")  
            //.attr("r", 10)  
            .attr("r",function(d){  //设置圆点半径                        
                return radiusover (d);                            
             })
            .attr("stroke", function(d,i) {
                 return colors(i);
            })
            .attr("stroke-width", 1)
            .attr("fill", function(d,i) {
                 return colors(i);
                 //return "#ddd";
            })
            .attr("fill-opacity",0.5);

        mycircle.on("click",function(d){
                  d3.event.stopPropagation();
                  tmpnode = d;
                  d.show = true;
                  var r = radiusover(d);
                  //var x = d3.select(this).attr("cx");
                  var xPosition = parseFloat(d3.select(this).attr("cx")) + r;
                  var yPosition = parseFloat(d3.select(this).attr("cy")) - r;

                  var text = d.name;
                  //更新提示条的位置和值
                  d3.select("#tooltip")
                      //.attr("left", xPosition + "px")
                      //.attr("top", yPosition + "px")
                      .select("#classname")
                      .text(text);

                  d3.select("#attributes")
                      .remove();
                  d3.select("#tooltip")
                      .append("span")
                      .attr("id","attributes");

                  var attribute = "";
                  d.attribute.forEach(function(property){
                      var tmptext = property.name;
                      if(property.type !== undefined)
                        tmptext = tmptext + " : " + property.type;
                      d3.select("#attributes")
                          .append("p")
                          //.attr("style", "align:left, padding:10%")
                          .attr("style", "padding-left:5%")
                          .text(tmptext);
                      //attribute = attribute + property.name + "";
                      //attribute = attribute + "\n";
                      });
                  d3.select("#attributes")
                          .append("hr")
                          .attr("style","border-top:1px solid #444");
                  //d3.select("#attributes")
                    //  .text(attribute);

                  //显示提示条
                  d3.select("#tooltip").classed("hidden",false);

                  myline.attr("stroke",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return "#444";
                    }
                    else
                      return "#ccc";
                  });

                  myline.attr("stroke-width",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return 2;
                    }
                    else
                      return 1.5;
                  });

                  myline.attr("marker-end",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return "url(#" + edge.type + "Hover)";
                    }
                    else
                      return "url(#" + edge.type + ")";
                  });

                  mycircle.attr("fill-opacity", function(mynode){
                        if(mynode === d)
                          return 0.85;
                        else
                          return 0.5;
                  });

                  mycircle.attr("stroke-width", function(mynode){
                        if(mynode === d)
                          return 3;
                        else
                          return 1;
                  });

                  myname.attr("stroke", function(mytext){
                    if(mytext === d)
                      return "#444";
                    else
                      return "#ccc";
                  });

                  myname.attr("stroke-width", function(mytext){
                    if(mytext === d)
                      return 0.8;
                    else
                      return 0.5;
                  });
            })
            .on("mouseover", function(d)
              {

                  myline.attr("stroke",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return "#444";
                    }
                    else
                      return "#ccc";
                  });

                  myline.attr("stroke-width",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return 2;
                    }
                    else
                      return 1.5;
                  });

                  myline.attr("marker-end",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return "url(#" + edge.type + "Hover)";
                    }
                    else
                      return "url(#" + edge.type + ")";
                  });
                  mycircle.attr("fill-opacity", function(mynode){
                        if(mynode === d)
                          return 0.85;
                        else
                          return 0.5;
                  });

                  mycircle.attr("stroke-width", function(mynode){
                        if(mynode === d)
                          return 3;
                        else
                          return 1;
                  });

                  myname.attr("stroke", function(mytext){
                    if(mytext === d)
                      return "#444";
                    else
                      return "#ccc";
                  });

                  myname.attr("stroke-width", function(mytext){
                    if(mytext === d)
                      return 0.8;
                    else
                      return 0.5;
                  });

              })  
           .on("mouseout", function(d)
              {
                  //d.show = false;
                  //d3.select("#tooltip").classed("hidden",true);
                  myline.attr("stroke","#ccc")
                        .attr("stroke-width",1.5)
                        .attr("marker-end",function(d) { return "url(#" + d.type + ")"; });
                  node.selectAll("circle")
                      .attr("fill-opacity",0.5)
                      .attr("stroke-width", 1);
                  myname.attr("stroke", "#ccc")
                        .attr("stroke-width", 0.5);
                  if(tmpnode !== null)
                  {
                      var text = tmpnode.name;
                      //更新提示条的位置和值
                      d3.select("#tooltip")
                          //.attr("left", xPosition + "px")
                          //.attr("top", yPosition + "px")
                          .select("#classname")
                          .text(text);

                      d3.select("#attributes")
                          .remove();
                      d3.select("#tooltip")
                          .append("span")
                          .attr("id","attributes");

                      var attribute = "";
                      tmpnode.attribute.forEach(function(property){
                          var tmptext = property.name;
                          if(property.type !== undefined)
                            tmptext = tmptext + " : " + property.type;
                          d3.select("#attributes")
                              .append("p")
                              //.attr("style", "align:left, padding:10%")
                              .attr("style", "padding-left:5%")
                              .text(tmptext);
                          //attribute = attribute + property.name + "";
                          //attribute = attribute + "\n";
                          });
                      d3.select("#attributes")
                              .append("hr")
                              .attr("style","border-top:1px solid #444");
                      //d3.select("#attributes")
                        //  .text(attribute);

                      //显示提示条
                      d3.select("#tooltip").classed("hidden",false);

                      myline.attr("stroke",function(edge){
                        if( edge.source === tmpnode || edge.target === tmpnode ){
                          return "#444";
                        }
                        else
                          return "#ccc";
                      });

                      myline.attr("stroke-width",function(edge){
                        if( edge.source === tmpnode || edge.target === tmpnode ){
                          return 2;
                        }
                        else
                          return 1.5;
                      });

                      myline.attr("marker-end",function(edge){
                        if( edge.source === tmpnode || edge.target === tmpnode ){
                          return "url(#" + edge.type + "Hover)";
                        }
                        else
                          return "url(#" + edge.type + ")";
                      });
                      mycircle.attr("fill-opacity", function(mynode){
                        if(mynode === tmpnode)
                          return 0.85;
                        else
                          return 0.5;
                      });

                      mycircle.attr("stroke-width", function(mynode){
                        if(mynode === tmpnode)
                          return 3;
                        else
                          return 1;
                      });

                      myname.attr("stroke", function(mytext){
                        if(mytext === tmpnode)
                          return "#444";
                        else
                          return "#ccc";
                      });

                      myname.attr("stroke-width", function(mytext){
                        if(mytext === tmpnode)
                          return 0.8;
                        else
                          return 0.5;
                      });

                  }
                  else
                  {
                    d3.select("#tooltip").classed("hidden",true);
                  }

                    
              }); 
  
        


      //Every time the simulation "ticks", this will be called

      force.on("tick", function() {

      //restrict the boundary of nodes
        dataset.nodes.forEach(function (d, i) {
            var r = radiuson(d);
            d.x = d.x - r < 0 ? r : d.x;
            d.x = d.x + r > w ? w - r : d.x;
            d.y = d.y - r < 0 ? r : d.y;
            d.y = d.y + r * 2 > h ? h - r * 2 : d.y;
        });

        link.selectAll("line")
           .attr("x1", function(d) { 
              var dx = d.target.x - d.source.x,//增量  
                  dy = d.target.y - d.source.y,  
                  dr = Math.sqrt(dx * dx + dy * dy);
              var r = radiusover(d.source);
              var rx = r * dx / dr;
              return (d.source.x + rx);
           })
           .attr("y1", function(d) { 
              var dx = d.target.x - d.source.x,//增量  
                  dy = d.target.y - d.source.y,  
                  dr = Math.sqrt(dx * dx + dy * dy);
              var r = radiusover(d.source);
              var ry = r * dy / dr;
              return (d.source.y + ry);
           })
           .attr("x2", function(d) { 
              var dx = d.target.x - d.source.x,//增量  
                  dy = d.target.y - d.source.y,  
                  dr = Math.sqrt(dx * dx + dy * dy);
              var r = radiusover(d.target);
              var rx = r * dx / dr;
              return (d.target.x - rx); })
           .attr("y2", function(d) { 
              var dx = d.target.x - d.source.x,//增量  
                  dy = d.target.y - d.source.y,  
                  dr = Math.sqrt(dx * dx + dy * dy);
              var r = radiusover(d.target);
              var ry = r * dy / dr;
              return (d.target.y - ry); });
      
        node.selectAll("circle")
           .attr("cx", function(d) { return d.x; })
           .attr("cy", function(d) { return d.y; });

        link.selectAll("text")
           .attr("x", function(d) { return (d.source.x + d.target.x)/2; })
           .attr("y", function(d) { return (d.source.y + d.target.y)/2; });

        node.selectAll("text")
           .attr("x", function(d) { return d.x - radiusover(d) * 2; })
           .attr("y", function(d) { return d.y + radiusover(d) * 2; });
      });     

    }();

});