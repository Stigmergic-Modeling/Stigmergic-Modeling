package net.stigmod.repository;

//import net.stigmod.domain.Rating;
import net.stigmod.domain.User;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
//import org.springframework.stereotype.Repository;

/**
 * @author mh
 * @since 02.04.11
 */
//@Repository
public interface UserRepository extends GraphRepository<User>,
        CineastsUserDetailsService {

    User findByLogin(String login);

//    @Query("MATCH (movie:Movie)<-[r:RATED]-(user) where ID(movie)={0} AND ID(user)={1} RETURN r")
//    Rating findUsersRatingForMovie(long movieId, long userId);
}

