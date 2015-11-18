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
import net.stigmod.domain.node.CollectiveConceptualModel;
import net.stigmod.domain.node.RelationNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.CollectiveConceptualModelRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

/**
 * 
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public class MigrateHandlerImpl implements MigrateHandler {

    @Autowired
    private CollectiveConceptualModelRepository collectiveConceptualModelRepository;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private RelationNodeRepository relationNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    private List<ClassNode> classNodeList;

    private List<RelationNode> relationNodeList;

    private List<ValueNode> valueNodeList;

    private boolean isStable=false;

    /**
     * 初始化
     * @param id (the id is ccm id)
     */
    public void migrateInit(Long id) {
        //获取ccm对象
        CollectiveConceptualModel ccm=collectiveConceptualModelRepository.findOne(id);

        //获取ccm中各种node的数据
        this.classNodeList=convertClassIdToObj(ccm.getClassNodesId());
        this.relationNodeList=convertRelationIdToObj(ccm.getRelationNodesId());
        this.valueNodeList=convertValueIdToObj(ccm.getValueNodesId());

        //初始化isStable函数
        this.isStable=false;
    }

    @Override
    public void migrateHandler() {
        int cNum=classNodeList.size();
        int rNum=relationNodeList.size();
        int iterNum=cNum+rNum;
        int curIterNum=0;
        while(true) {
            isStable=true;//在migrateClassNode和migrateRelationNode中若发生迁移则会由isStable转为false;
            int randValue=randomValue();
            if(randValue<cNum) migrateClassNode(classNodeList.get(randValue));
            else migrateRelationNode(relationNodeList.get(randValue-cNum));
            if(isStable&&curIterNum>iterNum) break;
            else if(isStable) curIterNum++;
            else curIterNum=0;
        }
        System.out.println("迭代结束啦~");
    }

    private void migrateClassNode(ClassNode classNode) {
        Set<Long> icmIdSet=classNode.getIcmList();
        for(Long icmId:icmIdSet) {
            findLowerEntropyLocForClass(classNode, icmId);
        }
    }

    private void migrateRelationNode(RelationNode relationNode) {
        Set<Long> icmIdSet=relationNode.getIcmList();
        for(Long icmId:icmIdSet) {
            findLowerEntropyLocForRelation(relationNode, icmId);
        }
    }

    private void findLowerEntropyLocForClass(ClassNode classNode,Long icmId) {
        double maxEnrtopyDecrease=0.0;
        long targetClassNodeId=-1;
        Set<ClassNode> alreadyHasCurIcmClassNode=new HashSet<>();
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode tmpCNode=classNodeList.get(i);
            if(tmpCNode.getId()==classNode.getId()) continue;//本身
            if(tmpCNode.getIcmList().contains(icmId)) {
                alreadyHasCurIcmClassNode.add(tmpCNode);
                continue;//如果是同样包含有该用户的节点,则先保存在already中.
            }
            double var=simulateMigrateForClass(icmId,classNode,tmpCNode);
        }
    }

    private double simulateMigrateForClass(Long icmId,ClassNode sourceCNode,ClassNode targetCNode) {
        Map<String,List<Set<Long>>> oldSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> oldTargetMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化
        //记录全局熵的变化
        double oldGlobalEntropy;
        double curGlobalEntropy;
//        oldSourceMap=MigrateUtil.getClassNodeMap(sourceCNode.getRtcEdges(),sourceCNode.getCtvEdges());
//        oldTargetMap=MigrateUtil.getClassNodeMap(targetCNode.getRtcEdges(),targetCNode.getCtvEdges());

        Set<Long> dupVNodeSet=new HashSet<>();//判断是否会出现重复切换某一个点
        for(ClassToValueEdge ctvEdge:sourceCNode.getCtvEdges()) {
            String edgeName=ctvEdge.getEdgeName();
            int usize=ctvEdge.getIcmList().size();
            if(usize==0) continue;
            if(ctvEdge.getIcmList().contains(icmId)) {//说明当前边包含了当前用户
                usize--;
                ValueNode valueNode=ctvEdge.getEnder();
                if(dupVNodeSet.contains(valueNode.getId()));
                else {
                    dupVNodeSet.add(valueNode.getId());

                }
            }
        }
        return sumEntropyVar;
    }

    private void findLowerEntropyLocForRelation(RelationNode relationNode,Long icmId) {

    }

    /**
     * 获取一个随机数
     * @return 随机数(范围在0~class和relation节点总数-1)
     */
    private int randomValue() {
        int sum=classNodeList.size()+relationNodeList.size();
        Random random=new Random();
        int target=Math.abs(random.nextInt())%sum;
        return target;
    }

    private List<ClassNode> convertClassIdToObj(Set<Long> classNodeIdSet) {
        List<ClassNode> classNodeList=new ArrayList<ClassNode>();
        for(Long id:classNodeIdSet) {
            ClassNode classNode=classNodeRepository.findOne(id);
            classNodeList.add(classNode);
        }
        return classNodeList;
    }

    private List<RelationNode> convertRelationIdToObj(Set<Long> relationNodeIdSet) {
        List<RelationNode> relationNodeList=new ArrayList<RelationNode>();
        for(Long id:relationNodeIdSet) {
            RelationNode relationNode=relationNodeRepository.findOne(id);
            relationNodeList.add(relationNode);
        }
        return relationNodeList;
    }

    private List<ValueNode> convertValueIdToObj(Set<Long> valueNodeIdSet) {
        List<ValueNode> valueNodeList=new ArrayList<ValueNode>();
        for(Long id:valueNodeIdSet) {
            ValueNode valueNode=valueNodeRepository.findOne(id);
            valueNodeList.add(valueNode);
        }
        return valueNodeList;
    }

}
