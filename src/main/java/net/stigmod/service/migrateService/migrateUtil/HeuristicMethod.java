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

    public List<Integer> migrateWithUserNumDecrease(List<Vertex> vertexList) {
        List<Integer> resList = new ArrayList<>();
        List<USumNode> uSumNodeList = getTheUserNumDecreaseList(vertexList);
        int nSize = uSumNodeList.size();
        for(int i=0;i<nSize;i++) {
            resList.add(uSumNodeList.get(i).locate);
        }
        return resList;
    }

    private List<USumNode> getTheUserNumDecreaseList(List<Vertex> vertexNodeList) {
        List<USumNode> uSumNodeList = new ArrayList<>();
        int vSize = vertexNodeList.size();
        if(vertexNodeList.size()<=0) return uSumNodeList;
        Vertex oneVertex = vertexNodeList.get(0);
        if(oneVertex.getClass()==ClassNode.class) {
            for(int i=0;i<vSize;i++) {
                ClassNode cNode = (ClassNode)vertexNodeList.get(i);
                USumNode uSumNode = new USumNode(cNode.getLoc(),cNode.getIcmSet().size());
                uSumNodeList.add(uSumNode);
            }
        }else if(oneVertex.getClass()==RelationNode.class) {
            for(int i=0;i<vSize;i++) {
                RelationNode rNode = (RelationNode)vertexNodeList.get(i);
                USumNode uSumNode = new USumNode(rNode.getLoc(),rNode.getIcmSet().size());
                uSumNodeList.add(uSumNode);
            }
        }
        //再最后进行排序(从用户数大的到小的)
        Collections.sort(uSumNodeList, new Comparator<USumNode>() {
            @Override
            public int compare(USumNode o1, USumNode o2) {
                return o2.uSum-o1.uSum;
            }
        });
        return uSumNodeList;
    }

    /**
     * 针对熵值进行排序
     * @param classNodeList
     * @param relationNodeList
     * @param valueNodeList
     * @return
     */
    public List<Integer> migrateWithEntropyDecrease(List<ClassNode> classNodeList, List<RelationNode> relationNodeList, List<ValueNode> valueNodeList) {
        List<EntropyNode> entropyNodeList = getTheEntropyDecreaseList(classNodeList, relationNodeList, valueNodeList);
        List<Integer> resList = new ArrayList<>();
        int sum = entropyNodeList.size();
        for(int i=0;i<sum;i++) {
            if(Double.compare(entropyNodeList.get(i).curBiEntropy , 0.0) > 0 &&
                    Math.abs(entropyNodeList.get(i).curBiEntropy - 0.0) > 0.00001) {
                resList.add(entropyNodeList.get(i).locate);
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

    private List<EntropyNode> getTheEntropyDecreaseList(List<ClassNode> classNodeList, List<RelationNode> relationNodeList, List<ValueNode> valueNodeList) {
        //获取启发式的序列
        int sumSize = classNodeList.size() + relationNodeList.size() + valueNodeList.size();
        int cNodeSize = classNodeList.size();
        int rAndcNodeSize = relationNodeList.size()+cNodeSize;
        List<EntropyNode> entropyNodeList = new ArrayList<>();
        for(ClassNode cNode : classNodeList) {
            EntropyNode entropyNode = new EntropyNode(cNode.getLoc(),cNode.getBiEntropyValue());
            entropyNodeList.add(entropyNode);
        }
        for(RelationNode rNode : relationNodeList) {
            EntropyNode entropyNode = new EntropyNode(rNode.getLoc()+cNodeSize,rNode.getBiEntropyValue());
            entropyNodeList.add(entropyNode);
        }
        for(ValueNode vNode : valueNodeList) {
            EntropyNode entropyNode = new EntropyNode(vNode.getLoc()+rAndcNodeSize,vNode.getBiEntropyValue());
            entropyNodeList.add(entropyNode);
        }

        Collections.sort(entropyNodeList, new Comparator<EntropyNode>() {
            @Override
            public int compare(EntropyNode o1, EntropyNode o2) {
                return Double.compare(o2.curBiEntropy , o1.curBiEntropy);
            }
        });
        return entropyNodeList;
    }

    class EntropyNode {
        int locate;//这个和普通loc不一致,因为还要用于判断是class还是relation还是value
        double curBiEntropy;

        EntropyNode(int loc, double curEntropy) {
            this.locate = loc;
            this.curBiEntropy = curEntropy;
        }
    }

    class USumNode {
        int locate;
        int uSum;

        public USumNode(int locate, int uSum) {
            this.locate = locate;
            this.uSum = uSum;
        }
    }
}
