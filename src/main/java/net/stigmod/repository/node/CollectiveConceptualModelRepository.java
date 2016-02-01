/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.node.CollectiveConceptualModel;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

/**
 * 
 *
 * @version     2016/02/02
 * @author 	    Kai Fu
 * @author 	    Shijun Wang
 */
@Repository
public interface CollectiveConceptualModelRepository extends GraphRepository<CollectiveConceptualModel> {

    @Query("MATCH (ccm:CCM) RETURN ccm")
    Set<CollectiveConceptualModel> getAllCcms();
}
