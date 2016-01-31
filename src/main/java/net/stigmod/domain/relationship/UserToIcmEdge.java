/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.relationship;

import net.stigmod.domain.node.IndividualConceptualModel;
import net.stigmod.domain.node.User;
import org.neo4j.ogm.annotation.EndNode;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.RelationshipEntity;
import org.neo4j.ogm.annotation.StartNode;

/**
 * A user owns many ICMs
 * 
 * @version 	2015/11/11
 * @author 	    Shijun Wang
 */
@RelationshipEntity(type = "OWNS")
public class UserToIcmEdge {

    @GraphId
    private Long id;

    @StartNode
    private User user;

    @EndNode
    private IndividualConceptualModel icm;

    public UserToIcmEdge() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public IndividualConceptualModel getIcm() {
        return icm;
    }

    public void setIcm(IndividualConceptualModel icm) {
        this.icm = icm;
    }
}
