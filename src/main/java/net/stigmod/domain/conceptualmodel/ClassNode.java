/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */
@NodeEntity(label = "Class")
public class ClassNode extends AbstractVertex {

//    private double orgEntropyValue;//这个表示没有乘上用户数前的节点熵值
    private double biEntropyValue;//这个表示没有乘上节点数前的节点熵值(这是orgE*num后的结果)
    private double postBiEntropyValue;//这个表示bi的前值
    private boolean isInitEntropy;
    private int loc;//这个纯粹是为了编程的方便,用空间换时间 对应classNodeListId
    private Long ccmId;

    //连接关系与类的关系
    @Relationship(type="E_CLASS",direction = Relationship.INCOMING)
    private Set<RelationToClassEdge> rtcEdges = new HashSet<>();

    //连接类与name值的关系
    @Relationship(type="PROPERTY",direction = Relationship.OUTGOING)
    private Set<ClassToValueEdge> ctvEdges = new HashSet<>();

    public ClassNode(){
        super();
//        this.orgEntropyValue = 0;
        this.biEntropyValue = 0;
        this.postBiEntropyValue = 0;
        this.isInitEntropy = true;
    }

    public ClassNode(ClassNode classNode) {
        this.id=classNode.getId();
        this.setIcmSet(classNode.getIcmSet());
        this.ccmId =classNode.getCcmId();
        this.biEntropyValue=classNode.getBiEntropyValue();
        this.postBiEntropyValue = classNode.getPostBiEntropyValue();
//        this.orgEntropyValue = classNode.getOrgEntropyValue();
        this.ctvEdges = new HashSet<>(classNode.getCtvEdges());
        this.rtcEdges = new HashSet<>(classNode.getRtcEdges());
        this.setIsInitEntropy(classNode.isInitEntropy());
    }

    public ClassNode(Long ccmId, Long icmId) {
        this();
        this.ccmId = ccmId;
        this.icmSet.add(icmId.toString());
    }

    public ClassNode(Long ccmId, Long icmId, RelationToClassEdge r2cEdge, ClassToValueEdge c2vEdge) {
        this(ccmId, icmId);
        if (null != r2cEdge) {
            this.rtcEdges.add(r2cEdge);
        }
        if (null != c2vEdge) {
            this.ctvEdges.add(c2vEdge);
        }
    }

//    public void UpdateClassNode(ClassNode classNode) {
//        this.icmSet = classNode.icmSet;
//        this.entropyValue = classNode.getEntropyValue();
//        this.rtcEdges = classNode.getRtcEdges();
//        this.ctvEdges = classNode.getCtvEdges();
//        this.isInitEntropy = classNode.isInitEntropy;
//    }

    // 添加 class->value 边
    public void addC2VEdge(ClassToValueEdge c2vEdge) {
        this.ctvEdges.add(c2vEdge);
    }

    // 添加 relationship->class 边
    public void addR2CEdge(RelationToClassEdge r2cEdge) {
        this.rtcEdges.add(r2cEdge);
    }

    /**
     * 如果该点是 ICM 中的孤立点，则将该点从 ICM 中删除
     * @param icmId icmId
     * @return 是否是孤立点
     */
    public boolean removeIcmIdIfNoEdgeAttachedInIcm(Long icmId) {

        for (RelationToClassEdge r2cEdge : this.getRtcEdges()) {
            if (r2cEdge.getIcmSet().contains(icmId)) {
                return false;  // 有边中含有 icmId，此节点暂时不能从 ICM 中删除
            }
        }
        for (ClassToValueEdge c2vEdge : this.getCtvEdges()) {
            if (c2vEdge.getIcmSet().contains(icmId)) {
                return false;  // 有边中含有 icmId，此节点暂时不能从 ICM 中删除
            }
        }

        // 此节点已经是 ICM 中的孤立点，删除
        this.removeIcmId(icmId);
        return true;
    }

    public Set<RelationToClassEdge> getRtcEdges() {
        return rtcEdges;
    }

    public Set<ClassToValueEdge> getCtvEdges() {
        return ctvEdges;
    }

    public double getBiEntropyValue() {
        return biEntropyValue;
    }

    public void setBiEntropyValue(double biEntropyValue) {
        this.biEntropyValue = biEntropyValue;
    }

    public Long getCcmId() {
        return ccmId;
    }

    public void setCcmId(Long ccmId) {
        this.ccmId = ccmId;
    }

    public int getLoc() {
        return loc;
    }

    public void setLoc(int loc) {
        this.loc = loc;
    }

    public boolean isInitEntropy() {
        return isInitEntropy;
    }

    public void setIsInitEntropy(boolean isInitEntropy) {
        this.isInitEntropy = isInitEntropy;
    }

    public double getPostBiEntropyValue() {
        return postBiEntropyValue;
    }

    public void setPostBiEntropyValue(double postBiEntropyValue) {
        this.postBiEntropyValue = postBiEntropyValue;
    }

    public void setRtcEdges(Set<RelationToClassEdge> rtcEdges) {
        this.rtcEdges = rtcEdges;
    }

    public void setCtvEdges(Set<ClassToValueEdge> ctvEdges) {
        this.ctvEdges = ctvEdges;
    }

    //    public double getOrgEntropyValue() {
//        return orgEntropyValue;
//    }
//
//    public void setOrgEntropyValue(double orgEntropyValue) {
//        this.orgEntropyValue = orgEntropyValue;
//    }
}
