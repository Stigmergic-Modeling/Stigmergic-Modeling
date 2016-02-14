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

//    @Property
//    private double orgEntropyValue;

    @Property
    private double biEntropyValue;

    private double postBiEntropyValue;

    private boolean isInitEntropy;

    @Property
    private Long modelId;

    @Property(name="icm_list")
    private Set<Long> icmSet =new HashSet<Long>();

    @Relationship(type="PROPERTY",direction = Relationship.INCOMING)
    private Set<ClassToValueEdge> ctvEdges =new HashSet<ClassToValueEdge>();

    @Relationship(type="PROPERTY",direction = Relationship.INCOMING)
    private Set<RelationToValueEdge> rtvEdges =new HashSet<RelationToValueEdge>();

    public ValueNode(){
//        this.orgEntropyValue = 0;
        this.biEntropyValue = 0;
        this.postBiEntropyValue = 0;
        this.isInitEntropy = true;
    }

    public ValueNode(String name) {
        this.name = name;
        this.biEntropyValue=0;
        this.isInitEntropy = true;
        this.postBiEntropyValue =0;
//        this.orgEntropyValue = 0;
    }

    public ValueNode(ValueNode valueNode) {
        this.id = valueNode.getId();
        this.icmSet = new HashSet<>(valueNode.getIcmSet());
        this.biEntropyValue = valueNode.getBiEntropyValue();
        this.modelId = valueNode.getModelId();
        this.setName(valueNode.getName());
        this.ctvEdges = new HashSet<>(valueNode.getCtvEdges());
        this.rtvEdges = new HashSet<>(valueNode.getRtvEdges());
        this.setIsInitEntropy(valueNode.isInitEntropy());
        this.postBiEntropyValue = valueNode.getPostBiEntropyValue();
//        this.orgEntropyValue = valueNode.getOrgEntropyValue();
    }

//    public void UpdateValueNode(ValueNode valueNode) {
//        this.icmSet =valueNode.getIcmSet();
//        this.entropyValue=valueNode.getEntropyValue();
//        this.ctvEdges=valueNode.getCtvEdges();
//        this.rtvEdges=valueNode.getRtvEdges();
//    }

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

    //    public double getOrgEntropyValue() {
//        return orgEntropyValue;
//    }
//
//    public void setOrgEntropyValue(double orgEntropyValue) {
//        this.orgEntropyValue = orgEntropyValue;
//    }
}
