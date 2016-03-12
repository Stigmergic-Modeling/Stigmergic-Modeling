/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.system.User;
import net.stigmod.service.StigmodUserDetailsService;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.stereotype.Repository;

/**
 * @author  Shijun Wang
 * @version 2016/03/11
 */
@Repository
public interface UserRepository extends GraphRepository<User>, StigmodUserDetailsService {

    User findByMail(String mail);

    User findByVerificationId(String verificationId);
}

