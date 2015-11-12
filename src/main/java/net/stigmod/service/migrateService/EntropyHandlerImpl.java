/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.RelationNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.domain.relationship.RelationToCEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * @target 该类主要用来计算熵值:包括节点和ccm熵值
 *
 * @version     2015/11/11
 * @author 	    Kai Fu
 */

@Service
public class EntropyHandlerImpl implements EntropyHandler{

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private RelationNodeRepository relationNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;


    /**
     * 计算类节点的熵值
     * @param id
     * @return 熵值
     */
    public Double computeClassEntropy(Long id) {
        double res=0.0;
        ClassNode classNode=classNodeRepository.findOne(id);
        if(classNode!=null) {
            Set<ClassToValueEdge> ctvEdges=classNode.getCtvEdges();//所有的出边
            Set<RelationToCEdge> rtcEdges=classNode.getRtcEdges();//所有的入边
            Map<String,List<Set<Long>>> myMap=getMapForClassNode(ctvEdges,rtcEdges);
            res=compueteMapEntropy(myMap);
        }
        return res;
    }

    /**
     * 计算关系节点的熵值
     * @param id
     * @return 熵值
     */
    public Double computeRelationEntropy(Long id) {
        double res=0.0;
        RelationNode relationNode=relationNodeRepository.findOne(id);
        if(relationNode!=null) {
            Set<RelationToCEdge> rtcEdges=relationNode.getRtcEdges();
            Set<RelationToValueEdge> rtvEdges=relationNode.getRtvEdges();
            Map<String,List<Set<Long>>> myMap=getMapForRelationNode(rtcEdges,rtvEdges);
            res=compueteMapEntropy(myMap);
        }
        return res;
    }

    /**
     * 计算值节点的熵值
     * @param id
     * @return 熵值
     */
    public Double computeValueEntropy(Long id) {
        double res=0.0;
        ValueNode valueNode=valueNodeRepository.findOne(id);
        if(valueNode!=null) {
            Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();
            Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();
            Map<String,List<Set<Long>>> myMap=getMapForValueNode(ctvEdges,rtvEdges);
            res=compueteMapEntropy(myMap);
        }
        return res;
    }

    /**
     * 计算整个ccm的熵值...实际上目前这个有问题,因为没有区分不同的ccm,现在相当于假设系统只有一个ccm
     * @return 熵值
     */
    public Double computeSystemEntropy() {
        double res=0.0;
        //class node entropy
        Iterable<ClassNode> iClass=classNodeRepository.findAll();
        Iterator<ClassNode> iterClass=iClass.iterator();
        while(iterClass.hasNext()) {
            res+=iterClass.next().getEntropyValue();
        }

        //relation node entropy
        Iterable<RelationNode> iRelation=relationNodeRepository.findAll();
        Iterator<RelationNode> iterRelation=iRelation.iterator();
        while(iterRelation.hasNext()) {
            res+=iterRelation.next().getEntropyValue();
        }

        //value node entropy
        Iterable<ValueNode> iValue=valueNodeRepository.findAll();
        Iterator<ValueNode> iterValue=iValue.iterator();
        while(iterValue.hasNext()) {
            res+=iterValue.next().getEntropyValue();
        }

        return res;
    }


