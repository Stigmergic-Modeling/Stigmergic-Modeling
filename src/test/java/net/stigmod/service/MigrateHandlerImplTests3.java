/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.conceptualmodel.RelationNode;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.domain.conceptualmodel.ClassToValueEdge;
import net.stigmod.domain.conceptualmodel.RelationToClassEdge;
import net.stigmod.domain.conceptualmodel.RelationToValueEdge;
import net.stigmod.service.migrateService.MigrateHandlerImpl;
import org.junit.Test;

import java.io.*;
import java.util.*;

/**
 * @author Kai Fu
 * @version 2016/2/28
 */
public class MigrateHandlerImplTests3 {
    List<ClassNode> classNodeList=new ArrayList<>();
    List<RelationNode> relationNodeList=new ArrayList<>();
    List<ValueNode> valueNodeList=new ArrayList<>();

    //这些nodeNum记录了对应节点数目
    int vNodeNum=37;
    int cNodeNum=8;
    int rNodeNum=25;//暂定

    long c=0;
    int PersonNum;

    public void readFile(String path) throws IOException {
        File file = new File(path);
        InputStreamReader inreader = new InputStreamReader(new FileInputStream(file));
        BufferedReader br = new BufferedReader(inreader);
        String line =  br.readLine();
        long curUId = 1;
        long c=0;
        Map<String,Integer> valueListMap = new HashMap<>();
        Map<String,Integer> classListMap = new HashMap<>();//这个每个model清理一次

        //设置常见的multi类型
        String[] tmpMulties = {"1","*","1..*","0..1"};
        for(int i=0;i<4;i++) {
            ValueNode valueNode = new ValueNode();
            constructVNode(valueNode,valueListMap,c++,0l,new HashSet<Long>(),tmpMulties[i]);
        }

        //设置一些必然存在的值节点
        ValueNode trueVNode = new ValueNode();
        constructVNode(trueVNode,valueListMap,c++,0l,new HashSet<Long>(),"true");


        while(line!=null) {
            Set<Long> curSet = new HashSet<>();
            curSet.add(curUId);
            if(!line.equals("*******************")) {
                String[] strs = line.split(":");
                if(strs[0].equals("class")) {
                    String cValueNodeName = strs[2];

                    ClassNode classNode = new ClassNode();
                    classNode.setIcmSet(new HashSet<Long>(curSet));
                    classNode.setCcmId(0l);
                    classNode.setId(c++);
                    classNodeList.add(classNode);
                    classListMap.put(cValueNodeName,classNodeList.size()-1);


                    String lowerCValueNodeName = cValueNodeName.toLowerCase();//当前名字的小写

//                    if(line.equals("class:5:Cart:productId*_Int")) {
//                        System.out.println("line: "+line+" ,lowerCValueNodeName: "+lowerCValueNodeName);
//                    }
                    ValueNode valueNode;//该class类的valueNode
                    ValueNode mainRoleVNode;//该class类的role
                    if(valueListMap.containsKey(cValueNodeName)) {//class节点对每个用户而言不同,但value节点对每个用户相同
                        valueNode = valueNodeList.get(valueListMap.get(cValueNodeName));
                        valueNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                    }else {
                        valueNode = new ValueNode();//这个是class对应得value节点
                        constructVNode(valueNode,valueListMap,c++,0l,curSet,cValueNodeName);
                    }

                    if(valueListMap.containsKey(lowerCValueNodeName)) {
                        mainRoleVNode = valueNodeList.get(valueListMap.get(lowerCValueNodeName));
                        mainRoleVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                    }else {
                        mainRoleVNode = new ValueNode();//这个是针对该类的role
                        constructVNode(mainRoleVNode,valueListMap,c++,0l,curSet,lowerCValueNodeName);
                    }
                    //创建了classNode和valueNode,下面创建ctv这条边
                    ClassToValueEdge ctvEdge = new ClassToValueEdge("name",classNode,valueNode);
                    ctvEdge.setId(c++);
                    ctvEdge.setIcmSet(new HashSet<Long>(curSet));
                    ctvEdge.setCcmId(0l);
                    classNode.getCtvEdges().add(ctvEdge);
                    valueNode.getCtvEdges().add(ctvEdge);

                    //下面是Class节点与它对应的attribute节点的关联
                    for(int i=3;i<strs.length;i++) {
                        if(strs[i]==null||strs[i].equals("")) continue;
                        String[] subStrs = strs[i].split("_");//获得对应属性与类型
                        String attrRole = subStrs[0];
                        String attrMulti = "";
                        if(attrRole.indexOf("*")!=-1) {
                            attrRole=attrRole.split("\\*")[0];
                            attrMulti = "*";
                        }
                        String typeName = subStrs[1];
                        ClassNode otherCNode;
                        ValueNode otherVNode;

                        if(valueListMap.containsKey(typeName)) {
                            otherVNode = valueNodeList.get(valueListMap.get(typeName));
                            otherVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                        }else {
                            otherVNode = new ValueNode();
                            constructVNode(otherVNode,valueListMap,c++,0l,curSet,typeName);
                        }

                        if(classListMap.containsKey(typeName)) {
                            otherCNode = classNodeList.get(classListMap.get(typeName));
                            otherCNode.getIcmSet().addAll(new HashSet<Long>(curSet));

                            otherCNode.getCtvEdges().iterator().next().getIcmSet().addAll(new HashSet<Long>(curSet));
                        }else {
                            otherCNode = new ClassNode();
                            otherCNode.setId(c++);
                            otherCNode.setIcmSet(new HashSet<Long>(curSet));
                            otherCNode.setCcmId(0l);
                            classNodeList.add(otherCNode);
                            classListMap.put(typeName,classNodeList.size()-1);

                            ClassToValueEdge ctvEdge2 = new ClassToValueEdge("name",otherCNode,otherVNode);
                            ctvEdge2.setId(c++);
                            ctvEdge2.setIcmSet(new HashSet<Long>(curSet));
                            ctvEdge2.setCcmId(0l);
                            otherCNode.getCtvEdges().add(ctvEdge2);
                            otherVNode.getCtvEdges().add(ctvEdge2);
                        }

                        ValueNode roleVNode;
                        if(valueListMap.containsKey(attrRole)) {
                            roleVNode = valueNodeList.get(valueListMap.get(attrRole));
                            roleVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                        }else {
                            roleVNode = new ValueNode();
                            constructVNode(roleVNode,valueListMap,c++,0l,curSet,attrRole);
                        }

                        //这个时候,classNode,valueNode,mainVNode是类的相关性质,otherCNode,otherVNode和roleVNode是属性的相关性质
                        RelationNode relationNode1 = new RelationNode();
                        relationNode1.setId(c++);
                        relationNode1.setCcmId(0l);
                        relationNode1.setIcmSet(new HashSet<Long>(curSet));
                        relationNodeList.add(relationNode1);

                        ValueNode attrMultiVNode = null;
                        ValueNode classMultiVNode = valueNodeList.get(valueListMap.get("*"));
                        if(attrMulti.equals("")) attrMultiVNode = valueNodeList.get(valueListMap.get("1"));
                        else attrMultiVNode = valueNodeList.get(valueListMap.get("*"));
                        attrMultiVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                        classMultiVNode.getIcmSet().addAll(new HashSet<Long>(curSet));

                        RelationToClassEdge rtcEdge1 = new RelationToClassEdge("e0","class",relationNode1,classNode);
                        rtcEdge1.setIcmSet(new HashSet<Long>(curSet));
                        rtcEdge1.setId(c++);
                        rtcEdge1.setCcmId(0l);
                        relationNode1.getRtcEdges().add(rtcEdge1);
                        classNode.getRtcEdges().add(rtcEdge1);

                        RelationToValueEdge rtvEdge1 = new RelationToValueEdge("e0","role",relationNode1,mainRoleVNode);
                        rtvEdge1.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge1.setId(c++);
                        rtvEdge1.setCcmId(0l);
                        relationNode1.getRtvEdges().add(rtvEdge1);
                        mainRoleVNode.getRtvEdges().add(rtvEdge1);

                        RelationToValueEdge rtvEdge2 = new RelationToValueEdge("e0","multi",relationNode1,classMultiVNode);
                        rtvEdge2.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge2.setId(c++);
                        rtvEdge2.setCcmId(0l);
                        relationNode1.getRtvEdges().add(rtvEdge2);
                        classMultiVNode.getRtvEdges().add(rtvEdge2);

                        //下面是e1端

                        RelationToClassEdge rtcEdge2 = new RelationToClassEdge("e1","class",relationNode1,otherCNode);
                        rtcEdge2.setIcmSet(new HashSet<Long>(curSet));
                        rtcEdge2.setId(c++);
                        rtcEdge2.setCcmId(0l);
                        relationNode1.getRtcEdges().add(rtcEdge2);
                        otherCNode.getRtcEdges().add(rtcEdge2);

                        RelationToValueEdge rtvEdge3 = new RelationToValueEdge("e1","role",relationNode1,otherVNode);
                        rtvEdge3.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge3.setId(c++);
                        rtvEdge3.setCcmId(0l);
                        relationNode1.getRtvEdges().add(rtvEdge3);
                        otherVNode.getRtvEdges().add(rtvEdge3);

                        RelationToValueEdge rtvEdge4 = new RelationToValueEdge("e1","multi",relationNode1,attrMultiVNode);
                        rtvEdge4.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge4.setId(c++);
                        rtvEdge4.setCcmId(0l);
                        relationNode1.getRtvEdges().add(rtvEdge4);
                        attrMultiVNode.getRtvEdges().add(rtvEdge4);

                        //下面是一个指向true节点的isAttribute边
                        RelationToValueEdge rtvEdge5 = new RelationToValueEdge("","isAttribute",relationNode1,
                                valueNodeList.get(valueListMap.get("true")));
                        rtvEdge5.setId(c++);
                        rtvEdge5.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge5.setCcmId(0l);
                        relationNode1.getRtvEdges().add(rtvEdge5);
                        valueNodeList.get(valueListMap.get("true")).getRtvEdges().add(rtvEdge5);
                    }

                }else {
                    //下面是relation这种
//                    System.out.println("strs[1]: "+strs[1]);
                    String[] subCNameStrs = strs[1].split("_");
                    String startCName = subCNameStrs[0];
                    String endCName = subCNameStrs[1];
                    ClassNode startCNode = classNodeList.get(classListMap.get(startCName));
                    ClassNode endCNode = classNodeList.get(classListMap.get(endCName));

                    String relationType = strs[2];
                    String[] multis = null;
                    String relationName = null;
                    String[] roles = null;
                    if(strs.length>3&&(!strs[3].equals(""))) multis = strs[3].split("_");
                    if(strs.length>4&&(!strs[4].equals(""))) relationName = strs[4];
                    if(strs.length>5&&(!strs[5].equals(""))) roles = strs[5].split("_");


                    //下面构建这个ClassToRelationToClass的
                    RelationNode relationNode = new RelationNode();
                    relationNode.setId(c++);
                    relationNode.setCcmId(0l);
                    relationNode.setIcmSet(new HashSet<Long>(curSet));
                    relationNodeList.add(relationNode);

                    RelationToClassEdge rtcEdge1 = new RelationToClassEdge("e0","class",relationNode,startCNode);
                    rtcEdge1.setId(c++);
                    rtcEdge1.setIcmSet(new HashSet<Long>(curSet));
                    rtcEdge1.setCcmId(0l);
                    relationNode.getRtcEdges().add(rtcEdge1);
                    startCNode.getRtcEdges().add(rtcEdge1);

                    RelationToClassEdge rtcEdge2 = new RelationToClassEdge("e1","class",relationNode,endCNode);
                    rtcEdge2.setId(c++);
                    rtcEdge2.setIcmSet(new HashSet<Long>(curSet));
                    rtcEdge2.setCcmId(0l);
                    relationNode.getRtcEdges().add(rtcEdge2);
                    endCNode.getRtcEdges().add(rtcEdge2);

                    //获取role节点
                    if(roles != null) {
                        ValueNode startRoleVNode = null;
                        ValueNode endRoleVNode = null;
                        if(roles!=null) {
                            if(valueListMap.containsKey(roles[0])) {
                                startRoleVNode = valueNodeList.get(valueListMap.get(roles[0]));
                                startRoleVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                            }else {//说明系统中没有这个value节点
                                startRoleVNode = new ValueNode();
                                constructVNode(startRoleVNode,valueListMap,c++,0l,curSet,roles[0]);
                            }
                            if(valueListMap.containsKey(roles[1])) {
                                endRoleVNode = valueNodeList.get(valueListMap.get(roles[1]));
                                endRoleVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                            }else {
                                endRoleVNode = new ValueNode();
                                constructVNode(endRoleVNode,valueListMap,c++,0l,curSet,roles[1]);
                            }
                        }else {
                            startRoleVNode = valueNodeList.get(valueListMap.get(startCName.toLowerCase()));
                            endRoleVNode = valueNodeList.get(valueListMap.get(endCName.toLowerCase()));
                        }

                        RelationToValueEdge rtvEdge1 = new RelationToValueEdge("e0","role",relationNode,startRoleVNode);
                        rtvEdge1.setId(c++);
                        rtvEdge1.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge1.setCcmId(0l);
                        relationNode.getRtvEdges().add(rtvEdge1);
                        startRoleVNode.getRtvEdges().add(rtvEdge1);

                        RelationToValueEdge rtvEdge3 = new RelationToValueEdge("e1","role",relationNode,endRoleVNode);
                        rtvEdge3.setId(c++);
                        rtvEdge3.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge3.setCcmId(0l);
                        relationNode.getRtvEdges().add(rtvEdge3);
                        endRoleVNode.getRtvEdges().add(rtvEdge3);
                    }

                    //获取multi类型
                    if(multis != null) {
//                        System.out.println("multis: "+strs[3]);
                        ValueNode startMultiVNode = valueNodeList.get(valueListMap.get(multis[0]));
                        ValueNode endMultiVNode = valueNodeList.get(valueListMap.get(multis[1]));
                        startMultiVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                        endMultiVNode.getIcmSet().addAll(new HashSet<Long>(curSet));

                        RelationToValueEdge rtvEdge2 = new RelationToValueEdge("e0","multi",relationNode,startMultiVNode);
                        rtvEdge2.setId(c++);
                        rtvEdge2.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge2.setCcmId(0l);
                        relationNode.getRtvEdges().add(rtvEdge2);
                        startMultiVNode.getRtvEdges().add(rtvEdge2);

                        RelationToValueEdge rtvEdge4 = new RelationToValueEdge("e1","multi",relationNode,endMultiVNode);
                        rtvEdge4.setId(c++);
                        rtvEdge4.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge4.setCcmId(0l);
                        relationNode.getRtvEdges().add(rtvEdge4);
                        endMultiVNode.getRtvEdges().add(rtvEdge4);
                    }

                    //获取relationName的value节点
                    if(relationName != null) {
                        ValueNode relationNameVNode = null;
                        if(valueListMap.containsKey(relationName)) {
                            relationNameVNode = valueNodeList.get(valueListMap.get(relationName));
                            relationNameVNode.getIcmSet().addAll(new HashSet<Long>(curSet));
                        }else {
                            relationNameVNode = new ValueNode();
                            constructVNode(relationNameVNode,valueListMap,c++,0l,curSet,relationName);
                        }

                        RelationToValueEdge rtvEdge5 = new RelationToValueEdge("","relationName",relationNode,relationNameVNode);
                        rtvEdge5.setId(c++);
                        rtvEdge5.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge5.setCcmId(0l);
                        relationNode.getRtvEdges().add(rtvEdge5);
                        relationNameVNode.getRtvEdges().add(rtvEdge5);
                    }

                    //这样就差relationType的指针了
                    String typeEdgeName = "";
                    if(relationType.equals("Association")) {
                        typeEdgeName = "isAssociation";
                    }else if(relationType.equals("Generalization")){
                        typeEdgeName = "isGeneralization";
                    }else if(relationType.equals("Composition")) {
                        typeEdgeName = "isComposition";
                    }else if(relationType.equals("Aggregation")) {
                        typeEdgeName = "isAggregation";
                    }
                    RelationToValueEdge rtvEdge6 = new RelationToValueEdge("",typeEdgeName,relationNode,
                            valueNodeList.get(valueListMap.get("true")));
                    rtvEdge6.setId(c++);
                    rtvEdge6.setIcmSet(new HashSet<Long>(curSet));
                    rtvEdge6.setCcmId(0l);
                    relationNode.getRtvEdges().add(rtvEdge6);
                    valueNodeList.get(valueListMap.get("true")).getRtvEdges().add(rtvEdge6);
                }
            }else {
                curUId=curUId+1;
                classListMap.clear();
            }
            line = br.readLine();
        }
    }

    private void constructVNode(ValueNode vNode,Map<String,Integer> valueListMap,long vid,long modelId,Set<Long> icmSet,String name) {
//        if(name.equals("Cart")) {
//            System.out.println("111");
//        }
        vNode.setId(vid);
        vNode.setCcmId(modelId);
        vNode.setIcmSet(new HashSet<Long>(icmSet));
        vNode.setName(name);
        valueNodeList.add(vNode);
        valueListMap.put(name,valueNodeList.size()-1);
    }

    @Test
    public void testMigrate() throws IOException {
//        this.PersonNum=20;
        String path = "/Users/fukai/Desktop/fulldataset.txt";
        readFile(path);//
        MigrateHandlerImpl migrateHandler=new MigrateHandlerImpl();
        migrateHandler.migrateInitForTest(classNodeList,relationNodeList,valueNodeList,++c);
        migrateHandler.migrateHandler(0l);
    }
}
