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
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

/**
 * CCM Repository
 *
 * @version     2016/02/02
 * @author 	    Kai Fu
 * @author 	    Shijun Wang
 */
@Repository
public interface CollectiveConceptualModelRepository extends GraphRepository<CollectiveConceptualModel> {

    @Query("MATCH (ccm:CCM) RETURN ccm")
    Set<CollectiveConceptualModel> getAllCcms();

    @Query("MATCH (ccm:CCM) WHERE ID(ccm) = {ccmId} RETURN ccm")
    CollectiveConceptualModel getCcmById(@Param("ccmId") Long ccmId);

    @Query("MATCH (icm:ICM)-[:IN]->(ccm:CCM) WHERE ID(icm) = {icmId} RETURN ccm")
    CollectiveConceptualModel getCcmByIcmId(@Param("icmId") Long icmId);
}
