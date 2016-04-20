/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService.migrateUtil;

import net.stigmod.domain.conceptualmodel.*;
import net.stigmod.service.migrateService.EntropyHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * @author Kai Fu
 * @version 2016/3/31
 */
@Service
public class SimulateHandlerImpl implements SimulateHandler{

    @Autowired
    MigrateUtil migrateUtil;

    @Autowired
    EntropyHandler entropyHandler;

    public double simulateMigrateForClass(Set<Long> icmSet,ClassNode sourceCNode,ClassNode targetCNode,int curNodeSum,
                                          double curSystemEntropy,boolean targetIsNullFlag) {
        return simulateMigrateForClassDetail(icmSet,sourceCNode,targetCNode,curNodeSum,curSystemEntropy,targetIsNullFlag);
    }

    public double simulateMigrateForRelation(Set<Long> icmSet,RelationNode sourceRNode,RelationNode targetRNode,
                                              int curNodeSum,double curSystemEntropy,boolean targetIsNullFlag){
        return simulateMigrateForRelationDetail(icmSet,sourceRNode,targetRNode,curNodeSum,curSystemEntropy,targetIsNullFlag);
    }

    private double simulateMigrateForClassDetail(Set<Long> icmSet,ClassNode sourceCNode,ClassNode targetCNode,int curNodeSum,
                                           double curSystemEntropy,boolean targetIsNullFlag) {
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化

        double simulateMigrateBiEntropy = 0.0;
        simulateMigrateBiEntropy += sourceCNode.getBiEntropyValue();
        simulateMigrateBiEntropy += targetCNode.getBiEntropyValue();

        int simulateNodeSum = curNodeSum;
        int icmSize = icmSet.size();

        if(targetIsNullFlag) simulateNodeSum++;//目标节点从空节点变为了非空节点,自然simulateNodeSum++了
        if(sourceCNode.getIcmSet().size() - icmSize ==0) simulateNodeSum--;//源节点从非空节点变为空节点,则simulateNodeSum--了

        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();

        Map<Integer,Set<Long>> sourceCtvNameMap = new HashMap<>();
        Map<Integer,Set<Long>> targetCtvNameMap = new HashMap<>();//这个map是专门针对name边的,key存储valuenode的loc,value存储用户

        Set<Integer> dupVNodeListIdSet=new HashSet<>();//判断是否会出现重复切换某一个点
        List<Integer> emergeVListIdList=new ArrayList<>();
        List<String> emergeVNameList=new ArrayList<>();
        Long oneIcmId = icmSet.iterator().next();//取出其中一个用户,作为标杆
        for(ClassToValueEdge ctvEdge : sourceCNode.getCtvEdges()) {
            int usize=ctvEdge.getIcmSet().size();
            if(usize==0) continue;
            String edgeName=ctvEdge.getName();
            if(ctvEdge.getIcmSet().contains(oneIcmId)) {//只要包含标杆用户,则说明当前边包含了当前用户集合
                usize-=icmSize;
                ValueNode valueNode=ctvEdge.getEnder();
                emergeVListIdList.add(valueNode.getLoc());
                emergeVNameList.add(edgeName);
                if(dupVNodeListIdSet.contains(valueNode.getLoc()));
                else {
                    dupVNodeListIdSet.add(valueNode.getLoc());
                    simulateMigrateBiEntropy += valueNode.getBiEntropyValue();
                    double ttmpVar = 0.0;
                    ttmpVar = migrateUtil.MigrateFromClassToClassForValueNode(icmSet,valueNode,sourceCNode,
                            targetCNode,curNodeSum,simulateNodeSum);
                    var += ttmpVar;
                }
            }

            Set<Long> tTmp=new HashSet<>(ctvEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(new HashSet<Long>(icmSet));
            }
            sourceCtvNameMap.put(ctvEdge.getEnder().getLoc(),tTmp);
        }

        Set<Integer> dupRNodeListIdSet=new HashSet<>();//判断是否会出现一个relation两条边指向一个class
        List<Integer> emergeRListIdList=new ArrayList<>();
        List<String> emergeRNameList=new ArrayList<>();
//        List<String> emergeRPortList=new ArrayList<>();

        Map<String,Set<Long>> tmpSourceUEdgeMap = new HashMap<>();
        Map<String,String> tmpSourceUEdgeNameMap = new HashMap<>();

        for(RelationToClassEdge rtcEdge : sourceCNode.getRtcEdges()) {
            int usize=rtcEdge.getIcmSet().size();
            if(usize==0) continue;
            int startLoc = rtcEdge.getStarter().getLoc();
            int endLoc = rtcEdge.getEnder().getLoc();
            String edgeName=rtcEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

//            String port=rtcEdge.getPort();
            if(rtcEdge.getIcmSet().contains(oneIcmId)) {
                usize-=icmSize;
                RelationNode relationNode=rtcEdge.getStarter();
                emergeRListIdList.add(relationNode.getLoc());
                emergeRNameList.add(edgeName);
//                emergeRPortList.add(port);
                if(dupRNodeListIdSet.contains(relationNode.getLoc()));
                else {
                    dupRNodeListIdSet.add(relationNode.getLoc());
                    simulateMigrateBiEntropy += relationNode.getBiEntropyValue();
                    double ttmpVar = 0.0;
                    ttmpVar = migrateUtil.MigrateFromClassToClassForRelationNode(icmSet,relationNode,sourceCNode,
                            targetCNode,curNodeSum,simulateNodeSum);
                    var += ttmpVar;
                }
            }

            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(new HashSet<Long>(icmSet));
            }
            if(tmpSourceUEdgeMap.containsKey(tag)) {
                tmpSourceUEdgeMap.get(tag).addAll(tTmp);
            }else {
                tmpSourceUEdgeMap.put(tag, tTmp);
                tmpSourceUEdgeNameMap.put(tag, edgeName);
            }
        }