    /**
     * @target 主要是获取ClassNode节点的边的Map
     * @param ctvEdges :出边
     * @param rtcEdges :入边
     * @return map数据结构
     */
    private Map<String,List<Set<Long>>> getMapForClassNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToCEdge> rtcEdges) {
        Map<String,List<Set<Long>>> myMap=new HashMap<>();
        if((ctvEdges==null||ctvEdges.size()==0)&&(rtcEdges==null||rtcEdges.size()==0)) return myMap;
        addCTVElementToMap(myMap,ctvEdges);
        addRTCElementToMap(myMap,rtcEdges);
        return myMap;
    }


    /**
     * @target 主要是获取RelationNode节点的边的Map
     * @param rtcEdges :出边
     * @param rtvEdges :出边
     * @return map数据结构
     */
    private Map<String,List<Set<Long>>> getMapForRelationNode(Set<RelationToCEdge> rtcEdges,Set<RelationToValueEdge> rtvEdges) {
        Map<String,List<Set<Long>>> myMap=new HashMap<>();
        if((rtcEdges==null||rtcEdges.size()==0)&&(rtvEdges==null||rtvEdges.size()==0)) return myMap;
        addRTCElementToMap(myMap,rtcEdges);
        addRTVElementToMap(myMap,rtvEdges);
        return myMap;
    }


    /**
     * @target 主要是获取ValueNode节点的边的Map
     * @param ctvEdges :入边
     * @param rtvEdges :入边
     * @return map数据结构
     */
    private Map<String,List<Set<Long>>> getMapForValueNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToValueEdge> rtvEdges) {
        Map<String,List<Set<Long>>> myMap=new HashMap<>();
        if((ctvEdges==null||ctvEdges.size()==0)&&(rtvEdges==null||rtvEdges.size()==0)) return myMap;
        addCTVElementToMap(myMap,ctvEdges);
        addRTVElementToMap(myMap,rtvEdges);
        return myMap;
    }

    /**
     * @target: 计算出一个节点的熵值(classNode,relationNode,valueNode进行计算时均需调用此函数)
     * @param myMap:以某个节点的边名为key,value是对应边的用户集合
     * @return 熵值
     */
    private Double compueteMapEntropy(Map<String,List<Set<Long>>> myMap) {
        double entropy=0.0;
        for(String key:myMap.keySet()) {//这里的每一个key是种类型的边(比如name)
            List<Set<Long>> valuelist=myMap.get(key);
            Set<Long> userSet=new HashSet<Long>();//所有用户的集合
            for(int i=0;i<valuelist.size();i++) {
                userSet.addAll(valuelist.get(i));
            }
            if(userSet.size()==0) continue;
            Iterator<Long> uIter=userSet.iterator();
            Map<String,List<Long>> resMap=new HashMap<>();
            while(uIter.hasNext()) {
                Long uid=uIter.next();
                StringBuffer stringBuffer=new StringBuffer();
                for(int i=0;i<valuelist.size();i++) {
                    if(valuelist.get(i).contains(uid)) stringBuffer.append(i);
                    if(i!=valuelist.size()-1) stringBuffer.append("-");
                }
                String str_edge=stringBuffer.toString();//边分布名
                if(resMap.containsKey(str_edge)) {
                    resMap.get(str_edge).add(uid);
                }else {
                    List<Long> ulist=new ArrayList<>();
                    ulist.add(uid);
                    resMap.put(str_edge,ulist);
                }
            }

            int u_num=userSet.size();
            double tagE=0.0;
            for(String str:resMap.keySet()) {
                List<Long> ulist=resMap.get(str);
                if(ulist.size()==0) System.out.println("Error...EntropyHandler class...!!!");
                double p=(double) ulist.size()/u_num;
                double logp=Math.log(p)/Math.log(2);
                tagE+=p*logp;
            }
            tagE=-tagE;
            entropy+=tagE;
        }
        return entropy;
    }

    private void addRTVElementToMap(Map<String,List<Set<Long>>> myMap , Set<RelationToValueEdge> rtvEdges) {
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String edgeName = rtvEdge.getEdgeName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(rtvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtvEdge.getIcmList());
                myMap.put(edgeName,list);
            }
        }
    }

    private void addCTVElementToMap(Map<String,List<Set<Long>>> myMap , Set<ClassToValueEdge> ctvEdges) {
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(ctvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmList());
                myMap.put(edgeName ,list);
            }
        }
    }

    private void addRTCElementToMap(Map<String,List<Set<Long>>> myMap , Set<RelationToCEdge> rtcEdges) {
        for(RelationToCEdge rtcEdge:rtcEdges) {
            String edgeName = rtcEdge.getEdgeName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(rtcEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtcEdge.getIcmList());
                myMap.put(edgeName , list);
            }
        }
    }
}
