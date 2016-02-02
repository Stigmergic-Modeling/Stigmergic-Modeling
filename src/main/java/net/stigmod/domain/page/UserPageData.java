/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.page;

import net.stigmod.domain.node.IndividualConceptualModel;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * User page data object
 *
 * @version     2016/02/03
 * @author 	    Shijun Wang
 */
public class UserPageData extends AbstractPageData {

    private Set<Icm> models;

    public UserPageData() {}

    public UserPageData(Set<IndividualConceptualModel> icms) {
        this.models = new HashSet<>();
        for (IndividualConceptualModel icm : icms) {
            Long id = icm.getId();
            String name = icm.getName();
            String description = icm.getDescription();
            Date updateDate = icm.getUpdateDate();
            int classNum = icm.getClassNum();
            int relationshipNum = icm.getRelationshipNum();

            models.add(new Icm(id, name, description, updateDate, classNum, relationshipNum));
        }
    }

    class Icm {
        private Long id;
        private String name;
        private String description;
        private Date update;
        private int classNum;
        private int relNum;

        public Icm() {}

        public Icm(Long id, String name, String description, Date updateDate, int classNum, int relationshipNum) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.update = updateDate;
            this.classNum = classNum;
            this.relNum = relationshipNum;
        }
    }
}
