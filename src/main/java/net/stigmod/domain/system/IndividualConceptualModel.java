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
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Relationship;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Individual Conceptual Model (ICM) object
 *
 * @version     2015/11/10
 * @author 	    Shijun Wang
 */
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
    private List<String> frontIdList;  // 与 backIdList 一起记录 id mapping
    private List<String> backIdList;  // 与 frontIdList 一起记录 id mapping （若为 List<Long> 类型，则会导致bug，原因暂时不明）

    public IndividualConceptualModel() {
        this("", "");
    }

    public IndividualConceptualModel(String name, String description) {
        this(name, description, new Date());
    }

    public IndividualConceptualModel(String name, String description, Date updateDate) {
        this.name = name;
        this.description = description;
        this.updateDate = updateDate;
        this.classNum = 0;
        this.relationshipNum = 0;
        this.frontIdList = new ArrayList<>();
        this.backIdList = new ArrayList<>();
    }

    /**
     * 添加映射
     * @param frontId 前端临时 ID
     * @param backId 后端数据库 ID
     */
    public void addIdMapping(String frontId, Long backId) {
        this.frontIdList.add(frontId);
        this.backIdList.add(backId.toString());
    }

    /**
     * 得到映射值
     * @param frontId 前端临时 ID
     * @return 后端数据库 ID
     */
    public Long getBackIdFromFrontId(String frontId) {
        int index = this.frontIdList.indexOf(frontId);
        if (-1 != index) {
            return Long.parseLong(this.backIdList.get(index), 10);
        } else {
            return Long.parseLong(frontId, 10);
        }
    }

    /**
     * 增加 User 与该 ICM 的关联
     * @param user User
     */
    public void addUser(User user) {
        this.users.add(user);
    }

    /**
     * 删除 User 与该 ICM 的关联
     * @param user User
     */
    public void removeUser(User user) {
        this.users.remove(user);
    }

    /**
     * 增加 CCM 与该 ICM 的关联
     * @param user User
     */
    public void addCcm(CollectiveConceptualModel ccm) {
        this.ccms.add(ccm);
    }

    /**
     * 删除 CCM 与该 ICM 的关联
     * @param user User
     */
    public void removeCcm(CollectiveConceptualModel ccm) {
        this.ccms.remove(ccm);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<String> getFrontIdList() {
        return frontIdList;
    }

    public void setFrontIdList(List<String> frontIdList) {
        this.frontIdList = frontIdList;
    }

    public List<String> getBackIdList() {
        return backIdList;
    }

    public void setBackIdList(List<String> backIdList) {
        this.backIdList = backIdList;
    }
}
