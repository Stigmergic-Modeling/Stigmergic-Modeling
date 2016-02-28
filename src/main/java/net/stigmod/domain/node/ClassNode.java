/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.node;

import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.domain.relationship.RelationToClassEdge;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */
@NodeEntity
public class ClassNode{
    @GraphId
    private Long id;

    @Property(name="icm_list")
    private Set<Long> icmSet = new HashSet<>();

//    private double orgEntropyValue;//这个表示没有乘上用户数前的节点熵值
    private double biEntropyValue;//这个表示没有乘上节点数前的节点熵值(这是orgE*num后的结果)
    private double postBiEntropyValue;//这个表示bi的前值
    private boolean isInitEntropy;
    private int loc;//这个纯粹是为了编程的方便,用空间换时间 对应classNodeListId
    private Long modelId;

    //连接关系与类的关系
    @Relationship(type="E_CLASS",direction = Relationship.INCOMING)
    private Set<RelationToClassEdge> rtcEdges = new HashSet<>();

    //连接类与name值的关系
    @Relationship(type="PROPERTY",direction = Relationship.OUTGOING)
    private Set<ClassToValueEdge> ctvEdges = new HashSet<>();

    public ClassNode(){
//        this.orgEntropyValue = 0;
        this.biEntropyValue = 0;
        this.postBiEntropyValue = 0;
        this.isInitEntropy = true;
    }

    public ClassNode(ClassNode classNode) {
        this.id=classNode.getId();
        this.icmSet = new HashSet<>(classNode.getIcmSet());
        this.modelId=classNode.getModelId();
        this.biEntropyValue=classNode.getBiEntropyValue();
        this.postBiEntropyValue = classNode.getPostBiEntropyValue();
//        this.orgEntropyValue = classNode.getOrgEntropyValue();
        this.ctvEdges = new HashSet<>(classNode.getCtvEdges());
        this.rtcEdges = new HashSet<>(classNode.getRtcEdges());
        this.setIsInitEntropy(classNode.isInitEntropy());
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
        ctvEdges.add(c2vEdge);
    }

    public Set<Long> getIcmSet() {
        return icmSet;
    }

    public void setIcmSet(Set<Long> icmSet) {
        this.icmSet = icmSet;
    }

    public Set<RelationToClassEdge> getRtcEdges() {
        return rtcEdges;
    }

    public Set<ClassToValueEdge> getCtvEdges() {
        return ctvEdges;
    }

    public Long getId() {
        return id;
    }

    public double getBiEntropyValue() {
        return biEntropyValue;
    }

    public void setBiEntropyValue(double biEntropyValue) {
        this.biEntropyValue = biEntropyValue;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public void setId(Long id) {
        this.id = id;
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
