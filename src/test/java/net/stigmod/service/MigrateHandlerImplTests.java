/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.node.*;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.domain.relationship.RelationToCEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;
import net.stigmod.service.migrateService.MigrateHandlerImpl;
import org.junit.Test;

import java.util.HashSet;
import java.util.*;

/**
 * @author Kai Fu
 * @version 2015/12/28
 */


public class MigrateHandlerImplTests {

    List<ClassNode> cLassNodeList=new ArrayList<>();
    List<RelationNode> relationNodeList=new ArrayList<>();
    List<ValueNode> valueNodeList=new ArrayList<>();
    List<ClassToValueEdge> ctvEdgeList=new ArrayList<>();
    List<RelationToCEdge> rtcEdgeList=new ArrayList<>();
    List<RelationToValueEdge> rtvEdgeList=new ArrayList<>();


    ClassNode studentCNode = new ClassNode();
    ClassNode teacherCNode = new ClassNode();
    ClassNode teacher2CNode = new ClassNode();
    ClassNode genderCNode = new ClassNode();
    ClassNode intCNode = new ClassNode();

    RelationNode stu_teaRNode = new RelationNode();
    RelationNode stu_tea2RNode = new RelationNode();
    RelationNode tea_genRNode = new RelationNode();
    RelationNode stu_genRNode = new RelationNode();
    RelationNode tea_intRNode = new RelationNode();
    RelationNode stu_intRNode = new RelationNode();

    ValueNode stuVNode = new ValueNode();
    ValueNode teaVNode = new ValueNode();
    ValueNode genVNode = new ValueNode();
    ValueNode intVNode = new ValueNode();

    RelationToCEdge rtcEdge;
    RelationToCEdge rtcEdge2;
    RelationToCEdge rtcEdge3;
    RelationToCEdge rtcEdge4;
    RelationToValueEdge rtvEdge;
    RelationToValueEdge rtvEdge2;
    RelationToValueEdge rtvEdge3;
    RelationToValueEdge rtvEdge4;
    ClassToValueEdge ctvEdge;
    ClassToValueEdge ctvEdge2;
    ClassToValueEdge ctvEdge3;

    private void cNodeInit() {
        Set<Long> s1=new HashSet<>();
        s1.add(1l);
        s1.add(2l);
        s1.add(3l);
        s1.add(4l);
        studentCNode.setIcmSet(s1);
        studentCNode.setModelId(0l);
        studentCNode.setId(1l);

        Set<Long> s2=new HashSet<>();
        s2.add(1l);
        s2.add(2l);
        s2.add(3l);
        teacherCNode.setIcmSet(s2);
        teacherCNode.setModelId(0l);
        teacherCNode.setId(2l);

        Set<Long> s5=new HashSet<>();
        s5.add(4l);
        teacher2CNode.setIcmSet(s5);
        teacher2CNode.setModelId(0l);
        teacher2CNode.setId(3l);

        Set<Long> s3=new HashSet<>();
        s3.add(1l);
        s3.add(2l);
        s3.add(3l);
        genderCNode.setIcmSet(s3);
        genderCNode.setModelId(0l);

        Set<Long> s4=new HashSet<>();
        s4.add(1l);
        s4.add(2l);
        s4.add(3l);
        intCNode.setIcmSet(s4);
        intCNode.setModelId(0l);
    }

    private void edgeInit() {
        Set<Long> s1=new HashSet<>();
        s1.add(1l);
        s1.add(2l);
        s1.add(3l);

        Set<Long> s2=new HashSet<>();
        s2.add(4l);

        rtcEdge = new RelationToCEdge("e0","class",stu_teaRNode,studentCNode);
        stu_teaRNode.getRtcEdges().add(rtcEdge);
        studentCNode.getRtcEdges().add(rtcEdge);
        rtcEdge2 = new RelationToCEdge("e1","class",stu_teaRNode,teacherCNode);
        stu_teaRNode.getRtcEdges().add(rtcEdge2);
        teacherCNode.getRtcEdges().add(rtcEdge2);
        rtcEdge.setIcmList(new HashSet<Long>(s1));
        rtcEdge2.setIcmList(new HashSet<Long>(s1));

        rtcEdge3 = new RelationToCEdge("e0","class",stu_tea2RNode,studentCNode);
        stu_tea2RNode.getRtcEdges().add(rtcEdge3);
        studentCNode.getRtcEdges().add(rtcEdge3);
        rtcEdge4 = new RelationToCEdge("e1","class",stu_tea2RNode,teacher2CNode);
        stu_tea2RNode.getRtcEdges().add(rtcEdge4);
        teacher2CNode.getRtcEdges().add(rtcEdge4);
        rtcEdge3.setIcmList(new HashSet<Long>(s2));
        rtcEdge4.setIcmList(new HashSet<Long>(s2));

        rtvEdge = new RelationToValueEdge("e0","role",stu_teaRNode,stuVNode);
        rtvEdge2 = new RelationToValueEdge("e1","role",stu_teaRNode,teaVNode);
        stu_teaRNode.getRtvEdges().add(rtvEdge);
        stu_teaRNode.getRtvEdges().add(rtvEdge2);
        stuVNode.getRtvEdges().add(rtvEdge);
        teaVNode.getRtvEdges().add(rtvEdge2);
        rtvEdge.setIcmList(new HashSet<Long>(s1));
        rtvEdge2.setIcmList(new HashSet<Long>(s1));

        rtvEdge3 = new RelationToValueEdge("e0","role",stu_tea2RNode,stuVNode);
        rtvEdge4 = new RelationToValueEdge("e1","role",stu_tea2RNode,teaVNode);
        stu_tea2RNode.getRtvEdges().add(rtvEdge3);
        stu_tea2RNode.getRtvEdges().add(rtvEdge4);
        stuVNode.getRtvEdges().add(rtvEdge3);
        teaVNode.getRtvEdges().add(rtvEdge4);
        rtvEdge3.setIcmList(new HashSet<Long>(s2));
        rtvEdge4.setIcmList(new HashSet<Long>(s2));

        ctvEdge = new ClassToValueEdge("name",studentCNode,stuVNode);
        studentCNode.getCtvEdges().add(ctvEdge);
        stuVNode.getCtvEdges().add(ctvEdge);
        ctvEdge.setIcmList(new HashSet<Long>(s1));
        ctvEdge.getIcmList().add(4l);
        ctvEdge2 = new ClassToValueEdge("name",teacherCNode,teaVNode);
        teacherCNode.getCtvEdges().add(ctvEdge2);
        teaVNode.getCtvEdges().add(ctvEdge2);
        ctvEdge2.setIcmList(new HashSet<Long>(s1));
        ctvEdge3 = new ClassToValueEdge("name",teacher2CNode,teaVNode);
        teacher2CNode.getCtvEdges().add(ctvEdge3);
        teaVNode.getCtvEdges().add(ctvEdge3);
        ctvEdge3.setIcmList(new HashSet<Long>(s2));
    }

