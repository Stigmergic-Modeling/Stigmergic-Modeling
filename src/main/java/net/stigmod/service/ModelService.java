/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.node.CollectiveConceptualModel;
import net.stigmod.domain.node.IndividualConceptualModel;
import net.stigmod.domain.node.User;
import org.neo4j.ogm.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * @author Shijun Wang
 * @version 2016/1/25
 */
@Service
public class ModelService {

    @Autowired
    private Session session;

    // 新建 ICM
    @Transactional
    public void createIcmClean(User user, String name, String description) {

        // 新建 ICM
        IndividualConceptualModel icm = new IndividualConceptualModel(name, description);
        icm.addUser(user);

        // 新建 CCM
        CollectiveConceptualModel ccm = new CollectiveConceptualModel(name, description);
        ccm.addIcm(icm);
        session.save(ccm);
    }


}
