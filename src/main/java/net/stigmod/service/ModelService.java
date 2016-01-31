/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

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
    public void createNewIcm(User user, String name, String description) {

        // 新建 ICM
        IndividualConceptualModel icm = new IndividualConceptualModel(name, description);
//        user.addIcm(icm);
        icm.addUser(user);
//        session.save(icm);
//        u2iEdge.setUser(user);
//        u2iEdge.setIcm(icm);
//        u2iEdgeRepo.save(u2iEdge);

//        Set<UserToIcmEdge> u2iEdgesInIcm = icm.getU2iEdges();
//        u2iEdgesInIcm.add(u2iEdge);
//        icm.setU2iEdges(u2iEdgesInIcm);

//        Set<UserToIcmEdge> u2iEdgesInUser = user.getU2iEdges();
//        u2iEdgesInUser.add(u2iEdge);
//        user.setU2iEdges(u2iEdgesInUser);

//        userRepo.setUserInSession(user);
//        userRepo.save(user);
//        icmRepo.save(icm);
//        u2iEdgeRepo.save(u2iEdge);

        session.save(icm);
    }
}
