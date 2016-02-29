/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.info;

import java.util.List;
import java.util.Map;

/**
 * 用于解析前端同步回来的建模操作序列（JSON string to Java Object）
 *
 * @author Shijun Wang
 * @version 2016/2/29
 */
public class ModelingOperationLog {
    public Long date;
    public String user;
    public Long icmId;
    public String icmName;
    public List<List<String>> log;
    public OrderChanges orderChanges;

    class OrderChanges {
        public Map<String, List<String>> classes;
        public Map<String, List<String>> relationGroups;
    }
}
