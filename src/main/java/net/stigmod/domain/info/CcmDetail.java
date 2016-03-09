/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.info;

import java.util.*;

/**
 * 前端 CCM 模型
 * @author Shijun Wang
 * @version 2016/3/8
 */
public class CcmDetail {

    public Map<String, Clazz> clazz = new HashMap<>();
    public Map<String, RelationshipGroup> relgrp = new HashMap<>();
    public Map<String, Relationship> relationship = new HashMap<>();

    public class Clazz {
        public Map<String, Reference> name = new HashMap<>();
        public List<String> attribute = new ArrayList<>();
        public Long ref = 0L;

        public Clazz(Long classRef, String className, Long nameRef) {  // 初始化时，添加一个 name，其他 name 后续添加
            this.name.put(className, new Reference(nameRef));
            this.ref = classRef;
        }

        public void addClassName(String className, Long nameRef) {  // 后续添加 name
            this.name.put(className, new Reference(nameRef));
        }

        public void addAttributeId(String attributeId) {
            this.attribute.add(attributeId);
        }
    }

    public class RelationshipGroup {
        public List<String> relationship = new ArrayList<>();
        // 没有 name 和 ref （也可以加，其实）

        public RelationshipGroup(String relationshipId) {
            this.relationship.add(relationshipId);
        }

        public void addRelationshipId(String relationshipId) {
            this.relationship.add(relationshipId);
        }
    }

    public class Relationship {
        public Map<String, Reference> name = new HashMap<>();
        public Map<String, Reference> type = new HashMap<>();
        public Map<String, TwoEndsReference> property = new HashMap<>();
        public Long ref = 0L;

        public Relationship(Long ref) {
            this.ref = ref;
        }
    }

    public class Reference {
        public Long ref = 0L;

        public Reference(Long ref) {
            this.ref = ref;
        }
    }

    public class TwoEndsReference {
        public Map<String, Reference> E0 = new HashMap<>();
        public Map<String, Reference> E1 = new HashMap<>();
    }


    /**
     * 添加类、类引用数、类名引用数
     * @param classId 类节点后端 ID
     * @param classRef 类节点引用数
     * @param className 类名
     * @param nameRef 类名引用数
     */
    public void addClass(Long classId, Long classRef, String className, Long nameRef) {
        String classIdString = classId.toString();
        if (!this.clazz.containsKey(classIdString)) {  // 首次添加这个类（以 ID 区分）
            this.clazz.put(classIdString, new Clazz(classRef, className, nameRef));
        } else {  // 非首次添加这个类（以 ID 区分）
            this.clazz.get(classIdString).addClassName(className, nameRef);
        }
    }

    /**
     * 添加一条 relationship property
     * @param relId 关系的 ID
     * @param port 关系特性的端口
     * @param propertyName 特性的名称
     * @param propertyValue 特性的值
     * @param relRef 关系的引用次数
     * @param propRef 特性的引用次数
     */
    public void addRelationshipProperty(Long relId, String port, String propertyName, String propertyValue, Long relRef, Long propRef) {
        String relIdStr = relId.toString();
        if (!this.relationship.containsKey(relIdStr)) {  // 第一次遇到这个关系节点，则新建
            this.relationship.put(relIdStr, new Relationship(relRef));
        }
        Relationship rel = this.relationship.get(relIdStr);
        switch (propertyName) {
            case "name":
                rel.name.put(propertyValue, new Reference(propRef));
                break;
            case "type":
                rel.type.put(propertyValue, new Reference(propRef));
                break;
            case "class":
                propertyName = "clazz";  // 为配合前端，这里改成 clazz
                // 刻意没有 break
            default:
                if (!rel.property.containsKey(propertyName)) {
                    rel.property.put(propertyName, new TwoEndsReference());
                }
                TwoEndsReference ter = rel.property.get(propertyName);
                if (port.equals("E0")) {
                    ter.E0.put(propertyValue, new Reference(propRef));
                } else {
                    ter.E1.put(propertyValue, new Reference(propRef));
                }
                break;
        }
    }

    /**
     * 构造 relationship group，将relationshipId 按类型填入 class 或 relationship group 的 list
     */
    public void fillInAttAndRelLists() {
        for (Map.Entry<String, Relationship> entry : this.relationship.entrySet()) {
            String relationshipId = entry.getKey();
            Relationship relationship = entry.getValue();
            boolean isAttribute = relationship.type.containsKey("Attribute");
            boolean isRelationship = relationship.type.containsKey("Generalization")
                    || relationship.type.containsKey("Association")
                    || relationship.type.containsKey("Aggregation")
                    || relationship.type.containsKey("Composition");

            TwoEndsReference ter = relationship.property.get("clazz");
            Set<String> classIdsAtE0 = ter.E0.keySet();
            Set<String> classIdsAtE1 = ter.E1.keySet();

            // 添加到 attribute list
            if (isAttribute) {
                for (String classId : classIdsAtE0) {
                    this.clazz.get(classId).addAttributeId(relationshipId);
                }
            }

            // 添加到 relationship list
            if (isRelationship) {
                for (String classId0 : classIdsAtE0) {
                    for (String classId1 : classIdsAtE1) {
                        if (!classId0.startsWith("_") && !classId1.startsWith("_")) {  // 滤掉与内置类有关的关系
                            String relationshipGroupName = classId0.compareTo(classId1) > 0
                                    ? classId1 + "-" + classId0
                                    : classId0 + "-" + classId1;
                            if (!this.relgrp.containsKey(relationshipGroupName)) {
                                this.relgrp.put(relationshipGroupName, new RelationshipGroup(relationshipId));
                            } else {
                                this.relgrp.get(relationshipGroupName).addRelationshipId(relationshipId);
                            }
                        }
                    }
                }
            }
        }
    }
}
