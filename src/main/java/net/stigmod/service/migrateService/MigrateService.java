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
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2016/3/18
 */
public interface MigrateService {

    boolean migrateAlgorithmImpls(Long modelId);

    boolean isRunning();
}
