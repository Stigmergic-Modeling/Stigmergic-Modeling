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
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 建模操作
 *
 * @author Shijun Wang
 * @version 2016/3/29
 */
@NodeEntity(label = "ModOps")
public class ModelingOperations {

    @GraphId
    private Long id;

    // 建模操作属于某个 ICM
    @Relationship(type = "BUILTBY", direction = Relationship.INCOMING)
    private Set<IndividualConceptualModel> icms = new HashSet<>();

    @Property
    private List<String> ops = new ArrayList<>();  // 全部建模操作

    public ModelingOperations() {}

    public ModelingOperations(IndividualConceptualModel icm) {
        this.icms.add(icm);
    }

    /**
     * 添加一段建模操作序列
     * @param ops 一段建模操作序列
     */
    public void addOperations(List<List<String>> ops) {
        for (List<String> op : ops) {
            StringBuilder sb = new StringBuilder();
            for (String s : op) {
                sb.append(s);
                sb.append("\t");
            }
            this.ops.add(sb.toString());
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<IndividualConceptualModel> getIcms() {
        return icms;
    }

    public void setIcms(Set<IndividualConceptualModel> icms) {
        this.icms = icms;
    }

    public List<String> getOps() {
        return ops;
    }

    public void setOps(List<String> ops) {
        this.ops = ops;
    }
}
