/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * User page data object
 *
 * @version     2015/11/11
 * @author 	    Shijun Wang
 */
@Component
public class UserPageData {

    private String mail;
    private List<IndividualConceptualModel> icms;

    public UserPageData() {
        icms = new ArrayList<>();
    }


    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public List<IndividualConceptualModel> getIcms() {
        return icms;
    }

    public void setIcms(List<IndividualConceptualModel> icms) {
        this.icms = icms;
    }
}
