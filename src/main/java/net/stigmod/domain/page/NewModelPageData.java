/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.page;

import net.stigmod.domain.system.CollectiveConceptualModel;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * 新建 Model 页面的模板数据
 *
 * @author Shijun Wang
 * @version 2016/2/2
 */
public class NewModelPageData extends AbstractPageData {

    private Map<String, Ccm> ccmInfo;

    public NewModelPageData() {}

    public NewModelPageData(Set<CollectiveConceptualModel> ccms) {
        this.ccmInfo = new HashMap<>();
        for (CollectiveConceptualModel ccm : ccms) {
            Long id = ccm.getId();
            String key = ccm.getName();
            String description = ccm.getDescription();
            String language = ccm.getLanguage().equals("ZH") ? "中文" : "English";
            this.ccmInfo.put(key, new Ccm(id, description, language));
        }
    }

    class Ccm {
        private Long id;
        private String description;
        private String language;

        public Ccm() {}

        public Ccm(Long id, String description, String language) {
            this.id = id;
            this.description = description;
            this.language = language;
        }
    }
}
