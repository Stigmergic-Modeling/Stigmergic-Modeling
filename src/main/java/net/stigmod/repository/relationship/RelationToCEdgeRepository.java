/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.relationship;

import net.stigmod.domain.conceptualmodel.RelationToClassEdge;
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
public interface RelationToCEdgeRepository extends GraphRepository<RelationToClassEdge>{
    List<RelationToClassEdge> findByCcmId(Long ccmId);

    @Query("MATCH (relation:Relationship {ccmId:{ccmId}})-[r:E_CLASS]->(class:Class {ccmId:{ccmId}}) WHERE id(relation)={relId} AND id(class)={classId} RETURN r")
    RelationToClassEdge getByRelationIdAndClassId(@Param("ccmId") Long ccmId,
                                                  @Param("relId") Long relId,
                                                  @Param("classId") Long classId);
}
