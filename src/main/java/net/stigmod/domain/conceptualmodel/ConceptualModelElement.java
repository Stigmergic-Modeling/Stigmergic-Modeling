/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

import java.util.Set;

/**
 * @author Shijun Wang
 * @version 2016/3/2
 */
public interface ConceptualModelElement {

    Long getId();

    void setId(Long id);

    Boolean getIsSettled();

    void setIsSettled(Boolean isSettled);

    void removeIcmId(Long icmId);

    void removeIcmSetFromSet(Set<Long> otherIcmSet);

    void addIcmSetFromSet(Set<Long> otherIcmSet);

    Set<Long> getIcmSet();

    void setIcmSet(Set<Long> icmSet);

    // 添加 icm id
    void addIcmId(Long icmId);

    // 统计引用用户数
    long countIcmNum();
}
