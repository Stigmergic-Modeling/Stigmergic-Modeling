/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.node;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Collective Conceptual Model (CCM) object
 *
 * @version     2015/11/11
 * @author 	    Shijun Wang
 */
@NodeEntity(label = "CCM")
public class CollectiveConceptualModel {

    @GraphId
    private Long id;

    @Property
    private Long modelId;

    @Property
    Set<Long> classNodesId = new HashSet<>();

    @Property
    Set<Long> relationNodesId = new HashSet<>();

    @Property
    Set<Long> valueNodesId = new HashSet<>();

    // An ICM is in a CCM
    @Relationship(type = "IN", direction = Relationship.INCOMING)
    private Set<IndividualConceptualModel> icms = new HashSet<>();

    private String name;
    private String description;
    private Date updateDate;
    private int classNum;
    private int relationshipNum;

    public CollectiveConceptualModel() {}

    public CollectiveConceptualModel(String name, String description) {
        this(name, description, new Date());
    }

    public CollectiveConceptualModel(String name, String description, Date updateDate) {
        this.name = name;
        this.description = description;
        this.updateDate = updateDate;
        this.classNum = 0;
        this.relationshipNum = 0;
    }

    public void addIcm(IndividualConceptualModel icm) {
        this.icms.add(icm);
    }

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

    public Set<Long> getClassNodesId() {
        return classNodesId;
    }

    public void setClassNodesId(Set<Long> classNodesId) {
        this.classNodesId = classNodesId;
    }

    public Set<Long> getRelationNodesId() {
        return relationNodesId;
    }

    public void setRelationNodesId(Set<Long> relationNodesId) {
        this.relationNodesId = relationNodesId;
    }

    public Set<Long> getValueNodesId() {
        return valueNodesId;
    }

    public void setValueNodesId(Set<Long> valueNodesId) {
        this.valueNodesId = valueNodesId;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }
}

