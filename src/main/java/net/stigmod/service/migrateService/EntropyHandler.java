/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.RelationNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.domain.relationship.RelationToCEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public interface EntropyHandler {
    public Double computeClassEntropy(Long id , int nodeSum);
    public Double computeRelationEntropy(Long id , int nodeSum);
    public Double computeValueEntropy(Long id , int nodeSum);

//    public Double computeSystemEntropy();

    public Map<String,List<Set<Long>>> getMapForClassNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToCEdge> rtcEdges);
    public Map<String,List<Set<Long>>> getMapForRelationNode(Set<RelationToCEdge> rtcEdges,Set<RelationToValueEdge> rtvEdges);
    public Map<String,List<Set<Long>>> getMapForValueNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToValueEdge> rtvEdges);

    public Double computeMapEntropy(Map<String, List<Set<Long>>> myMap, int nodeSum);

    public Double computeMapBiEntropy(Map<String,List<Set<Long>>> myMap);

    public Double initNodeListEntropy(List<ClassNode> classNodeList , List<RelationNode> relationNodeList ,
                                    List<ValueNode> valueNodeList , int nodeSum);

}
