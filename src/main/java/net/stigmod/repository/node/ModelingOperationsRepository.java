/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.system.ModelingOperations;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;

/**
 * @author Shijun Wang
 * @version 2016/3/29
 */
public interface ModelingOperationsRepository extends GraphRepository<ModelingOperations> {

    @Query("MATCH (modOps:ModOps)<-[:BUILTBY]-(icm:ICM) " +
            "WHERE id(icm)={icmId} " +
            "RETURN modOps")
    ModelingOperations getModOpsByIcmId(@Param("icmId") Long icmId);
}