    private void rNodeInit() {
        Set<Long> s1=new HashSet<>();
        s1.add(1l);
        s1.add(2l);
        s1.add(3l);
        stu_teaRNode.setIcmSet(s1);
        stu_teaRNode.setModelId(0l);
        stu_teaRNode.setId(4l);

        Set<Long> s6=new HashSet<>();
        s6.add(4l);
        stu_tea2RNode.setIcmSet(s6);
        stu_tea2RNode.setModelId(0l);
        stu_tea2RNode.setId(5l);

        Set<Long> s2=new HashSet<>();
        s2.add(1l);
        s2.add(2l);
        s2.add(3l);
        stu_genRNode.setIcmSet(s2);
        stu_genRNode.setModelId(0l);

        Set<Long> s3=new HashSet<>();
        s3.add(1l);
        s3.add(2l);
        s3.add(3l);
        stu_intRNode.setIcmSet(s3);
        stu_intRNode.setModelId(0l);

        Set<Long> s4=new HashSet<>();
        s4.add(1l);
        s4.add(2l);
        s4.add(3l);
        tea_genRNode.setIcmSet(s4);
        tea_genRNode.setModelId(0l);

        Set<Long> s5=new HashSet<>();
        s5.add(1l);
        s5.add(2l);
        s5.add(3l);
        tea_intRNode.setIcmSet(s5);
        tea_intRNode.setModelId(0l);
    }

    private void vNodeInit() {
        Set<Long> s1=new HashSet<>();
        s1.add(1l);
        s1.add(2l);
        s1.add(3l);
        stuVNode.setIcmSet(s1);
        stuVNode.setName("Student");
        stuVNode.setModelId(0l);
        stuVNode.setId(6l);

        Set<Long> s2=new HashSet<>();
        s2.add(1l);
        s2.add(2l);
        s2.add(3l);
        teaVNode.setIcmSet(s2);
        teaVNode.setName("Teacher");
        teaVNode.setModelId(0l);
        teaVNode.setId(7l);

        Set<Long> s3=new HashSet<>();
        s3.add(1l);
        s3.add(2l);
        s3.add(3l);
        genVNode.setIcmSet(s3);
        genVNode.setName("Gender");
        genVNode.setModelId(0l);

        Set<Long> s4=new HashSet<>();
        s4.add(1l);
        s4.add(2l);
        s4.add(3l);
        intVNode.setIcmSet(s4);
        intVNode.setName("Integer");
        intVNode.setModelId(0l);
    }

    private void initTest() {
        cNodeInit();
        rNodeInit();
        vNodeInit();
        edgeInit();
        cLassNodeList.add(studentCNode);
        cLassNodeList.add(teacherCNode);
        cLassNodeList.add(teacher2CNode);

        relationNodeList.add(stu_teaRNode);
        relationNodeList.add(stu_tea2RNode);

        valueNodeList.add(stuVNode);
        valueNodeList.add(teaVNode);

        rtcEdgeList.add(rtcEdge);
        rtcEdgeList.add(rtcEdge2);
        rtcEdgeList.add(rtcEdge3);
        rtcEdgeList.add(rtcEdge4);

        rtvEdgeList.add(rtvEdge);
        rtvEdgeList.add(rtvEdge2);
        rtvEdgeList.add(rtvEdge3);
        rtvEdgeList.add(rtvEdge4);

        ctvEdgeList.add(ctvEdge);
        ctvEdgeList.add(ctvEdge2);
        ctvEdgeList.add(ctvEdge3);


    }

    @Test
    public void testMigrate() {
        initTest();
        MigrateHandlerImpl migrateHandler=new MigrateHandlerImpl();
        migrateHandler.migrateInitForTest(cLassNodeList,relationNodeList,valueNodeList);
        migrateHandler.migrateHandler(0l);
    }
}
