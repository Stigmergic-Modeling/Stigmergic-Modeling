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
              { name: "StudentName"},
              { name: "StudentID"},
              { name: "Password"}
            ]
          },
          { name: "Course" ,
            property: [
              { name: "CourseName"},
              { name: "CourseID"},
              { name: "CourseCategory"},
              { name: "Credit"},
              { name: "Place"},
              { name: "Time"},
              { name: "Teacher"}
            ]
          },
          { name: "CourseList" ,
            property: [
              { name: "StudentID"},
              { name: "CourseID"}
            ]
          },
          { name: "SelectedCourses" ,
            property: [
              { name: "Major"},
              { name: "SpecialDate"},
              { name: "Calendar"}
            ]
          },
          { name: "CourseChart" ,
            property: [
              { name: "CourseID"},
              { name: "CourseName"},
              { name: "Teacher"},
              { name: "StudentType"},
              { name: "CourseType"},
              { name: "ClassNumber"}
            ]
          },
          { name: "CourseManager" ,
            property: [
              { name: "ManagerName"},
              { name: "WorkID"},
              { name: "Password"}
            ]
          }
        ],
        edges: [
          { source: 0, target: 1, type: "association", smulti: "0..1", tmulti: "1..*" },
          { source: 0, target: 2, type: "generalization", smulti: " ", tmulti: " " },
          { source: 0, target: 3, type: "dependency", smulti: " ", tmulti: " " },
          { source: 1, target: 3, type: "association", smulti: "1", tmulti: "0..*" },
          { source: 2, target: 3, type: "generalization", smulti: " ", tmulti: " " },
          { source: 2, target: 5, type: "dependency", smulti: " ", tmulti: " " },
          { source: 3, target: 5, type: "association", smulti: "*", tmulti: "1" },
          { source: 4, target: 5, type: "generalization", smulti: " ", tmulti: " " }
        ]
      };

      var svg = d3.select(".col-xs-7").append("svg")
            .attr("width", w)  
            .attr("height", h);
            //.attr("stroke", "#ccc")
            //.attr("stroke-width", 2.5); 


      
      //Initialize a default force layout, using the nodes and edges in dataset
      var force = d3.layout.force()
                 .nodes(dataset.nodes)
                 .links(dataset.edges)
                 .size([w, h])
                 .linkDistance(150)
                 .charge([-350])
                 .start();

      var colors = d3.scale.category10();

      svg.append("svg:defs").selectAll("marker")  
        .data(["generalization", "association", "dependency"])  
        .enter().append("svg:marker")  
        .attr("id", String)  
        .attr("viewBox", "0 -5 10 10")  
        .attr("refX", 15)  
        .attr("refY", -1.5)  
        .attr("markerWidth", 6)  
        .attr("markerHeight", 6)  
        .attr("orient", "auto")
        //.attr("stroke", "#ccc")  
        .append("svg:path")  
        .attr("d", "M0,-5L10,0L0,5");
  

      var link = svg.selectAll(".link")  
                 .data(dataset.edges)  
                 .enter().append("g")  
                 .attr("class", "link")
                  .on("mouseover", mouseoverlink)  
                  //.on("mouseout", mouseoutlink) 
                  .on("click", function(d){
                      d3.select(".property")
                        .remove();
                      d3.select(".col-xs-4")
                        .append("div")
                        .attr("class","property");
                      d3.select(".property")
                        .append("br");
                      d3.select(".property")
                        .append("p")
                        .attr("style","padding-left:10%;font-weight:bold")
                        .text("Relationship:");
                      d3.select(".property")
                        .append("p")
                        .attr("style","padding-left:10%")
                        .text(d.source.name + "[" + d.smulti + "]"
                          + "--" + d.type + "--" 
                          + "[" + d.tmulti + "]" + d.target.name);});
  
        var myline = link.append("line")
            .attr("class", function(d) { return "link " + d.type; })  
            .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

          /*link.append("text")
            .attr("dy", ".35em") // vertical-align: middle 标签垂直居中
        .attr("text-anchor", "middle") 
        .text("0");*/
            //.text(function(d) { return d.name; });

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
                         
                         /*.on("click", function(d){
                            d3.select(".property")
                            .remove();
                            d3.select(".col-xs-4")
                              .append("div")
                              .attr("class","property");
                            d3.select(".property")
                              .append("br");
                            d3.select(".property")
                              .append("p")
                              .attr("style","padding-left:10%;font-weight:bold")
                              .text("Class:");
                            d3.select(".property")
                              .append("p")
                              .attr("style","padding-left:20%")
                              .text(d.name);
                            d3.select(".property")
                              .append("br");
                            d3.select(".property")
                              .append("p")
                              .attr("style","padding-left:10%;font-weight:bold")
                              .text("Attributes:");
                            d.property.forEach(function(property){
                              d3.select(".property")
                                .append("p")
                                .attr("style","padding-left:20%")
                                .text(property.name);
                              });*/
              /*d3.select(".property")
                .append("table")
                .attr("class", "details")
                .attr("align", "center")
                .attr("border","1");
              d3.select(".details")
                .append("tr")
                .attr("style","text-align:center;font-weight:bold")
                .text(d.name);
              d.property.forEach(function(property){
                    d3.select(".details")
                      .append("tr")
                      .text(property.name);
                    });
              }) */
                .call(force.drag);
  
        node.append("circle")  
            //.attr("r", 10)  
            .attr("r",function(d){  //设置圆点半径                        
                return radiusover (d);                            
             })
            .style("fill", function(d,i) {
                 return colors(i);
            })
            .on("mouseover", function(d)
              {
                  d.show = true;
                  var r = radiuson(d);
                  //var x = d3.select(this).attr("cx");
                  var xPosition = parseFloat(d3.select(this).attr("cx")) + r;
                  var yPosition = parseFloat(d3.select(this).attr("cy")) - r;

                  var text = d.name;
                  //更新提示条的位置和值
                  d3.select("#tooltip")
                      .attr("left", xPosition + "px")
                      .attr("top", yPosition + "px")
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
                  //d3.select("#attributes")
                    //  .text(attribute);

                  //显示提示条
                  d3.select("#tooltip").classed("hidden",false);
/*
                  myline.attr("fill",function(edge){
                    if( edge.source === d || edge.target === d ){
                      return "#000";
                    }
                  });*/



              })  
           .on("mouseout", function(d)
              {
                  d.show = false;
                  d3.select("#tooltip").classed("hidden",true);
              });
        node.append("title")
            .text(function(d) { return d.name; });  
  
        node.append("text")  
            //.style("stroke", "#ccc")
            //.style("stroke-width", "0.5")
            .text(function(d) { return d.name; });
            


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
           .attr("x1", function(d) { return d.source.x; })
           .attr("y1", function(d) { return d.source.y; })
           .attr("x2", function(d) { 
              var dx = d.target.x - d.source.x,//增量  
                  dy = d.target.y - d.source.y,  
                  dr = Math.sqrt(dx * dx + dy * dy);
              var r = radiusover(d);
              var rx = r * dx / dr;
              return (d.target.x - rx); })
           .attr("y2", function(d) { 
              var dx = d.target.x - d.source.x,//增量  
                  dy = d.target.y - d.source.y,  
                  dr = Math.sqrt(dx * dx + dy * dy);
              var r = radiusover(d);
              var ry = r * dy / dr;
              return (d.target.y - ry); })
           .attr("stroke", function (d) {
                if (d.source.show || d.target.show)
                    return "#000";
                else
                    return "#ccc";
            })
            .attr("stroke-width", function (d) {
                if (d.source.show || d.target.show)
                    return 2;
                else
                    return 1.5;
            });
      
        node.selectAll("circle")
           .attr("cx", function(d) { return d.x; })
           .attr("cy", function(d) { return d.y; })
           .attr("stroke", function(d)
            {
              if(d.show)
                return "#000";
              else
                return "none"
            })
           .attr("stroke-width", function(d)
            {
              if(d.show)
                return 2;
              else
                return 1;
            });

        link.selectAll("text")
           .attr("x", function(d) { return (d.source.x + d.target.x)/2; })
           .attr("y", function(d) { return (d.source.y + d.target.y)/2; });

        node.selectAll("text")
           .attr("x", function(d) { return d.x - radiusover(d) * 2; })
           .attr("y", function(d) { return d.y + radiusover(d) * 2; })
           .attr("stroke", function(d)
            {
              if(d.show)
                return "#000";
              else
                return "#ccc";
            })
           .attr("stroke-width", function(d)
            {
              if(d.show)
                return 1;
              else
                return 0.5;
            });
      });

      function mouseover() {  
          
         // d.show = true;

          d3.select(this).select("circle").transition()  
              .duration(500)
              .ease("bounce")
              //.attr("r", 15)
              .attr("r",function(r){  //设置圆点半径                        
                 return radiuson (r);                            
                })
              .attr("stroke", "#ccc")
              .attr("stroke-width", 2.5);
            /*d3.select(this)
              .append("text")
              .transition()  
              .duration(100)
              .text(function(d) { return d.name; });*/
      }  
      function mouseoverlink() {  
          d3.select(this).select("line").transition()  
              .duration(500)
              .ease("bounce")
              .attr("stroke", "#ccc")
              .attr("stroke-width", 2.5);
      }
  
      function mouseout() {  
          d3.select(this).select("circle").transition()  
              .duration(500)  
              //.attr("r", 10)
              .attr("r",function(d){  //设置圆点半径                        
              return radiusover (d);                            
          })
              .attr("stroke-width", 0);
            /*d3.select(this)
              .select("text")
              .remove();*/
            }

    }();

});