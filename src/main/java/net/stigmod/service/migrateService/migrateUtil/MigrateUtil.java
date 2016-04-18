/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService.migrateUtil;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.conceptualmodel.RelationNode;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.domain.conceptualmodel.ClassToValueEdge;
import net.stigmod.domain.conceptualmodel.RelationToClassEdge;
import net.stigmod.domain.conceptualmodel.RelationToValueEdge;
import net.stigmod.service.migrateService.EntropyHandler;
import net.stigmod.util.wordsim.WordSimilarities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 *
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
@Service
public class MigrateUtil {

    @Autowired
    private EntropyHandler entropyHandler;

//    private EntropyHandler entropyHandler=new EntropyHandlerImpl();

    public int getTheUserSum(List<ValueNode> valueNodeList) {
        Set<Long> uSet = new HashSet<>();
        for(ValueNode vNode : valueNodeList) {
            uSet.addAll(new HashSet<>(vNode.getIcmSet()));
        }
        return uSet.size();
    }

    /**
     * 类节点上的icmSet集合从sourceCNode迁移到targetCNode时,其指向的valueNode的熵值变化
     * @param icmSet
     * @param valueNode
     * @param sourceCNode
     * @param targetCNode
     * @return 熵值变化
     */
    public double MigrateFromClassToClassForValueNode(Set<Long> icmSet , ValueNode valueNode , ClassNode sourceCNode ,
                                                         ClassNode targetCNode , int oldNodeNum , int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        int sourceListId = sourceCNode.getLoc();
        int targetListId = targetCNode.getLoc();

        Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();
        Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();

        Long oneIcmId = icmSet.iterator().next();

        Set<String> edgeNameSet=new HashSet<>();
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getName();
            if(ctvEdge.getStarter().getLoc()==sourceListId&&ctvEdge.getIcmSet().contains(oneIcmId))
                edgeNameSet.add(edgeName);
        }

        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getName();

            Set<Long> tmpUserSet=new HashSet<>(ctvEdge.getIcmSet());
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(ctvEdge.getStarter().getLoc()==sourceListId&&ctvEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceClass指向ValueNode的边
            }else if(ctvEdge.getStarter().getLoc()==targetListId&&edgeNameSet.contains(edgeName)){
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
        entropyHandler.addRTVElementToMap(newNodeMap,rtvEdges);//完成了relationToValue部分的内容

        //完成了oldNodeMap和newNodeMap的连接
        double oldEntropy=valueNode.getBiEntropyValue()*oldNodeNum;
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , valueNode , newNodeNum);
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
    public double MigrateFromClassToClassForRelationNode(Set<Long> icmSet , RelationNode relationNode , ClassNode sourceCNode
            , ClassNode targetCNode , int oldNodeNum ,int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Integer sourceListId=sourceCNode.getLoc();
        Integer targetListId=targetCNode.getLoc();

        Set<RelationToClassEdge> rtcEdges=relationNode.getRtcEdges();
        Set<RelationToValueEdge> rtvEdges=relationNode.getRtvEdges();

//        Map<String,Set<String>> edgeNameAndPortCMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        Map<String,Integer> edgeNameMap = new HashMap<>();
        //现在这里策略要变一下,我们不考虑端口的问题(虽然真正迁移的时候还是考虑的)

        Long oneIcmId = icmSet.iterator().next();

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            if(rtcEdge.getEnder().getLoc()==sourceListId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtcEdge.getName();
                if(edgeNameMap.containsKey(edgeName)) {
                    edgeNameMap.put(edgeName,edgeNameMap.get(edgeName)+1);
                }else {
                    edgeNameMap.put(edgeName,1);
                }
            }
        }

        //完成了edgeNameAndPortMap的初始化工作
        Map<String,Set<Long>> tmpUEdgeMap = new HashMap<>();
        Map<String,String> tmpUEdgeNameMap = new HashMap<>();

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            int startLoc = rtcEdge.getStarter().getLoc();
            int endLoc = rtcEdge.getEnder().getLoc();
            String edgeName = rtcEdge.getName();
            String tag = edgeName + "-" + startLoc + "-" + endLoc;//这是一个标记

