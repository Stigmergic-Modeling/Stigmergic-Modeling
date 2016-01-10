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
import net.stigmod.domain.node.ValueNode;
import org.neo4j.ogm.annotation.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */
@RelationshipEntity(type="PROPERTY")
public class ClassToValueEdge {

    @GraphId
    private Long id;

    @StartNode
    private ClassNode starter;

    @EndNode
    private ValueNode ender;

    @Property(name="port")
    private String port;

    @Property(name="name")
    private String edgeName;

    @Property(name="icm_list")
    private Set<Long> icmList=new HashSet<>();

    @Property
    private Long modelId;

    private Set<Long> icmListPreCopy=new HashSet<>();

    private boolean isChanged=false;

    public ClassToValueEdge() {
        this.port="";
    }

    public ClassToValueEdge(ClassToValueEdge ctvEdge) {
        this.id=ctvEdge.getId();
        this.starter=new ClassNode(ctvEdge.getStarter());
        this.ender=new ValueNode(ctvEdge.getEnder());
        this.port=ctvEdge.port;
        this.edgeName=ctvEdge.getEdgeName();
        this.icmList=new HashSet<>(ctvEdge.getIcmList());
        this.modelId=ctvEdge.getModelId();
    }

    public ClassToValueEdge(String edgeName, ClassNode starter, ValueNode ender) {
        this.port="";
        this.edgeName=edgeName;
        this.starter=starter;
        this.ender=ender;
    }

    public ClassToValueEdge(String port , String edgeName, ClassNode starter, ValueNode ender) {
        this.starter = starter;
        this.ender = ender;
        this.edgeName = edgeName;
        this.port=port;
    }

    public void UpdateClassToVEdge(ClassToValueEdge classToValueEdge) {
        this.icmList=classToValueEdge.getIcmList();//其他的要保持不变
    }

    public Long getId() {
        return id;
    }

    public ClassNode getStarter() {
        return starter;
    }

    public void setStarter(ClassNode starter) {
        this.starter = starter;
    }

    public ValueNode getEnder() {
        return ender;
    }

    public void setEnder(ValueNode ender) {
        this.ender = ender;
    }

    public String getEdgeName() {
        return edgeName;
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

    public void setEdgeName(String edgeName) {
        this.edgeName = edgeName;
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
}
