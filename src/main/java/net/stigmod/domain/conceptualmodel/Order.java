/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/3/5
 */
@NodeEntity(label="Order")
public class Order {
    @GraphId
    private Long id;

    @Property
    private Long icmId;

    @Property
    private String type;  // AttOdr or RelOdr

    @Property
    private String name;

    @Property
    private List<String> orderList = new ArrayList<>();

    public Order() {
        this(0L, "", "");
    }

    public Order(Long icmId, String type, String name) {
        this.icmId = icmId;
        this.type = type;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIcmId() {
        return icmId;
    }

    public void setIcmId(Long icmId) {
        this.icmId = icmId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getOrderList() {
        return orderList;
    }

    public void setOrderList(List<String> orderList) {
        this.orderList = orderList;
    }
}
