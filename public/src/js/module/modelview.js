define(function (require, exports, module) {

    var d3 = require('../lib/d3.v3');

    // 用d3实现model可视化
    +function modelview() {

      var w = 600;
      var h = 400;

      var dataset = {
        nodes: [
          { name: "Student" , 
            property: [
              { name: "- StudentName:String"},
              { name: "- StudentID:int"},
              { name: "- Password:String"}
            ]
          },
          { name: "Course" ,
            property: [
              { name: "- CourseName:String"},
              { name: "- CourseID:int"},
              { name: "- CourseCategory:String"},
              { name: "- Credit:int"},
              { name: "- Place:String"},
              { name: "- Time:Time"},
              { name: "- Teacher:Teacher"}
            ]
          },
          { name: "CourseList" ,
            property: [
              { name: "- StudentID:int"},
              { name: "- CourseID:int"}
            ]
          },
          { name: "SelectedCourses" ,
            property: [
              { name: "- Major:String"},
              { name: "- SpecialDate:Date"},
              { name: "- Calendar:Date"}
            ]
          },
          { name: "CourseChart" ,
            property: [
              { name: "- CourseID:int"},
              { name: "- CourseName:String"},
              { name: "- Teacher:Teacher"},
              { name: "- StudentType:String"},
              { name: "- CourseType:String"},
              { name: "- ClassNumber:int"}
            ]
          },
          { name: "CourseManager" ,
            property: [
              { name: "- ManagerName:String"},
              { name: "- WorkID:int"},
              { name: "- Password:String"}
            ]
          }
        ],
        edges: [
          { source: 0, target: 1, type: "association", smulti: "0..1", tmulti: "1..*" },
          { source: 0, target: 2, type: "generalization", smulti: " ", tmulti: " " },
          { source: 0, target: 3, type: "composition", smulti: " ", tmulti: " " },
          { source: 1, target: 3, type: "association", smulti: "1", tmulti: "0..*" },
          { source: 2, target: 3, type: "generalization", smulti: " ", tmulti: " " },
          { source: 2, target: 5, type: "aggregation", smulti: " ", tmulti: " " },
          { source: 3, target: 5, type: "association", smulti: "*", tmulti: "1" },
          { source: 4, target: 5, type: "generalization", smulti: " ", tmulti: " " }
        ]
      };

      var svg = d3.select(".col-xs-7").append("svg")
            .attr("width", w)  
            .attr("height", h);
            //.attr("stroke", "#ccc")
            //.attr("stroke-width", 2); 


      
      //Initialize a default force layout, using the nodes and edges in dataset
      var force = d3.layout.force()
                 .nodes(dataset.nodes)
                 .links(dataset.edges)
                 .size([w, h])
                 .linkDistance(150)
                 .charge([-350])
                 .start();

      var colors = d3.scale.category10();

      var defs = svg.append("defs");
 
      var genMarker = defs.append("marker")
                          .attr("id","generalization")
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
                          .attr("id","generalizationHover")
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
                          .attr("id","aggregation")
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
                          .attr("id","aggregationHover")
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
                          .attr("id","composition")
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
                          .attr("id","compositionHover")
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


      var link = svg.selectAll(".link")  
                 .data(dataset.edges)  
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
                  d.property.forEach(function(property){
                      d3.select("#attributes")
                          .append("p")
                          //.attr("style", "align:left, padding:10%")
                          .attr("style", "padding-left:5%")
                          .text(property.name);
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
/*
                  mycircle.attr("stroke", function(mynode){
                        if(mynode === d)
                          return "#444";
                        else
                          return "none";
                  });
*/
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
                /*
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
                  d.property.forEach(function(property){
                      d3.select("#attributes")
                          .append("p")
                          //.attr("style", "align:left, padding:10%")
                          .attr("style", "padding-left:5%")
                          .text(property.name);
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
*/

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
                  /*

                  mycircle.attr("stroke", function(mynode){
                        if(mynode === d)
                          return "#444";
                        else
                          return "none";
                  });
*/
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
                      tmpnode.property.forEach(function(property){
                          d3.select("#attributes")
                              .append("p")
                              //.attr("style", "align:left, padding:10%")
                              .attr("style", "padding-left:5%")
                              .text(property.name);
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
/*
                      mycircle.attr("stroke", function(mynode){
                        if(mynode === tmpnode)
                          return "#444";
                        else
                          return "none";
                      });
*/
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
            d.y = d.y + r > h ? h - r : d.y;
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