package net.stigmod;

import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import net.stigmod.util.config.Neo4j;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.data.neo4j.config.Neo4jConfiguration;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.data.neo4j.server.Neo4jServer;
import org.springframework.data.neo4j.server.RemoteServer;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableNeo4jRepositories("net.stigmod.repository")
@EnableTransactionManagement
@ComponentScan("net.stigmod")
public class Application extends Neo4jConfiguration {

    // Common settings
    private Config config = ConfigLoader.load();
    private Neo4j neo4j = config.getNeo4j();
    private String host = neo4j.getHost();
    private String port = neo4j.getPort();
    private String username = neo4j.getUsername();
    private String password = neo4j.getPassword();

    @Override
    public SessionFactory getSessionFactory() {
        return new SessionFactory("net.stigmod.domain");
    }

    @Bean
    public Neo4jServer neo4jServer() {
        return new RemoteServer("http://" + host + ":" + port, username, password);
    }

    @Override
    @Bean
    @Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public Session getSession() throws Exception {
        return super.getSession();
    }
}