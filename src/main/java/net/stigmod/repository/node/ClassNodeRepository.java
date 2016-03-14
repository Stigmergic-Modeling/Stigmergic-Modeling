/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.conceptualmodel.ClassNode;
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
public interface ClassNodeRepository extends GraphRepository<ClassNode> {

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) " +
            "WHERE toString({icmId}) IN class.icmSet AND toString({icmId}) IN r.icmSet " +
            "RETURN class")
    ClassNode getOneByName(@Param("ccmId") Long ccmId,
                           @Param("icmId") Long icmId,
                           @Param("className") String className);

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) " +
            "WHERE toString({icmId}) IN class.icmSet AND toString({icmId}) IN r.icmSet " +
            "RETURN class")
    List<ClassNode> getByName(@Param("ccmId") Long ccmId,
                              @Param("icmId") Long icmId,
                              @Param("className") String className);

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) " +
            "RETURN class")
    List<ClassNode> getByNameFromCcm(@Param("ccmId") Long ccmId,
                                     @Param("className") String className);

    @Query( "MATCH (class:Class)-[r:PROPERTY]->(value:Value {name: {className}, ccmId: {ccmId}}) RETURN class")  // 不要求该类节点在 ICM 中存在
    List<ClassNode> getAllByName(@Param("ccmId") Long ccmId,
                                 @Param("className") String className);

    @Query("MATCH (class:Class)-[edge:PROPERTY {name:'name'}]->(value:Value) " +
            "WHERE toString({icmId}) IN class.icmSet " +
            "AND toString({icmId}) IN edge.icmSet " +
            "AND toString({icmId}) IN value.icmSet " +
            "RETURN value.name as className, id(class) as classId")
    List<Map<String, Object>> getAllClassNamesAndIdsByIcmId(@Param("icmId") Long icmId);

    @Query("MATCH (class:Class {ccmId: {ccmId}})-[edge:PROPERTY {name:'name'}]->(value:Value) " +
            "WHERE size(class.icmSet) > 0 AND size(edge.icmSet) > 0 " +  // 需要类节点和名字边引用不为零
            "RETURN value.name as className, id(class) as classId, " +
            "size(class.icmSet) as classRef, size(edge.icmSet) as nameRef")
    List<Map<String, Object>> getAllClassInfoBycmId(@Param("ccmId") Long ccmId);

    @Query("MATCH (class:Class {ccmId: {ccmId}})-[:PROPERTY]->(value:Value) " +
            "WHERE size(class.icmSet) > 0 " +
            "AND NOT value.name IN ['_int', '_float', '_string', '_boolean']" +
            "RETURN count(DISTINCT class)")
    Long getClassNumInCcm(@Param("ccmId") Long ccmId);

    @Query("MATCH (class:Class)-[:PROPERTY]->(value:Value) " +
            "WHERE toString({icmId}) IN class.icmSet " +
            "AND NOT value.name IN ['_int', '_float', '_string', '_boolean'] " +
            "RETURN count(DISTINCT class)")
    Long getClassNumInIcm(@Param("icmId") Long icmId);
}