            Set<Long> tmpUserSet=new HashSet<>(rtcEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);
            if(rtcEdge.getEnder().getLoc()==sourceListId && rtcEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);
            }else if(rtcEdge.getEnder().getLoc()==targetListId && edgeNameMap.keySet().contains(edgeName)) {
                newTmpUserSet.addAll(icmSet);
                if(edgeNameMap.get(edgeName)==1) edgeNameMap.remove(edgeName);
                else edgeNameMap.put(edgeName,edgeNameMap.get(edgeName)-1);
            }

            if(tmpUEdgeMap.containsKey(tag)) {
                tmpUEdgeMap.get(tag).addAll(newTmpUserSet);
            }else {
                tmpUEdgeMap.put(tag,newTmpUserSet);
                tmpUEdgeNameMap.put(tag,edgeName);
            }
        }

        int startLoc = relationNode.getLoc();
        int endLoc = targetListId;
        if(edgeNameMap.size() != 0) {
            for(String edgeName : edgeNameMap.keySet()) {
                Set<Long> innerSet = new HashSet<>(icmSet);
                String tag = edgeName +"-"+ startLoc +"-"+ endLoc;
                if(tmpUEdgeMap.containsKey(tag)) {
                    tmpUEdgeMap.get(tag).addAll(innerSet);
                }else {
                    tmpUEdgeMap.put(tag,innerSet);
                    tmpUEdgeNameMap.put(tag,edgeName);
                }
            }
        }

        convertElementToMapForMigrate(newNodeMap,tmpUEdgeMap,tmpUEdgeNameMap);//转换一下

        //上面针对RelationToCLassEdge部分,下面要针对RelationToValueEdge部分了
        entropyHandler.addRTVElementToMap(newNodeMap,rtvEdges);//完成了上述部分

        //两部分都完成
        //完成了oldNodeMap和newNodeMap的建立
        double oldEntropy=relationNode.getBiEntropyValue()*oldNodeNum;
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , relationNode , newNodeNum);
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
    public double MigrateFromRelationToRelationForValueNode(Set<Long> icmSet , ValueNode valueNode , RelationNode sourceRNode
            , RelationNode targetRNode , int oldNodeNum , int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        int sourceListId=sourceRNode.getLoc();
        int targetListId=targetRNode.getLoc();

        Set<RelationToValueEdge> rtvEdges=valueNode.getRtvEdges();
        Set<ClassToValueEdge> ctvEdges=valueNode.getCtvEdges();

        Long oneIcmId = icmSet.iterator().next();

//        Map<String,Set<String>> edgeNameAndPortMap=new HashMap<>();//这里的key是edgeName,value是所有port集合
        Map<String,Integer> edgeNameMap = new HashMap<>();

        for(RelationToValueEdge rtvEdge:rtvEdges) {
            if(rtvEdge.getStarter().getLoc()==sourceListId&&rtvEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtvEdge.getName();
                if(edgeNameMap.containsKey(edgeName)) {
                    edgeNameMap.put(edgeName,edgeNameMap.get(edgeName)+1);
                }else {
                    edgeNameMap.put(edgeName,1);
                }
            }
        }

        Map<String,Set<Long>> tmpUEdgeMap = new HashMap<>();
        Map<String,String> tmpUEdgeNameMap = new HashMap<>();
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            int startLoc = rtvEdge.getStarter().getLoc();
            int endLoc = rtvEdge.getEnder().getLoc();
            String edgeName=rtvEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

            Set<Long> tmpUserSet=new HashSet<>(rtvEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);

            if(rtvEdge.getStarter().getLoc()==sourceListId&&rtvEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceClass指向ValueNode的边
            }else if(rtvEdge.getStarter().getLoc()==targetListId && edgeNameMap.keySet().contains(edgeName)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                if(edgeNameMap.get(edgeName)==1) edgeNameMap.remove(edgeName);
                else edgeNameMap.put(edgeName,edgeNameMap.get(edgeName)-1);
            }

            if(tmpUEdgeMap.containsKey(tag)) {
                tmpUEdgeMap.get(tag).addAll(newTmpUserSet);
            }else {
                tmpUEdgeMap.put(tag,newTmpUserSet);
                tmpUEdgeNameMap.put(tag,edgeName);
            }
        }

        int startLoc = targetListId;
        int endLoc = valueNode.getLoc();
        if(edgeNameMap.size() != 0) {
            for(String edgeName : edgeNameMap.keySet()) {
                Set<Long> innerSet = new HashSet<>(icmSet);
                String tag = edgeName +"-"+ startLoc +"-"+ endLoc;
                if(tmpUEdgeMap.containsKey(tag)) {
                    tmpUEdgeMap.get(tag).addAll(innerSet);
                }else {
                    tmpUEdgeMap.put(tag,innerSet);
                    tmpUEdgeNameMap.put(tag,edgeName);
                }
            }
        }

        convertElementToMapForMigrate(newNodeMap,tmpUEdgeMap,tmpUEdgeNameMap);//转换一下

        //但是上面的oldNodeMap和newNodeMap都只完成了relation to value的部分
        //下面我们完成class to value部分
        entropyHandler.addCTVElementToMap(newNodeMap,ctvEdges);

        //完成了oldNodeMap和newNodeMap的建立
