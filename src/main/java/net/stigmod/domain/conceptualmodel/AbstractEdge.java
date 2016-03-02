/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

/**
 * @author Shijun Wang
 * @version 2016/3/3
 */
public abstract class AbstractEdge implements Edge {

    protected String port;
    protected String name;
    protected String displayName;

    public void updateDisplayName() {
        this.displayName = this.port.equals("") ? this.name : this.port + '.' + this.name;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
        this.updateDisplayName();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updateDisplayName();
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
