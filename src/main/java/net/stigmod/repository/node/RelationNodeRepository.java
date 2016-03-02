/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.conceptualmodel.RelationNode;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */
@Repository
public interface RelationNodeRepository extends GraphRepository<RelationNode>{

    /**
     * 由类名和属性名获取“属性转换成的关系节点”
     * @param ccmId ccmId
     * @param icmId icmId
     * @param className 类名
     * @param attributeName 属性名
     * @return 关系节点
     */
    @Query("MATCH " +
            "(:Value {name:{className}, ccmId:{ccmId}})" +
            "<--(:Class)" +
            "<--(rel:Relationship)" +
            "-[{name:'role',port:'E1'}]->(:Value {name:{attributeName}, ccmId:{ccmId}}) " +
            "WHERE str({icmId}) IN rel.icm_list " +
            "RETURN rel")
    RelationNode getOneAttRelByClassNameAndAttName(@Param("ccmId") Long ccmId,
                                                @Param("icmId") Long icmId,
                                                @Param("className") String className,
                                                @Param("attributeName") String attributeName);
}