        migrateUtil.convertElementToMapForMigrate(newSourceMap,tmpSourceUEdgeMap,tmpSourceUEdgeNameMap);//将对应内容转换成newSourceMap

        //上述这两步完成了对newSourceMap的构建,接下来是newTargetMap的构建

        for(ClassToValueEdge ctvEdge:targetCNode.getCtvEdges()) {
            String edgeName=ctvEdge.getName();
            int usize=ctvEdge.getIcmSet().size();
            int vId=ctvEdge.getEnder().getLoc();
            int emVSize=emergeVListIdList.size();
            for(int i=0;i<emVSize;i++) {
                int emergeVId=emergeVListIdList.get(i);
                String emergeEdgeName=emergeVNameList.get(i);
                if(emergeVId!=vId||!emergeEdgeName.equals(edgeName)) continue;
                usize+=icmSize;
                emergeVListIdList.remove(i);
                emergeVNameList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(ctvEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(new HashSet<Long>(icmSet));
            }
            targetCtvNameMap.put(vId,tTmp);//将这个value节点加入到其中去
        }

        Map<String,Set<Long>> tmpTargetUEdgeMap = new HashMap<>();
        Map<String,String> tmpTargetUEdgeNameMap = new HashMap<>();

        for(RelationToClassEdge rtcEdge:targetCNode.getRtcEdges()) {
            int startLoc = rtcEdge.getStarter().getLoc();
            int endLoc = rtcEdge.getEnder().getLoc();
            String edgeName=rtcEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

//            String port=rtcEdge.getPort();
            int usize=rtcEdge.getIcmSet().size();
            int rListId=rtcEdge.getStarter().getLoc();
            int emRSize=emergeRListIdList.size();
            for(int i=0;i<emRSize;i++) {
                int emergeRListId=emergeRListIdList.get(i);
                String emergeEdgeName=emergeRNameList.get(i);
//                String emergePort=emergeRPortList.get(i);
                if(emergeRListId!=rListId) continue;
                if(!emergeEdgeName.equals(edgeName)) continue;
//                if(!emergePort.equals(port)) continue;
                usize+=icmSize;
                emergeRListIdList.remove(i);
                emergeRNameList.remove(i);
//                emergeRPortList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(new HashSet<Long>(icmSet));
            }
            if(tmpTargetUEdgeMap.containsKey(tag)) {
                tmpTargetUEdgeMap.get(tag).addAll(tTmp);
            }else {
                tmpTargetUEdgeMap.put(tag, tTmp);
                tmpTargetUEdgeNameMap.put(tag, edgeName);
            }
//            if(!newTargetMap.containsKey(edgeName)) {
//                List<Set<Long>> refU=new ArrayList<>();
//                refU.add(tTmp);
//                newTargetMap.put(edgeName,refU);
//            }else {
//                newTargetMap.get(edgeName).add(tTmp);
//            }
        }

        int targetCLoc = targetCNode.getLoc();
        int emergeVIdListSize = emergeVListIdList.size();
        int emergeRIdListSize = emergeRListIdList.size();
        for(int i=0;i<emergeVIdListSize;i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
            String edgeName=emergeVNameList.get(i);
            targetCtvNameMap.put(emergeVListIdList.get(i),tTmp);//把这个补进去
        }

        for(int i=0;i<emergeRIdListSize;i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
            String edgeName=emergeRNameList.get(i);
            int rLoc = emergeRListIdList.get(i);
            String tag = edgeName +"-"+ rLoc +"-"+ targetCLoc;

            if(tmpTargetUEdgeMap.containsKey(tag)) {
                tmpTargetUEdgeMap.get(tag).addAll(tTmp);
            }else {
                tmpTargetUEdgeMap.put(tag, tTmp);
                tmpTargetUEdgeNameMap.put(tag, edgeName);
            }
        }

        migrateUtil.convertElementToMapForMigrate(newTargetMap,tmpTargetUEdgeMap,tmpTargetUEdgeNameMap);//将对应内容转换成newSourceMap

        //完成了newTargetMap的构建
//        double oldSourceEntropy=entropyHandler.computeMapEntropy(oldSourceMap,nodeSum);
        double oldSourceEntropy = sourceCNode.getBiEntropyValue()*curNodeSum;
        double newSourceEntropy=entropyHandler.computeSimulateMigrateCNodeMapEntropy(newSourceMap, sourceCtvNameMap,
                sourceCNode,simulateNodeSum);
//        double oldTargetEntropy=entropyHandler.computeMapEntropy(oldTargetMap,nodeSum);
        double oldTargetEntropy = targetCNode.getBiEntropyValue()*curNodeSum;
        double newTargetEntropy=entropyHandler.computeSimulateMigrateCNodeMapEntropy(newTargetMap, targetCtvNameMap,
                targetCNode, simulateNodeSum);//这里必须做特殊处理,因为ClassToValue的边的要算相似度

        //获取变化的var值
        double sourceVar=newSourceEntropy-oldSourceEntropy;
        double targetVar=newTargetEntropy-oldTargetEntropy;
        sumEntropyVar+=var;
        sumEntropyVar+=sourceVar;
        sumEntropyVar+=targetVar;

        double simulateMigrateEntropy = simulateMigrateBiEntropy*curNodeSum;
        double unChangeBiEntropy = (curSystemEntropy - simulateMigrateEntropy)/curNodeSum;
        double migratedSystemEntropy = unChangeBiEntropy * simulateNodeSum + simulateMigrateEntropy + sumEntropyVar;
        double resVar = migratedSystemEntropy - curSystemEntropy;

        return resVar;
    }

