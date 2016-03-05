/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.conceptualmodel.Vertex;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/3/5
 */
public interface VertexRepository extends GraphRepository<Vertex> {

    @Query("MATCH (vertex:{label}) WHERE toString({icmId}) in vertex.icmSet RETURN vertex")
    List<Vertex> getAllByIcmIdAndLabel(@Param("icmId") Long icmId, @Param("label") String label);
}
