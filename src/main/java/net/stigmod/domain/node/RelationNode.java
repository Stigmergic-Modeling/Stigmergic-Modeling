/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */


package net.stigmod.domain.node;

import net.stigmod.domain.relationship.RelationToClassEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;
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

@NodeEntity(label = "Relationship")
public class RelationNode {

    @GraphId
    private Long id;

    @Property(name="icm_list")
    private Set<Long> icmSet = new HashSet<>();

//    private double orgEntropyValue;//表示没有乘用户数之前的节点熵值
    private double biEntropyValue;//这个表示没有乘上节点数前的节点熵值
    private double postBiEntropyValue;
    private boolean isInitEntropy;//起到判断当前熵值是否是初始熵值得作用
    private int loc;
    private Long ccmId;

    public RelationNode() {
//        this.orgEntropyValue = 0;
        this.biEntropyValue = 0;
        this.postBiEntropyValue = 0;
        this.isInitEntropy = true;
    }

    public RelationNode(RelationNode relationNode) {
        this.id=relationNode.getId();
        this.icmSet =new HashSet<>(relationNode.getIcmSet());
        this.biEntropyValue=relationNode.getBiEntropyValue();
        this.postBiEntropyValue = relationNode.getPostBiEntropyValue();
//        this.orgEntropyValue = relationNode.getOrgEntropyValue();
        this.ccmId =relationNode.getCcmId();
        this.rtcEdges=new HashSet<>(relationNode.getRtcEdges());
        this.rtvEdges=new HashSet<>(relationNode.getRtvEdges());
        this.setIsInitEntropy(relationNode.isInitEntropy());
    }

    @Relationship(type="E_CLASSS",direction = Relationship.OUTGOING)
    private Set<RelationToClassEdge> rtcEdges =new HashSet<RelationToClassEdge>();

    @Relationship(type="PROPERTY",direction = Relationship.OUTGOING)
    private Set<RelationToValueEdge> rtvEdges =new HashSet<RelationToValueEdge>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

//    public void UpdateRelationNode(RelationNode relationNode) {
//        this.icmSet =relationNode.getIcmSet();
//        this.biEntropyValue=relationNode.getBiEntropyValue();
//        this.orgEntropyValue = relationNode.getOrgEntropyValue();
//        this.rtcEdges=relationNode.getRtcEdges();
//        this.rtvEdges=relationNode.getRtvEdges();
//    }

    public Set<RelationToClassEdge> getRtcEdges() {
        return rtcEdges;
    }

    public Set<Long> getIcmSet() {
        return icmSet;
    }

    public void setIcmSet(Set<Long> icmSet) {
        this.icmSet = icmSet;
    }

    public Set<RelationToValueEdge> getRtvEdges() {
        return rtvEdges;
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

    public void setRtvEdges(Set<RelationToValueEdge> rtvEdges) {
        this.rtvEdges = rtvEdges;
    }

    //    public double getOrgEntropyValue() {
//        return orgEntropyValue;
//    }
//
//    public void setOrgEntropyValue(double orgEntropyValue) {
//        this.orgEntropyValue = orgEntropyValue;
//    }
}
