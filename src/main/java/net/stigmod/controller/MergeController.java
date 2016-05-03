/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.conceptualmodel.*;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.service.Neo4jDatabaseCleaner;
import net.stigmod.service.migrateService.MigrateHandler;
import net.stigmod.service.migrateService.MigrateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.*;
import java.util.*;

/**
 * @author Kai Fu
 * @version 2016/3/8
 */
@Controller
public class MergeController {
    @Autowired
    ClassNodeRepository classNodeRepository;

    @Autowired
    RelationNodeRepository relationNodeRepository;

    @Autowired
    ValueNodeRepository valueNodeRepository;

    @Autowired
    MigrateService migrateService;

    @Autowired
    Neo4jDatabaseCleaner neo4jDatabaseCleaner;

    long modelId=0;

    @RequestMapping(value="/preMerge", method = RequestMethod.GET)
    @ResponseBody
    private String dealPreMergeDate() throws IOException{
        boolean isRunning = migrateService.isRunning();
        if(isRunning) return "Algorithm is running ~!";
        else {
            migrateService.setIsRunning(true);
            neo4jDatabaseCleaner.cleanDb();
            System.out.println("isRunning!");
            String path = "/Users/fukai/Desktop/58";
            List<ClassNode> classNodeList=new ArrayList<>();
            List<RelationNode> relationNodeList=new ArrayList<>();
            List<ValueNode> valueNodeList=new ArrayList<>();

            readFile(path,classNodeList,relationNodeList,valueNodeList);

//            Map<Long,Integer> uCMap = new HashMap<>();
//            Map<Long,Integer> uRMap = new HashMap<>();
//            for(int i=0;i<classNodeList.size();i++) {
//                ClassNode cNode = classNodeList.get(i);
//                Set<Long> icmSet = cNode.getIcmSet();
//                Iterator<Long> iter = icmSet.iterator();
//                while(iter.hasNext()) {
//                    long u = iter.next();
//                    if(uCMap.containsKey(u)) {
//                        uCMap.put(u,uCMap.get(u)+1);
//                    }else uCMap.put(u,1);
//                }
//            }
//
//            for(int i=0;i<relationNodeList.size();i++) {
//                RelationNode rNode = relationNodeList.get(i);
//                Set<Long> icmSet = rNode.getIcmSet();
//                Iterator<Long> iter = icmSet.iterator();
//                while(iter.hasNext()) {
//                    long u = iter.next();
//                    if(uRMap.containsKey(u)) {
//                        uRMap.put(u,uRMap.get(u)+1);
//                    }else uRMap.put(u,1);
//                }
//            }

//            for(long u : uCMap.keySet()) {
//                System.out.println(u+"\t"+uCMap.get(u)+"\t"+uRMap.get(u));
//            }

            for(int i=0;i<classNodeList.size();i++) classNodeRepository.save(classNodeList.get(i),1);
            for(int i=0;i<relationNodeList.size();i++) relationNodeRepository.save(relationNodeList.get(i),1);
            for(int i=0;i<valueNodeList.size();i++) valueNodeRepository.save(valueNodeList.get(i),1);

            try {
                migrateService.migrateAlgorithmImpls(0l);
            }catch(Exception e) {
                e.printStackTrace();
            }
            migrateService.setIsRunning(false);
            return "Hello World ~!";
        }
    }

    private void readFile(String path,List<ClassNode> classNodeList,List<RelationNode> relationNodeList,
                          List<ValueNode> valueNodeList) throws IOException {
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
            constructVNode(valueNodeList,valueNode , valueListMap , modelId , new HashSet<Long>() , tmpMulties[i]);
        }

        //设置一些必然存在的值节点
        ValueNode trueVNode = new ValueNode();
        constructVNode(valueNodeList,trueVNode, valueListMap, modelId, new HashSet<Long>() , "true");


