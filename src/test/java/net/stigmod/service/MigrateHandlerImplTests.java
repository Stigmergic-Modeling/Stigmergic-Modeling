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
import net.stigmod.service.migrateService.MigrateUtil;
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

    //这些nodeNum记录了对应节点数目
    int vNodeNum=37;
    int cNodeNum=8;
    int rNodeNum=25;//暂定

    long c=0;
    int PersonNum;

    private void cNodeInit() {

        for(long t=0;t<PersonNum;t++) {
            for(int i=0;i<cNodeNum;i++) {
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

    private void rNodeInit() {

        for(long t=0;t<PersonNum;t++) {
            for(int i=0;i<rNodeNum;i++) {
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
        for(int i=0;i < vNodeNum;i++) {
            ValueNode vNode = new ValueNode();
            vNode.setIcmSet(new HashSet<Long>(s1));
            vNode.setModelId(0l);
            vNode.setId(c++);
            valueNodeList.add(vNode);
        }

        //
        valueNodeList.get(0).setName("Person");
        valueNodeList.get(1).setName("Student");
        valueNodeList.get(2).setName("Teacher");
        valueNodeList.get(3).setName("Course");
        valueNodeList.get(4).setName("CourseSchedule");
        valueNodeList.get(5).setName("Integer");
        valueNodeList.get(6).setName("String");
        valueNodeList.get(7).setName("Boolean");

        //
        valueNodeList.get(8).setName("person");
        valueNodeList.get(9).setName("student");
        valueNodeList.get(10).setName("teacher");
        valueNodeList.get(11).setName("course");
        valueNodeList.get(12).setName("courseSchedule");

        //Person attribute
        valueNodeList.get(13).setName("uid");
        valueNodeList.get(14).setName("name");
        valueNodeList.get(15).setName("age");
        valueNodeList.get(16).setName("gender");
        valueNodeList.get(17).setName("email");
        valueNodeList.get(18).setName("tel");

        //Student
        valueNodeList.get(19).setName("sid");
        valueNodeList.get(20).setName("grade");
        valueNodeList.get(21).setName("major");

        //Course
        valueNodeList.get(22).setName("cid");
        //***16-name
        valueNodeList.get(23).setName("credit");
        valueNodeList.get(24).setName("teacherId");

        //Teacher
        valueNodeList.get(25).setName("tid");
        valueNodeList.get(26).setName("title");
        valueNodeList.get(27).setName("hightestEducation");
        valueNodeList.get(28).setName("department");

        //CourseSchedule
        //***15-cid
        valueNodeList.get(29).setName("locate");
        valueNodeList.get(30).setName("date");


        //relation-name
        valueNodeList.get(31).setName("choose");
        valueNodeList.get(32).setName("teaching");
        valueNodeList.get(33).setName("with");

        valueNodeList.get(34).setName("true");

        valueNodeList.get(35).setName("1");
        valueNodeList.get(36).setName("*");
    }

    private void edgeInit() {
        for(long i=0;i<PersonNum;i++) {
            c++;

            Set<Long> s1=new HashSet<>();
            s1.add(i);

            int curI=(int)i;

            //先把所有classNode的指向valueNode的边确定下来
            //第一个是Person
            ClassToValueEdge ctvEdge1 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum),valueNodeList.get(0));
            ctvEdge1.setIcmList(new HashSet<Long>(s1));
            ctvEdge1.setId(c++);
            cLassNodeList.get(curI*cNodeNum).getCtvEdges().add(ctvEdge1);
            valueNodeList.get(0).getCtvEdges().add(ctvEdge1);
            //第二个是Student
            ClassToValueEdge ctvEdge2 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+1),valueNodeList.get(1));
            ctvEdge2.setIcmList(new HashSet<Long>(s1));
            ctvEdge2.setId(c++);
            cLassNodeList.get(curI*cNodeNum+1).getCtvEdges().add(ctvEdge2);
            valueNodeList.get(1).getCtvEdges().add(ctvEdge2);
            //第三个是Teacher
            ClassToValueEdge ctvEdge3 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+2),valueNodeList.get(2));
            ctvEdge3.setIcmList(new HashSet<Long>(s1));
            ctvEdge3.setId(c++);
            cLassNodeList.get(curI*cNodeNum+2).getCtvEdges().add(ctvEdge3);
            valueNodeList.get(2).getCtvEdges().add(ctvEdge3);
            //第四个是Course
            ClassToValueEdge ctvEdge4 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+3),valueNodeList.get(3));
            ctvEdge4.setIcmList(new HashSet<Long>(s1));
            ctvEdge4.setId(c++);
            cLassNodeList.get(curI*cNodeNum+3).getCtvEdges().add(ctvEdge4);
            valueNodeList.get(3).getCtvEdges().add(ctvEdge4);
            //第五个是CourseSchedule
            ClassToValueEdge ctvEdge5 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+4),valueNodeList.get(4));
            ctvEdge5.setIcmList(new HashSet<Long>(s1));
            ctvEdge5.setId(c++);
            cLassNodeList.get(curI*cNodeNum+4).getCtvEdges().add(ctvEdge5);
            valueNodeList.get(4).getCtvEdges().add(ctvEdge5);
            //第六个是Integer
            ClassToValueEdge ctvEdge6 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+5),valueNodeList.get(5));
            ctvEdge6.setIcmList(new HashSet<Long>(s1));
            ctvEdge6.setId(c++);
            cLassNodeList.get(curI*cNodeNum+5).getCtvEdges().add(ctvEdge6);
            valueNodeList.get(5).getCtvEdges().add(ctvEdge6);
            //第七个是String
            ClassToValueEdge ctvEdge7 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+6),valueNodeList.get(6));
            ctvEdge7.setIcmList(new HashSet<Long>(s1));
            ctvEdge7.setId(c++);
            cLassNodeList.get(curI*cNodeNum+6).getCtvEdges().add(ctvEdge7);
            valueNodeList.get(6).getCtvEdges().add(ctvEdge7);
            //第八个是Boolean
            ClassToValueEdge ctvEdge8 =
                    new ClassToValueEdge("name",cLassNodeList.get(curI*cNodeNum+7),valueNodeList.get(7));
            ctvEdge8.setIcmList(new HashSet<Long>(s1));
            ctvEdge8.setId(c++);
            cLassNodeList.get(curI*cNodeNum+7).getCtvEdges().add(ctvEdge8);
            valueNodeList.get(7).getCtvEdges().add(ctvEdge8);
            //classNode 一共有8个

            //下面设置Rtv与Rtc节点
            //第一个是关系是Person与Student的关系,泛化关系,以e0为父端,e1为子端
            RelationToCEdge rtcEdge1 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum),cLassNodeList.get(curI*cNodeNum));
            rtcEdge1.setIcmList(new HashSet<Long>(s1));
            rtcEdge1.setId(c++);
            relationNodeList.get(curI*rNodeNum).getRtcEdges().add(rtcEdge1);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge1);

            RelationToValueEdge rtvEdge1 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum),valueNodeList.get(8));
            rtvEdge1.setIcmList(new HashSet<Long>(s1));
            rtvEdge1.setId(c++);
            relationNodeList.get(curI*rNodeNum).getRtvEdges().add(rtvEdge1);
            valueNodeList.get(8).getRtvEdges().add(rtvEdge1);

            RelationToCEdge rtcEdge2 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum),cLassNodeList.get(curI*cNodeNum+1));
            rtcEdge2.setIcmList(new HashSet<Long>(s1));
            rtcEdge2.setId(c++);
            relationNodeList.get(curI*rNodeNum).getRtcEdges().add(rtcEdge2);
            cLassNodeList.get(curI*cNodeNum+1).getRtcEdges().add(rtcEdge2);

            RelationToValueEdge rtvEdge2 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum),valueNodeList.get(9));
            rtvEdge2.setIcmList(new HashSet<Long>(s1));
            rtvEdge2.setId(c++);
            relationNodeList.get(curI*rNodeNum).getRtvEdges().add(rtvEdge2);
            valueNodeList.get(9).getRtvEdges().add(rtvEdge2);

            //一条额外的generalization边,表明该关系为泛化的
            RelationToValueEdge rtvEdge3 =
                    new RelationToValueEdge("","isGeneralization",relationNodeList.get(curI*rNodeNum), valueNodeList.get(34));
            rtvEdge3.setIcmList(new HashSet<Long>(s1));
            rtvEdge3.setId(c++);
            relationNodeList.get(curI*rNodeNum).getRtvEdges().add(rtvEdge3);
            valueNodeList.get(34).getRtvEdges().add(rtvEdge3);

            //第一个关系结束,第二个关系是Person与Teacher的关系

            RelationToCEdge rtcEdge4 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+1),cLassNodeList.get(curI*cNodeNum));
            rtcEdge4.setIcmList(new HashSet<Long>(s1));
            rtcEdge4.setId(c++);
            relationNodeList.get(curI*rNodeNum+1).getRtcEdges().add(rtcEdge4);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge4);

            RelationToValueEdge rtvEdge5 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+1),valueNodeList.get(8));
            rtvEdge5.setIcmList(new HashSet<Long>(s1));
            rtvEdge5.setId(c++);
            relationNodeList.get(curI*rNodeNum+1).getRtvEdges().add(rtvEdge5);
            valueNodeList.get(8).getRtvEdges().add(rtvEdge5);

            RelationToCEdge rtcEdge6 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+1),cLassNodeList.get(curI*cNodeNum+2));
            rtcEdge6.setIcmList(new HashSet<Long>(s1));
            rtcEdge6.setId(c++);
            relationNodeList.get(curI*rNodeNum+1).getRtcEdges().add(rtcEdge6);
            cLassNodeList.get(curI*cNodeNum+2).getRtcEdges().add(rtcEdge6);

            RelationToValueEdge rtvEdge7 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+1),valueNodeList.get(10));
            rtvEdge7.setIcmList(new HashSet<Long>(s1));
            rtvEdge7.setId(c++);
            relationNodeList.get(curI*rNodeNum+1).getRtvEdges().add(rtvEdge7);
            valueNodeList.get(10).getRtvEdges().add(rtvEdge7);

            //一条额外的generalization边,表明该关系为泛化的
            RelationToValueEdge rtvEdge8 =
                    new RelationToValueEdge("","isGeneralization",relationNodeList.get(curI*rNodeNum+1), valueNodeList.get(34));
            rtvEdge8.setIcmList(new HashSet<Long>(s1));
            rtvEdge8.setId(c++);
            relationNodeList.get(curI*rNodeNum+1).getRtvEdges().add(rtvEdge8);
            valueNodeList.get(34).getRtvEdges().add(rtvEdge8);
            //第二个关系节点建立完毕

            //第三个关系是Student与Course的关系,1对*,关系名为choose
            RelationToCEdge rtcEdge9 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+2),cLassNodeList.get(curI*cNodeNum+1));
            rtcEdge9.setIcmList(new HashSet<Long>(s1));
            rtcEdge9.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtcEdges().add(rtcEdge9);
            cLassNodeList.get(curI*cNodeNum+1).getRtcEdges().add(rtcEdge9);

            RelationToValueEdge rtvEdge10 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(9));
            rtvEdge10.setIcmList(new HashSet<Long>(s1));
            rtvEdge10.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge10);
            valueNodeList.get(9).getRtvEdges().add(rtvEdge10);

            RelationToValueEdge rtvEdge11 =
                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
            rtvEdge11.setIcmList(new HashSet<Long>(s1));
            rtvEdge11.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge12 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+2),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge12.setIcmList(new HashSet<Long>(s1));
            rtcEdge12.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtcEdges().add(rtcEdge12);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge12);

            RelationToValueEdge rtvEdge13 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(11));
            rtvEdge13.setIcmList(new HashSet<Long>(s1));
            rtvEdge13.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge13);
            valueNodeList.get(11).getRtvEdges().add(rtvEdge13);

            RelationToValueEdge rtvEdge14 =
                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
            rtvEdge14.setIcmList(new HashSet<Long>(s1));
            rtvEdge14.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge15 =
                    new RelationToValueEdge("","edge name",relationNodeList.get(curI*rNodeNum+2), valueNodeList.get(31));
            rtvEdge15.setIcmList(new HashSet<Long>(s1));
            rtvEdge15.setId(c++);
            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge15);
            valueNodeList.get(31).getRtvEdges().add(rtvEdge15);

            //下面是第四个关系Course与Teacher,*对1的多重性,边名为teaching
            RelationToCEdge rtcEdge16 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+3),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge16.setIcmList(new HashSet<Long>(s1));
            rtcEdge16.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtcEdges().add(rtcEdge16);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge16);

            RelationToValueEdge rtvEdge17 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+3),valueNodeList.get(11));
            rtvEdge17.setIcmList(new HashSet<Long>(s1));
            rtvEdge17.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtvEdges().add(rtvEdge17);
            valueNodeList.get(11).getRtvEdges().add(rtvEdge17);

            RelationToValueEdge rtvEdge18 =//多重性尚未修改
                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+3),valueNodeList.get(36));
            rtvEdge18.setIcmList(new HashSet<Long>(s1));
            rtvEdge18.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtvEdges().add(rtvEdge18);
            valueNodeList.get(36).getRtvEdges().add(rtvEdge18);

            RelationToCEdge rtcEdge19 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+3),cLassNodeList.get(curI*cNodeNum+2));
            rtcEdge19.setIcmList(new HashSet<Long>(s1));
            rtcEdge19.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtcEdges().add(rtcEdge19);
            cLassNodeList.get(curI*cNodeNum+2).getRtcEdges().add(rtcEdge19);

            RelationToValueEdge rtvEdge20 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+3),valueNodeList.get(10));
            rtvEdge20.setIcmList(new HashSet<Long>(s1));
            rtvEdge20.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtvEdges().add(rtvEdge20);
            valueNodeList.get(10).getRtvEdges().add(rtvEdge20);

            RelationToValueEdge rtvEdge21 = //暂没修改
                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+3),valueNodeList.get(35));
            rtvEdge21.setIcmList(new HashSet<Long>(s1));
            rtvEdge21.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtvEdges().add(rtvEdge21);
            valueNodeList.get(35).getRtvEdges().add(rtvEdge21);

            RelationToValueEdge rtvEdge22 =
                    new RelationToValueEdge("","edge name",relationNodeList.get(curI*rNodeNum+3), valueNodeList.get(32));
            rtvEdge22.setIcmList(new HashSet<Long>(s1));
            rtvEdge22.setId(c++);
            relationNodeList.get(curI*rNodeNum+3).getRtvEdges().add(rtvEdge22);
            valueNodeList.get(32).getRtvEdges().add(rtvEdge22);

            //下面建立第5个关系 Course与CourseSchedule
            RelationToCEdge rtcEdge23 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+4),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge23.setIcmList(new HashSet<Long>(s1));
            rtcEdge23.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtcEdges().add(rtcEdge23);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge23);

            RelationToValueEdge rtvEdge24 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+4),valueNodeList.get(11));
            rtvEdge24.setIcmList(new HashSet<Long>(s1));
            rtvEdge24.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtvEdges().add(rtvEdge24);
            valueNodeList.get(11).getRtvEdges().add(rtvEdge24);

            RelationToValueEdge rtvEdge25 =//多重性尚未修改
                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+4),valueNodeList.get(35));
            rtvEdge25.setIcmList(new HashSet<Long>(s1));
            rtvEdge25.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtvEdges().add(rtvEdge25);
            valueNodeList.get(35).getRtvEdges().add(rtvEdge25);

            RelationToCEdge rtcEdge26 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+4),cLassNodeList.get(curI*cNodeNum+4));
            rtcEdge26.setIcmList(new HashSet<Long>(s1));
            rtcEdge26.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtcEdges().add(rtcEdge26);
            cLassNodeList.get(curI*cNodeNum+4).getRtcEdges().add(rtcEdge26);

            RelationToValueEdge rtvEdge27 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+4),valueNodeList.get(12));
            rtvEdge27.setIcmList(new HashSet<Long>(s1));
            rtvEdge27.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtvEdges().add(rtvEdge27);
            valueNodeList.get(12).getRtvEdges().add(rtvEdge27);

            RelationToValueEdge rtvEdge28 = //暂没修改
                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+4),valueNodeList.get(35));
            rtvEdge28.setIcmList(new HashSet<Long>(s1));
            rtvEdge28.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtvEdges().add(rtvEdge28);
            valueNodeList.get(35).getRtvEdges().add(rtvEdge28);

            RelationToValueEdge rtvEdge29 =
                    new RelationToValueEdge("","edge name",relationNodeList.get(curI*rNodeNum+4), valueNodeList.get(33));
            rtvEdge29.setIcmList(new HashSet<Long>(s1));
            rtvEdge29.setId(c++);
            relationNodeList.get(curI*rNodeNum+4).getRtvEdges().add(rtvEdge29);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge29);

            //完成了基本的五个关系的建立,剩下20个关系则是属性关系了
            //第一个是Person与uid的
            RelationToCEdge rtcEdge30 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+5),cLassNodeList.get(curI*cNodeNum));
            rtcEdge30.setIcmList(new HashSet<Long>(s1));
            rtcEdge30.setId(c++);
            relationNodeList.get(curI*rNodeNum+5).getRtcEdges().add(rtcEdge30);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge30);

            RelationToValueEdge rtvEdge31 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+5),valueNodeList.get(0));
            rtvEdge31.setIcmList(new HashSet<Long>(s1));
            rtvEdge31.setId(c++);
            relationNodeList.get(curI*rNodeNum+5).getRtvEdges().add(rtvEdge31);
            valueNodeList.get(0).getRtvEdges().add(rtvEdge31);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge33 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+5),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge33.setIcmList(new HashSet<Long>(s1));
            rtcEdge33.setId(c++);
            relationNodeList.get(curI*rNodeNum+5).getRtcEdges().add(rtcEdge33);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge33);

            RelationToValueEdge rtvEdge34 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+5),valueNodeList.get(13));
            rtvEdge34.setIcmList(new HashSet<Long>(s1));
            rtvEdge34.setId(c++);
            relationNodeList.get(curI*rNodeNum+5).getRtvEdges().add(rtvEdge34);
            valueNodeList.get(13).getRtvEdges().add(rtvEdge34);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge36 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+5), valueNodeList.get(33));
            rtvEdge36.setIcmList(new HashSet<Long>(s1));
            rtvEdge36.setId(c++);
            relationNodeList.get(curI*rNodeNum+5).getRtvEdges().add(rtvEdge36);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge36);

            //Person与name的属性
            RelationToCEdge rtcEdge37 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+6),cLassNodeList.get(curI*cNodeNum));
            rtcEdge37.setIcmList(new HashSet<Long>(s1));
            rtcEdge37.setId(c++);
            relationNodeList.get(curI*rNodeNum+6).getRtcEdges().add(rtcEdge37);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge37);

            RelationToValueEdge rtvEdge38 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+6),valueNodeList.get(0));
            rtvEdge38.setIcmList(new HashSet<Long>(s1));
            rtvEdge38.setId(c++);
            relationNodeList.get(curI*rNodeNum+6).getRtvEdges().add(rtvEdge38);
            valueNodeList.get(0).getRtvEdges().add(rtvEdge38);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge40 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+6),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge40.setIcmList(new HashSet<Long>(s1));
            rtcEdge40.setId(c++);
            relationNodeList.get(curI*rNodeNum+6).getRtcEdges().add(rtcEdge40);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge40);

            RelationToValueEdge rtvEdge41 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+6),valueNodeList.get(14));
            rtvEdge41.setIcmList(new HashSet<Long>(s1));
            rtvEdge41.setId(c++);
            relationNodeList.get(curI*rNodeNum+6).getRtvEdges().add(rtvEdge41);
            valueNodeList.get(14).getRtvEdges().add(rtvEdge41);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge43 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+6), valueNodeList.get(33));
            rtvEdge43.setIcmList(new HashSet<Long>(s1));
            rtvEdge43.setId(c++);
            relationNodeList.get(curI*rNodeNum+6).getRtvEdges().add(rtvEdge43);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge43);

            //下一个Person与age
            RelationToCEdge rtcEdge44 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+7),cLassNodeList.get(curI*cNodeNum));
            rtcEdge44.setIcmList(new HashSet<Long>(s1));
            rtcEdge44.setId(c++);
            relationNodeList.get(curI*rNodeNum+7).getRtcEdges().add(rtcEdge44);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge44);

            RelationToValueEdge rtvEdge45 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+7),valueNodeList.get(0));
            rtvEdge45.setIcmList(new HashSet<Long>(s1));
            rtvEdge45.setId(c++);
            relationNodeList.get(curI*rNodeNum+7).getRtvEdges().add(rtvEdge45);
            valueNodeList.get(0).getRtvEdges().add(rtvEdge45);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge47 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+7),cLassNodeList.get(curI*cNodeNum+5));
            rtcEdge47.setIcmList(new HashSet<Long>(s1));
            rtcEdge47.setId(c++);
            relationNodeList.get(curI*rNodeNum+7).getRtcEdges().add(rtcEdge47);
            cLassNodeList.get(curI*cNodeNum+5).getRtcEdges().add(rtcEdge47);

            RelationToValueEdge rtvEdge48 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+7),valueNodeList.get(15));
            rtvEdge48.setIcmList(new HashSet<Long>(s1));
            rtvEdge48.setId(c++);
            relationNodeList.get(curI*rNodeNum+7).getRtvEdges().add(rtvEdge48);
            valueNodeList.get(15).getRtvEdges().add(rtvEdge48);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge50 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+7), valueNodeList.get(33));
            rtvEdge50.setIcmList(new HashSet<Long>(s1));
            rtvEdge50.setId(c++);
            relationNodeList.get(curI*rNodeNum+7).getRtvEdges().add(rtvEdge50);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge50);

            //下一个是Perosn与gender
            RelationToCEdge rtcEdge51 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+8),cLassNodeList.get(curI*cNodeNum));
            rtcEdge51.setIcmList(new HashSet<Long>(s1));
            rtcEdge51.setId(c++);
            relationNodeList.get(curI*rNodeNum+8).getRtcEdges().add(rtcEdge51);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge51);

            RelationToValueEdge rtvEdge52 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+8),valueNodeList.get(0));
            rtvEdge52.setIcmList(new HashSet<Long>(s1));
            rtvEdge52.setId(c++);
            relationNodeList.get(curI*rNodeNum+8).getRtvEdges().add(rtvEdge52);
            valueNodeList.get(0).getRtvEdges().add(rtvEdge52);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge54 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+8),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge54.setIcmList(new HashSet<Long>(s1));
            rtcEdge54.setId(c++);
            relationNodeList.get(curI*rNodeNum+8).getRtcEdges().add(rtcEdge54);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge54);

            RelationToValueEdge rtvEdge55 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+8),valueNodeList.get(16));
            rtvEdge55.setIcmList(new HashSet<Long>(s1));
            rtvEdge55.setId(c++);
            relationNodeList.get(curI*rNodeNum+8).getRtvEdges().add(rtvEdge55);
            valueNodeList.get(16).getRtvEdges().add(rtvEdge55);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge57 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+8), valueNodeList.get(33));
            rtvEdge57.setIcmList(new HashSet<Long>(s1));
            rtvEdge57.setId(c++);
            relationNodeList.get(curI*rNodeNum+8).getRtvEdges().add(rtvEdge57);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge57);

            //Person与email的关系
            RelationToCEdge rtcEdge58 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+9),cLassNodeList.get(curI*cNodeNum));
            rtcEdge58.setIcmList(new HashSet<Long>(s1));
            rtcEdge58.setId(c++);
            relationNodeList.get(curI*rNodeNum+9).getRtcEdges().add(rtcEdge58);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge58);

            RelationToValueEdge rtvEdge59 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+9),valueNodeList.get(0));
            rtvEdge59.setIcmList(new HashSet<Long>(s1));
            rtvEdge59.setId(c++);
            relationNodeList.get(curI*rNodeNum+9).getRtvEdges().add(rtvEdge59);
            valueNodeList.get(0).getRtvEdges().add(rtvEdge59);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge61 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+9),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge61.setIcmList(new HashSet<Long>(s1));
            rtcEdge61.setId(c++);
            relationNodeList.get(curI*rNodeNum+9).getRtcEdges().add(rtcEdge61);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge61);

            RelationToValueEdge rtvEdge62 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+9),valueNodeList.get(17));
            rtvEdge62.setIcmList(new HashSet<Long>(s1));
            rtvEdge62.setId(c++);
            relationNodeList.get(curI*rNodeNum+9).getRtvEdges().add(rtvEdge62);
            valueNodeList.get(17).getRtvEdges().add(rtvEdge62);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge64 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+9), valueNodeList.get(33));
            rtvEdge64.setIcmList(new HashSet<Long>(s1));
            rtvEdge64.setId(c++);
            relationNodeList.get(curI*rNodeNum+9).getRtvEdges().add(rtvEdge64);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge64);

            //下一个是Person与tel的关系
            RelationToCEdge rtcEdge65 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+10),cLassNodeList.get(curI*cNodeNum));
            rtcEdge65.setIcmList(new HashSet<Long>(s1));
            rtcEdge65.setId(c++);
            relationNodeList.get(curI*rNodeNum+10).getRtcEdges().add(rtcEdge65);
            cLassNodeList.get(curI*cNodeNum).getRtcEdges().add(rtcEdge65);

            RelationToValueEdge rtvEdge66 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+10),valueNodeList.get(0));
            rtvEdge66.setIcmList(new HashSet<Long>(s1));
            rtvEdge66.setId(c++);
            relationNodeList.get(curI*rNodeNum+10).getRtvEdges().add(rtvEdge66);
            valueNodeList.get(0).getRtvEdges().add(rtvEdge66);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge68 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+10),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge68.setIcmList(new HashSet<Long>(s1));
            rtcEdge68.setId(c++);
            relationNodeList.get(curI*rNodeNum+10).getRtcEdges().add(rtcEdge68);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge68);

            RelationToValueEdge rtvEdge69 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+10),valueNodeList.get(18));
            rtvEdge69.setIcmList(new HashSet<Long>(s1));
            rtvEdge69.setId(c++);
            relationNodeList.get(curI*rNodeNum+10).getRtvEdges().add(rtvEdge69);
            valueNodeList.get(18).getRtvEdges().add(rtvEdge69);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge71 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+10), valueNodeList.get(33));
            rtvEdge71.setIcmList(new HashSet<Long>(s1));
            rtvEdge71.setId(c++);
            relationNodeList.get(curI*rNodeNum+10).getRtvEdges().add(rtvEdge71);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge71);

            //Student与sid的属性关系
            RelationToCEdge rtcEdge72 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+11),cLassNodeList.get(curI*cNodeNum+1));
            rtcEdge72.setIcmList(new HashSet<Long>(s1));
            rtcEdge72.setId(c++);
            relationNodeList.get(curI*rNodeNum+11).getRtcEdges().add(rtcEdge72);
            cLassNodeList.get(curI*cNodeNum+1).getRtcEdges().add(rtcEdge72);

            RelationToValueEdge rtvEdge73 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+11),valueNodeList.get(1));
            rtvEdge73.setIcmList(new HashSet<Long>(s1));
            rtvEdge73.setId(c++);
            relationNodeList.get(curI*rNodeNum+11).getRtvEdges().add(rtvEdge73);
            valueNodeList.get(1).getRtvEdges().add(rtvEdge73);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge75 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+11),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge75.setIcmList(new HashSet<Long>(s1));
            rtcEdge75.setId(c++);
            relationNodeList.get(curI*rNodeNum+11).getRtcEdges().add(rtcEdge75);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge75);

            RelationToValueEdge rtvEdge76 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+11),valueNodeList.get(19));
            rtvEdge76.setIcmList(new HashSet<Long>(s1));
            rtvEdge76.setId(c++);
            relationNodeList.get(curI*rNodeNum+11).getRtvEdges().add(rtvEdge76);
            valueNodeList.get(19).getRtvEdges().add(rtvEdge76);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge78 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+11), valueNodeList.get(33));
            rtvEdge78.setIcmList(new HashSet<Long>(s1));
            rtvEdge78.setId(c++);
            relationNodeList.get(curI*rNodeNum+11).getRtvEdges().add(rtvEdge78);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge78);

            //下一个是Student与grade
            RelationToCEdge rtcEdge79 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+12),cLassNodeList.get(curI*cNodeNum+1));
            rtcEdge79.setIcmList(new HashSet<Long>(s1));
            rtcEdge79.setId(c++);
            relationNodeList.get(curI*rNodeNum+12).getRtcEdges().add(rtcEdge79);
            cLassNodeList.get(curI*cNodeNum+1).getRtcEdges().add(rtcEdge79);

            RelationToValueEdge rtvEdge80 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+12),valueNodeList.get(1));
            rtvEdge80.setIcmList(new HashSet<Long>(s1));
            rtvEdge80.setId(c++);
            relationNodeList.get(curI*rNodeNum+12).getRtvEdges().add(rtvEdge80);
            valueNodeList.get(1).getRtvEdges().add(rtvEdge80);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge82 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+12),cLassNodeList.get(curI*cNodeNum+5));
            rtcEdge82.setIcmList(new HashSet<Long>(s1));
            rtcEdge82.setId(c++);
            relationNodeList.get(curI*rNodeNum+12).getRtcEdges().add(rtcEdge82);
            cLassNodeList.get(curI*cNodeNum+5).getRtcEdges().add(rtcEdge82);

            RelationToValueEdge rtvEdge83 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+12),valueNodeList.get(20));
            rtvEdge83.setIcmList(new HashSet<Long>(s1));
            rtvEdge83.setId(c++);
            relationNodeList.get(curI*rNodeNum+12).getRtvEdges().add(rtvEdge83);
            valueNodeList.get(20).getRtvEdges().add(rtvEdge83);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge85 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+12), valueNodeList.get(33));
            rtvEdge85.setIcmList(new HashSet<Long>(s1));
            rtvEdge85.setId(c++);
            relationNodeList.get(curI*rNodeNum+12).getRtvEdges().add(rtvEdge85);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge85);

            //Student与major的属性关系
            RelationToCEdge rtcEdge86 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+13),cLassNodeList.get(curI*cNodeNum+1));
            rtcEdge86.setIcmList(new HashSet<Long>(s1));
            rtcEdge86.setId(c++);
            relationNodeList.get(curI*rNodeNum+13).getRtcEdges().add(rtcEdge86);
            cLassNodeList.get(curI*cNodeNum+1).getRtcEdges().add(rtcEdge86);

            RelationToValueEdge rtvEdge87 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+13),valueNodeList.get(1));
            rtvEdge87.setIcmList(new HashSet<Long>(s1));
            rtvEdge87.setId(c++);
            relationNodeList.get(curI*rNodeNum+13).getRtvEdges().add(rtvEdge87);
            valueNodeList.get(1).getRtvEdges().add(rtvEdge87);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge89 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+13),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge89.setIcmList(new HashSet<Long>(s1));
            rtcEdge89.setId(c++);
            relationNodeList.get(curI*rNodeNum+13).getRtcEdges().add(rtcEdge89);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge89);

            RelationToValueEdge rtvEdge90 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+13),valueNodeList.get(21));
            rtvEdge90.setIcmList(new HashSet<Long>(s1));
            rtvEdge90.setId(c++);
            relationNodeList.get(curI*rNodeNum+13).getRtvEdges().add(rtvEdge90);
            valueNodeList.get(21).getRtvEdges().add(rtvEdge90);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge92 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+13), valueNodeList.get(33));
            rtvEdge92.setIcmList(new HashSet<Long>(s1));
            rtvEdge92.setId(c++);
            relationNodeList.get(curI*rNodeNum+13).getRtvEdges().add(rtvEdge92);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge92);

            //下面是Course的相关属性
            //首先是Course和cid的
            RelationToCEdge rtcEdge93 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+14),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge93.setIcmList(new HashSet<Long>(s1));
            rtcEdge93.setId(c++);
            relationNodeList.get(curI*rNodeNum+14).getRtcEdges().add(rtcEdge93);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge93);

            RelationToValueEdge rtvEdge94 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+14),valueNodeList.get(3));
            rtvEdge94.setIcmList(new HashSet<Long>(s1));
            rtvEdge94.setId(c++);
            relationNodeList.get(curI*rNodeNum+14).getRtvEdges().add(rtvEdge94);
            valueNodeList.get(3).getRtvEdges().add(rtvEdge94);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge96 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+14),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge96.setIcmList(new HashSet<Long>(s1));
            rtcEdge96.setId(c++);
            relationNodeList.get(curI*rNodeNum+14).getRtcEdges().add(rtcEdge96);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge96);

            RelationToValueEdge rtvEdge97 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+14),valueNodeList.get(22));
            rtvEdge97.setIcmList(new HashSet<Long>(s1));
            rtvEdge97.setId(c++);
            relationNodeList.get(curI*rNodeNum+14).getRtvEdges().add(rtvEdge97);
            valueNodeList.get(22).getRtvEdges().add(rtvEdge97);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge99 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+14), valueNodeList.get(33));
            rtvEdge99.setIcmList(new HashSet<Long>(s1));
            rtvEdge99.setId(c++);
            relationNodeList.get(curI*rNodeNum+14).getRtvEdges().add(rtvEdge99);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge99);

            //其次是Course和name的
            RelationToCEdge rtcEdge100 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+15),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge100.setIcmList(new HashSet<Long>(s1));
            rtcEdge100.setId(c++);
            relationNodeList.get(curI*rNodeNum+15).getRtcEdges().add(rtcEdge100);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge100);

            RelationToValueEdge rtvEdge101 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+15),valueNodeList.get(3));
            rtvEdge101.setIcmList(new HashSet<Long>(s1));
            rtvEdge101.setId(c++);
            relationNodeList.get(curI*rNodeNum+15).getRtvEdges().add(rtvEdge101);
            valueNodeList.get(3).getRtvEdges().add(rtvEdge101);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge103 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+15),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge103.setIcmList(new HashSet<Long>(s1));
            rtcEdge103.setId(c++);
            relationNodeList.get(curI*rNodeNum+15).getRtcEdges().add(rtcEdge103);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge103);

            RelationToValueEdge rtvEdge104 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+15),valueNodeList.get(14));
            rtvEdge104.setIcmList(new HashSet<Long>(s1));
            rtvEdge104.setId(c++);
            relationNodeList.get(curI*rNodeNum+15).getRtvEdges().add(rtvEdge104);
            valueNodeList.get(14).getRtvEdges().add(rtvEdge104);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge106 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+15), valueNodeList.get(33));
            rtvEdge106.setIcmList(new HashSet<Long>(s1));
            rtvEdge106.setId(c++);
            relationNodeList.get(curI*rNodeNum+15).getRtvEdges().add(rtvEdge106);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge106);

            //Course和credit
            RelationToCEdge rtcEdge107 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+16),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge107.setIcmList(new HashSet<Long>(s1));
            rtcEdge107.setId(c++);
            relationNodeList.get(curI*rNodeNum+16).getRtcEdges().add(rtcEdge107);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge107);

            RelationToValueEdge rtvEdge108 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+16),valueNodeList.get(3));
            rtvEdge108.setIcmList(new HashSet<Long>(s1));
            rtvEdge108.setId(c++);
            relationNodeList.get(curI*rNodeNum+16).getRtvEdges().add(rtvEdge108);
            valueNodeList.get(3).getRtvEdges().add(rtvEdge108);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge110 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+16),cLassNodeList.get(curI*cNodeNum+5));
            rtcEdge110.setIcmList(new HashSet<Long>(s1));
            rtcEdge110.setId(c++);
            relationNodeList.get(curI*rNodeNum+16).getRtcEdges().add(rtcEdge110);
            cLassNodeList.get(curI*cNodeNum+5).getRtcEdges().add(rtcEdge110);

            RelationToValueEdge rtvEdge111 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+16),valueNodeList.get(23));
            rtvEdge111.setIcmList(new HashSet<Long>(s1));
            rtvEdge111.setId(c++);
            relationNodeList.get(curI*rNodeNum+16).getRtvEdges().add(rtvEdge111);
            valueNodeList.get(23).getRtvEdges().add(rtvEdge111);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge113 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+16), valueNodeList.get(33));
            rtvEdge113.setIcmList(new HashSet<Long>(s1));
            rtvEdge113.setId(c++);
            relationNodeList.get(curI*rNodeNum+16).getRtvEdges().add(rtvEdge113);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge113);

            //Course与teacherId
            RelationToCEdge rtcEdge114 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+17),cLassNodeList.get(curI*cNodeNum+3));
            rtcEdge114.setIcmList(new HashSet<Long>(s1));
            rtcEdge114.setId(c++);
            relationNodeList.get(curI*rNodeNum+17).getRtcEdges().add(rtcEdge114);
            cLassNodeList.get(curI*cNodeNum+3).getRtcEdges().add(rtcEdge114);

            RelationToValueEdge rtvEdge115 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+17),valueNodeList.get(3));
            rtvEdge115.setIcmList(new HashSet<Long>(s1));
            rtvEdge115.setId(c++);
            relationNodeList.get(curI*rNodeNum+17).getRtvEdges().add(rtvEdge115);
            valueNodeList.get(3).getRtvEdges().add(rtvEdge115);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge117 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+17),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge117.setIcmList(new HashSet<Long>(s1));
            rtcEdge117.setId(c++);
            relationNodeList.get(curI*rNodeNum+17).getRtcEdges().add(rtcEdge117);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge117);

            RelationToValueEdge rtvEdge118 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+17),valueNodeList.get(24));
            rtvEdge118.setIcmList(new HashSet<Long>(s1));
            rtvEdge118.setId(c++);
            relationNodeList.get(curI*rNodeNum+17).getRtvEdges().add(rtvEdge118);
            valueNodeList.get(24).getRtvEdges().add(rtvEdge118);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge120 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+17), valueNodeList.get(33));
            rtvEdge120.setIcmList(new HashSet<Long>(s1));
            rtvEdge120.setId(c++);
            relationNodeList.get(curI*rNodeNum+17).getRtvEdges().add(rtvEdge120);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge120);

            //接下来是Teacher的属性关系
            //首先是Teacher与tid
            RelationToCEdge rtcEdge121 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+18),cLassNodeList.get(curI*cNodeNum+2));
            rtcEdge121.setIcmList(new HashSet<Long>(s1));
            rtcEdge121.setId(c++);
            relationNodeList.get(curI*rNodeNum+18).getRtcEdges().add(rtcEdge121);
            cLassNodeList.get(curI*cNodeNum+2).getRtcEdges().add(rtcEdge121);

            RelationToValueEdge rtvEdge122 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+18),valueNodeList.get(2));
            rtvEdge122.setIcmList(new HashSet<Long>(s1));
            rtvEdge122.setId(c++);
            relationNodeList.get(curI*rNodeNum+18).getRtvEdges().add(rtvEdge122);
            valueNodeList.get(2).getRtvEdges().add(rtvEdge122);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge124 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+18),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge124.setIcmList(new HashSet<Long>(s1));
            rtcEdge124.setId(c++);
            relationNodeList.get(curI*rNodeNum+18).getRtcEdges().add(rtcEdge124);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge124);

            RelationToValueEdge rtvEdge125 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+18),valueNodeList.get(25));
            rtvEdge125.setIcmList(new HashSet<Long>(s1));
            rtvEdge125.setId(c++);
            relationNodeList.get(curI*rNodeNum+18).getRtvEdges().add(rtvEdge125);
            valueNodeList.get(25).getRtvEdges().add(rtvEdge125);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge127 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+18), valueNodeList.get(33));
            rtvEdge127.setIcmList(new HashSet<Long>(s1));
            rtvEdge127.setId(c++);
            relationNodeList.get(curI*rNodeNum+18).getRtvEdges().add(rtvEdge127);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge127);

            //Teacher与title的关系
            RelationToCEdge rtcEdge128 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+19),cLassNodeList.get(curI*cNodeNum+2));
            rtcEdge128.setIcmList(new HashSet<Long>(s1));
            rtcEdge128.setId(c++);
            relationNodeList.get(curI*rNodeNum+19).getRtcEdges().add(rtcEdge128);
            cLassNodeList.get(curI*cNodeNum+2).getRtcEdges().add(rtcEdge128);

            RelationToValueEdge rtvEdge129 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+19),valueNodeList.get(2));
            rtvEdge129.setIcmList(new HashSet<Long>(s1));
            rtvEdge129.setId(c++);
            relationNodeList.get(curI*rNodeNum+19).getRtvEdges().add(rtvEdge129);
            valueNodeList.get(2).getRtvEdges().add(rtvEdge129);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge131 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+19),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge131.setIcmList(new HashSet<Long>(s1));
            rtcEdge131.setId(c++);
            relationNodeList.get(curI*rNodeNum+19).getRtcEdges().add(rtcEdge131);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge131);

            RelationToValueEdge rtvEdge132 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+19),valueNodeList.get(26));
            rtvEdge132.setIcmList(new HashSet<Long>(s1));
            rtvEdge132.setId(c++);
            relationNodeList.get(curI*rNodeNum+19).getRtvEdges().add(rtvEdge132);
            valueNodeList.get(26).getRtvEdges().add(rtvEdge132);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge134 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+19), valueNodeList.get(33));
            rtvEdge134.setIcmList(new HashSet<Long>(s1));
            rtvEdge134.setId(c++);
            relationNodeList.get(curI*rNodeNum+19).getRtvEdges().add(rtvEdge134);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge134);

            //下面是Teacher与hightestEducation
            RelationToCEdge rtcEdge135 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+20),cLassNodeList.get(curI*cNodeNum+2));
            rtcEdge135.setIcmList(new HashSet<Long>(s1));
            rtcEdge135.setId(c++);
            relationNodeList.get(curI*rNodeNum+20).getRtcEdges().add(rtcEdge135);
            cLassNodeList.get(curI*cNodeNum+2).getRtcEdges().add(rtcEdge135);

            RelationToValueEdge rtvEdge136 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+20),valueNodeList.get(2));
            rtvEdge136.setIcmList(new HashSet<Long>(s1));
            rtvEdge136.setId(c++);
            relationNodeList.get(curI*rNodeNum+20).getRtvEdges().add(rtvEdge136);
            valueNodeList.get(2).getRtvEdges().add(rtvEdge136);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge138 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+20),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge138.setIcmList(new HashSet<Long>(s1));
            rtcEdge138.setId(c++);
            relationNodeList.get(curI*rNodeNum+20).getRtcEdges().add(rtcEdge138);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge138);

            RelationToValueEdge rtvEdge139 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+20),valueNodeList.get(27));
            rtvEdge139.setIcmList(new HashSet<Long>(s1));
            rtvEdge139.setId(c++);
            relationNodeList.get(curI*rNodeNum+20).getRtvEdges().add(rtvEdge139);
            valueNodeList.get(27).getRtvEdges().add(rtvEdge139);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge141 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+20), valueNodeList.get(33));
            rtvEdge141.setIcmList(new HashSet<Long>(s1));
            rtvEdge141.setId(c++);
            relationNodeList.get(curI*rNodeNum+20).getRtvEdges().add(rtvEdge141);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge141);

            //下面是Teacher与department
            RelationToCEdge rtcEdge142 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+21),cLassNodeList.get(curI*cNodeNum+2));
            rtcEdge142.setIcmList(new HashSet<Long>(s1));
            rtcEdge142.setId(c++);
            relationNodeList.get(curI*rNodeNum+21).getRtcEdges().add(rtcEdge142);
            cLassNodeList.get(curI*cNodeNum+2).getRtcEdges().add(rtcEdge142);

            RelationToValueEdge rtvEdge143 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+21),valueNodeList.get(2));
            rtvEdge143.setIcmList(new HashSet<Long>(s1));
            rtvEdge143.setId(c++);
            relationNodeList.get(curI*rNodeNum+21).getRtvEdges().add(rtvEdge143);
            valueNodeList.get(2).getRtvEdges().add(rtvEdge143);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge145 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+21),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge145.setIcmList(new HashSet<Long>(s1));
            rtcEdge145.setId(c++);
            relationNodeList.get(curI*rNodeNum+21).getRtcEdges().add(rtcEdge145);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge145);

            RelationToValueEdge rtvEdge146 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+21),valueNodeList.get(28));
            rtvEdge146.setIcmList(new HashSet<Long>(s1));
            rtvEdge146.setId(c++);
            relationNodeList.get(curI*rNodeNum+21).getRtvEdges().add(rtvEdge146);
            valueNodeList.get(28).getRtvEdges().add(rtvEdge146);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge148 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+21), valueNodeList.get(33));
            rtvEdge148.setIcmList(new HashSet<Long>(s1));
            rtvEdge148.setId(c++);
            relationNodeList.get(curI*rNodeNum+21).getRtvEdges().add(rtvEdge148);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge148);

            //接下来是CourseSchedule的属性关系
            RelationToCEdge rtcEdge149 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+22),cLassNodeList.get(curI*cNodeNum+4));
            rtcEdge149.setIcmList(new HashSet<Long>(s1));
            rtcEdge149.setId(c++);
            relationNodeList.get(curI*rNodeNum+22).getRtcEdges().add(rtcEdge149);
            cLassNodeList.get(curI*cNodeNum+4).getRtcEdges().add(rtcEdge149);

            RelationToValueEdge rtvEdge150 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+22),valueNodeList.get(4));
            rtvEdge150.setIcmList(new HashSet<Long>(s1));
            rtvEdge150.setId(c++);
            relationNodeList.get(curI*rNodeNum+22).getRtvEdges().add(rtvEdge150);
            valueNodeList.get(4).getRtvEdges().add(rtvEdge150);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge152 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+22),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge152.setIcmList(new HashSet<Long>(s1));
            rtcEdge152.setId(c++);
            relationNodeList.get(curI*rNodeNum+22).getRtcEdges().add(rtcEdge152);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge152);

            RelationToValueEdge rtvEdge153 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+22),valueNodeList.get(22));
            rtvEdge153.setIcmList(new HashSet<Long>(s1));
            rtvEdge153.setId(c++);
            relationNodeList.get(curI*rNodeNum+22).getRtvEdges().add(rtvEdge153);
            valueNodeList.get(22).getRtvEdges().add(rtvEdge153);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge155 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+22), valueNodeList.get(33));
            rtvEdge155.setIcmList(new HashSet<Long>(s1));
            rtvEdge155.setId(c++);
            relationNodeList.get(curI*rNodeNum+22).getRtvEdges().add(rtvEdge155);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge155);

            //下面是CourseSchedule与locate
            RelationToCEdge rtcEdge156 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+23),cLassNodeList.get(curI*cNodeNum+4));
            rtcEdge156.setIcmList(new HashSet<Long>(s1));
            rtcEdge156.setId(c++);
            relationNodeList.get(curI*rNodeNum+23).getRtcEdges().add(rtcEdge156);
            cLassNodeList.get(curI*cNodeNum+4).getRtcEdges().add(rtcEdge156);

            RelationToValueEdge rtvEdge157 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+23),valueNodeList.get(4));
            rtvEdge157.setIcmList(new HashSet<Long>(s1));
            rtvEdge157.setId(c++);
            relationNodeList.get(curI*rNodeNum+23).getRtvEdges().add(rtvEdge157);
            valueNodeList.get(4).getRtvEdges().add(rtvEdge157);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge159 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+23),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge159.setIcmList(new HashSet<Long>(s1));
            rtcEdge159.setId(c++);
            relationNodeList.get(curI*rNodeNum+23).getRtcEdges().add(rtcEdge159);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge159);

            RelationToValueEdge rtvEdge160 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+23),valueNodeList.get(29));
            rtvEdge160.setIcmList(new HashSet<Long>(s1));
            rtvEdge160.setId(c++);
            relationNodeList.get(curI*rNodeNum+23).getRtvEdges().add(rtvEdge160);
            valueNodeList.get(29).getRtvEdges().add(rtvEdge160);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge162 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+23), valueNodeList.get(33));
            rtvEdge162.setIcmList(new HashSet<Long>(s1));
            rtvEdge162.setId(c++);
            relationNodeList.get(curI*rNodeNum+23).getRtvEdges().add(rtvEdge162);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge162);

            //下面是CourseSchedule与date
            RelationToCEdge rtcEdge163 =
                    new RelationToCEdge("e0","class",relationNodeList.get(curI*rNodeNum+24),cLassNodeList.get(curI*cNodeNum+4));
            rtcEdge163.setIcmList(new HashSet<Long>(s1));
            rtcEdge163.setId(c++);
            relationNodeList.get(curI*rNodeNum+24).getRtcEdges().add(rtcEdge163);
            cLassNodeList.get(curI*cNodeNum+4).getRtcEdges().add(rtcEdge163);

            RelationToValueEdge rtvEdge164 =
                    new RelationToValueEdge("e0","role",relationNodeList.get(curI*rNodeNum+24),valueNodeList.get(4));
            rtvEdge164.setIcmList(new HashSet<Long>(s1));
            rtvEdge164.setId(c++);
            relationNodeList.get(curI*rNodeNum+24).getRtvEdges().add(rtvEdge164);
            valueNodeList.get(4).getRtvEdges().add(rtvEdge164);

