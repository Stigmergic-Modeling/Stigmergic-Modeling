/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.repository.relationship.ClassToVEdgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author Shijun Wang
 * @version 2016/2/27
 */
@Service
public class WorkspaceService {

    @Autowired
    private Neo4jOperations neo4jTemplate;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    @Autowired
    private ClassToVEdgeRepository classToVEdgeRepository;

    @Transactional
    public void testNeo4jSaving(Long icmId, Long ccmId) {
        ClassNode clazz = new ClassNode();
        ValueNode value = new ValueNode();
        ClassToValueEdge c2vEdge = new ClassToValueEdge("1", "name", clazz, value);
        clazz.addC2VEdge(c2vEdge);
        value.addC2VEdge(c2vEdge);

        neo4jTemplate.save(clazz);
    }
}
