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
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2016/4/1
 */
@Service
public class HeuristicMethod {

    public List<Integer> migrateWithHeuristicList(List<ClassNode> classNodeList,List<RelationNode> relationNodeList,List<ValueNode> valueNodeList) {
        List<MinNode> minNodeList = getTheHeuristicList(classNodeList,relationNodeList,valueNodeList);
        List<Integer> resList = new ArrayList<>();
        int sum = minNodeList.size();
        for(int i=0;i<sum;i++) {
            if(Double.compare(minNodeList.get(i).curBiEntropy , 0.0) > 0 &&
                    Math.abs(minNodeList.get(i).curBiEntropy - 0.0) > 0.00001) {
                resList.add(minNodeList.get(i).locate);
            }else break;
        }
        return resList;
    }

    public List<Integer> getConClassNodeForRelationNode(RelationNode targetRNode) {
        List<Integer> conCNodeList = new ArrayList<>();
        for(RelationToClassEdge rtcEdge : targetRNode.getRtcEdges()) {
            conCNodeList.add(rtcEdge.getEnder().getLoc());
        }
        return conCNodeList;
    }

    public List<Integer> getConRelationNodeForClassNode(ClassNode targetCNode) {
        List<Integer> conRNodeList = new ArrayList<>();
        for(RelationToClassEdge rtcEdge : targetCNode.getRtcEdges()) {
            conRNodeList.add(rtcEdge.getStarter().getLoc());
        }
        return conRNodeList;
    }

    public List<Integer> getConClassNodeForValueNode(ValueNode targetVNode) {
        List<Integer> conCNodeList = new ArrayList<>();
        for(ClassToValueEdge ctvEdge : targetVNode.getCtvEdges()) {
            conCNodeList.add(ctvEdge.getStarter().getLoc());
        }
        return conCNodeList;
    }

    public List<Integer> getConRelationNodeForValueNode(ValueNode targetVNode) {
        List<Integer> conRNodeList = new ArrayList<>();
        for(RelationToValueEdge rtvEdge : targetVNode.getRtvEdges()) {
            conRNodeList.add(rtvEdge.getStarter().getLoc());
        }
        return conRNodeList;
    }

    private List<MinNode> getTheHeuristicList(List<ClassNode> classNodeList,List<RelationNode> relationNodeList,List<ValueNode> valueNodeList) {
        //获取启发式的序列
        int sumSize = classNodeList.size() + relationNodeList.size() + valueNodeList.size();
        int cNodeSize = classNodeList.size();
        int rAndcNodeSize = relationNodeList.size()+cNodeSize;
        List<MinNode> minNodeList = new ArrayList<>();
        for(ClassNode cNode : classNodeList) {
            MinNode minNode = new MinNode(cNode.getLoc(),cNode.getBiEntropyValue());
            minNodeList.add(minNode);
        }
        for(RelationNode rNode : relationNodeList) {
            MinNode minNode = new MinNode(rNode.getLoc()+cNodeSize,rNode.getBiEntropyValue());
            minNodeList.add(minNode);
        }
        for(ValueNode vNode : valueNodeList) {
            MinNode minNode = new MinNode(vNode.getLoc()+rAndcNodeSize,vNode.getBiEntropyValue());
            minNodeList.add(minNode);
        }

        Collections.sort(minNodeList, new Comparator<MinNode>() {
            @Override
            public int compare(MinNode o1, MinNode o2) {
                return Double.compare(o2.curBiEntropy , o1.curBiEntropy);
            }
        });
        return minNodeList;
    }

    class MinNode {
        int locate;//这个和普通loc不一致,因为还要用于判断是class还是relation还是value
        double curBiEntropy;

        MinNode(int loc,double curEntropy) {
            this.locate = loc;
            this.curBiEntropy = curEntropy;
        }
    }
}
