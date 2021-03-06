/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.Property;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Shijun Wang
 * @version 2016/3/4
 */
public abstract class AbstractConceptualModelElement implements ConceptualModelElement {

    @GraphId
    protected Long id;

    @Property
    protected Set<String> icmSet = new HashSet<>();

    @Property
    protected Boolean isSettled;  // 用于区分是否已经被 CCM 融合算法处理完毕

    public AbstractConceptualModelElement() {
        this.isSettled = false;  // 新建的元素，默认需要被 CCM 融合算法处理
    }

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

    public String getUniqueIdentifierString() {
        return this.toString();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public long countIcmNum() {
        return this.icmSet.size();
    }

    public Boolean getIsSettled() {
        return isSettled;
    }

    public void setIsSettled(Boolean isSettled) {
        this.isSettled = isSettled;
    }
}
