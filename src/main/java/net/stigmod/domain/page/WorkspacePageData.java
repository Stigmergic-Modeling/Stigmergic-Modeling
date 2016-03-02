/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.page;

import net.stigmod.domain.info.IcmBrief;
import net.stigmod.domain.system.IndividualConceptualModel;
import net.stigmod.domain.system.User;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Workspace page data object
 *
 * @version     2016/02/03
 * @author 	    Shijun Wang
 */
public class WorkspacePageData extends AbstractPageData {

    public String userName;
    public Long ccmId;
    public Long icmId;
    public String icmName;

//    private IcmDetail model;

    public Set<IcmBrief> models;

    public WorkspacePageData(User user, IndividualConceptualModel currentIcm, Set<IndividualConceptualModel> icms, Long ccmId) {
        this.userName = user.getName();
        this.ccmId = ccmId;
        this.icmId = currentIcm.getId();
        this.icmName = currentIcm.getName();

        this.models = new HashSet<>();
        for (IndividualConceptualModel icm : icms) {
            Long id = icm.getId();
            String name = icm.getName();
            String description = icm.getDescription();
            Date updateDate = icm.getUpdateDate();
            int classNum = icm.getClassNum();
            int relationshipNum = icm.getRelationshipNum();

            models.add(new IcmBrief(id, name, description, updateDate, classNum, relationshipNum));
        }
    }
}
