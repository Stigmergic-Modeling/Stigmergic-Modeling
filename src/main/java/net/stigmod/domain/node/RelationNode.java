/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */


package net.stigmod.domain.node;

import net.stigmod.domain.relationship.RelationToCEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */

@NodeEntity
public class RelationNode {

    @GraphId
    private Long id;

    @Property(name="icm_list")
    private Set<Long> icmSet = new HashSet<>();

    @Property
    private double entropyValue;

    @Property
    private Long modelId;

    private int loc;

    public RelationNode() {
        this.entropyValue = 0;
    }

    public RelationNode(RelationNode relationNode) {
        this.id=relationNode.getId();
        this.icmSet =new HashSet<>(relationNode.getIcmSet());
        this.entropyValue=relationNode.getEntropyValue();
        this.modelId=relationNode.getModelId();
        this.rtcEdges=new HashSet<>(relationNode.getRtcEdges());
        this.rtvEdges=new HashSet<>(relationNode.getRtvEdges());
    }

    @Relationship(type="E_CLASSS",direction = Relationship.OUTGOING)
    private Set<RelationToCEdge> rtcEdges =new HashSet<RelationToCEdge>();

    @Relationship(type="PROPERTY",direction = Relationship.OUTGOING)
    private Set<RelationToValueEdge> rtvEdges =new HashSet<RelationToValueEdge>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void UpdateRelationNode(RelationNode relationNode) {
        this.icmSet =relationNode.getIcmSet();
        this.entropyValue=relationNode.getEntropyValue();
        this.rtcEdges=relationNode.getRtcEdges();
        this.rtvEdges=relationNode.getRtvEdges();
    }

    public Set<RelationToCEdge> getRtcEdges() {
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

    public double getEntropyValue() {
        return entropyValue;
    }

    public void setEntropyValue(double entropyValue) {
        this.entropyValue = entropyValue;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public int getLoc() {
        return loc;
    }

    public void setLoc(int loc) {
        this.loc = loc;
    }
}
