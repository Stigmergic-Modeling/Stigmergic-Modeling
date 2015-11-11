/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.relationship;

import net.stigmod.domain.node.RelationNode;
import net.stigmod.domain.node.ValueNode;
import org.neo4j.ogm.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */
@RelationshipEntity(type="property")
public class RelationToValueEdge {
    @GraphId
    private Long id;

    @StartNode
    private RelationNode starter;

    @EndNode
    private ValueNode ender;

    @Property(name="name")
    private String edgeName;

    @Property(name="icm_list")
    private List<Long> icmList=new ArrayList<Long>();

    public RelationToValueEdge() {}

    public RelationToValueEdge(String edgeName, RelationNode starter, ValueNode ender) {
        this.edgeName = edgeName;
        this.starter = starter;
        this.ender = ender;
    }

    public Long getId() {
        return id;
    }

    public RelationNode getStarter() {
        return starter;
    }

    public void setStarter(RelationNode starter) {
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