//            RelationToValueEdge rtvEdge11 =//多重性尚未修改
//                    new RelationToValueEdge("e0","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(35));
//            rtvEdge11.setIcmList(new HashSet<Long>(s1));
//            rtvEdge11.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge11);
//            valueNodeList.get(35).getRtvEdges().add(rtvEdge11);

            RelationToCEdge rtcEdge166 =
                    new RelationToCEdge("e1","class",relationNodeList.get(curI*rNodeNum+24),cLassNodeList.get(curI*cNodeNum+6));
            rtcEdge166.setIcmList(new HashSet<Long>(s1));
            rtcEdge166.setId(c++);
            relationNodeList.get(curI*rNodeNum+24).getRtcEdges().add(rtcEdge166);
            cLassNodeList.get(curI*cNodeNum+6).getRtcEdges().add(rtcEdge166);

            RelationToValueEdge rtvEdge167 =
                    new RelationToValueEdge("e1","role",relationNodeList.get(curI*rNodeNum+24),valueNodeList.get(30));
            rtvEdge167.setIcmList(new HashSet<Long>(s1));
            rtvEdge167.setId(c++);
            relationNodeList.get(curI*rNodeNum+24).getRtvEdges().add(rtvEdge167);
            valueNodeList.get(30).getRtvEdges().add(rtvEdge167);

