/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService.migrateUtil;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.conceptualmodel.RelationNode;

import java.util.Set;

/**
 * @author Kai Fu
 * @version 2016/4/1
 */
public interface SimulateHandler {
    public double simulateMigrateForClass(Set<Long> icmSet,ClassNode sourceCNode,ClassNode targetCNode,int curNodeSum,
                                          double curSystemEntropy,boolean targetIsNullFlag) ;
    public double simulateMigrateForRelation(Set<Long> icmSet,RelationNode sourceRNode,RelationNode targetRNode,
                                             int curNodeSum,double curSystemEntropy,boolean targetIsNullFlag);
}
