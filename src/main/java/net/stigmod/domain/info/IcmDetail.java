/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.info;

import javafx.util.Pair;
import net.stigmod.domain.conceptualmodel.Order;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ICM 的完整模型，用于 workspace page 的模型显示
 * @author Shijun Wang
 * @version 2016/2/27
 */
public class IcmDetail {

    // 这 4 个属性在前端需要转换为数组的 4 个元素
    public Map<String, Clazz> classes = new HashMap<>();
    public Map<String, RelationshipGroup> relationshipGroups = new HashMap<>();
    public Name2IdMapping name2IdMapping = new Name2IdMapping();
    public Map<String, Long> id2IdMapping = new HashMap<>();

    // 添加多个类
    public void addClasses(List<Map<String, Object>> classNamesAndIds) {
        for (Map<String, Object> classNameAndId : classNamesAndIds) {
            String name = (String) classNameAndId.get("className");
            if (!name.startsWith("_")) {  // 前端模型中不需要内置类 _string, _int, _float, _boolean
                Long id = ((Integer) classNameAndId.get("classId")).longValue();  // SDN 返回的数字都是 Integer 类型的，不能直接转型成 Long
                this.classes.put(name, new Clazz());
                this.name2IdMapping.addClass(name, id);
            }
        }
    }

    // 向某类中添加一个属性
    public void addAttribute(String className, String attributeName, Long attributeId, Map<String, String> propertyAndValues) {
        Clazz clazz = this.classes.get(className);
        clazz.addAttribute(attributeName);
        for (Map.Entry<String, String> item : propertyAndValues.entrySet()) {
            String propertyName = item.getKey();
            String propertyValue = item.getValue();
            clazz.addAttributeProperty(attributeName, propertyName, propertyValue);
        }
        this.name2IdMapping.addAttribute(className, attributeName, attributeId);
    }

    // 添加一个关系关系（若其归属的关系组尚未存在，则首先添加关系组，再添加关系）
    public void addRelationship(Long relationshipId, Map<String, Pair<String, String>> propertyAndValues) {  // type 和 name 合并在 key 为 “name” 的 propertyAndValues 中
        String relationshipGroupName = makeRelationshipGroupName(propertyAndValues.get("class").getKey(), propertyAndValues.get("class").getValue());
        if (!this.relationshipGroups.containsKey(relationshipGroupName)) {
            this.relationshipGroups.put(relationshipGroupName, new RelationshipGroup());
        }
        RelationshipGroup relationshipGroup = this.relationshipGroups.get(relationshipGroupName);
        relationshipGroup.addRelationship(relationshipId);
        for (Map.Entry<String, Pair<String, String>> item : propertyAndValues.entrySet()) {
            String propertyName = item.getKey();
            Pair<String, String> propertyValue = item.getValue();
            relationshipGroup.addRelationshipProperty(relationshipId, propertyName, propertyValue);
        }
    }

    // 添加 attribute 的顺序 List
    public void addAttributeOrders(List<Order> orders) {
        for (Order order : orders) {
            this.classes.get(order.getName()).orderInIcm.order = order.getOrderList();
        }
    }

    // 添加 relationship 的顺序 List
    public void addRelationshipOrders(List<Order> orders) {
        for (Order order : orders) {
            this.relationshipGroups.get(order.getName()).orderInIcm.order = order.getOrderList();
        }
    }

    private String makeRelationshipGroupName(String className0, String className1) {
        if (className0.compareTo(className1) > 0) {
            return className1 + '-' + className0;  // 1 的字典序靠前
        } else {
            return className0 + '-' + className1;  // 0 的字典序靠前
        }
    }

    // 内部类
    public class Clazz {
        // 这 2 个属性在前端需要转换为数组的 2 个元素
        public Map<String, List<Map<String, String>>> attributes = new HashMap<>();  // 这里的 List 是冗余的，为与遗留代码兼容
        public OrderInIcm orderInIcm = new OrderInIcm();

        public void addAttribute(String attributeName) {
            List<Map<String, String>> redundantList = new ArrayList<>();
            redundantList.add(new HashMap<String, String>());
            this.attributes.put(attributeName, redundantList);
        }

        public void addAttributeProperty(String attributeName, String propertyName, String propertyValue) {
            this.attributes.get(attributeName).get(0).put(propertyName, propertyValue);
        }
    }

    public class RelationshipGroup {
        // 这 2 个属性在前端需要转换为数组的 2 个元素
        public Map<Long, List<Map<String, Pair<String, String>>>> relationships = new HashMap<>(); // Pair<String, String> 这个类型有待商榷，如果json化时不为数组，则需用List<String>代替
        public OrderInIcm orderInIcm = new OrderInIcm();

        public void addRelationship(Long relationshipId) {
            List<Map<String, Pair<String, String>>> redundantList = new ArrayList<>();
            redundantList.add(new HashMap<String, Pair<String, String>>());
            this.relationships.put(relationshipId, redundantList);
        }

        public void addRelationshipProperty(Long relationshipId, String propertyName, Pair<String, String> propertyValue) {
            this.relationships.get(relationshipId).get(0).put(propertyName, propertyValue);
        }
    }

    public class OrderInIcm {  // 这个 Order 类是冗余的，保留的目的是与前端的遗留代码兼容
        public List<String> order = new ArrayList<>();
    }

    public class Name2IdMapping {
        public Map<String, ClassIdAndAttributeIdMapping> clazz = new HashMap<>();
        public Map<String, Long> relation = new HashMap<>();

        public class ClassIdAndAttributeIdMapping {
            public Long id;
            public Map<String, Long> attribute = new HashMap<>();

            public ClassIdAndAttributeIdMapping(Long id) {
                this.id = id;
            }
        }

        public void addClass(String name, Long id) {
            this.clazz.put(name, new ClassIdAndAttributeIdMapping(id));
        }

        public void addAttribute(String className, String attributeName, Long id) {
            this.clazz.get(className).attribute.put(attributeName, id);
        }
    }
}