    private double simulateMigrateForRelationDetail(Set<Long> icmSet,RelationNode sourceRNode,
                                              RelationNode targetRNode,int curNodeSum,
                                              double curSystemEntropy,boolean targetIsNullFlag) {
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化

        double simulateMigrateBiEntropy = 0.0;
        simulateMigrateBiEntropy += sourceRNode.getBiEntropyValue();
        simulateMigrateBiEntropy += targetRNode.getBiEntropyValue();

        int simulateNodeSum=curNodeSum;
        int icmSetSize = icmSet.size();

        if(targetIsNullFlag) simulateNodeSum++;//目标节点为空节点,则将simulateNodeNum加加
        if(sourceRNode.getIcmSet().size()-icmSetSize==0) simulateNodeSum--;//源节点为单用户节点,则将simulateNodeNum减减

        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();

        Long oneIcmId = icmSet.iterator().next();

        Map<Integer, List<Set<Long>>> sourceRoleNodeMap = new HashMap<>();

        Map<String,Set<Long>> tmpSourceUEdgeMap = new HashMap<>();
        Map<String,String> tmpSourceUEdgeNameMap = new HashMap<>();

        Set<Integer> dupVNodeListIdSet=new HashSet<>();//判断是否会出现重复切换某一个点
        List<Integer> emergeVListIdList=new ArrayList<>();
//        List<String> emergeVPortList=new ArrayList<>();
        List<String> emergeVNameList=new ArrayList<>();
        for(RelationToValueEdge rtvEdge : sourceRNode.getRtvEdges()) {
            int usize=rtvEdge.getIcmSet().size();
            if(usize==0) continue;
            int startLoc = rtvEdge.getStarter().getLoc();
            int endLoc = rtvEdge.getEnder().getLoc();
            String edgeName=rtvEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

            if(rtvEdge.getIcmSet().contains(oneIcmId)) {//说明当前边包含了当前用户
                usize-=icmSetSize;
                ValueNode valueNode=rtvEdge.getEnder();
                emergeVListIdList.add(valueNode.getLoc());
                emergeVNameList.add(edgeName);
                if(dupVNodeListIdSet.contains(valueNode.getLoc()));
                else {
                    dupVNodeListIdSet.add(valueNode.getLoc());
                    simulateMigrateBiEntropy += valueNode.getBiEntropyValue();
                    double valueNodeVar = 0.0;
                    valueNodeVar += migrateUtil.MigrateFromRelationToRelationForValueNode(
                            icmSet,valueNode,sourceRNode,targetRNode,curNodeSum,simulateNodeSum);
                    var += valueNodeVar;
                }
            }

            Set<Long> tTmp=new HashSet<>(rtvEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(icmSet);
            }
            if(edgeName.equals("role")) {
                int vId = rtvEdge.getEnder().getLoc();
                if(sourceRoleNodeMap.containsKey(vId)) {
                    sourceRoleNodeMap.get(vId).add(tTmp);
                }else {
                    List<Set<Long>> innerList = new ArrayList<>();
                    innerList.add(tTmp);
                    sourceRoleNodeMap.put(vId,innerList);
                }
            }else {
                if(tmpSourceUEdgeMap.containsKey(tag)) {
                    tmpSourceUEdgeMap.get(tag).addAll(tTmp);
                }else {
                    tmpSourceUEdgeMap.put(tag,tTmp);
                    tmpSourceUEdgeNameMap.put(tag,edgeName);
                }
            }
        }

        Set<Integer> dupCNodeListIdSet=new HashSet<>();//判断是否会出现一个relation两条边指向一个class
        List<Integer> emergeCListIdList=new ArrayList<>();
//        List<String> emergeCPortList=new ArrayList<>();
        List<String> emergeCNameList=new ArrayList<>();
        for(RelationToClassEdge rtcEdge : sourceRNode.getRtcEdges()) {
            int usize=rtcEdge.getIcmSet().size();
            if(usize==0) continue;
            int startLoc = rtcEdge.getStarter().getLoc();
            int endLoc = rtcEdge.getEnder().getLoc();
            String edgeName=rtcEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

//            String port=rtcEdge.getPort();
            if(rtcEdge.getIcmSet().contains(oneIcmId)) {
                usize--;
                ClassNode classNode=rtcEdge.getEnder();
                emergeCListIdList.add(classNode.getLoc());
//                emergeCPortList.add(port);
                emergeCNameList.add(edgeName);
                if(dupCNodeListIdSet.contains(classNode.getLoc()));
                else {
                    dupCNodeListIdSet.add(classNode.getLoc());
                    simulateMigrateBiEntropy += classNode.getBiEntropyValue();
                    double classNodeVar = 0.0;
                    classNodeVar+=migrateUtil.MigrateFromRelationToRelationForClassNode(
                            icmSet,classNode,sourceRNode,targetRNode,curNodeSum,simulateNodeSum);
                    var += classNodeVar;
                }
            }

            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(icmSet);
            }
            if(tmpSourceUEdgeMap.containsKey(tag)) {
                tmpSourceUEdgeMap.get(tag).addAll(tTmp);
            }else {
                tmpSourceUEdgeMap.put(tag,tTmp);
                tmpSourceUEdgeNameMap.put(tag,edgeName);
            }
        }

