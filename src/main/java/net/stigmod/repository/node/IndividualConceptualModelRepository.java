package net.stigmod.repository.node;


import net.stigmod.domain.node.IndividualConceptualModel;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;

public interface IndividualConceptualModelRepository extends GraphRepository<IndividualConceptualModel> {

    @Query("MATCH (user:User)-[r:OWNS]->(icm:ICM)" +
            "WHERE id(user)={0} AND icm.name={1}" +
            "RETURN icm")
    IndividualConceptualModel findIndividualConceptualModel(long userId, String modelName);

}
