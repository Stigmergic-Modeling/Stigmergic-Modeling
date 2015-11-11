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

import java.util.ArrayList;
import java.util.List;

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

    @Property(name="icm_list")
    private List<Long> icmList=new ArrayList<Long>();

    @Relationship(type="property",direction = Relationship.INCOMING)
    private List<ClassToValueEdge> ctvEdges =new ArrayList<ClassToValueEdge>();

    @Relationship(type="property",direction = Relationship.INCOMING)
    private List<RelationToValueEdge> rtvEdges =new ArrayList<RelationToValueEdge>();

    //deprecated
//    @Relationship(type="has",direction = Relationship.INCOMING)
//    private List<ModelToVEdge> mtvedges=new ArrayList<ModelToVEdge>();

    public ValueNode(){}

    public ValueNode(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ClassToValueEdge> getCtvEdges() {
        return ctvEdges;
    }

    public List<RelationToValueEdge> getRtvEdges() {
        return rtvEdges;
    }

    public List<Long> getIcmList() {
        return icmList;
    }

    public void setIcmList(List<Long> icmList) {
        this.icmList = icmList;
    }

    //    public List<ModelToVEdge> getMtvedges() {
//        return mtvedges;
//    }
//
//    public void setMtvedges(List<ModelToVEdge> mtvedges) {
//        this.mtvedges = mtvedges;
//    }
}
