/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.relationship;

import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.RelationNode;
import org.neo4j.ogm.annotation.*;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */

@RelationshipEntity(type="E_CLASSS")
public class RelationToClassEdge {

    @GraphId
    private Long id;

    @StartNode
    private RelationNode starter;

    @EndNode
    private ClassNode ender;

    @Property(name="name")
    private String edgeName;

    @Property(name="port")
    private String port;

    @Property(name="icm_list")
    private Set<Long> icmSet = new HashSet<>();

    private Long modelId;
    private Set<Long> icmSetPreCopy = new HashSet<>();
    private boolean isChanged=false;

    public RelationToClassEdge() {
        this.port=null;
    }

    public RelationToClassEdge(RelationToClassEdge rtcEdge) {
        this.id=rtcEdge.getId();
        this.starter=new RelationNode(rtcEdge.getStarter());
        this.ender=new ClassNode(rtcEdge.getEnder());
        this.port=rtcEdge.port;
        this.edgeName=rtcEdge.getEdgeName();
        this.icmSet=new HashSet<>(rtcEdge.getIcmSet());
        this.modelId=rtcEdge.getModelId();
    }

    public RelationToClassEdge(String port, String edgeName, RelationNode starter, ClassNode ender) {
        this.edgeName=edgeName;
        this.starter=starter;
        this.ender=ender;
        this.port=port;
    }

    public void UpdateRelationToCEdge(RelationToClassEdge relationToClassEdge) {
        this.icmSet= relationToClassEdge.getIcmSet();
    }

    public Long getId() {
        return id;
    }

    public RelationNode getStarter() {
        return starter;
    }

    public ClassNode getEnder() {
        return ender;
    }

    public String getEdgeName() {
        return edgeName;
    }

    public void setEdgeName(String edgeName) {
        this.edgeName = edgeName;
    }

    public Set<Long> getIcmSet() {
        return icmSet;
    }

    public void setIcmSet(Set<Long> icmSet) {
        this.icmSet = icmSet;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public Set<Long> getIcmSetPreCopy() {
        return icmSetPreCopy;
    }

    public void setIcmSetPreCopy(Set<Long> icmSetPreCopy) {
        this.icmSetPreCopy = icmSetPreCopy;
    }

    public boolean isChanged() {
        return isChanged;
    }

    public void setIsChanged(boolean isChanged) {
        this.isChanged = isChanged;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStarter(RelationNode starter) {
        this.starter = starter;
    }

    public void setEnder(ClassNode ender) {
        this.ender = ender;
    }
}
