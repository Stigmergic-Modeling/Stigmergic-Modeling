package net.stigmod.domain;

import org.neo4j.ogm.annotation.GraphId;
import org.springframework.stereotype.Component;

import java.util.Date;


@Component
public class ModelInfo {

    @GraphId
    Long nodeId;
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
