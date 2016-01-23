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
import net.stigmod.domain.relationship.RelationToCEdge;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */
@NodeEntity
public class ClassNode{
    @GraphId
    private Long id;

    @Property(name="icm_list")
    private Set<Long> icmSet = new HashSet<>();

    @Property
    private Long modelId;

    @Property
    private double entropyValue;

    //连接关系与类的关系
    @Relationship(type="E_CLASS",direction = Relationship.INCOMING)
    private Set<RelationToCEdge> rtcEdges = new HashSet<RelationToCEdge>();

    //连接类与name值的关系
    @Relationship(type="PROPERTY",direction = Relationship.OUTGOING)
    private Set<ClassToValueEdge> ctvEdges = new HashSet<ClassToValueEdge>();

    private int loc;//这个纯粹是为了编程的方便,用空间换时间 对应classNodeListId

    public ClassNode(){
        this.entropyValue = 0;
    }

    public ClassNode(ClassNode classNode) {
        this.id=classNode.getId();
        this.icmSet = new HashSet<>(classNode.getIcmSet());
        this.modelId=classNode.getModelId();
        this.entropyValue=classNode.getEntropyValue();
        this.ctvEdges = new HashSet<>(classNode.getCtvEdges());
        this.rtcEdges = new HashSet<>(classNode.getRtcEdges());
    }

    public void UpdateClassNode(ClassNode classNode) {
        this.icmSet = classNode.icmSet;
        this.entropyValue=classNode.getEntropyValue();
        this.rtcEdges=classNode.getRtcEdges();
        this.ctvEdges=classNode.getCtvEdges();
    }

    public Set<Long> getIcmSet() {
        return icmSet;
    }

    public void setIcmSet(Set<Long> icmSet) {
        this.icmSet = icmSet;
    }

    public Set<RelationToCEdge> getRtcEdges() {
        return rtcEdges;
    }

    public Set<ClassToValueEdge> getCtvEdges() {
        return ctvEdges;
    }

    public Long getId() {
        return id;
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

    public void setId(Long id) {
        this.id = id;
    }

    public int getLoc() {
        return loc;
    }

    public void setLoc(int loc) {
        this.loc = loc;
    }
}
