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
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

/**
 * 
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public class MigrateUtil {

    @Autowired
    private EntropyHandler entropyHandler;


    /**
     * 类节点上的icmId用户从sourceCNode迁移到targetCNode时,其指向的valueNode的熵值变化
     * @param icmId
     * @param valueNode
     * @param sourceCNode
     * @param targetCNode
     * @return 熵值变化
     */
    public double MigrateFromClassToClassForValueNode(Long icmId,ValueNode valueNode,ClassNode sourceCNode,ClassNode targetCNode) {
        double res=0.0;
        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceCNode.getId();
        Long targetId=targetCNode.getId();

        Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();
        Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();

        Set<String> edgeNameSet=new HashSet<>();
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            if(ctvEdge.getStarter().getId()==sourceId&&ctvEdge.getIcmList().contains(icmId))
                edgeNameSet.add(edgeName);
        }

        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(ctvEdge.getIcmList());
            if(oldNodeMap.containsKey(edgeName)) {
                oldNodeMap.get(edgeName).add(tmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(tmpUserSet);
                oldNodeMap.put(edgeName,list);
            }//上面这部分获得了valueNode的oldNodeMap
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(ctvEdge.getStarter().getId()==sourceId&&ctvEdge.getIcmList().contains(icmId)) {
                newTmpUserSet.remove(icmId);//是一条由sourceClass指向ValueNode的边
            }else if(ctvEdge.getStarter().getId()==targetId&&edgeNameSet.contains(edgeName)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.add(icmId);
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
                Set<Long> set=new HashSet<>();
                set.add(icmId);
                newNodeMap.get(edgeName).add(set);
            }
        }

        //但是上面的oldNodeMap和newNodeMap都只完成了class to value的部分
        //下面我们完成relation to value部分
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String edgeName=rtvEdge.getEdgeName();
            if(oldNodeMap.containsKey(edgeName)) {
                oldNodeMap.get(edgeName).add(rtvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtvEdge.getIcmList());
                oldNodeMap.put(edgeName,list);
            }
            //由于这一部分下oldNodeMap和newNodeMap应该是相同的,因此不做改变
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(rtvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(rtvEdge.getIcmList());
                newNodeMap.put(edgeName,list);
            }
        }

        //完成了oldNodeMap和newNodeMap的连接
        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap);
        double newEntropy=entropyHandler.compueteMapEntropy(newNodeMap);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }

    /**
     * 类节点上的icmId用户从sourceCNode迁移到targetCNode时,其指向的relationNode的熵值变化
     * @param icmId
     * @param relationNode
     * @param sourceCNode
     * @param targetCNode
     * @return relation节点的熵值变化情况
     */
    public double MigrateFromClassToClassForRelationNode(Long icmId,RelationNode relationNode,ClassNode sourceCNode,ClassNode targetCNode) {
        double res=0.0;
        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceCNode.getId();
        Long targetId=targetCNode.getId();

        Set<RelationToCEdge> rtcEdges=relationNode.getRtcEdges();
        Set<RelationToValueEdge> rtvEdges=relationNode.getRtvEdges();

        Map<String,Set<String>> edgeNameAndPortCMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        Map<String,Set<String>> edgeNameAndPortVMap=new HashMap<>();//这里的key是edgeName,value是所有port集合

        for(RelationToCEdge rtcEdge:rtcEdges) {
            if(rtcEdge.getEnder().getId()==sourceId&&rtcEdge.getIcmList().contains(icmId)) {
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
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmList().contains(icmId)) {
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

        for(RelationToCEdge rtcEdge:rtcEdges) {
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtcEdge.getIcmList());//该边的用户数
            if(oldNodeMap.containsKey(edgeName)) {//由于现在以edgeName作为标示,而不是以port,所以用edgeName来判断
                oldNodeMap.get(edgeName).add(tmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(tmpUserSet);
                oldNodeMap.put(edgeName,list);
            }
            //上面这部分获得了valueNode的oldNodeMap
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtcEdge.getEnder().getId()==sourceId&&rtcEdge.getIcmList().contains(icmId)) {
                newTmpUserSet.remove(icmId);//是一条由sourceClass指向ValueNode的边
            }else if(rtcEdge.getEnder().getId()==targetId&&edgeNameAndPortCMap.keySet().contains(edgeName)
                    &&edgeNameAndPortCMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.add(icmId);
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
                    Set<Long> set=new HashSet<>();
                    set.add(icmId);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //上面针对RelationToCLassEdge部分,下面要针对RelationToValueEdge部分了

        for(RelationToValueEdge rtvEdge:rtvEdges) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtvEdge.getIcmList());//该边的用户数
            if(oldNodeMap.containsKey(edgeName)) {//由于现在以edgeName作为标示,而不是以port,所以用edgeName来判断
                oldNodeMap.get(edgeName).add(tmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(tmpUserSet);
                oldNodeMap.put(edgeName,list);
            }
            //上面这部分获得了valueNode的oldNodeMap
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmList().contains(icmId)) {
                newTmpUserSet.remove(icmId);//是一条由sourceClass指向ValueNode的边
            }else if(rtvEdge.getStarter().getId()==targetId&&edgeNameAndPortVMap.keySet().contains(edgeName)
                    &&edgeNameAndPortVMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.add(icmId);
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
                    Set<Long> set=new HashSet<>();
                    set.add(icmId);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //两部分都完成
        //完成了oldNodeMap和newNodeMap的建立
        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap);
        double newEntropy=entropyHandler.compueteMapEntropy(newNodeMap);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }


    /**
     * 关系节点上的icmId用户从sourceRNode迁移到targetRNode时,其指向的valueNode的熵值变化
     * @param icmId
     * @param valueNode
     * @param sourceRNode
     * @param targetRNode
     * @return 熵值变化
     */
    public double MigrateFromRelationToRelationForValueNode(Long icmId,ValueNode valueNode,RelationNode sourceRNode,RelationNode targetRNode) {
        double res=0.0;
        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceRNode.getId();
        Long targetId=targetRNode.getId();

        Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();
        Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();

        Map<String,Set<String>> edgeNameAndPortMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmList().contains(icmId)) {
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
            Set<Long> tmpUserSet=new HashSet<>(rtvEdge.getIcmList());//该边的用户数
            if(oldNodeMap.containsKey(edgeName)) {//由于现在以edgeName作为标示,而不是以port,所以用edgeName来判断
                oldNodeMap.get(edgeName).add(tmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(tmpUserSet);
                oldNodeMap.put(edgeName,list);
            }
            //上面这部分获得了valueNode的oldNodeMap
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtvEdge.getStarter().getId()==sourceId&&rtvEdge.getIcmList().contains(icmId)) {
                newTmpUserSet.remove(icmId);//是一条由sourceClass指向ValueNode的边
            }else if(rtvEdge.getStarter().getId()==targetId&&edgeNameAndPortMap.keySet().contains(edgeName)
                    &&edgeNameAndPortMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.add(icmId);
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
                    Set<Long> set=new HashSet<>();
                    set.add(icmId);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //但是上面的oldNodeMap和newNodeMap都只完成了relation to value的部分
        //下面我们完成class to value部分
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            if(oldNodeMap.containsKey(edgeName)) {
                oldNodeMap.get(edgeName).add(ctvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmList());
                oldNodeMap.put(edgeName,list);
            }
            //由于这一部分下oldNodeMap和newNodeMap应该是相同的,因此不做改变
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(ctvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmList());
                newNodeMap.put(edgeName,list);
            }
        }

        //完成了oldNodeMap和newNodeMap的建立
        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap);
        double newEntropy=entropyHandler.compueteMapEntropy(newNodeMap);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }

    /**
     * 关系节点上的icmId用户从sourceRNode迁移到targetRNode时,其指向的classNode的熵值变化
     * @param icmId
     * @param classNode
     * @param sourceRNode
     * @param targetRNode
     * @return classNode的熵值变化
     */
    public double MigrateFromRelationToRelationForClassNode(Long icmId,ClassNode classNode,RelationNode sourceRNode,RelationNode targetRNode) {
        double res=0.0;
        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Long sourceId=sourceRNode.getId();
        Long targetId=targetRNode.getId();

        Set<RelationToCEdge> rtcEdges=classNode.getRtcEdges();//relation到class的集合
        Set<ClassToValueEdge> ctvEdges=classNode.getCtvEdges();

        Map<String,Set<String>> edgeNameAndPortMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        for(RelationToCEdge rtcEdge:rtcEdges) {
            if(rtcEdge.getStarter().getId()==sourceId&&rtcEdge.getIcmList().contains(icmId)) {
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

        for(RelationToCEdge rtcEdge:rtcEdges) {
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            Set<Long> tmpUserSet=new HashSet<>(rtcEdge.getIcmList());//该边的用户数
            if(oldNodeMap.containsKey(edgeName)) {//由于现在以edgeName作为标示,而不是以port,所以用edgeName来判断
                oldNodeMap.get(edgeName).add(tmpUserSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(tmpUserSet);
                oldNodeMap.put(edgeName,list);
            }
            //上面这部分获得了classNode的oldNodeMap
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtcEdge.getStarter().getId()==sourceId&&rtcEdge.getIcmList().contains(icmId)) {
                newTmpUserSet.remove(icmId);//是一条由sourceNode指向ClassNode的边
            }else if(rtcEdge.getStarter().getId()==targetId&&edgeNameAndPortMap.keySet().contains(edgeName)
                    &&edgeNameAndPortMap.get(edgeName).contains(port)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.add(icmId);
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
                    Set<Long> set=new HashSet<>();
                    set.add(icmId);
                    newNodeMap.get(edgeName).add(set);
                }
            }
        }

        //但是上面的oldNodeMap和newNodeMap都只完成了relation to class的部分
        //下面我们完成class to value部分
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getEdgeName();
            if(oldNodeMap.containsKey(edgeName)) {
                oldNodeMap.get(edgeName).add(ctvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmList());
                oldNodeMap.put(edgeName,list);
            }
            //由于这一部分下oldNodeMap和newNodeMap应该是相同的,因此不做改变
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(ctvEdge.getIcmList());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmList());
                newNodeMap.put(edgeName,list);
            }
        }

        //完成了oldNodeMap和newNodeMap的建立
        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap);
        double newEntropy=entropyHandler.compueteMapEntropy(newNodeMap);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }



}