//            RelationToValueEdge rtvEdge14 = //暂没修改
//                  new RelationToValueEdge("e1","multi",relationNodeList.get(curI*rNodeNum+2),valueNodeList.get(36));
//            rtvEdge14.setIcmList(new HashSet<Long>(s1));
//            rtvEdge14.setId(c++);
//            relationNodeList.get(curI*rNodeNum+2).getRtvEdges().add(rtvEdge14);
//            valueNodeList.get(36).getRtvEdges().add(rtvEdge14);

            RelationToValueEdge rtvEdge169 =
                    new RelationToValueEdge("","isAttribute",relationNodeList.get(curI*rNodeNum+24), valueNodeList.get(33));
            rtvEdge169.setIcmList(new HashSet<Long>(s1));
            rtvEdge169.setId(c++);
            relationNodeList.get(curI*rNodeNum+24).getRtvEdges().add(rtvEdge169);
            valueNodeList.get(33).getRtvEdges().add(rtvEdge169);

        }

    }

    private void initTest() {
        cNodeInit();
        rNodeInit();
        vNodeInit();
        edgeInit();
    }

    @Test
    public void testMigrate() {
        this.PersonNum=20;
        initTest();
        MigrateHandlerImpl migrateHandler=new MigrateHandlerImpl();
        migrateHandler.migrateInitForTest(cLassNodeList,relationNodeList,valueNodeList);
        migrateHandler.migrateHandler(0l);
    }

