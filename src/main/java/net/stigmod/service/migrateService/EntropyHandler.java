/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

/**
 * 
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public interface EntropyHandler {
    public Double computeClassEntropy(Long id);
    public Double computeRelationEntropy(Long id);
    public Double computeValueEntropy(Long id);

    public Double computeSystemEntropy();
}
