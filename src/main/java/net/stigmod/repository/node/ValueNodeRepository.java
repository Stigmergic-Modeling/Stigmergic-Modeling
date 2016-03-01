/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.node.ValueNode;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @version     2015/11/11
 * @author 	    Kai Fu
 * @author      Shijun Wang
 */
@Repository
public interface ValueNodeRepository extends GraphRepository<ValueNode> {

    @Query("MATCH (value:Value {name:{name},ccmId:{ccmId}}) RETURN value")
    List<ValueNode> findByNameAndCcmId(@Param("name") String name, @Param("ccmId") Long ccmId);
}
