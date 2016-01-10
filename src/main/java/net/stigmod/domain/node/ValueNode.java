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
public class ValueNode {

    @GraphId
    private Long id;

    @Property(name="name")
    private String name;

    @Property
    private double entropyValue;

    @Property
    private Long modelId;

    @Property(name="icm_list")
    private Set<Long> icmSet =new HashSet<Long>();

    @Relationship(type="PROPERTY",direction = Relationship.INCOMING)
    private Set<ClassToValueEdge> ctvEdges =new HashSet<ClassToValueEdge>();

    @Relationship(type="PROPERTY",direction = Relationship.INCOMING)
    private Set<RelationToValueEdge> rtvEdges =new HashSet<RelationToValueEdge>();

    public ValueNode(){
        this.entropyValue=0;
    }

    public ValueNode(String name) {
        this.name = name;
        this.entropyValue=0;
    }

    public ValueNode(ValueNode valueNode) {
        this.id=valueNode.getId();
        this.icmSet =new HashSet<>(valueNode.getIcmSet());
        this.entropyValue=valueNode.getEntropyValue();
        this.modelId=valueNode.getModelId();
        this.setName(valueNode.getName());
        this.ctvEdges=new HashSet<>(valueNode.getCtvEdges());
        this.rtvEdges=new HashSet<>(valueNode.getRtvEdges());
    }

    public void UpdateValueNode(ValueNode valueNode) {
        this.icmSet =valueNode.getIcmSet();
        this.entropyValue=valueNode.getEntropyValue();
        this.ctvEdges=valueNode.getCtvEdges();
        this.rtvEdges=valueNode.getRtvEdges();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<ClassToValueEdge> getCtvEdges() {
        return ctvEdges;
    }

    public Set<RelationToValueEdge> getRtvEdges() {
        return rtvEdges;
    }

    public Set<Long> getIcmSet() {
        return icmSet;
    }

    public void setIcmSet(Set<Long> icmSet) {
        this.icmSet = icmSet;
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
}
