/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

/**
 * @author Shijun Wang
 * @version 2016/3/2
 */
public interface Vertex extends ConceptualModelElement {

    /**
     * 如果该点是 ICM 中的孤立点，则将该点从 ICM 中删除
     * @param icmId icmId
     * @return 是否是孤立点
     */
    boolean removeIcmIdIfNoEdgeAttachedInIcm(Long icmId);
}
