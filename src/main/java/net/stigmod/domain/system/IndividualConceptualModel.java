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

import java.util.*;

/**
 * Individual Conceptual Model (ICM) object
 *
 * @version     2015/11/10
 * @author 	    Shijun Wang
 */
@NodeEntity(label = "ICM")
public class IndividualConceptualModel extends AbstractConceptualModel {

    // A user owns many ICMs
    @Relationship(type = "OWNS", direction = Relationship.INCOMING)
    private Set<User> users = new HashSet<>();

    // An ICM is in a CCM
    @Relationship(type = "IN", direction = Relationship.OUTGOING)
    private Set<CollectiveConceptualModel> ccms = new HashSet<>();

    // 建模操作集合
    @Relationship(type = "BUILTBY", direction = Relationship.OUTGOING)
    private Set<ModelingOperations> modelingOperations = new HashSet<>();

    @Property
    private List<String> frontIdList;  // 与 backIdList 一起记录 id mapping

    @Property
    private List<String> backIdList;  // 与 frontIdList 一起记录 id mapping （若为 List<Long> 类型，则会导致bug，原因暂时不明）

    public IndividualConceptualModel() {
        this("", "", "EN");
    }

    public IndividualConceptualModel(String name, String description, String language) {
        this(name, description, new Date(), language);
    }

    public IndividualConceptualModel(String name, String description, Date date, String language) {
        super(name, description, date, language);
        this.frontIdList = new ArrayList<>();
        this.backIdList = new ArrayList<>();
    }

    /**
     * 添加映射
     * @param frontId 前端临时 ID
     * @param backId 后端数据库 ID
     */
    public void addIdMapping(String frontId, Long backId) {

        // 首先尝试更新 mapping
        for (int i = 0; i < this.frontIdList.size(); i++) {
            if (frontId.equals(this.frontIdList.get(i))) {
                this.backIdList.set(i, backId.toString());
                return;
            }
        }

        // 若 frontId 未曾出现过，则创建 mapping
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

    /**
     * 添加建模操作的容器
     * @param modOps 建模操作容器
     */
    public void addModelingOps(ModelingOperations modOps) {
        this.modelingOperations.add(modOps);
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

    public Set<ModelingOperations> getModelingOperations() {
        return modelingOperations;
    }

    public void setModelingOperations(Set<ModelingOperations> modelingOperations) {
        this.modelingOperations = modelingOperations;
    }
}