//        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap , oldNodeNum);
        double oldEntropy=valueNode.getBiEntropyValue()*oldNodeNum;
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , valueNode , newNodeNum);
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
    public double MigrateFromRelationToRelationForClassNode(Set<Long> icmSet , ClassNode classNode , RelationNode sourceRNode
            , RelationNode targetRNode , int oldNodeNum , int newNodeNum) {
        double res=0.0;
//        Map<String,List<Set<Long>>> oldNodeMap=new HashMap<>();
        Map<String,List<Set<Long>>> newNodeMap=new HashMap<>();
        Integer sourceListId=sourceRNode.getLoc();
        Integer targetListId=targetRNode.getLoc();

        Set<RelationToClassEdge> rtcEdges=classNode.getRtcEdges();//relation到class的集合
        Set<ClassToValueEdge> ctvEdges=classNode.getCtvEdges();

        //处理了rtc的相关迁移
        Long oneIcmId = icmSet.iterator().next();
        Map<String,Integer> edgeNameMap = new HashMap<>();

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            if(rtcEdge.getStarter().getLoc()==sourceListId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                String edgeName=rtcEdge.getName();
                if(edgeNameMap.containsKey(edgeName)) {
                    edgeNameMap.put(edgeName,edgeNameMap.get(edgeName)+1);
                }else {
                    edgeNameMap.put(edgeName,1);
                }
            }
        }

        Map<String,Set<Long>> tmpUEdgeMap = new HashMap<>();
        Map<String,String> tmpUEdgeNameMap = new HashMap<>();

        for(RelationToClassEdge rtcEdge:rtcEdges) {
            int startLoc = rtcEdge.getStarter().getLoc();
            int endLoc = rtcEdge.getEnder().getLoc();
            String edgeName=rtcEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

            Set<Long> tmpUserSet=new HashSet<>(rtcEdge.getIcmSet());//该边的用户数
            Set<Long> newTmpUserSet=new HashSet<>(tmpUserSet);

            if(rtcEdge.getStarter().getLoc()==sourceListId&&rtcEdge.getIcmSet().contains(oneIcmId)) {
                newTmpUserSet.removeAll(icmSet);//是一条由sourceNode指向ClassNode的边
            }else if(rtcEdge.getStarter().getLoc()==targetListId && edgeNameMap.keySet().contains(edgeName)){
                //起点是目标节点,且原有节点中有一条和该边同名的边
                newTmpUserSet.addAll(icmSet);
                if(edgeNameMap.get(edgeName)==1) edgeNameMap.remove(edgeName);
                else edgeNameMap.put(edgeName,edgeNameMap.get(edgeName)-1);
            }

            if(tmpUEdgeMap.containsKey(tag)) {
                tmpUEdgeMap.get(tag).addAll(newTmpUserSet);
            }else {
                tmpUEdgeMap.put(tag,newTmpUserSet);
                tmpUEdgeNameMap.put(tag,edgeName);
            }
        }

        int startLoc = targetListId;
        int endLoc = classNode.getLoc();
        if(edgeNameMap.size() != 0) {
            for(String edgeName : edgeNameMap.keySet()) {
                Set<Long> innerSet = new HashSet<>(icmSet);
                String tag = edgeName +"-"+ startLoc +"-"+ endLoc;
                if(tmpUEdgeMap.containsKey(tag)) {
                    tmpUEdgeMap.get(tag).addAll(innerSet);
                }else {
                    tmpUEdgeMap.put(tag,innerSet);
                    tmpUEdgeNameMap.put(tag,edgeName);
                }
            }
        }

        convertElementToMapForMigrate(newNodeMap,tmpUEdgeMap,tmpUEdgeNameMap);//转换一下

        //但是上面的oldNodeMap和newNodeMap都只完成了relation to class的部分
        //下面我们完成class to value部分
        entropyHandler.addCTVElementToMap(newNodeMap,ctvEdges);

        //完成了oldNodeMap和newNodeMap的建立
