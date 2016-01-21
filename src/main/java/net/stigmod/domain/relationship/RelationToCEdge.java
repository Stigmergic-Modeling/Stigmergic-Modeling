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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */

@RelationshipEntity(type="E_CLASSS")
public class RelationToCEdge {

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
    private Set<Long> icmList=new HashSet<>();

    @Property
    private Long modelId;

    private Set<Long> icmListPreCopy=new HashSet<>();

    private boolean isChanged=false;

    public RelationToCEdge() {
        this.port=null;
    }

    public RelationToCEdge(RelationToCEdge rtcEdge) {
        this.id=rtcEdge.getId();
        this.starter=new RelationNode(rtcEdge.getStarter());
        this.ender=new ClassNode(rtcEdge.getEnder());
        this.port=rtcEdge.port;
        this.edgeName=rtcEdge.getEdgeName();
        this.icmList=new HashSet<>(rtcEdge.getIcmList());
        this.modelId=rtcEdge.getModelId();
    }

    public RelationToCEdge(String port , String edgeName, RelationNode starter, ClassNode ender) {
        this.edgeName=edgeName;
        this.starter=starter;
        this.ender=ender;
        this.port=port;
    }

    public void UpdateRelationToCEdge(RelationToCEdge relationToCEdge) {
        this.icmList=relationToCEdge.getIcmList();
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

    public Set<Long> getIcmList() {
        return icmList;
    }

    public void setIcmList(Set<Long> icmList) {
        this.icmList = icmList;
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

    public Set<Long> getIcmListPreCopy() {
        return icmListPreCopy;
    }

    public void setIcmListPreCopy(Set<Long> icmListPreCopy) {
        this.icmListPreCopy = icmListPreCopy;
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
}
