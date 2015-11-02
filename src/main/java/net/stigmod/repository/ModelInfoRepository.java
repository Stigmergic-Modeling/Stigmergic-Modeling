package net.stigmod.repository;


import net.stigmod.domain.ModelInfo;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;

public interface ModelInfoRepository extends GraphRepository<ModelInfo> {

    @Query("MATCH (user:User)<-[r:RATED]-(modelInfo:ModelInfo) where ID(user)={0} AND modelInfo.name={1} RETURN modelInfo")
    ModelInfo findModelInfo(long userId, String modelName);

}
