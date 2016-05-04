package net.stigmod;

import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import net.stigmod.util.config.Neo4j;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;
import org.springframework.context.annotation.*;
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

//    @Override
//    public SessionFactory getSessionFactory() {
//        return new SessionFactory("net.stigmod.domain");
//    }

//    @Bean
//    public Neo4jServer neo4jServer() {
//        return new RemoteServer("http://" + host + ":" + port, username, password);
//    }


    @Bean
    public org.neo4j.ogm.config.Configuration getConfiguration() {
        org.neo4j.ogm.config.Configuration config = new org.neo4j.ogm.config.Configuration();
        config.driverConfiguration()
                .setDriverClassName("org.neo4j.ogm.drivers.http.driver.HttpDriver")
                .setURI("http://" + username + ":" + password + "@" + host + ":" + port);
//        config.driverConfiguration()
//                .setDriverClassName("org.neo4j.ogm.drivers.embedded.driver.EmbeddedDriver")
//                .setURI("file:///Users/wangshijun/Documents/Neo4j/experiment_6_embedded");
        return config;
    }

    @Bean
    public SessionFactory getSessionFactory() {
        return new SessionFactory(getConfiguration(), "net.stigmod.domain");
    }

    @Override
    @Bean
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)   // singleton scope to make neo4j session work in @Scheduled tasks
    public Session getSession() throws Exception {
        return super.getSession();
    }
}