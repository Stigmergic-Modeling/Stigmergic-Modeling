/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.system.SystemInfo;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;

/**
 * @author Shijun Wang
 * @version 2016/3/20
 */
public interface SystemInfoRepository extends GraphRepository<SystemInfo> {

    @Query("MATCH (sysInfo:SystemInfo) return sysInfo")  // system 节点在数据库中唯一
    SystemInfo getSystemInfo();
}
