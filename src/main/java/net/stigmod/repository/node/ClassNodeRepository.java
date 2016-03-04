/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.conceptualmodel.ClassNode;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */
@Repository
public interface ClassNodeRepository extends GraphRepository<ClassNode>{

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) " +
            "WHERE toString({icmId}) IN class.icmSet AND toString({icmId}) IN r.icmSet " +
            "RETURN class")
    ClassNode getOneByName(@Param("ccmId") Long ccmId,
                           @Param("icmId") Long icmId,
                           @Param("className") String className);

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) " +
            "WHERE toString({icmId}) IN class.icmSet AND toString({icmId}) IN r.icmSet " +
            "RETURN class")
    List<ClassNode> getByName(@Param("ccmId") Long ccmId,
                              @Param("icmId") Long icmId,
                              @Param("className") String className);

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) RETURN class")  // 不要求该类节点在 ICM 中存在
    List<ClassNode> getAllByName(@Param("ccmId") Long ccmId,
                                 @Param("className") String className);
}
