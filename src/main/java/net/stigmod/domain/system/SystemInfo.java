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

/**
 * @author Shijun Wang
 * @version 2016/3/20
 */
@NodeEntity(label = "SystemInfo")
public class SystemInfo {

    @GraphId
    private Long id;

    @Property
    private Long activatedCcmId;

    @Property
    private String activatedCcmName;

    public SystemInfo() {
        activatedCcmId = -1L;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getActivatedCcmId() {
        return activatedCcmId;
    }

    public void setActivatedCcmId(Long activatedCcmId) {
        this.activatedCcmId = activatedCcmId;
    }

    public String getActivatedCcmName() {
        return activatedCcmName;
    }

    public void setActivatedCcmName(String activatedCcmName) {
        this.activatedCcmName = activatedCcmName;
    }
}
