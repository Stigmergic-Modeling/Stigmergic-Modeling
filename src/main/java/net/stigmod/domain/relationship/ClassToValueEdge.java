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
import java.util.List;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */
@RelationshipEntity(type="property")
public class ClassToValueEdge {

    @GraphId
    private Long id;

    @StartNode
    private ClassNode starter;

    @EndNode
    private ValueNode ender;

    @Property(name="name")
    private String edgeName;

    @Property(name="icm_list")
    private List<Long> icmList=new ArrayList<>();

    public ClassToValueEdge() {}

    public ClassToValueEdge(String edgeName, ClassNode starter, ValueNode ender) {
        this.starter = starter;
        this.ender = ender;
        this.edgeName = edgeName;
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

    public List<Long> getIcmList() {
        return icmList;
    }

    public void setIcmList(List<Long> icmList) {
        this.icmList = icmList;
    }
}
