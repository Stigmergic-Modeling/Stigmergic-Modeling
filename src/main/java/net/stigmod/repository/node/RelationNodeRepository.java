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

import java.util.List;
import java.util.Map;

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
            "-[edge1{name:'role',port:'E1'}]->(:Value {name:{attributeName}, ccmId:{ccmId}}), " +
            "(rel:Relationship)-[edge2{name:'isAttribute'}]->(:Value {name:'true', ccmId:{ccmId}}) " +
            "WHERE toString({icmId}) IN rel.icmSet " +
            "AND toString({icmId}) IN edge1.icmSet " +
            "AND toString({icmId}) IN edge2.icmSet " +
            "RETURN rel")
    RelationNode getOneAttRelByClassNameAndAttName(@Param("ccmId") Long ccmId,
                                                   @Param("icmId") Long icmId,
                                                   @Param("className") String className,
                                                   @Param("attributeName") String attributeName);

    @Query("MATCH (relationship:Relationship)-[edge:PROPERTY]->(value:Value {name:'true'}) " +
            "WHERE edge.port='' " +
            "AND NOT edge.name='name' " +
            "AND toString({icmId}) IN relationship.icmSet " +
            "AND toString({icmId}) IN edge.icmSet " +
            "AND toString({icmId}) IN value.icmSet " +
            "RETURN id(relationship) as relationshipId, edge.name as relationshipType")
    List<Map<String, Object>> getAllRelationshipsAndTypesByIcmId(@Param("icmId") Long icmId);

    @Query("MATCH (relationship:Relationship)-[edge:PROPERTY]->(value:Value) " +
            "WHERE id(relationship)={relationshipId} " +
            "AND toString({icmId}) IN relationship.icmSet " +
            "AND toString({icmId}) IN edge.icmSet " +
            "AND toString({icmId}) IN value.icmSet " +
            "RETURN edge.port as port, edge.name as propertyName, value.name as propertyValue")
    List<Map<String, Object>> getAllRelationshipPropertiesByIcmIdAndRelationshipId(@Param("icmId") Long icmId,
                                                                                   @Param("relationshipId") Long relationshipId);

    @Query("MATCH (relationship:Relationship)-[edge:E_CLASS {name: 'class'}]->(class:Class)-[:PROPERTY]->(value:Value) " +
            "WHERE id(relationship)={relationshipId} " +
            "AND toString({icmId}) IN relationship.icmSet " +
            "AND toString({icmId}) IN edge.icmSet " +
            "AND toString({icmId}) IN class.icmSet " +
            "AND toString({icmId}) IN value.icmSet " +
            "RETURN edge.port as port, value.name as propertyValue")
    List<Map<String, Object>> getClassEndRelationshipPropertiesByIcmIdAndRelationshipId(@Param("icmId") Long icmId,
                                                                                        @Param("relationshipId") Long relationshipId);

    @Query("MATCH (value0:Value {name: {className0}})<-[edge0b:PROPERTY]-(class0:Class)<-[edge0a:E_CLASS]-" +
            "(relationship:Relationship)-[edge1a:E_CLASS]->(class1:Class)-[edge1b:PROPERTY]->(value1:Value {name: {className1}}) " +
            "WHERE toString({icmId}) IN relationship.icmSet " +
            "AND toString({icmId}) IN edge0a.icmSet " +
            "AND toString({icmId}) IN edge0b.icmSet " +
            "AND toString({icmId}) IN edge1a.icmSet " +
            "AND toString({icmId}) IN edge1b.icmSet " +
            "AND toString({icmId}) IN class0.icmSet " +
            "AND toString({icmId}) IN class1.icmSet " +
            "AND toString({icmId}) IN value0.icmSet " +
            "AND toString({icmId}) IN value1.icmSet " +
            "RETURN id(relationship)")
    List<Long> getAllRelationshipIdsInRelationshipGroup(@Param("icmId") Long icmId,
                                                         @Param("className0") String className0,
                                                         @Param("className1") String className1);

    @Query("MATCH (relationship:Relationship)-[edge0:E_CLASS]->(class:Class)-[edge1:PROPERTY]->(value:Value {name: {className}}) " +
            "WHERE toString({icmId}) IN relationship.icmSet " +
            "AND toString({icmId}) IN edge0.icmSet " +
            "AND toString({icmId}) IN edge1.icmSet " +
            "AND toString({icmId}) IN class.icmSet " +
            "AND toString({icmId}) IN value.icmSet " +
            "RETURN id(relationship)")
    List<Long> getAllRelationshipIdsRelatedToClass(@Param("icmId") Long icmId,
                                                   @Param("className") String className);
}
