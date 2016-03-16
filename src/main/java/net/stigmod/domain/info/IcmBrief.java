/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.info;

import java.util.Date;

/**
 * ICM 简略信息结构，用于 usermodel page 和 workspace page 的信息显示
 * @author Shijun Wang
 * @version 2016/2/27
 */
public class IcmBrief {
    public Long id;
    public String name;
    public String description;
    public Date update;
    public Long classNum;
    public Long relNum;

    public IcmBrief(Long id, String name, String description, Date updateDate, Long classNum, Long relationshipNum) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.update = updateDate;
        this.classNum = classNum;
        this.relNum = relationshipNum;
    }
}