//        double oldEntropy=entropyHandler.compueteMapEntropy(oldNodeMap , oldNodeNum);
        double oldEntropy=classNode.getBiEntropyValue()*oldNodeNum;
//        Map<String,List<Set<Long>>> tmpMap=entropyHandler.getMapForClassNode(classNode.getCtvEdges(),classNode.getRtcEdges());
        double newEntropy=entropyHandler.computeMapEntropy(newNodeMap , classNode , newNodeNum);
        res=newEntropy-oldEntropy;
        if(Double.compare(res,0.0)==0) res=0.0;
        return res;
    }

    public void convertElementToMapForMigrate(Map<String,List<Set<Long>>> newNodeMap,Map<String,Set<Long>> tmpUEdgeMap
            ,Map<String,String> tmpUEdgeNameMap) {
        //专门针对tmpUEdgeMap和tmpUEdgeNameMap结构转换成newNodeMap的函数
        for(String key : tmpUEdgeMap.keySet()) {
            Set<Long> uSet = tmpUEdgeMap.get(key);
            String edgeName = tmpUEdgeNameMap.get(key);
            if(newNodeMap.containsKey(edgeName)) {
                newNodeMap.get(edgeName).add(uSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(uSet);
                newNodeMap.put(edgeName,list);
            }
        }
    }

    /**
     * 这个函数是用来找出classNode中哪些用户指向同一个值节点,但过滤掉了用户数为1的情况,交由后面来解决
     * @param cNode
     * @return
     */
    public List<Set<Long>> getTheUserSetToConValueNodeForClassNode(ClassNode cNode) {
        List<Set<Long>> resList = new ArrayList<>();
        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            if(ctvEdge.getIcmSet().size()<=1) continue;
            Set<Long> vUSet = new HashSet<>(ctvEdge.getIcmSet());
            resList.add(vUSet);
        }
        return resList;
    }

    /**
     * 这个函数是用来找出classNode中哪些用户的边完全相同的
     * @param cNode
     * @return 一个map结构,主要就是相同边的用户集合
     */
    public Map<String,Set<Long>> getTheUserSetForClassNode(ClassNode cNode) {
        Set<Long> curIcmSet = cNode.getIcmSet();
        Map<Long,String> icmMap = new HashMap<>();
        Map<String,Set<Long>> sameIcmMap = new HashMap<>();
        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            for(Long curIcm : ctvEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm))
                    icmMap.put(curIcm,icmMap.get(curIcm)+"-"+ctvEdge.getUniqueIdentifierString());
                else {
                    icmMap.put(curIcm, ctvEdge.getUniqueIdentifierString());
                }
            }
        }

        for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
            for(Long curIcm : rtcEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm)) icmMap.put(curIcm, icmMap.get(curIcm) + "-" + rtcEdge.getUniqueIdentifierString());
                else {
                    icmMap.put(curIcm, rtcEdge.getUniqueIdentifierString());
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

    public Map<String,Set<Long>> getTheUserSetForRelationNode(RelationNode rNode) {
        Set<Long> curIcmSet = rNode.getIcmSet();
        Map<Long,String> icmMap = new HashMap<>();
        Map<String,Set<Long>> sameIcmMap = new HashMap<>();
        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            for(Long curIcm : rtvEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm))
                    icmMap.put(curIcm,icmMap.get(curIcm)+"-"+rtvEdge.getUniqueIdentifierString());
                else {
                    icmMap.put(curIcm, rtvEdge.getUniqueIdentifierString());
                }
            }
        }

        for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
            for(Long curIcm : rtcEdge.getIcmSet()) {
                if(icmMap.containsKey(curIcm)) icmMap.put(curIcm,icmMap.get(curIcm)+"-"+rtcEdge.getUniqueIdentifierString());
                else {
                    icmMap.put(curIcm, rtcEdge.getUniqueIdentifierString());
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

    /**
     * 为0表示返回正常的list,为1表示只返回与当前cNode相似的概念的ConClassNode
     * @param cNode
     * @param valueNodeList
     * @param strictLevel
     * @return
     */
    public List<Integer> findConClassNodes(ClassNode cNode,List<ClassNode> classNodeList,List<ValueNode> valueNodeList,
                                           int strictLevel) {
        List<Integer> tmpConClassNodes = new ArrayList<>();
        if(strictLevel==1) {
            tmpConClassNodes = findConClassNodesForSim(cNode, valueNodeList);//这部分没考虑relationNode
        }else {
            tmpConClassNodes = findConClassNodesDetail(cNode, valueNodeList);
        }
        List<Integer> resConClassNodes = getSortedConCNode(tmpConClassNodes,classNodeList);
        return resConClassNodes;
    }

    public List<Integer> getSortedConCNode(List<Integer> tmpConClassNodes,List<ClassNode> classNodeList) {
        List<Integer> resConClassNodes = new ArrayList<>();
        int resSize = tmpConClassNodes.size();
        List<PreSortNode> preSortNodes = new ArrayList<>();
        for(int i=0;i<resSize;i++) {
            ClassNode innerNode = classNodeList.get(tmpConClassNodes.get(i));
            PreSortNode preSortNode = new PreSortNode(innerNode.getLoc(),innerNode.getBiEntropyValue(),innerNode.getIcmSet().size());
            preSortNodes.add(preSortNode);
        }
        Collections.sort(preSortNodes, new Comparator<PreSortNode>() {
            @Override
            public int compare(PreSortNode o1, PreSortNode o2) {
                return o1.refUserNum - o2.refUserNum;
            }
        });
        for(int i=0;i<resSize;i++) {
            resConClassNodes.add(preSortNodes.get(i).loc);
        }
        return resConClassNodes;
    }


    //返回与cNode有相交节点的所有classNode的ListId编号
    private List<Integer> findConClassNodesDetail(ClassNode cNode,List<ValueNode> valueNodeList) {
        List<Integer> classNodeListIdSet = new ArrayList<>();
        classNodeListIdSet.addAll(findConClassNodesForSim(cNode,valueNodeList));

        for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
            if(rtcEdge.getIcmSet().size() == 0) continue;
            RelationNode rNode = rtcEdge.getStarter();
            for(RelationToClassEdge rtcEdge2 : rNode.getRtcEdges()) {
                if(rtcEdge2.getIcmSet().size() == 0) continue;
                ClassNode otherCNode = rtcEdge2.getEnder();
                if(otherCNode.getLoc()==cNode.getLoc() || classNodeListIdSet.contains(otherCNode.getLoc())) continue;
                else {
                    classNodeListIdSet.add(otherCNode.getLoc());
                }
            }
        }

        return classNodeListIdSet;
    }

    private List<Integer> findConClassNodesForSim(ClassNode cNode,List<ValueNode> valueNodeList) {
        List<Integer> classNodeListIdSet = new ArrayList<>();
        Set<Integer> vDirectNodeListIdSet = new HashSet<>();
        Set<Integer> sumVNodeSet = new HashSet<>();

        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            if(ctvEdge.getIcmSet().size() == 0) continue;
            ValueNode vNode = ctvEdge.getEnder();
            vDirectNodeListIdSet.add(vNode.getLoc());
        }

        //除了ctv和rtc的之外,还要考虑因为value节点相似而带来的额外的ctv
        for(int vloc : vDirectNodeListIdSet) {
            List<Integer> simList = WordSimilarities.mostSimList.get(vloc);
            sumVNodeSet.addAll(simList);
        }
        sumVNodeSet.addAll(vDirectNodeListIdSet);

        for(int vNodeLocId : sumVNodeSet) {
            ValueNode vNode = valueNodeList.get(vNodeLocId);
            //获得了当前cNode连接的一个vNode,接下来获取到该vNode连接的所有cNode
            for(ClassToValueEdge ctvEdge2 : vNode.getCtvEdges()) {
                if(ctvEdge2.getIcmSet().size() == 0) continue;
                ClassNode otherCNode = ctvEdge2.getStarter();
                if(otherCNode.getLoc()==cNode.getLoc() || classNodeListIdSet.contains(otherCNode.getLoc())) continue;
                else {
                    classNodeListIdSet.add(otherCNode.getLoc());
                }
            }
        }
        return classNodeListIdSet;
    }

    /**
     *
     * @param rNode
     * @param valueNodeList
     * @param strictLevel 为0返回正常的ConRelation,为1表示只保留与其Role相同的relation,为2表示只保留非string等基础类型的relation
     * @return
     */
    public List<Integer> findConRelationNodes(RelationNode rNode,List<RelationNode> relationNodeList
            ,List<ValueNode> valueNodeList,int strictLevel) {
        List<Integer> tmpResConRList = new ArrayList<>();
        if(strictLevel == 0) {
            tmpResConRList = findConRelationNodesDetail(rNode,valueNodeList);
        }else if(strictLevel == 1) {
            //1号情况下必须找出与其role相似的节点
            List<Integer> tConRList = findConRelationNodesDetail(rNode,valueNodeList);
            List<List<Integer>> curRoleList = getRoleListForRelationNode(rNode);
            for(int otherRLoc : tConRList) {
                RelationNode otherRNode = relationNodeList.get(otherRLoc);
                List<List<Integer>> otherRoleList = getRoleListForRelationNode(otherRNode);
                if(isSimRoleForTwoRoleList(curRoleList,otherRoleList)) tmpResConRList.add(otherRLoc);
            }
        }else if(strictLevel == 2) {
            List<Integer> tConRList = findConRelationNodesDetail(rNode,valueNodeList);
            tmpResConRList = removeBasicRNodeFromRList(tConRList,relationNodeList);
        }

        List<Integer> resConRList = getSortedConRNode(tmpResConRList,relationNodeList);
        return resConRList;
    }

    public List<Integer> getSortedConRNode(List<Integer> tmpResConRList,List<RelationNode> relationNodeList) {
        List<Integer> resConRList = new ArrayList<>();
        int rSize = tmpResConRList.size();
        List<PreSortNode> preSortNodes = new ArrayList<>();
        for(int i=0;i<rSize;i++) {
            RelationNode innerRNode = relationNodeList.get(tmpResConRList.get(i));
            PreSortNode preSortNode = new PreSortNode(innerRNode.getLoc(),innerRNode.getBiEntropyValue(),innerRNode.getIcmSet().size());
            preSortNodes.add(preSortNode);
        }

        Collections.sort(preSortNodes, new Comparator<PreSortNode>() {
            @Override
            public int compare(PreSortNode o1, PreSortNode o2) {
                return o1.refUserNum - o2.refUserNum;
            }
        });
        for(int i=0;i<rSize;i++) {
            resConRList.add(preSortNodes.get(i).loc);
        }
        return resConRList;
    }

    /**
     * 主要用来移除relationNodeList中所包含的基础类型的属性
     * @param conRList
     * @param relationNodeList
     * @return
     */
    public List<Integer> removeBasicRNodeFromRList(List<Integer> conRList,List<RelationNode> relationNodeList) {
        List<Integer> resConRList = new ArrayList<>();
        for(int otherRLoc : conRList) {
            RelationNode otherRNode = relationNodeList.get(otherRLoc);
            if(!isBasicTypeRelation(otherRNode)) resConRList.add(otherRLoc);
        }
        return resConRList;
    }

    public boolean isBasicTypeRelation(RelationNode rNode) {
        boolean flag = false;
        for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
            ClassNode cNode = rtcEdge.getEnder();
            for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
                String cName = ctvEdge.getEnder().getName();
                if(cName.equals("int")||cName.equals("string")||cName.equals("boolean")||cName.equals("float")) {
                    flag = true;
                    break;
                }
            }
            if(flag) break;
        }
        return flag;
    }

    private List<Integer> findConRelationNodesDetail(RelationNode rNode,List<ValueNode> valueNodeList) {
        List<Integer> relationNodeListIdSet = new ArrayList<>();
        List<Integer> vNodeSimListIdSet = new ArrayList<>();//用来找相似的valueNode
        List<Integer> vNodeListIdSet = new ArrayList<>();

        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            if (rtvEdge.getIcmSet().size() == 0) continue;
            ValueNode vNode = rtvEdge.getEnder();
            if(vNode.getName().equals("1")||vNode.getName().equals("0..1")||vNode.getName().equals("2")||
                    vNode.getName().equals("*") ||vNode.getName().equals("1..*")||vNode.getName().equals("true"))
                continue;
            vNodeSimListIdSet.add(vNode.getLoc());
            vNodeListIdSet.add(vNode.getLoc());
        }

        for(int vloc : vNodeSimListIdSet) {
            List<Double> vSim = WordSimilarities.vNodeSimList.get(vloc);
            int vSize = vSim.size();
            for(int i=0;i<vSize;i++) {
                if(i==vloc) continue;
                if(Double.compare(vSim.get(i),0.5)>=0) {
                    vNodeListIdSet.add(i);
                }
            }
        }

        for(int vNodeLocId : vNodeListIdSet) {
            ValueNode vNode = valueNodeList.get(vNodeLocId);
            if(vNode.getName().equals("1")||vNode.getName().equals("0..1")||vNode.getName().equals("2")||
                    vNode.getName().equals("*") ||vNode.getName().equals("1..*")||vNode.getName().equals("true"))
                continue;
            for(RelationToValueEdge rtvEdge2 : vNode.getRtvEdges()) {
                if(rtvEdge2.getIcmSet().size() == 0) continue;
                RelationNode otherRNode = rtvEdge2.getStarter();
                if(otherRNode.getLoc()==rNode.getLoc() || relationNodeListIdSet.contains(otherRNode.getLoc())) continue;
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
                if(otherRNode.getLoc()==rNode.getLoc() || relationNodeListIdSet.contains(otherRNode.getLoc())) continue;
                else {
                    relationNodeListIdSet.add(otherRNode.getLoc());
                }
            }
        }

        return relationNodeListIdSet;
    }

    /**
     * 获取当前relationNode的role列表,注意一个relation可能多种role.
     * @param rNode
     * @return
     */
    private List<List<Integer>> getRoleListForRelationNode(RelationNode rNode) {
        Set<Long> icmSet = new HashSet<>(rNode.getIcmSet());
        Iterator<Long> iter = icmSet.iterator();
        Map<String,Set<Long>> myMap = new HashMap<>();
        List<RelationToValueEdge> rtvList = new ArrayList<>(rNode.getRtvEdges());
        while(iter.hasNext()) {
            long curIcmId = iter.next();
            StringBuffer curStrBuffer = new StringBuffer();
            for(RelationToValueEdge rtvEdge : rtvList) {
                if(rtvEdge.getName().equals("role") && rtvEdge.getIcmSet().contains(curIcmId)) {//
                    if(curStrBuffer.length()==0) curStrBuffer.append(rtvEdge.getEnder().getLoc());
                    else curStrBuffer.append("-"+rtvEdge.getEnder().getLoc());
                }
            }
            String curStr = curStrBuffer.toString();
            if(myMap.containsKey(curStr)) {
                myMap.get(curStr).add(curIcmId);
            }else {
                Set<Long> innerSet = new HashSet<>();
                innerSet.add(curIcmId);
                myMap.put(curStr,innerSet);
            }
        }//这里面string石油valueNode的loc组成的
        //获得了用户分布集合
        List<List<Integer>> roleList = new ArrayList<>();
        List<String> roleMapList = new ArrayList<>(myMap.keySet());
        int rSize = roleMapList.size();
        for(int i=0;i<rSize;i++) {
            String curRoleStr = roleMapList.get(i);
            if(curRoleStr.equals("")) continue;
            List<Integer> curRoleList = new ArrayList<>();
            if(curRoleStr.indexOf("-")!=-1) {
                String[] roleArr = curRoleStr.split("-");
                curRoleList.add(Integer.parseInt(roleArr[0]));
                curRoleList.add(Integer.parseInt(roleArr[1]));
            }else {
                curRoleList.add(Integer.parseInt(curRoleStr));
                curRoleList.add(-1);
            }
            roleList.add(curRoleList);
        }
        return roleList;
    }

    /**
     * 判断两个roleList是否有相似的
     * @param curRoleList
     * @param otherRoleList
     * @return
     */
    private boolean isSimRoleForTwoRoleList(List<List<Integer>> curRoleList,List<List<Integer>> otherRoleList) {
        int curSize = curRoleList.size();
        int otherSize = otherRoleList.size();
        for(int i=0;i<curSize;i++) {
            List<Integer> curInnerList = curRoleList.get(i);
            int curRole1 = curInnerList.get(0);
            int curRole2 = curInnerList.get(1);
            List<Integer> simRoleLoc1 = new ArrayList<>();
            List<Integer> simRoleLoc2 = new ArrayList<>();
            if(curRole1!=-1) simRoleLoc1=WordSimilarities.mostSimList.get(curRole1);
            else simRoleLoc1.add(-1);
            if(curRole2!=-1) simRoleLoc2=WordSimilarities.mostSimList.get(curRole2);
            else simRoleLoc2.add(-1);
            for(int j=0;j<otherSize;j++) {
                List<Integer> otherInnerList = otherRoleList.get(j);
                int otherRole1 = otherInnerList.get(0);
                int otherRole2 = otherInnerList.get(1);
                if((simRoleLoc1.contains(otherRole1)&&simRoleLoc2.contains(otherRole2)) ||
                        (simRoleLoc1.contains(otherRole2)&&simRoleLoc2.contains(otherRole1))) return true;
            }
        }
        return false;//false
    }

    //按用户引用数对List进行排序.
    class PreSortNode {
        //按用户引用数对List进行排序.
        int loc;
        double entropy;
        int refUserNum;

        public PreSortNode(int loc, double entropy, int refUserNum) {
            this.loc = loc;
            this.entropy = entropy;
            this.refUserNum = refUserNum;
        }
    }
}
