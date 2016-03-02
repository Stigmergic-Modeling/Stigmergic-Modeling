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
import net.stigmod.domain.relationship.RelationToClassEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;

import java.util.*;

/**
 *
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public class MigrateUtil {

//    @Autowired
//    private EntropyHandler entropyHandler;

    private EntropyHandler entropyHandler=new EntropyHandlerImpl();

    /**
     * 类节点上的icmSet集合从sourceCNode迁移到targetCNode时,其指向的valueNode的熵值变化
     * @param icmSet
     * @param valueNode
     * @param sourceCNode
     * @param targetCNode
     * @return 熵值变化
     */
    protected double MigrateFromClassToClassForValueNode(Set<Long> icmSet , ValueNode valueNode , ClassNode sourceCNode ,
                                                         ClassNode targetCNode , int oldNodeNum , int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceCNode.getId();
        Long targetId=targetCNode.getId();

        Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();
        Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();

        Long oneIcmId = icmSet.iterator().next();

        Set<String> edgeNameSet=new HashSet<>();
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            if(ctvEdge.getStarter().getId()==sourceId&&ctvEdge.getIcmSet().contains(oneIcmId))
                edgeNameSet.add(edgeName);
        }

        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(ctvEdge.getIcmSet());
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(ctvEdge.getStarter().getId()==sourceId&&ctvEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceClass指向ValueNode的边
            }else if(ctvEdge.getStarter().getId()==targetId&&edgeNameSet.contains(edgeName)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                edgeNameSet.remove(edgeName);
            }
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(newTmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(newTmpUserSet);
                newNodeMap.put(edgeName,list);
            }
        }
        if(edgeNameSet.size()!=0) {
            for(String edgeName:edgeNameSet) {
                Set<Long> set=new HashSet<>(icmSet);
                newNodeMap.get(edgeName).add(set);
            }
        }

        //但是上面的oldNodeMap和newNodeMap都只完成了class to value的部分
        //下面我们完成relation to value部分
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String edgeName=rtvEdge.getEdgeName();
            //由于这一部分下oldNodeMap和newNodeMap应该是相同的,因此不做改变
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(rtvEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtvEdge.getIcmSet());
                newNodeMap.put(edgeName,list);
            }
        }

        //完成了oldNodeMap和newNodeMap的连接
        double oldEntropy=valueNode.getBiEntropyValue()*oldNodeNum;
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , newNodeNum);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }

    /**
     * 类节点上的icmId用户从sourceCNode迁移到targetCNode时,其指向的relationNode的熵值变化
     * @param icmSet
     * @param relationNode
     * @param sourceCNode
     * @param targetCNode
     * @return relation节点的熵值变化情况
     */
    protected double MigrateFromClassToClassForRelationNode(Set<Long> icmSet , RelationNode relationNode , ClassNode sourceCNode
            , ClassNode targetCNode , int oldNodeNum ,int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceCNode.getId();
        Long targetId=targetCNode.getId();

        Set<RelationToClassEdge> rtcEdges=relationNode.getRtcEdges();
        Set<RelationToValueEdge> rtvEdges=relationNode.getRtvEdges();

        Map<String,Set<String>> edgeNameAndPortCMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        Map<String,Set<String>> edgeNameAndPortVMap=new HashMap<>();//这里的key是edgeName,value是所有port集合

        Long oneIcmId = icmSet.iterator().next();

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            if(rtcEdge.getEnder().getId()==sourceId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtcEdge.getEdgeName();
                String port=rtcEdge.getPort();
                if(edgeNameAndPortCMap.containsKey(edgeName)) {
                    edgeNameAndPortCMap.get(edgeName).add(port);
                }else {
                    Set<String> set=new HashSet<>();
                    set.add(port);
                    edgeNameAndPortCMap.put(edgeName,set);
                }
            }
        }

        for(RelationToValueEdge rtvEdge:rtvEdges) {
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtvEdge.getEdgeName();
                String port=rtvEdge.getPort();
                if(edgeNameAndPortVMap.containsKey(edgeName)) {
                    edgeNameAndPortVMap.get(edgeName).add(port);
                }else {
                    Set<String> set=new HashSet<>();
                    set.add(port);
                    edgeNameAndPortVMap.put(edgeName,set);
                }
            }
        }

        //完成了edgeNameAndPortMap的初始化工作

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtcEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtcEdge.getEnder().getId()==sourceId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceClass指向ValueNode的边
            }else if(rtcEdge.getEnder().getId()==targetId&&edgeNameAndPortCMap.keySet().contains(edgeName)
                    &&edgeNameAndPortCMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                edgeNameAndPortCMap.get(edgeName).remove(port);//在我们的map里移除这个port
            }

            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(newTmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(newTmpUserSet);
                newNodeMap.put(edgeName,list);
            }
        }

        if(edgeNameAndPortCMap!=null) {
            for(String edgeName:edgeNameAndPortCMap.keySet()) {
                Set<String> portSet=edgeNameAndPortCMap.get(edgeName);
                if(portSet.size()==0) continue;
                for(String innerPort:portSet) {
                    Set<Long> set=new HashSet<>(icmSet);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //上面针对RelationToCLassEdge部分,下面要针对RelationToValueEdge部分了

        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtvEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceClass指向ValueNode的边
            }else if(rtvEdge.getStarter().getId()==targetId&&edgeNameAndPortVMap.keySet().contains(edgeName)
                    &&edgeNameAndPortVMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                edgeNameAndPortVMap.get(edgeName).remove(port);//在我们的map里移除这个port
            }

            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(newTmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(newTmpUserSet);
                newNodeMap.put(edgeName,list);
            }
        }

        if(edgeNameAndPortVMap!=null) {
            for(String edgeName:edgeNameAndPortVMap.keySet()) {
                Set<String> portSet=edgeNameAndPortVMap.get(edgeName);
                if(portSet.size()==0) continue;
                for(String innerPort:portSet) {
                    Set<Long> set=new HashSet<>(icmSet);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //两部分都完成
        //完成了oldNodeMap和newNodeMap的建立
//        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap , oldNodeNum);
        double oldEntropy=relationNode.getBiEntropyValue()*oldNodeNum;
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , newNodeNum);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }


    /**
     * 关系节点上的icmId用户从sourceRNode迁移到targetRNode时,其指向的valueNode的熵值变化
     * @param icmSet
     * @param valueNode
     * @param sourceRNode
     * @param targetRNode
     * @return 熵值变化
     */
    protected double MigrateFromRelationToRelationForValueNode(Set<Long> icmSet , ValueNode valueNode , RelationNode sourceRNode
            , RelationNode targetRNode , int oldNodeNum , int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceRNode.getId();
        Long targetId=targetRNode.getId();

        Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();
        Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();

        Long oneIcmId = icmSet.iterator().next();

        Map<String,Set<String>> edgeNameAndPortMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtvEdge.getEdgeName();
                String port=rtvEdge.getPort();
                if(edgeNameAndPortMap.containsKey(edgeName)) {
                    edgeNameAndPortMap.get(edgeName).add(port);
                }else {
                    Set<String> set=new HashSet<>();
                    set.add(port);
                    edgeNameAndPortMap.put(edgeName,set);
                }
            }
        }

        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtvEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceClass指向ValueNode的边
            }else if(rtvEdge.getStarter().getId()==targetId&&edgeNameAndPortMap.keySet().contains(edgeName)
                    &&edgeNameAndPortMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                edgeNameAndPortMap.get(edgeName).remove(port);//在我们的map里移除这个port
            }

            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(newTmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(newTmpUserSet);
                newNodeMap.put(edgeName,list);
            }
        }

        if(edgeNameAndPortMap!=null) {
            for(String edgeName:edgeNameAndPortMap.keySet()) {
                Set<String> portSet=edgeNameAndPortMap.get(edgeName);
                if(portSet.size()==0) continue;
                for(String innerPort:portSet) {
                    Set<Long> set=new HashSet<>(icmSet);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //但是上面的oldNodeMap和newNodeMap都只完成了relation to value的部分
        //下面我们完成class to value部分
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            //由于这一部分下oldNodeMap和newNodeMap应该是相同的,因此不做改变
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(ctvEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmSet());
                newNodeMap.put(edgeName,list);
            }
        }

        //完成了oldNodeMap和newNodeMap的建立
//        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap , oldNodeNum);
        double oldEntropy=valueNode.getBiEntropyValue()*oldNodeNum;
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , newNodeNum);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }

    /**
     * 关系节点上的icmId用户从sourceRNode迁移到targetRNode时,其指向的classNode的熵值变化
     * @param icmSet
     * @param classNode
     * @param sourceRNode
     * @param targetRNode
     * @return classNode的熵值变化
     */
    protected double MigrateFromRelationToRelationForClassNode(Set<Long> icmSet , ClassNode classNode , RelationNode sourceRNode
            , RelationNode targetRNode , int oldNodeNum , int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceRNode.getId();
        Long targetId=targetRNode.getId();

        Set<RelationToClassEdge> rtcEdges=classNode.getRtcEdges();//relation到class的集合
        Set<ClassToValueEdge> ctvEdges=classNode.getCtvEdges();

        Long oneIcmId = icmSet.iterator().next();

        Map<String,Set<String>> edgeNameAndPortMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        for(RelationToClassEdge rtcEdge:rtcEdges) {
            if(rtcEdge.getStarter().getId()==sourceId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtcEdge.getEdgeName();
                String port=rtcEdge.getPort();
                if(edgeNameAndPortMap.containsKey(edgeName)) {
                    edgeNameAndPortMap.get(edgeName).add(port);
                }else {
                    Set<String> set=new HashSet<>();
                    set.add(port);
                    edgeNameAndPortMap.put(edgeName,set);
                }
            }
        }

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtcEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtcEdge.getStarter().getId()==sourceId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceNode指向ClassNode的边
            }else if(rtcEdge.getStarter().getId()==targetId&&edgeNameAndPortMap.keySet().contains(edgeName)
                    &&edgeNameAndPortMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                edgeNameAndPortMap.get(edgeName).remove(port);//在我们的map里移除这个port
            }

            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(newTmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(newTmpUserSet);
                newNodeMap.put(edgeName,list);
            }
        }

        if(edgeNameAndPortMap!=null) {
            for(String edgeName:edgeNameAndPortMap.keySet()) {
                Set<String> portSet=edgeNameAndPortMap.get(edgeName);
                if(portSet.size()==0) continue;
                for(String innerPort:portSet) {
                    Set<Long> set=new HashSet<>(icmSet);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //但是上面的oldNodeMap和newNodeMap都只完成了relation to class的部分
        //下面我们完成class to value部分
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            //由于这一部分下oldNodeMap和newNodeMap应该是相同的,因此不做改变
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(ctvEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmSet());
                newNodeMap.put(edgeName,list);
            }
        }

        //完成了oldNodeMap和newNodeMap的建立
//        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap , oldNodeNum);
        double oldEntropy=classNode.getBiEntropyValue()*oldNodeNum;
//        Map<String,List<Set<Long>>> tmpMap=entropyHandler.getMapForClassNode(classNode.getCtvEdges(),classNode.getRtcEdges());
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , newNodeNum);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }

    /**
     * 这个函数是用来找出classNode中哪些用户的边完全相同的
     * @param cNode
     * @return 一个map结构,主要就是相同边的用户集合
     */
    protected Map<String,Set<Long>> getTheUserSetForClassNode(ClassNode cNode) {
        Set<Long> curIcmSet = cNode.getIcmSet();
        Map<Long,String> icmMap = new HashMap<>();
        Map<String,Set<Long>> sameIcmMap = new HashMap<>();
        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            for(Long curIcm : ctvEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm))
                    icmMap.put(curIcm,icmMap.get(curIcm)+"-"+ctvEdge.getId());
                else {
                    icmMap.put(curIcm,ctvEdge.getId().toString());
                }
            }
        }

        for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
            for(Long curIcm : rtcEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm)) icmMap.put(curIcm,icmMap.get(curIcm)+"-"+rtcEdge.getId());
                else {
                    icmMap.put(curIcm,rtcEdge.getId().toString());
                }
            }
        }

        for(Long curIcm : icmMap.keySet()) {
            String identity = icmMap.get(curIcm);
            if(sameIcmMap.containsKey(identity)) {
                sameIcmMap.get(identity).add(curIcm);
            }else {
                Set<Long> icms = new HashSet<>();
                icms.add(curIcm);
                sameIcmMap.put(identity,icms);
            }
        }
        return sameIcmMap;
    }

    protected Map<String,Set<Long>> getTheUserSetForRelationNode(RelationNode rNode) {
        Set<Long> curIcmSet = rNode.getIcmSet();
        Map<Long,String> icmMap = new HashMap<>();
        Map<String,Set<Long>> sameIcmMap = new HashMap<>();
        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            for(Long curIcm : rtvEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm))
                    icmMap.put(curIcm,icmMap.get(curIcm)+"-"+rtvEdge.getId());
                else {
                    icmMap.put(curIcm,rtvEdge.getId().toString());
                }
            }
        }

        for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
            for(Long curIcm : rtcEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm)) icmMap.put(curIcm,icmMap.get(curIcm)+"-"+rtcEdge.getId());
                else {
                    icmMap.put(curIcm,rtcEdge.getId().toString());
                }
            }
        }

        for(Long curIcm : icmMap.keySet()) {
            String identity = icmMap.get(curIcm);
            if(sameIcmMap.containsKey(identity)) {
                sameIcmMap.get(identity).add(curIcm);
            }else {
                Set<Long> icms = new HashSet<>();
                icms.add(curIcm);
                sameIcmMap.put(identity,icms);
            }
        }
        return sameIcmMap;
    }

    //返回与cNode有相交节点的所有classNode的ListId编号
    protected Set<Integer> findConClassNodes(ClassNode cNode) {
        Set<Integer> classNodeListIdSet = new HashSet<>();

        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            if(ctvEdge.getIcmSet().size() == 0) continue;
            ValueNode vNode = ctvEdge.getEnder();
            //获得了当前cNode连接的一个vNode,接下来获取到该vNode连接的所有cNode
            for(ClassToValueEdge ctvEdge2 : vNode.getCtvEdges()) {
                if(ctvEdge2.getIcmSet().size() == 0) continue;
                ClassNode otherCNode = ctvEdge2.getStarter();
                if(otherCNode.getId()==cNode.getId() || classNodeListIdSet.contains(otherCNode.getLoc())) continue;
                else {
                    classNodeListIdSet.add(otherCNode.getLoc());
                }
            }
        }

        for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
            if(rtcEdge.getIcmSet().size() == 0) continue;
            RelationNode rNode = rtcEdge.getStarter();
            for(RelationToClassEdge rtcEdge2 : rNode.getRtcEdges()) {
                if(rtcEdge2.getIcmSet().size() == 0) continue;
                ClassNode otherCNode = rtcEdge2.getEnder();
                if(otherCNode.getId()==cNode.getId() || classNodeListIdSet.contains(otherCNode.getLoc())) continue;
                else {
                    classNodeListIdSet.add(otherCNode.getLoc());
                }
            }
        }
        return classNodeListIdSet;
    }

    protected Set<Integer> findConRelationNodes(RelationNode rNode) {
        Set<Integer> relationNodeListIdSet = new HashSet<>();

        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            if(rtvEdge.getIcmSet().size() == 0) continue;
            ValueNode vNode = rtvEdge.getEnder();
            if(vNode.getName().equals("1")||vNode.getName().equals("2")||vNode.getName().equals("*")
                    ||vNode.getName().equals("1..*")||vNode.getName().equals("true")) continue;
            for(RelationToValueEdge rtvEdge2 : vNode.getRtvEdges()) {
                if(rtvEdge2.getIcmSet().size() == 0) continue;
                RelationNode otherRNode = rtvEdge2.getStarter();
                if(otherRNode.getId()==rNode.getId() || relationNodeListIdSet.contains(otherRNode.getLoc())) continue;
                else {
                    relationNodeListIdSet.add(otherRNode.getLoc());
                }
            }
        }

        for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
            if(rtcEdge.getIcmSet().size() == 0) continue;
            ClassNode cNode = rtcEdge.getEnder();
            for(RelationToClassEdge rtcEdge2 : cNode.getRtcEdges()) {
                if(rtcEdge2.getIcmSet().size() == 0) continue;
                RelationNode otherRNode = rtcEdge2.getStarter();
                if(otherRNode.getId()==rNode.getId() || relationNodeListIdSet.contains(otherRNode.getLoc())) continue;
                else {
                    relationNodeListIdSet.add(otherRNode.getLoc());
                }
            }
        }
        return relationNodeListIdSet;
    }

}
