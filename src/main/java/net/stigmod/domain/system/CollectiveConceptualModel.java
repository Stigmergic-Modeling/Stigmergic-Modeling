/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.system;

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
public class CollectiveConceptualModel extends AbstractConceptualModel {

    @Property
    Set<Long> classNodesId = new HashSet<>();

    @Property
    Set<Long> relationNodesId = new HashSet<>();

    @Property
    Set<Long> valueNodesId = new HashSet<>();

    // An ICM is in a CCM
    @Relationship(type = "IN", direction = Relationship.INCOMING)
    private Set<IndividualConceptualModel> icms = new HashSet<>();

    public CollectiveConceptualModel() {
        this("","", "EN");
    }

    public CollectiveConceptualModel(String name, String description, String language) {
        this(name, description, new Date(), language);
    }

    public CollectiveConceptualModel(String name, String description, Date date, String language) {
        super(name, description, date, language);
    }

    /**
     * 增加 ICM 与该 CCM 的关联
     * @param icm ICM
     */
    public void addIcm(IndividualConceptualModel icm) {
        this.icms.add(icm);
    }

    /**
     * 删除 ICM 与该 CCM 的关联
     * @param icm ICM
     */
    public void removeIcm(IndividualConceptualModel icm) {
        this.icms.remove(icm);
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
}

