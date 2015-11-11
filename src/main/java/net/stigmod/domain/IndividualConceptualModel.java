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
import org.neo4j.ogm.annotation.Relationship;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Individual Conceptual Model (ICM) object
 *
 * @version     2015/11/10
 * @author 	    Shijun Wang
 */
@Component
@NodeEntity(label = "ICM")
public class IndividualConceptualModel {

    @GraphId
    private Long id;

    // A user owns many ICMs
    @Relationship(type = "OWNS", direction = Relationship.INCOMING)
    private Set<UserToIcmEdge> u2iEdges =new HashSet<>();

    // An ICM is in a CCM
    @Relationship(type = "IN", direction = Relationship.OUTGOING)
    private Set<IcmToCcmEdge> i2cEdges =new HashSet<>();

    private String name;
    private String description;
    private Date updateDate;
    private int classNum;
    private int relationshipNum;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public int getClassNum() {
        return classNum;
    }

    public void setClassNum(int classNum) {
        this.classNum = classNum;
    }

    public int getRelationshipNum() {
        return relationshipNum;
    }

    public void setRelationshipNum(int relationshipNum) {
        this.relationshipNum = relationshipNum;
    }

}
