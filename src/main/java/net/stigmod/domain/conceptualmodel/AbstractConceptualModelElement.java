/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

import org.neo4j.ogm.annotation.Property;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Shijun Wang
 * @version 2016/3/4
 */
public abstract class AbstractConceptualModelElement implements ConceptualModelElement {

    @Property
    protected Set<String> icmSet = new HashSet<>();

//    public AbstractConceptualModelElement() {
//        this.icmSet = new HashSet<>();
//    }

    // 添加 icm id
    public void addIcmId(Long icmId) {
        this.icmSet.add(icmId.toString());
    }

    public void removeIcmId(Long icmId) {
        this.icmSet.remove(icmId.toString());
    }

    public void removeIcmSetFromSet(Set<Long> otherIcmSet) {
        for (Long curIcm : otherIcmSet) {
            this.icmSet.remove(curIcm.toString());
        }
    }

    public void addIcmSetFromSet(Set<Long> otherIcmSet) {
        for (Long curIcm : otherIcmSet) {
            this.icmSet.add(curIcm.toString());
        }
    }

    public Set<Long> getIcmSet() {
        Set<Long> ret = new HashSet<>();
        for (String elem : this.icmSet) {
            ret.add(Long.parseLong(elem, 10));
        }
        return ret;
    }

    public void setIcmSet(Set<Long> icmSet) {
        this.icmSet.clear();
        for (Long elem : icmSet) {
            this.icmSet.add(elem.toString());
        }
    }

    public long countIcmNum() {
        return this.icmSet.size();
    }
}
