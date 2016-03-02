/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.conceptualmodel.RelationNode;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.domain.conceptualmodel.ClassToValueEdge;
import net.stigmod.domain.conceptualmodel.RelationToClassEdge;
import net.stigmod.domain.conceptualmodel.RelationToValueEdge;
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
    public Double computeClassEntropy(Long id , int nodeSum) {
        double res=0.0;
        ClassNode classNode=classNodeRepository.findOne(id);
        if(classNode!=null) {
            Set<ClassToValueEdge> ctvEdges=classNode.getCtvEdges();//所有的出边
            Set<RelationToClassEdge> rtcEdges=classNode.getRtcEdges();//所有的入边
            Map<String,List<Set<Long>>> myMap=getMapForClassNode(ctvEdges,rtcEdges);
            res= computeMapEntropy(myMap, nodeSum);
        }
        return res;
    }

    /**
     * 计算关系节点的熵值
     * @param id
     * @return 熵值
     */
    public Double computeRelationEntropy(Long id , int nodeSum) {
        double res=0.0;
        RelationNode relationNode=relationNodeRepository.findOne(id);
        if(relationNode!=null) {
            Set<RelationToClassEdge> rtcEdges=relationNode.getRtcEdges();
            Set<RelationToValueEdge> rtvEdges=relationNode.getRtvEdges();
            Map<String,List<Set<Long>>> myMap=getMapForRelationNode(rtcEdges,rtvEdges);
            res= computeMapEntropy(myMap, nodeSum);
        }
        return res;
    }

    /**
     * 计算值节点的熵值
     * @param id
     * @return 熵值
     */
    public Double computeValueEntropy(Long id , int nodeSum) {
        double res=0.0;
        ValueNode valueNode=valueNodeRepository.findOne(id);
        if(valueNode!=null) {
            Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();
            Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();
            Map<String,List<Set<Long>>> myMap=getMapForValueNode(ctvEdges,rtvEdges);
            res= computeMapEntropy(myMap, nodeSum);
        }
        return res;
    }

