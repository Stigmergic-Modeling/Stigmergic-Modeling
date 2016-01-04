/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

//import net.stigmod.domain.Rating;
import net.stigmod.domain.node.User;
//import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.stereotype.Repository;

/**
 * UserRepository
 *
 * @version     2015/11/11
 * @author      mh
 * @author 	    Shijun Wang
 */
//@Repository
public interface UserRepository extends GraphRepository<User> {

    User findByMail(String mail);

//    @Query("MATCH (movie:Movie)<-[r:RATED]-(user) where ID(movie)={0} AND ID(user)={1} RETURN r")
//    Rating findUsersRatingForMovie(long movieId, long userId);
}

