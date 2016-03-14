/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.system;

import org.neo4j.ogm.annotation.GraphId;

import java.util.Date;

/**
 * @author Shijun Wang
 * @version 2016/3/14
 */
public abstract class AbstractConceptualModel implements ConceptualModel {

    @GraphId
    protected Long id;

    protected String name;
    protected String description;
    protected Date creationDate;
    protected Date updateDate;
    protected Long classNum;
    protected Long relationshipNum;

    public AbstractConceptualModel() {
        this("", "");
    }

    public AbstractConceptualModel(String name, String description) {
        this(name, description, new Date());
    }

    public AbstractConceptualModel(String name, String description, Date date) {
        this.name = name;
        this.description = description;
        this.creationDate = date;
        this.updateDate = date;
        this.classNum = 0L;
        this.relationshipNum = 0L;
    }

    /**
     * 更新类和关系的数量
     * @param classNum 类个数
     * @param relationshipNum 关系个数
     */
    public void updateNums(Long classNum, Long relationshipNum) {
        this.classNum = classNum;
        this.relationshipNum = relationshipNum;
        this.updateDate = new Date();
    }

    // getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public Long getClassNum() {
        return classNum;
    }

    public void setClassNum(Long classNum) {
        this.classNum = classNum;
    }

    public Long getRelationshipNum() {
        return relationshipNum;
    }

    public void setRelationshipNum(Long relationshipNum) {
        this.relationshipNum = relationshipNum;
    }
}