//    /**
//     * 计算整个ccm的熵值...实际上目前这个有问题,因为没有区分不同的ccm,现在相当于假设系统只有一个ccm
//     * @return 熵值
//     */
//    public Double computeSystemEntropy() {
//        double res=0.0;
//        //class node entropy
//        Iterable<ClassNode> iClass=classNodeRepository.findAll();
//        Iterator<ClassNode> iterClass=iClass.iterator();
//        while(iterClass.hasNext()) {
//            res+=iterClass.next().getEntropyValue();
//        }
//
//        //relation node entropy
//        Iterable<RelationNode> iRelation=relationNodeRepository.findAll();
//        Iterator<RelationNode> iterRelation=iRelation.iterator();
//        while(iterRelation.hasNext()) {
//            res+=iterRelation.next().getEntropyValue();
//        }
//
//        //value node entropy
//        Iterable<ValueNode> iValue=valueNodeRepository.findAll();
//        Iterator<ValueNode> iterValue=iValue.iterator();
//        while(iterValue.hasNext()) {
//            res+=iterValue.next().getEntropyValue();
//        }
//
//        return res;
//    }


    /**
     * @target 主要是获取ClassNode节点的边的Map
     * @param ctvEdges :出边
     * @param rtcEdges :入边
     * @return map数据结构
     */
    public Map<String,List<Set<Long>>> getMapForClassNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToClassEdge> rtcEdges) {
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
    public Map<String,List<Set<Long>>> getMapForRelationNode(Set<RelationToClassEdge> rtcEdges,Set<RelationToValueEdge> rtvEdges) {
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
    public Map<String,List<Set<Long>>> getMapForValueNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToValueEdge> rtvEdges) {
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
    public Double computeMapEntropy(Map<String, List<Set<Long>>> myMap, int nodeSum) {
        double entropy = computeMapBiEntropy(myMap);
        entropy *= nodeSum;
        return entropy;
    }

    public Double computeMapBiEntropy(Map<String,List<Set<Long>>> myMap) {
        double entropy=0.0;
        for(String key : myMap.keySet()) {//这里的每一个key是种类型的边(比如name)
            List<Set<Long>> valuelist=myMap.get(key);
            int valueListSize = valuelist.size();
            Set<Long> userSet=new HashSet<Long>();//所有用户的集合
            for(int i=0;i<valueListSize;i++) {
                userSet.addAll(valuelist.get(i));
            }
            if(userSet.size()==0) continue;
            Iterator<Long> uIter=userSet.iterator();
            Map<String,List<Long>> resMap=new HashMap<>();
            Map<String,List<Integer>> resEdgeMap = new HashMap<>();//这个value值是边集合
            while(uIter.hasNext()) {
                Long uid=uIter.next();
                StringBuffer stringBuffer=new StringBuffer();
                List<Integer> edgeList = new ArrayList<>();
                for(int i=0;i<valueListSize;i++) {
                    if(valuelist.get(i).contains(uid)) {
                        stringBuffer.append(i);
                        edgeList.add(i);
                    }
                }
                String str_edge=stringBuffer.toString();//边分布名
                if(resMap.containsKey(str_edge)) {
                    resMap.get(str_edge).add(uid);
                }else {
                    List<Long> ulist=new ArrayList<>();
                    ulist.add(uid);
                    resMap.put(str_edge,ulist);
                    resEdgeMap.put(str_edge,edgeList);
                }
            }
            //resMap中包含有边的分布
            int u_num=userSet.size();
            double tagE=0.0;

            List<List<Long>> ulists=new ArrayList<>();
            List<List<Integer>> edgeIdLists=new ArrayList<>();
            for(String str : resMap.keySet()) {
                List<Long> ulist=resMap.get(str);
                if(ulist.size()==0) continue;
                edgeIdLists.add(resEdgeMap.get(str));
                ulists.add(ulist);
            }

            int edgeIdListSize = edgeIdLists.size();
            List<List<Double>> simList=new ArrayList<>();
            for(int i=0;i<edgeIdListSize;i++) {
                List<Integer> cur=edgeIdLists.get(i);
                List<Double> sims=new ArrayList<>();
                simList.add(sims);
                for(int j=0;j<edgeIdListSize;j++) {
                    if(i>=j) {
                        simList.get(i).add(0.0);
                        continue;
                    }
                    List<Integer> other =edgeIdLists.get(j);
                    Set<Integer> con = new HashSet<>(cur);
                    con.retainAll(new HashSet<>(other));
                    Set<Integer> union = new HashSet<>(cur);
                    union.addAll(new HashSet<>(other));
                    double similarity=(double)con.size()/union.size();
                    simList.get(i).add(similarity);
                }
            }

            List<Double> prob=new ArrayList<>();
            int ulistsSize = ulists.size();
            for(int i=0;i<ulistsSize;i++) {
                int tmpListSize = ulists.get(i).size();
                double p=(double) tmpListSize / u_num;
                prob.add(p);
            }

            for(int i=0;i<ulistsSize;i++) {
                double sum=prob.get(i);
                for(int j=0;j<ulistsSize;j++) {
                    if(i==j) continue;
                    if(j>i) sum+=prob.get(j)*simList.get(i).get(j);
                    else sum+=prob.get(j)*simList.get(j).get(i);
                }
                double logp=Math.log(sum)/Math.log(2);
                tagE+=prob.get(i)*logp;
            }
            tagE=-tagE;
            tagE=tagE*userSet.size();
            entropy+=tagE;
        }
        return entropy;
    }

    private void addRTVElementToMap(Map<String,List<Set<Long>>> myMap , Set<RelationToValueEdge> rtvEdges) {
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String edgeName = rtvEdge.getEdgeName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(rtvEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtvEdge.getIcmSet());
                myMap.put(edgeName,list);
            }
        }
    }

    private void addCTVElementToMap(Map<String,List<Set<Long>>> myMap , Set<ClassToValueEdge> ctvEdges) {
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(ctvEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmSet());
                myMap.put(edgeName ,list);
            }
        }
    }

    private void addRTCElementToMap(Map<String,List<Set<Long>>> myMap , Set<RelationToClassEdge> rtcEdges) {
        for(RelationToClassEdge rtcEdge:rtcEdges) {
            String edgeName = rtcEdge.getEdgeName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(rtcEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtcEdge.getIcmSet());
                myMap.put(edgeName , list);
            }
        }
    }

    //起到初始化node节点的熵值的作用
    public Double initNodeListEntropy(List<ClassNode> classNodeList , List<RelationNode> relationNodeList ,
                                     List<ValueNode> valueNodeList , int nodeSum) {
        double systemEntropy = 0.0;
        double systemBiEntropy = 0.0; //表示没有乘上nodeSum之前的系统熵值

        int csize = classNodeList.size();
        for(int i=0 ; i<csize ; i++) {
            ClassNode classNode = classNodeList.get(i);
            if(classNode.isInitEntropy()) {//如果他是刚被初始化的节点,那么这个节点的熵值必须重新算出,否则不用再计算了
                classNode.setIsInitEntropy(false);//标注这个节点已经被初始化过了,不再是初始节点了
                double cNodeBiEntropy =
                        computeMapBiEntropy(getMapForClassNode(classNode.getCtvEdges(), classNode.getRtcEdges()));
                if(Double.compare(0.0,cNodeBiEntropy) != 0) {
                    System.out.println("Its a Error for classNode in function initCNodeListEntropy , EntropyHandlerImpl class");
                }
//                classNode.setOrgEntropyValue(cNodeBiEntropy/classNode.getIcmSet().size());
                classNode.setBiEntropyValue(cNodeBiEntropy);//设置节点的熵值
            }else;

            systemBiEntropy += classNode.getBiEntropyValue();
        }

        int rsize = relationNodeList.size();
        for(int i=0 ; i<rsize ; i++) {
            RelationNode relationNode = relationNodeList.get(i);
            if(relationNode.isInitEntropy()) {
                relationNode.setIsInitEntropy(false);
                double rNodeBiEntropy =
                        computeMapBiEntropy(getMapForRelationNode(relationNode.getRtcEdges(), relationNode.getRtvEdges()));
                if(Double.compare(0.0,rNodeBiEntropy) != 0) {
                    System.out.println("Its a Error for relationNode in function initRNodeListEntropy , EntropyHandlerImpl class");
                }
//                relationNode.setOrgEntropyValue(rNodeBiEntropy/relationNode.getIcmSet().size());
                relationNode.setBiEntropyValue(rNodeBiEntropy);
            }else;
            systemBiEntropy += relationNode.getBiEntropyValue();
        }

        int vsize = valueNodeList.size();
        for(int i=0;i<vsize;i++) {
            ValueNode valueNode = valueNodeList.get(i);
            if(valueNode.isInitEntropy()) {
                valueNode.setIsInitEntropy(false);
                double vNodeBiEntropy =
                        computeMapBiEntropy(getMapForValueNode(valueNode.getCtvEdges(), valueNode.getRtvEdges()));
//                valueNode.setOrgEntropyValue(vNodeBiEntropy/valueNode.getIcmSet().size());
                valueNode.setBiEntropyValue(vNodeBiEntropy);
            }else ;

            systemBiEntropy += valueNode.getBiEntropyValue();
        }

        systemEntropy = systemBiEntropy * nodeSum;
        return systemEntropy;//524233.47265417513
    }
}
