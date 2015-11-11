/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain;

import org.neo4j.ogm.annotation.EndNode;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.RelationshipEntity;
import org.neo4j.ogm.annotation.StartNode;

/**
 * An ICM is in a CCM
 *
 * @version 	2015/11/11
 * @author 	    Shijun Wang
 */
@RelationshipEntity(type = "IN")
public class IcmToCcmEdge {

    @GraphId
    private Long id;

    @StartNode
    private IndividualConceptualModel icm;

    @EndNode
    private CollectiveConceptualModel ccm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public IndividualConceptualModel getIcm() {
        return icm;
    }

    public void setIcm(IndividualConceptualModel icm) {
        this.icm = icm;
    }

    public CollectiveConceptualModel getCcm() {
        return ccm;
    }

    public void setCcm(CollectiveConceptualModel ccm) {
        this.ccm = ccm;
    }
}