//    @Test
//    public void testRandomValue() {
//        this.PersonNum=2;
//        initTest();
//        MigrateHandlerImpl migrateHandler = new MigrateHandlerImpl();
//        migrateHandler.migrateInitForTest(cLassNodeList,relationNodeList,valueNodeList);
//        int[] randList=migrateHandler.randomValue();
//        for(int i=0;i<randList.length;i++) {
//            System.out.print(randList[i]+" ,");
//        }
//        System.out.println();
//    }

//    @Test
//    public void testGetTheUserSetForClassNode() {
//        initTest();
//        ClassNode cNode = cLassNodeList.get(0);
//        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
//            ctvEdge.getIcmList().add(2l);
//            ctvEdge.getIcmList().add(3l);
//            ctvEdge.getIcmList().add(5l);
//        }
//        for(RelationToCEdge rtcEdge : cNode.getRtcEdges()) {
//            rtcEdge.getIcmList().add(4l);
//            rtcEdge.getIcmList().add(6l);
//        }
//
//
//        RelationNode rNode = relationNodeList.get(0);
//        int t=0;
//        for(RelationToCEdge rtcEdge : rNode.getRtcEdges()) {
//            rtcEdge.getIcmList().add(2l);
//            rtcEdge.getIcmList().add(3l);
//            rtcEdge.getIcmList().add(4l);
//            t++;
//            if(t==1) rtcEdge.getIcmList().add(6l);
//        }
//
//        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
//            rtvEdge.getIcmList().add(5l);
//            rtvEdge.getIcmList().add(6l);
//            rtvEdge.getIcmList().add(7l);
//        }
//
//        MigrateUtil migrateUtil = new MigrateUtil();
//        migrateUtil.getTheUserSetForRelationNode(relationNodeList.get(0));
//    }


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
