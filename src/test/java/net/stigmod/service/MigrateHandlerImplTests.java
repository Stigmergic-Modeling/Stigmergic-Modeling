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
import net.stigmod.service.migrateService.EntropyHandler;
import net.stigmod.service.migrateService.EntropyHandlerImpl;
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

    long c=0;
    int PersonNum=10;

    private void cNodeInit() {

        for(long t=0;t<PersonNum;t++) {
            for(int i=0;i<6;i++) {
                c++;
                Set<Long> s1=new HashSet<>();
                s1.add(t);
//                ClassNode cNode = cLassNodeList.get(6*(int)t+i);
                ClassNode cNode = new ClassNode();
                cNode.setIcmSet(s1);
                cNode.setModelId(0l);
                cNode.setId(c);
                cLassNodeList.add(cNode);
            }
        }
    }

    private void edgeInit() {
        for(long i=0;i<PersonNum;i++) {
            c++;

            Set<Long> s1=new HashSet<>();
            s1.add(i);

            RelationToCEdge rtcEdge1 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7),cLassNodeList.get((int)i*6));
            rtcEdge1.setIcmList(new HashSet<Long>(s1));
            rtcEdge1.setId(c);
            relationNodeList.get((int)i*7).getRtcEdges().add(rtcEdge1);
            cLassNodeList.get((int)i*6).getRtcEdges().add(rtcEdge1);

            c++;
            RelationToValueEdge rtvEdge1 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7),valueNodeList.get(4));
            rtvEdge1.setIcmList(new HashSet<Long>(s1));
            rtvEdge1.setId(c);
            relationNodeList.get((int)i*7).getRtvEdges().add(rtvEdge1);
            valueNodeList.get(4).getRtvEdges().add(rtvEdge1);

            c++;
            RelationToCEdge rtcEdge2 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7),cLassNodeList.get((int)i*6+1));
            rtcEdge2.setIcmList(new HashSet<Long>(s1));
            rtcEdge2.setId(c);
            relationNodeList.get((int)i*7).getRtcEdges().add(rtcEdge2);
            cLassNodeList.get((int)i*6+1).getRtcEdges().add(rtcEdge2);

            c++;
            RelationToValueEdge rtvEdge2 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7),valueNodeList.get(5));
            rtvEdge2.setIcmList(new HashSet<Long>(s1));
            rtvEdge2.setId(c);
            relationNodeList.get((int)i*7).getRtvEdges().add(rtvEdge2);
            valueNodeList.get(5).getRtvEdges().add(rtvEdge2);

            //
            c++;
            RelationToCEdge rtcEdge3 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7+1),cLassNodeList.get((int)i*6));
            rtcEdge3.setIcmList(new HashSet<Long>(s1));
            rtcEdge3.setId(c++);
            relationNodeList.get((int)i*7+1).getRtcEdges().add(rtcEdge3);
            cLassNodeList.get((int)i*6).getRtcEdges().add(rtcEdge3);

            RelationToValueEdge rtvEdge3 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7+1),valueNodeList.get(4));
            rtvEdge3.setIcmList(new HashSet<Long>(s1));
            rtvEdge3.setId(c++);
            relationNodeList.get((int)i*7+1).getRtvEdges().add(rtvEdge3);
            valueNodeList.get(4).getRtvEdges().add(rtvEdge3);

            RelationToCEdge rtcEdge4 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7+1),cLassNodeList.get((int)i*6+4));
            rtcEdge4.setIcmList(new HashSet<Long>(s1));
            rtcEdge4.setId(c++);
            relationNodeList.get((int)i*7+1).getRtcEdges().add(rtcEdge4);
            cLassNodeList.get((int)i*6+4).getRtcEdges().add(rtcEdge4);

            RelationToValueEdge rtvEdge4 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7+1),valueNodeList.get(6));
            rtvEdge4.setIcmList(new HashSet<Long>(s1));
            rtvEdge4.setId(c++);
            relationNodeList.get((int)i*7+1).getRtvEdges().add(rtvEdge4);
            valueNodeList.get(6).getRtvEdges().add(rtvEdge4);

            //
            RelationToCEdge rtcEdge5 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7+2),cLassNodeList.get((int)i*6+1));
            rtcEdge5.setIcmList(new HashSet<Long>(s1));
            rtcEdge5.setId(c++);
            relationNodeList.get((int)i*7+2).getRtcEdges().add(rtcEdge5);
            cLassNodeList.get((int)i*6+1).getRtcEdges().add(rtcEdge5);

            RelationToValueEdge rtvEdge5 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7+2),valueNodeList.get(5));
            rtvEdge5.setIcmList(new HashSet<Long>(s1));
            rtvEdge5.setId(c++);
            relationNodeList.get((int)i*7+2).getRtvEdges().add(rtvEdge5);
            valueNodeList.get(5).getRtvEdges().add(rtvEdge5);

            RelationToCEdge rtcEdge6 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7+2),cLassNodeList.get((int)i*6+4));
            rtcEdge6.setIcmList(new HashSet<Long>(s1));
            rtcEdge6.setId(c++);
            relationNodeList.get((int)i*7+2).getRtcEdges().add(rtcEdge6);
            cLassNodeList.get((int)i*6+4).getRtcEdges().add(rtcEdge6);

            RelationToValueEdge rtvEdge6 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7+2),valueNodeList.get(6));
            rtvEdge6.setIcmList(new HashSet<Long>(s1));
            rtvEdge6.setId(c++);
            relationNodeList.get((int)i*7+2).getRtvEdges().add(rtvEdge6);
            valueNodeList.get(6).getRtvEdges().add(rtvEdge6);

            //
            RelationToCEdge rtcEdge7 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7+3),cLassNodeList.get((int)i*6));
            rtcEdge7.setIcmList(new HashSet<Long>(s1));
            rtcEdge7.setId(c++);
            relationNodeList.get((int)i*7+3).getRtcEdges().add(rtcEdge7);
            cLassNodeList.get((int)i*6).getRtcEdges().add(rtcEdge7);

            RelationToValueEdge rtvEdge7 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7+3),valueNodeList.get(4));
            rtvEdge7.setIcmList(new HashSet<Long>(s1));
            rtvEdge7.setId(c++);
            relationNodeList.get((int)i*7+3).getRtvEdges().add(rtvEdge7);
            valueNodeList.get(4).getRtvEdges().add(rtvEdge7);

            RelationToCEdge rtcEdge8 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7+3),cLassNodeList.get((int)i*6+5));
            rtcEdge8.setIcmList(new HashSet<Long>(s1));
            rtcEdge8.setId(c++);
            relationNodeList.get((int)i*7+3).getRtcEdges().add(rtcEdge8);
            cLassNodeList.get((int)i*6+5).getRtcEdges().add(rtcEdge8);

            RelationToValueEdge rtvEdge8 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7+3),valueNodeList.get(11));
            rtvEdge8.setIcmList(new HashSet<Long>(s1));
            rtvEdge8.setId(c++);
            relationNodeList.get((int)i*7+3).getRtvEdges().add(rtvEdge8);
            valueNodeList.get(11).getRtvEdges().add(rtvEdge8);

            //
            RelationToCEdge rtcEdge9 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7+4),cLassNodeList.get((int)i*6+1));
            rtcEdge9.setIcmList(new HashSet<Long>(s1));
            rtcEdge9.setId(c++);
            relationNodeList.get((int)i*7+4).getRtcEdges().add(rtcEdge9);
            cLassNodeList.get((int)i*6+1).getRtcEdges().add(rtcEdge9);

            RelationToValueEdge rtvEdge9 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7+4),valueNodeList.get(5));
            rtvEdge9.setIcmList(new HashSet<Long>(s1));
            rtvEdge9.setId(c++);
            relationNodeList.get((int)i*7+4).getRtvEdges().add(rtvEdge9);
            valueNodeList.get(5).getRtvEdges().add(rtvEdge9);

            RelationToCEdge rtcEdge10 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7+4),cLassNodeList.get((int)i*6+5));
            rtcEdge10.setIcmList(new HashSet<Long>(s1));
            rtcEdge10.setId(c++);
            relationNodeList.get((int)i*7+4).getRtcEdges().add(rtcEdge10);
            cLassNodeList.get((int)i*6+5).getRtcEdges().add(rtcEdge10);

            RelationToValueEdge rtvEdge10 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7+4),valueNodeList.get(11));
            rtvEdge10.setIcmList(new HashSet<Long>(s1));
            rtvEdge10.setId(c++);
            relationNodeList.get((int)i*7+4).getRtvEdges().add(rtvEdge10);
            valueNodeList.get(11).getRtvEdges().add(rtvEdge10);

            //
            RelationToCEdge rtcEdge11 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7+5),cLassNodeList.get((int)i*6+1));
            rtcEdge11.setIcmList(new HashSet<Long>(s1));
            rtcEdge11.setId(c++);
            relationNodeList.get((int)i*7+5).getRtcEdges().add(rtcEdge11);
            cLassNodeList.get((int)i*6+1).getRtcEdges().add(rtcEdge11);

            RelationToValueEdge rtvEdge11 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7+5),valueNodeList.get(5));
            rtvEdge11.setIcmList(new HashSet<Long>(s1));
            rtvEdge11.setId(c++);
            relationNodeList.get((int)i*7+5).getRtvEdges().add(rtvEdge11);
            valueNodeList.get(5).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge12 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7+5),cLassNodeList.get((int)i*6+2));
            rtcEdge12.setIcmList(new HashSet<Long>(s1));
            rtcEdge12.setId(c++);
            relationNodeList.get((int)i*7+5).getRtcEdges().add(rtcEdge12);
            cLassNodeList.get((int)i*6+2).getRtcEdges().add(rtcEdge12);

            RelationToValueEdge rtvEdge12 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7+5),valueNodeList.get(7));
            rtvEdge12.setIcmList(new HashSet<Long>(s1));
            rtvEdge12.setId(c++);
            relationNodeList.get((int)i*7+5).getRtvEdges().add(rtvEdge12);
            valueNodeList.get(7).getRtvEdges().add(rtvEdge12);

            //
            RelationToCEdge rtcEdge13 =
                    new RelationToCEdge("e0","class",relationNodeList.get((int)i*7+6),cLassNodeList.get((int)i*6+1));
            rtcEdge13.setIcmList(new HashSet<Long>(s1));
            rtcEdge13.setId(c++);
            relationNodeList.get((int)i*7+6).getRtcEdges().add(rtcEdge13);
            cLassNodeList.get((int)i*6+1).getRtcEdges().add(rtcEdge13);

            RelationToValueEdge rtvEdge13 =
                    new RelationToValueEdge("e0","role",relationNodeList.get((int)i*7+6),valueNodeList.get(5));
            rtvEdge13.setIcmList(new HashSet<Long>(s1));
            rtvEdge13.setId(c++);
            relationNodeList.get((int)i*7+6).getRtvEdges().add(rtvEdge13);
            valueNodeList.get(5).getRtvEdges().add(rtvEdge13);

            RelationToCEdge rtcEdge14 =
                    new RelationToCEdge("e1","class",relationNodeList.get((int)i*7+6),cLassNodeList.get((int)i*6+3));
            rtcEdge14.setIcmList(new HashSet<Long>(s1));
            rtcEdge14.setId(c++);
            relationNodeList.get((int)i*7+6).getRtcEdges().add(rtcEdge14);
            cLassNodeList.get((int)i*6+3).getRtcEdges().add(rtcEdge14);

            RelationToValueEdge rtvEdge14 =
                    new RelationToValueEdge("e1","role",relationNodeList.get((int)i*7+6),valueNodeList.get(9));
            rtvEdge14.setIcmList(new HashSet<Long>(s1));
            rtvEdge14.setId(c++);
            relationNodeList.get((int)i*7+6).getRtvEdges().add(rtvEdge14);
            valueNodeList.get(9).getRtvEdges().add(rtvEdge14);

            //下面是ctv了
            ClassToValueEdge ctvEdge1 =
                    new ClassToValueEdge("name",cLassNodeList.get((int)i*6),valueNodeList.get(0));
            ctvEdge1.setIcmList(new HashSet<Long>(s1));
            ctvEdge1.setId(c++);
            cLassNodeList.get((int)i*6).getCtvEdges().add(ctvEdge1);
            valueNodeList.get(0).getCtvEdges().add(ctvEdge1);

            ClassToValueEdge ctvEdge2 =
                    new ClassToValueEdge("name",cLassNodeList.get((int)i*6+1),valueNodeList.get(1));
            ctvEdge2.setIcmList(new HashSet<Long>(s1));
            ctvEdge2.setId(c++);
            cLassNodeList.get((int)i*6+1).getCtvEdges().add(ctvEdge2);
            valueNodeList.get(1).getCtvEdges().add(ctvEdge2);

            ClassToValueEdge ctvEdge3 =
                    new ClassToValueEdge("name",cLassNodeList.get((int)i*6+2),valueNodeList.get(3));
            ctvEdge3.setIcmList(new HashSet<Long>(s1));
            ctvEdge3.setId(c++);
            cLassNodeList.get((int)i*6+2).getCtvEdges().add(ctvEdge3);
            valueNodeList.get(3).getCtvEdges().add(ctvEdge3);

            ClassToValueEdge ctvEdge4 =
                    new ClassToValueEdge("name",cLassNodeList.get((int)i*6+3),valueNodeList.get(8));
            ctvEdge4.setIcmList(new HashSet<Long>(s1));
            ctvEdge4.setId(c++);
            cLassNodeList.get((int)i*6+3).getCtvEdges().add(ctvEdge4);
            valueNodeList.get(8).getCtvEdges().add(ctvEdge4);

            ClassToValueEdge ctvEdge5 =
                    new ClassToValueEdge("name",cLassNodeList.get((int)i*6+4),valueNodeList.get(2));
            ctvEdge5.setIcmList(new HashSet<Long>(s1));
            ctvEdge5.setId(c++);
            cLassNodeList.get((int)i*6+4).getCtvEdges().add(ctvEdge5);
            valueNodeList.get(2).getCtvEdges().add(ctvEdge5);

            ClassToValueEdge ctvEdge6 =
                    new ClassToValueEdge("name",cLassNodeList.get((int)i*6+5),valueNodeList.get(10));
            ctvEdge6.setIcmList(new HashSet<Long>(s1));
            ctvEdge6.setId(c);
            cLassNodeList.get((int)i*6+5).getCtvEdges().add(ctvEdge6);
            valueNodeList.get(10).getCtvEdges().add(ctvEdge6);
        }

    }

    private void rNodeInit() {

        for(long t=0;t<PersonNum;t++) {
            for(int i=0;i<7;i++) {
                c++;
                Set<Long> s1=new HashSet<>();
                s1.add(t);
//                RelationNode rNode = relationNodeList.get(7*(int)t+i);
                RelationNode rNode = new RelationNode();
                rNode.setIcmSet(s1);
                rNode.setModelId(0l);
                rNode.setId(c);
                relationNodeList.add(rNode);
            }
        }
    }

    private void vNodeInit() {
        Set<Long> s1=new HashSet<>();
        for(long i=0;i<(long)PersonNum;i++) {
            s1.add(i);
        }

        c++;
        ValueNode vNode1 = new ValueNode();
        vNode1.setIcmSet(new HashSet<Long>(s1));
        vNode1.setModelId(0l);
        vNode1.setId(c++);
        vNode1.setName("Student");

        ValueNode vNode2 = new ValueNode();
        vNode2.setIcmSet(new HashSet<Long>(s1));
        vNode2.setModelId(0l);
        vNode2.setId(c++);
        vNode2.setName("Teacher");

        ValueNode vNode3 = new ValueNode();
        vNode3.setIcmSet(new HashSet<Long>(s1));
        vNode3.setModelId(0l);
        vNode3.setId(c++);
        vNode3.setName("Person");

        ValueNode vNode4 = new ValueNode();
        vNode4.setIcmSet(new HashSet<Long>(s1));
        vNode4.setModelId(0l);
        vNode4.setId(c++);
        vNode4.setName("Integer");

        ValueNode vNode5 = new ValueNode();
        vNode5.setIcmSet(new HashSet<Long>(s1));
        vNode5.setModelId(0l);
        vNode5.setId(c++);
        vNode5.setName("student");

        ValueNode vNode6 = new ValueNode();
        vNode6.setIcmSet(new HashSet<Long>(s1));
        vNode6.setModelId(0l);
        vNode6.setId(c++);
        vNode6.setName("teacher");

        ValueNode vNode7 = new ValueNode();
        vNode7.setIcmSet(new HashSet<Long>(s1));
        vNode7.setModelId(0l);
        vNode7.setId(c++);
        vNode7.setName("person");

        ValueNode vNode8 = new ValueNode();
        vNode8.setIcmSet(new HashSet<Long>(s1));
        vNode8.setModelId(0l);
        vNode8.setId(c++);
        vNode8.setName("int");

        ValueNode vNode9 = new ValueNode();
        vNode9.setIcmSet(new HashSet<Long>(s1));
        vNode9.setModelId(0l);
        vNode9.setId(c++);
        vNode9.setName("Boolean");

        ValueNode vNode10 = new ValueNode();
        vNode10.setIcmSet(new HashSet<Long>(s1));
        vNode10.setModelId(0l);
        vNode10.setId(c++);
        vNode10.setName("boolean");

        ValueNode vNode11 = new ValueNode();
        vNode11.setIcmSet(new HashSet<Long>(s1));
        vNode11.setModelId(0l);
        vNode11.setId(c++);
        vNode11.setName("Course");

        ValueNode vNode12 = new ValueNode();
        vNode12.setIcmSet(new HashSet<Long>(s1));
        vNode12.setModelId(0l);
        vNode12.setId(c);
        vNode12.setName("course");

        valueNodeList.add(vNode1);
        valueNodeList.add(vNode2);
        valueNodeList.add(vNode3);
        valueNodeList.add(vNode4);
        valueNodeList.add(vNode5);
        valueNodeList.add(vNode6);
        valueNodeList.add(vNode7);
        valueNodeList.add(vNode8);
        valueNodeList.add(vNode9);
        valueNodeList.add(vNode10);
        valueNodeList.add(vNode11);
        valueNodeList.add(vNode12);
    }

    private void initTest() {
        cNodeInit();
        rNodeInit();
        vNodeInit();
        edgeInit();
    }

    @Test
    public void testMigrate() {
        initTest();
        MigrateHandlerImpl migrateHandler=new MigrateHandlerImpl();
        migrateHandler.migrateInitForTest(cLassNodeList,relationNodeList,valueNodeList);
        migrateHandler.migrateHandler(0l);
    }

//    @Test
//    public void testMap() {
//        Map<String,List<Set<Long>>> myMap = new HashMap<>();
//        List<Set<Long>> lists=new ArrayList<>();
//        Set<Long> s1=new HashSet<>();
//        Set<Long> s2=new HashSet<>();
//        Set<Long> s3=new HashSet<>();
//        Set<Long> s4=new HashSet<>();
//
//        s1.add(1l);
//        s1.add(2l);
//        s1.add(3l);
//
//        s2.add(1l);
//        s2.add(3l);
//        s2.add(5l);
//
//        s3.add(2l);
//        s3.add(3l);
//        s3.add(4l);
//
//        s4.add(1l);
//        s4.add(5l);
//
//        lists.add(s1);
//        lists.add(s2);
//        lists.add(s3);
//        lists.add(s4);
//
//        myMap.put("name",lists);
//
//        EntropyHandler entropyHandler=new EntropyHandlerImpl();
//        entropyHandler.compueteMapEntropy(myMap,5);
//    }
}