        //上述这两步完成了对newSourceMap的构建,接下来是newTargetMap的构建
        migrateUtil.convertElementToMapForMigrate(newSourceMap,tmpSourceUEdgeMap,tmpSourceUEdgeNameMap);

        Map<String,Set<Long>> tmpTargetUEdgeMap = new HashMap<>();
        Map<String,String> tmpTargetUEdgeNameMap = new HashMap<>();
        Map<Integer, List<Set<Long>>> targetRoleNodeMap = new HashMap<>();

        for(RelationToValueEdge rtvEdge:targetRNode.getRtvEdges()) {
            int startLoc = rtvEdge.getStarter().getLoc();
            int endLoc = rtvEdge.getEnder().getLoc();
            String edgeName=rtvEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+ endLoc;

            int usize=rtvEdge.getIcmSet().size();
            int vId=rtvEdge.getEnder().getLoc();
            int emVSize=emergeVListIdList.size();//这个是记录了sourceRNode所连接的value节点中包含有curIcmId的个数
            for(int i=0;i<emVSize;i++) {
                int emergeVId=emergeVListIdList.get(i);
                String emergeEdgeName=emergeVNameList.get(i);
                if(emergeVId!=vId||!emergeEdgeName.equals(edgeName)) continue;
                usize+=icmSetSize;
                emergeVListIdList.remove(i);
                emergeVNameList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtvEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(icmSet);
            }
            if(edgeName.equals("role")) {
                if(targetRoleNodeMap.containsKey(vId)) {
                    targetRoleNodeMap.get(vId).add(tTmp);
                }else {
                    List<Set<Long>> innerList = new ArrayList<>();
                    innerList.add(tTmp);
                    targetRoleNodeMap.put(vId,innerList);
                }
            }else {
                if(tmpTargetUEdgeMap.containsKey(tag)) {
                    tmpTargetUEdgeMap.get(tag).addAll(tTmp);
                }else {
                    tmpTargetUEdgeMap.put(tag,tTmp);
                    tmpTargetUEdgeNameMap.put(tag,edgeName);
                }
            }
        }

