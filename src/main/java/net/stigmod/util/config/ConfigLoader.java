package net.stigmod.util.config;

//import org.springframework.stereotype.Component;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.File;

//@Component
public class ConfigLoader {
    public ConfigLoader() {}

    public static Config load() {
        try {
            File file = new File("/Users/wangshijun/IdeaProjects/StigMod/target/Cafe/WEB-INF/config.xml");
            JAXBContext jaxbContext = JAXBContext.newInstance(Config.class);

            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            return (Config) jaxbUnmarshaller.unmarshal(file);

        } catch (JAXBException e) {
            e.printStackTrace();
            return null;
        }
    }
}
