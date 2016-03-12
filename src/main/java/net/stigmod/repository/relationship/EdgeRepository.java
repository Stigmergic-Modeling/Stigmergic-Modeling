/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.relationship;

import net.stigmod.domain.conceptualmodel.Edge;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/3/2
 */
@Repository
public interface EdgeRepository extends GraphRepository<Edge> {

    @Query( "MATCH (starter {ccmId:{ccmId}})-[edge]->(ender {ccmId:{ccmId}}) " +
            "WHERE id(starter)={starterId} AND id(ender)={enderId} AND edge.name={edgeName} AND edge.port={port} " +
            "RETURN edge")
    Edge getOneByTwoVertexIdsAndEdgeName(@Param("ccmId") Long ccmId,
                                         @Param("starterId") Long starterId,
                                         @Param("enderId") Long enderId,
                                         @Param("port") String port,
                                         @Param("edgeName") String edgeName);

    @Query( "MATCH (starter {ccmId:{ccmId}})-[edge]->(ender {ccmId:{ccmId}}) " +
            "WHERE id(starter)={starterId} AND id(ender)={enderId} AND edge.name={edgeName} AND edge.port={port} " +
            "RETURN edge")
    List<Edge> getByTwoVertexIdsAndEdgeName(@Param("ccmId") Long ccmId,
                                            @Param("starterId") Long starterId,
                                            @Param("enderId") Long enderId,
                                            @Param("port") String port,
                                            @Param("edgeName") String edgeName);
}
