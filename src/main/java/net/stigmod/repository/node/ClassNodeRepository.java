/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.node.ClassNode;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */
@Repository
public interface ClassNodeRepository extends GraphRepository<ClassNode>{

    @Query("MATCH (class:Class)-[:PROPERTY]->(value:Value {name: {className}}) WHERE str({icmId}) IN class.icm_list RETURN class")
    ClassNode getByName(@Param("className") String className, @Param("icmId") Long icmId);
}
