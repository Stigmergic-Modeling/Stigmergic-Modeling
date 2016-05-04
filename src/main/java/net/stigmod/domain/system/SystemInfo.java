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
    private Long activatedCcmId1;

    @Property
    private String activatedCcmName1;

    @Property
    private Long activatedCcmId2;

    @Property
    private String activatedCcmName2;

    public SystemInfo() {
        activatedCcmId1 = 0L;
        activatedCcmId2 = 0L;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getActivatedCcmId1() {
        return activatedCcmId1;
    }

    public void setActivatedCcmId1(Long activatedCcmId1) {
        this.activatedCcmId1 = activatedCcmId1;
    }

    public String getActivatedCcmName1() {
        return activatedCcmName1;
    }

    public void setActivatedCcmName1(String activatedCcmName1) {
        this.activatedCcmName1 = activatedCcmName1;
    }

    public Long getActivatedCcmId2() {
        return activatedCcmId2;
    }

    public void setActivatedCcmId2(Long activatedCcmId2) {
        this.activatedCcmId2 = activatedCcmId2;
    }

    public String getActivatedCcmName2() {
        return activatedCcmName2;
    }

    public void setActivatedCcmName2(String activatedCcmName2) {
        this.activatedCcmName2 = activatedCcmName2;
    }
}
