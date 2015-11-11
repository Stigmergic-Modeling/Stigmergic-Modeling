/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */


package net.stigmod.domain;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */

@NodeEntity
public class RelationNode {

    @GraphId
    private Long id;

    @Property(name="icm_list")
    private List<Long> icmList=new ArrayList<Long>();

    public RelationNode() {}

    @Relationship(type="e_class",direction = Relationship.OUTGOING)
    private Set<RelationToCEdge> rtcEdges =new HashSet<RelationToCEdge>();

    @Relationship(type="property",direction = Relationship.OUTGOING)
    private Set<RelationToValueEdge> rtvEdges =new HashSet<RelationToValueEdge>();

    public Long getId() {
        return id;
    }

    public Set<RelationToCEdge> getRtcEdges() {
        return rtcEdges;
    }

    public List<Long> getIcmList() {
        return icmList;
    }

    public void setIcmList(List<Long> icmList) {
        this.icmList = icmList;
    }

    public Set<RelationToValueEdge> getRtvEdges() {
        return rtvEdges;
    }
}
