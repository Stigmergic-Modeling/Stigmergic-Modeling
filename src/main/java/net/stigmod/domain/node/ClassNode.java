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
import net.stigmod.domain.relationship.RelationToCEdge;
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
public class ClassNode {
    @GraphId
    private Long id;

    @Property(name="icm_list")
    List<Long> icmList=new ArrayList<Long>();

    //连接关系与类的关系
    @Relationship(type="e_class",direction = Relationship.INCOMING)
    private Set<RelationToCEdge> rtcEdges =new HashSet<RelationToCEdge>();

    //连接类与name值的关系
    @Relationship(type="property",direction = Relationship.OUTGOING)
    private Set<ClassToValueEdge> ctvEdges =new HashSet<ClassToValueEdge>();


    public ClassNode(){}

    public List<Long> getIcmList() {
        return icmList;
    }

    public void setIcmList(List<Long> icmList) {
        this.icmList = icmList;
    }

    public Set<RelationToCEdge> getRtcEdges() {
        return rtcEdges;
    }

    public Set<ClassToValueEdge> getCtvEdges() {
        return ctvEdges;
    }

    public Long getId() {
        return id;
    }

}
