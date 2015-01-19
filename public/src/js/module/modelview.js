define(function (require, exports, module) {

    var d3 = require('../lib/d3.v3');

    // 用d3实现model可视化
    +function modelview() {

        var w = 500;
        var h = 400;

        var dataset = {
            nodes: [
                {
                    name: "Student",
                    property: [
                        {name: "StudentName"},
                        {name: "StudentID"},
                        {name: "Password"}
                    ]
                },
                {
                    name: "Course",
                    property: [
                        {name: "CourseName"},
                        {name: "CourseID"},
                        {name: "CourseCategory"},
                        {name: "Credit"},
                        {name: "Place"},
                        {name: "Time"},
                        {name: "Teacher"}
                    ]
                },
                {
                    name: "CourseList",
                    property: [
                        {name: "StudentID"},
                        {name: "CourseID"}
                    ]
                },
                {
                    name: "SelectedCourses",
                    property: [
                        {name: "Major"},
                        {name: "SpecialDate"},
                        {name: "Calendar"}
                    ]
                },
                {
                    name: "CourseChart",
                    property: [
                        {name: "CourseID"},
                        {name: "CourseName"},
                        {name: "Teacher"},
                        {name: "StudentType"},
                        {name: "CourseType"},
                        {name: "ClassNumber"}
                    ]
                },
                {
                    name: "CourseManager",
                    property: [
                        {name: "ManagerName"},
                        {name: "WorkID"},
                        {name: "Password"}
                    ]
                }
            ],
            edges: [
                {source: 0, target: 1},
                {source: 0, target: 2},
                {source: 0, target: 3},
                {source: 1, target: 3},
                {source: 2, target: 3},
                {source: 2, target: 5},
                {source: 3, target: 5},
                {source: 4, target: 5}
            ]
        };

        var svg = d3.select("#stigmod-d3view-left").append("svg")
                .attr("width", w)
                .attr("height", h);

        //Initialize a default force layout, using the nodes and edges in dataset
        var force = d3.layout.force()
                .nodes(dataset.nodes)
                .links(dataset.edges)
                .size([w, h])
                .linkDistance(100)
                .charge([-400])
                .start();

        var colors = d3.scale.category10();

        var link = svg.selectAll(".link")
                .data(dataset.edges)
                .enter().append("g")
                .attr("class", "link");

        link.append("line")
                .style("stroke", "#ccc")
                .style("stroke-width", 1);

        /*link.append("text")
         .attr("dy", ".35em") // vertical-align: middle 标签垂直居中
         .attr("text-anchor", "middle")
         .text("0");*/
        //.text(function(d) { return d.name; });

        function radiusover(d) {
            if (!d.weight) {//节点weight属性没有值初始化为1（一般就是叶子了）
                d.weight = 1;
            }
            return d.weight * 3 + 5;
        }

        function radiuson(d) {
            if (!d.weight) {//节点weight属性没有值初始化为1（一般就是叶子了）
                d.weight = 1;
            }
            return d.weight * 3 + 10;
        }

        var node = svg.selectAll(".node")
                .data(dataset.nodes)
                .enter().append("g")
                .attr("class", "node")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", function (d) {
                    d3.select(".property")
                            .remove();
                    d3.select("#stigmod-d3view-right")
                            .append("div")
                            .attr("class", "property");
                    d3.select(".property")
                            .append("br");
                    d3.select(".property")
                            .append("p")
                            .attr("style", "padding-left:10%;font-weight:bold")
                            .text("Class:");
                    d3.select(".property")
                            .append("p")
                            .attr("style", "padding-left:20%")
                            .text(d.name);
                    d3.select(".property")
                            .append("br");
                    d3.select(".property")
                            .append("p")
                            .attr("style", "padding-left:10%;font-weight:bold")
                            .text("Properties:");
                    d.property.forEach(function (property) {
                        d3.select(".property")
                                .append("p")
                                .attr("style", "padding-left:20%")
                                .text(property.name);
                    });
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
                     });*/
                })
                .call(force.drag);

        node.append("circle")
            //.attr("r", 10)
                .attr("r", function (d) {  //设置圆点半径
                    return radiusover(d);
                })
                .style("fill", function (d, i) {
                    return colors(i);
                });

        node.append("title")
                .text(function (d) {
                    return d.name;
                });

        node.append("text")
                .text(function (d) {
                    return d.name;
                });

        //Every time the simulation "ticks", this will be called

        force.on("tick", function () {

            link.selectAll("line")
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

            node.selectAll("circle")
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });

            link.selectAll("text")
                    .attr("x", function (d) {
                        return (d.source.x + d.target.x) / 2;
                    })
                    .attr("y", function (d) {
                        return (d.source.y + d.target.y) / 2;
                    });

            node.selectAll("text")
                    .attr("x", function (d) {
                        return d.x + 17;
                    })
                    .attr("y", function (d) {
                        return d.y + 5;
                    });
        });

        function mouseover() {
            d3.select(this).select("circle").transition()
                    .duration(500)
                    .ease("bounce")
                //.attr("r", 15)
                    .attr("r", function (d) {  //设置圆点半径
                        return radiuson(d);
                    })
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", 2.5);
            /*d3.select(this)
             .append("text")
             .transition()
             .duration(100)
             .text(function(d) { return d.name; });*/
        }

        function mouseout() {
            d3.select(this).select("circle").transition()
                    .duration(500)
                //.attr("r", 10)
                    .attr("r", function (d) {  //设置圆点半径
                        return radiusover(d);
                    })
                    .attr("stroke-width", 0);
            /*d3.select(this)
             .select("text")
             .remove();*/
        }

    }();

});