        for(RelationToClassEdge rtcEdge:targetRNode.getRtcEdges()) {
//            String port=rtcEdge.getPort();
            int startLoc = rtcEdge.getStarter().getLoc();
            int endLoc = rtcEdge.getEnder().getLoc();
            String edgeName=rtcEdge.getName();
            String tag = edgeName +"-"+ startLoc +"-"+endLoc;

            int usize=rtcEdge.getIcmSet().size();
            int cListId = rtcEdge.getEnder().getLoc();//获取class的id
            int emCSize=emergeCListIdList.size();
            for(int i=0;i<emCSize;i++) {
                int emergeCListId=emergeCListIdList.get(i);
//                String emergePort=emergeCPortList.get(i);
                String emergeEdgeName=emergeCNameList.get(i);
                if(emergeCListId!=cListId||!emergeEdgeName.equals(edgeName)) continue;
                usize+=icmSetSize;
                emergeCListIdList.remove(i);
                emergeCNameList.remove(i);
//                emergeCPortList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(icmSet);
            }

            if(tmpTargetUEdgeMap.containsKey(tag)) {
                tmpTargetUEdgeMap.get(tag).addAll(tTmp);
            }else {
                tmpTargetUEdgeMap.put(tag,tTmp);
                tmpTargetUEdgeNameMap.put(tag,edgeName);
            }
        }



