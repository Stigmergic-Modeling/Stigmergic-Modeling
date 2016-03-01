/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.relationship;

import net.stigmod.domain.relationship.ClassToValueEdge;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Kai Fu
 * @version 2015/11/10
 */
@Repository
public interface ClassToVEdgeRepository extends GraphRepository<ClassToValueEdge> {

    List<ClassToValueEdge> findByCcmId(Long ccmId);

    @Query("MATCH (class:Class)-[c2v:PROPERTY]->(value:Value) WHERE id(class)={classId} AND id(value)={valueId} RETURN c2v")
    List<ClassToValueEdge> findByClassIdAndValueId(@Param("classId") Long classId, @Param("valueId") Long valueId);
}
