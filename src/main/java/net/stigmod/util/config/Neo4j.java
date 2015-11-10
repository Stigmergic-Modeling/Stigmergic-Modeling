/*
 * Copyright 2014-2016, Stigmergic-Modeling Project,
 * SEIDR, Peking University,
 * All rights reserved.
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.config;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * StigMod configuration Neo4j object class
 *
 * @version     2015/11/10
 * @author 	    Shijun Wang
 */
@XmlRootElement(namespace="package net.stigmod.util.config.Config")
public class Neo4j {
    private String host;
    private String port;
    private String username;
    private String password;

    public String getHost() {
        return host;
    }

    @XmlElement
    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    @XmlElement
    public void setPort(String port) {
        this.port = port;
    }

    public String getUsername() {
        return username;
    }

    @XmlElement
    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    @XmlElement
    public void setPassword(String password) {
        this.password = password;
    }
}
