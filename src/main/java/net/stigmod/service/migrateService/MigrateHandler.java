/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import org.springframework.stereotype.Service;

/**
 * 
 *
 * @version     2015/11/11
 * @author 	    Kai Fu
 */
public interface MigrateHandler {

    public void migrateInit(Long id);
    public void migrateHandler();

}
