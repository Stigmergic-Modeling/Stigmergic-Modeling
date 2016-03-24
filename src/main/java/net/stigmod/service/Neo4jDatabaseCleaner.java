/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import org.neo4j.ogm.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */
@Service
public class Neo4jDatabaseCleaner {

    @Autowired
    Session session;

    public void cleanDb() {
        session.execute("MATCH n OPTIONAL MATCH n-[r]-m delete n,r,m");
    }
}
