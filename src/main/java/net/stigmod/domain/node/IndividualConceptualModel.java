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
    private Set<User> users = new HashSet<>();

    // An ICM is in a CCM
    @Relationship(type = "IN", direction = Relationship.OUTGOING)
    private Set<CollectiveConceptualModel> ccms = new HashSet<>();

    private String name;
    private String description;
    private Date updateDate;
    private int classNum;
    private int relationshipNum;

    public IndividualConceptualModel() {}

    public IndividualConceptualModel(String name, String description) {
        this(name, description, new Date());
    }

    public IndividualConceptualModel(String name, String description, Date updateDate) {
        this.name = name;
        this.description = description;
        this.updateDate = updateDate;
        this.classNum = 0;
        this.relationshipNum = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void addUser(User user) {
        users.add(user);
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public Set<CollectiveConceptualModel> getCcms() {
        return ccms;
    }

    public void setCcms(Set<CollectiveConceptualModel> ccms) {
        this.ccms = ccms;
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

}
