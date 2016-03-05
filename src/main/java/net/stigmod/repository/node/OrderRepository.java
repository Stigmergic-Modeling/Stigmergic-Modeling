/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.conceptualmodel.Order;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/3/5
 */
@Repository
public interface OrderRepository extends GraphRepository<Order> {

    @Query("MATCH (order:Order {icmId: {icmId}, type: {type}, name: {name}}) RETURN order")
    List<Order> getByIcmIdAndTypeAndName(@Param("icmId") Long icmId, @Param("type") String type, @Param("name") String name);

    @Query("MATCH (order:Order {icmId: {icmId}, type: {type}}) RETURN order")
    List<Order> getByIcmIdAndType(@Param("icmId") Long icmId, @Param("type") String type);

}
