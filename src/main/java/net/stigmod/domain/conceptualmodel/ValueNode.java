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
import java.util.Set;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */

@NodeEntity(label = "Value")
public class ValueNode implements Vertex {

    @GraphId
    private Long id;

    @Property(name="name")
    private String name;

//    private double orgEntropyValue;
    private double biEntropyValue;
    private double postBiEntropyValue;
    private boolean isInitEntropy;
    private Long ccmId;

    @Property(name="icm_list")
    private Set<String> icmSet =new HashSet<>();

    @Relationship(type="PROPERTY",direction = Relationship.INCOMING)
    private Set<ClassToValueEdge> ctvEdges =new HashSet<>();

    @Relationship(type="PROPERTY",direction = Relationship.INCOMING)
    private Set<RelationToValueEdge> rtvEdges =new HashSet<>();

    public ValueNode(){
//        this.orgEntropyValue = 0;
        this.biEntropyValue = 0;
        this.postBiEntropyValue = 0;
        this.isInitEntropy = true;
    }

    public ValueNode(String name) {
        this();
        this.name = name;
    }

    public ValueNode(ValueNode valueNode) {
        this.id = valueNode.getId();
        this.setIcmSet(valueNode.getIcmSet());
        this.biEntropyValue = valueNode.getBiEntropyValue();
        this.ccmId = valueNode.getCcmId();
        this.setName(valueNode.getName());
        this.ctvEdges = new HashSet<>(valueNode.getCtvEdges());
        this.rtvEdges = new HashSet<>(valueNode.getRtvEdges());
        this.setIsInitEntropy(valueNode.isInitEntropy());
        this.postBiEntropyValue = valueNode.getPostBiEntropyValue();
//        this.orgEntropyValue = valueNode.getOrgEntropyValue();
    }

    public ValueNode(Long ccmId, Long icmId, String name) {
        this();
        this.ccmId = ccmId;
        this.icmSet.add(icmId.toString());
        this.name = name;
    }

    public ValueNode(Long ccmId, Long icmId, String name, ClassToValueEdge c2vEdge) {
        this(ccmId, icmId, name);
        if (null != c2vEdge) {
            this.ctvEdges.add(c2vEdge);
        }
    }

//    public void UpdateValueNode(ValueNode valueNode) {
//        this.icmSet =valueNode.getIcmSet();
//        this.entropyValue=valueNode.getEntropyValue();
//        this.ctvEdges=valueNode.getCtvEdges();
//        this.rtvEdges=valueNode.getRtvEdges();
//    }

    // 添加 class->value 边
    public void addC2VEdge(ClassToValueEdge c2vEdge) {
        ctvEdges.add(c2vEdge);
    }

    // 添加 relationship->value 边
    public void addR2VEdge(RelationToValueEdge r2vEdge) {
        this.rtvEdges.add(r2vEdge);
    }

    // 添加 icm id
    public void addIcmId(Long icmId) {
        this.icmSet.add(icmId.toString());
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
        Set<Long> ret = new HashSet<>();
        for (String elem : this.icmSet) {
            ret.add(Long.parseLong(elem, 10));
        }
        return ret;
    }

    public void setIcmSet(Set<Long> icmSet) {
        for (Long elem : icmSet) {
            this.icmSet.add(elem.toString());
        }
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

    public void setCtvEdges(Set<ClassToValueEdge> ctvEdges) {
        this.ctvEdges = ctvEdges;
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
