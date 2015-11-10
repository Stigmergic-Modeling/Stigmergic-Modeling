/*
 * Copyright 2014-2016, Stigmergic-Modeling Project,
 * SEIDR, Peking University,
 * All rights reserved.
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.config;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.net.URL;

/**
 * Load StigMod configurations
 *
 * @version     2015/10/30
 * @author 	    Shijun Wang
 */
public class ConfigLoader {
    public ConfigLoader() {}

    public static Config load() {
        try {

            // config.xml is located at "src/main/resources/config.xml" during development
            // (resources marked as a resource dir)
            // and at "target/Cafe/WEB-INF/classes/config.xml" during deployment (by IntelliJ deployment schema)
            // Inspired by http://stackoverflow.com/questions/6893497/java-file-path-in-web-project
            URL url = Thread.currentThread().getContextClassLoader().getResource("/config.xml");
            assert url != null;
            File file = new File(url.getFile());
            JAXBContext jaxbContext = JAXBContext.newInstance(Config.class);

            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            return (Config) jaxbUnmarshaller.unmarshal(file);

        } catch (JAXBException e) {
            e.printStackTrace();
            return null;
        }
    }
}