        while(line!=null) {
//            System.out.println("line: "+line);
            Set<Long> curSet = new HashSet<>();
            curSet.add(curUId);
            if(!line.equals("*******************")) {
                String[] strs = line.split(":");
                if(strs[0].equals("class")) {
                    String cValueNodeName = strs[2];

                    ClassNode classNode = null;

                    ValueNode valueNode = null;//该class类的valueNode
                    if(valueListMap.containsKey(cValueNodeName)) {//class节点对每个用户而言不同,但value节点对每个用户相同
                        valueNode = valueNodeList.get(valueListMap.get(cValueNodeName));
                        valueNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                    }else {
                        valueNode = new ValueNode();//这个是class对应得value节点
                        constructVNode(valueNodeList,valueNode,valueListMap,modelId,curSet,cValueNodeName);
                    }

                    if(classListMap.containsKey(cValueNodeName)) {
                        classNode = classNodeList.get(classListMap.get(cValueNodeName));
                        classNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                    }else {
                        classNode = new ClassNode();
                        constructCNode(classNodeList,classNode,classListMap,modelId,curSet,cValueNodeName);

                        //创建了classNode和valueNode,下面创建ctv这条边
                        ClassToValueEdge ctvEdge = new ClassToValueEdge("name",classNode,valueNode);
                        ctvEdge.setIcmSet(new HashSet<Long>(curSet));
                        ctvEdge.setCcmId(modelId);
                        classNode.getCtvEdges().add(ctvEdge);
                        valueNode.getCtvEdges().add(ctvEdge);
                    }


                    String lowerCValueNodeName = cValueNodeName.toLowerCase();//当前名字的小写
                    ValueNode mainRoleVNode = null;//该class类的role

                    if(valueListMap.containsKey(lowerCValueNodeName)) {
                        mainRoleVNode = valueNodeList.get(valueListMap.get(lowerCValueNodeName));
                        mainRoleVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                    }else {
                        mainRoleVNode = new ValueNode();//这个是针对该类的role
                        constructVNode(valueNodeList,mainRoleVNode,valueListMap,modelId,curSet,lowerCValueNodeName);
                    }

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
                        ValueNode otherVNode;//只在otherCNode到otherVNode有用

                        if(valueListMap.containsKey(typeName)) {
                            otherVNode = valueNodeList.get(valueListMap.get(typeName));
                            otherVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                        }else {
                            otherVNode = new ValueNode();
                            constructVNode(valueNodeList,otherVNode,valueListMap,modelId,curSet,typeName);
                        }

                        if(classListMap.containsKey(typeName)) {
                            otherCNode = classNodeList.get(classListMap.get(typeName));
                            otherCNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                            otherCNode.getCtvEdges().iterator().next().addIcmSetFromSet(new HashSet<Long>(curSet));
                        }else {
                            otherCNode = new ClassNode();
                            constructCNode(classNodeList,otherCNode,classListMap,modelId,curSet,typeName);

                            ClassToValueEdge ctvEdge2 = new ClassToValueEdge("name",otherCNode,otherVNode);
                            ctvEdge2.setIcmSet(new HashSet<Long>(curSet));
                            ctvEdge2.setCcmId(modelId);
                            otherCNode.getCtvEdges().add(ctvEdge2);
                            otherVNode.getCtvEdges().add(ctvEdge2);
                        }

                        ValueNode roleVNode;
                        if(valueListMap.containsKey(attrRole)) {
                            roleVNode = valueNodeList.get(valueListMap.get(attrRole));
                            roleVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                        }else {
                            roleVNode = new ValueNode();
                            constructVNode(valueNodeList,roleVNode,valueListMap,modelId,curSet,attrRole);
                        }

                        //这个时候,classNode,valueNode,mainVNode是类的相关性质,otherCNode,otherVNode和roleVNode是属性的相关性质
                        RelationNode relationNode1 = new RelationNode();
                        constructRNode(relationNodeList,relationNode1,modelId,curSet);

                        ValueNode attrMultiVNode = null;
                        ValueNode classMultiVNode = valueNodeList.get(valueListMap.get("1"));
                        if(attrMulti.equals("")) attrMultiVNode = valueNodeList.get(valueListMap.get("1"));
                        else attrMultiVNode = valueNodeList.get(valueListMap.get("*"));
                        attrMultiVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                        classMultiVNode.addIcmSetFromSet(new HashSet<Long>(curSet));

                        RelationToClassEdge rtcEdge1 = new RelationToClassEdge("e0","class",relationNode1,classNode);
                        rtcEdge1.setIcmSet(new HashSet<Long>(curSet));
                        rtcEdge1.setCcmId(modelId);
                        relationNode1.getRtcEdges().add(rtcEdge1);
                        classNode.getRtcEdges().add(rtcEdge1);

                        //这是第一个role
                        RelationToValueEdge rtvEdge1 = new RelationToValueEdge("e0","role",relationNode1,mainRoleVNode);
                        rtvEdge1.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge1.setCcmId(modelId);
                        relationNode1.getRtvEdges().add(rtvEdge1);
                        mainRoleVNode.getRtvEdges().add(rtvEdge1);

                        RelationToValueEdge rtvEdge2 = new RelationToValueEdge("e0","multi",relationNode1,classMultiVNode);
                        rtvEdge2.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge2.setCcmId(modelId);
                        relationNode1.getRtvEdges().add(rtvEdge2);
                        classMultiVNode.getRtvEdges().add(rtvEdge2);
                        classMultiVNode.addIcmSetFromSet(new HashSet<Long>(curSet));

                        //下面是e1端

                        RelationToClassEdge rtcEdge2 = new RelationToClassEdge("e1","class",relationNode1,otherCNode);
                        rtcEdge2.setIcmSet(new HashSet<Long>(curSet));
                        rtcEdge2.setCcmId(modelId);
                        relationNode1.getRtcEdges().add(rtcEdge2);
                        otherCNode.getRtcEdges().add(rtcEdge2);

                        RelationToValueEdge rtvEdge3 = new RelationToValueEdge("e1","role",relationNode1,roleVNode);
                        rtvEdge3.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge3.setCcmId(modelId);
                        relationNode1.getRtvEdges().add(rtvEdge3);
                        roleVNode.getRtvEdges().add(rtvEdge3);

                        RelationToValueEdge rtvEdge4 = new RelationToValueEdge("e1","multi",relationNode1,attrMultiVNode);
                        rtvEdge4.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge4.setCcmId(modelId);
                        relationNode1.getRtvEdges().add(rtvEdge4);
                        attrMultiVNode.getRtvEdges().add(rtvEdge4);
                        attrMultiVNode.addIcmSetFromSet(new HashSet<Long>(curSet));

                        //下面是一个指向true节点的isAttribute边
                        RelationToValueEdge rtvEdge5 = new RelationToValueEdge("","isAttribute",relationNode1,
                                valueNodeList.get(valueListMap.get("true")));
                        rtvEdge5.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge5.setCcmId(modelId);
                        relationNode1.getRtvEdges().add(rtvEdge5);
                        valueNodeList.get(valueListMap.get("true")).getRtvEdges().add(rtvEdge5);
                        valueNodeList.get(valueListMap.get("true")).addIcmSetFromSet(new HashSet<Long>(curSet));
                    }

                }else if(strs[0].equals("relation")){
                    //下面是relation这种

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
                    constructRNode(relationNodeList,relationNode,modelId,curSet);

                    RelationToClassEdge rtcEdge1 = new RelationToClassEdge("e0","class",relationNode,startCNode);
                    rtcEdge1.setIcmSet(new HashSet<Long>(curSet));
                    rtcEdge1.setCcmId(modelId);
                    relationNode.getRtcEdges().add(rtcEdge1);
                    startCNode.getRtcEdges().add(rtcEdge1);

                    RelationToClassEdge rtcEdge2 = new RelationToClassEdge("e1","class",relationNode,endCNode);
                    rtcEdge2.setIcmSet(new HashSet<Long>(curSet));
                    rtcEdge2.setCcmId(modelId);
                    relationNode.getRtcEdges().add(rtcEdge2);
                    endCNode.getRtcEdges().add(rtcEdge2);

                    //获取role节点
                    if(roles != null) {
                        ValueNode startRoleVNode = null;
                        ValueNode endRoleVNode = null;
                        if(roles!=null) {
                            if(valueListMap.containsKey(roles[0])) {
                                startRoleVNode = valueNodeList.get(valueListMap.get(roles[0]));
                                startRoleVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                            }else {//说明系统中没有这个value节点
                                startRoleVNode = new ValueNode();
                                constructVNode(valueNodeList,startRoleVNode,valueListMap,modelId,curSet,roles[0]);
                            }
                            if(valueListMap.containsKey(roles[1])) {
                                endRoleVNode = valueNodeList.get(valueListMap.get(roles[1]));
                                endRoleVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                            }else {
                                endRoleVNode = new ValueNode();
                                constructVNode(valueNodeList,endRoleVNode,valueListMap,modelId,curSet,roles[1]);
                            }
                        }else {
                            startRoleVNode = valueNodeList.get(valueListMap.get(startCName.toLowerCase()));
                            endRoleVNode = valueNodeList.get(valueListMap.get(endCName.toLowerCase()));
                        }

                        RelationToValueEdge rtvEdge1 = new RelationToValueEdge("e0","role",relationNode,startRoleVNode);
                        rtvEdge1.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge1.setCcmId(modelId);
                        relationNode.getRtvEdges().add(rtvEdge1);
                        startRoleVNode.getRtvEdges().add(rtvEdge1);

                        RelationToValueEdge rtvEdge3 = new RelationToValueEdge("e1","role",relationNode,endRoleVNode);
                        rtvEdge3.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge3.setCcmId(modelId);
                        relationNode.getRtvEdges().add(rtvEdge3);
                        endRoleVNode.getRtvEdges().add(rtvEdge3);
                    }

                    //获取multi类型
                    if(multis != null) {
//                        System.out.println("multis: "+strs[3]);
                        ValueNode startMultiVNode = valueNodeList.get(valueListMap.get(multis[0]));
                        ValueNode endMultiVNode = valueNodeList.get(valueListMap.get(multis[1]));
                        startMultiVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                        endMultiVNode.addIcmSetFromSet(new HashSet<Long>(curSet));

                        RelationToValueEdge rtvEdge2 = new RelationToValueEdge("e0","multi",relationNode,startMultiVNode);
                        rtvEdge2.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge2.setCcmId(modelId);
                        relationNode.getRtvEdges().add(rtvEdge2);
                        startMultiVNode.getRtvEdges().add(rtvEdge2);

                        RelationToValueEdge rtvEdge4 = new RelationToValueEdge("e1","multi",relationNode,endMultiVNode);
                        rtvEdge4.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge4.setCcmId(modelId);
                        relationNode.getRtvEdges().add(rtvEdge4);
                        endMultiVNode.getRtvEdges().add(rtvEdge4);
                    }

                    //获取relationName的value节点
                    if(relationName != null) {
                        ValueNode relationNameVNode = null;
                        if(valueListMap.containsKey(relationName)) {
                            relationNameVNode = valueNodeList.get(valueListMap.get(relationName));
                            relationNameVNode.addIcmSetFromSet(new HashSet<Long>(curSet));
                        }else {
                            relationNameVNode = new ValueNode();
                            constructVNode(valueNodeList,relationNameVNode,valueListMap,modelId,curSet,relationName);
                        }

                        RelationToValueEdge rtvEdge5 = new RelationToValueEdge("","relationName",relationNode,relationNameVNode);
                        rtvEdge5.setIcmSet(new HashSet<Long>(curSet));
                        rtvEdge5.setCcmId(modelId);
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
                    rtvEdge6.setIcmSet(new HashSet<Long>(curSet));
                    rtvEdge6.setCcmId(modelId);
                    relationNode.getRtvEdges().add(rtvEdge6);
                    valueNodeList.get(valueListMap.get("true")).getRtvEdges().add(rtvEdge6);
                    valueNodeList.get(valueListMap.get("true")).addIcmSetFromSet(new HashSet<Long>(curSet));
                }
            }else {
                curUId=curUId+1;
                classListMap.clear();
            }
            line = br.readLine();
        }
    }

    private void constructVNode(List<ValueNode> valueNodeList,ValueNode vNode,Map<String,Integer> valueListMap,
                                long modelId,Set<Long> icmSet,String name) {
        vNode.setCcmId(modelId);
        vNode.setIcmSet(new HashSet<Long>(icmSet));
        vNode.setName(name);
        valueNodeList.add(vNode);
        valueListMap.put(name, valueNodeList.size() - 1);
    }

    private void constructCNode(List<ClassNode> classNodeList,ClassNode cNode,Map<String,Integer> classListMap,long modelId,Set<Long> icmSet,String name) {
        cNode.setIcmSet(new HashSet<Long>(icmSet));
        cNode.setCcmId(modelId);
        classNodeList.add(cNode);
        classListMap.put(name,classNodeList.size()-1);
    }

    private void constructRNode(List<RelationNode> relationNodeList,RelationNode rNode,long modelId,Set<Long> icmSet) {
        rNode.setCcmId(modelId);
        rNode.setIcmSet(new HashSet<Long>(icmSet));
        relationNodeList.add(rNode);
    }

}
