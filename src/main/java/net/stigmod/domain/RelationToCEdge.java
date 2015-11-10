/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain;

import org.neo4j.ogm.annotation.*;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */

@RelationshipEntity(type="e_class")
public class RelationToCEdge {

    @GraphId
    private Long id;

    @StartNode
    private RelationNode starter;

    @EndNode
    private ClassNode ender;

    @Property
    private String edgeName;

    public RelationToCEdge() {}

    public RelationToCEdge(String edgeName, RelationNode starter, ClassNode ender) {
        this.edgeName=edgeName;
        this.starter=starter;
        this.ender=ender;
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
}