        //这部分就是我们要新加入的边
        int targetLoc = targetRNode.getLoc();
        for(int i=0;i<emergeVListIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
//            String port=emergeVPortList.get(i);
            String edgeName=emergeVNameList.get(i);
            int vLoc = emergeVListIdList.get(i);

            String tag = edgeName +"-"+ targetLoc +"-"+ vLoc;
            if(edgeName.equals("role")) {
                if(targetRoleNodeMap.containsKey(vLoc)) {
                    targetRoleNodeMap.get(vLoc).add(tTmp);
                }else {
                    List<Set<Long>> innerList = new ArrayList<>();
                    innerList.add(tTmp);
                    targetRoleNodeMap.put(vLoc,innerList);
                }
            }else {
                if(tmpTargetUEdgeMap.containsKey(tag)) {
                    tmpTargetUEdgeMap.get(tag).addAll(tTmp);
                }else {
                    tmpTargetUEdgeMap.put(tag,tTmp);
                    tmpTargetUEdgeNameMap.put(tag,edgeName);
                }
            }
        }

        for (int i = 0; i < emergeCListIdList.size(); i++) {
            Set<Long> tTmp = new HashSet<>(icmSet);
            String edgeName=emergeCNameList.get(i);
            int cLoc = emergeCListIdList.get(i);

            String tag = edgeName +"-"+ targetLoc +"-"+ cLoc;
            if(tmpTargetUEdgeMap.containsKey(tag)) {
                tmpTargetUEdgeMap.get(tag).addAll(tTmp);
            }else {
                tmpTargetUEdgeMap.put(tag,tTmp);
                tmpTargetUEdgeNameMap.put(tag,edgeName);
            }
        }

        migrateUtil.convertElementToMapForMigrate(newTargetMap,tmpTargetUEdgeMap,tmpTargetUEdgeNameMap);

        //完成了newTargetMap的构建
//        double oldSourceEntropy=entropyHandler.computeMapEntropy(oldSourceMap,nodeSum);
        double oldSourceEntropy = sourceRNode.getBiEntropyValue()*curNodeSum;
        double newSourceEntropy=entropyHandler.computeSimulateMigrateRNodeMapEntropy(newSourceMap, sourceRoleNodeMap,
                sourceRNode, simulateNodeSum);
//        double oldTargetEntropy=entropyHandler.computeMapEntropy(oldTargetMap,nodeSum);
        double oldTargetEntropy = targetRNode.getBiEntropyValue()*curNodeSum;
        double newTargetEntropy=entropyHandler.computeSimulateMigrateRNodeMapEntropy(newTargetMap, targetRoleNodeMap,
                targetRNode ,simulateNodeSum);

        //获取变化的var值
        double sourceVar=newSourceEntropy-oldSourceEntropy;
        double targetVar=newTargetEntropy-oldTargetEntropy;
        sumEntropyVar+=var;
        sumEntropyVar+=sourceVar;
        sumEntropyVar+=targetVar;

        double simulateMigrateEntropy = simulateMigrateBiEntropy*curNodeSum;
        double unChangeBiEntropy = (curSystemEntropy - simulateMigrateEntropy)/curNodeSum;
        double migratedcurSystemEntropy = unChangeBiEntropy * simulateNodeSum + simulateMigrateEntropy + sumEntropyVar;
        double resVar = migratedcurSystemEntropy - curSystemEntropy;

        return resVar;
    }


}
