/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.info;

import java.util.HashMap;
import java.util.Map;

/**
 * 前端 CCM 模型
 * @author Shijun Wang
 * @version 2016/3/8
 */
public class CcmDetail {

    public Map<String, Clazz> clazz = new HashMap<>();
    public Map<String, RelationshipGroup> relgrp = new HashMap<>();

    public class Clazz {
        public Map<String, Reference> name = new HashMap<>();
        public Map<String, Attribute> attribute = new HashMap<>();
        public long ref = 0L;
    }

    public class Attribute {
        public Map<String, Reference> name = new HashMap<>();
        public Map<String, Reference> type = new HashMap<>();
        public Map<String, Reference> multiplicity = null;
        public Map<String, Reference> visibility = null;
        public Map<String, Reference> defaultt = null;  // 注意，这里 default 不能做属性名！需要在前端转换
        public Map<String, Reference> constraint = null;
        public Map<String, Reference> ordering = null;
        public Map<String, Reference> uniqueness = null;
        public Map<String, Reference> readOnly = null;
        public Map<String, Reference> union = null;
        public Map<String, Reference> subsets = null;
        public Map<String, Reference> redefines = null;
        public Map<String, Reference> composite = null;
        public long ref = 0L;
    }

    public class RelationshipGroup {
        public Map<String, Relationship> relationship = new HashMap<>();
        // 没有 name 和 ref （也可以加，其实）
    }

    public class Relationship {
        public Map<String, Reference> name = new HashMap<>();
        public Map<String, Reference> type = new HashMap<>();
        public TwoEndsReference role = new TwoEndsReference();
        public TwoEndsReference classs = new TwoEndsReference();  // 注意，这里 class 不能做属性名！需要在前端转换
        public TwoEndsReference multiplicity = null;
        public TwoEndsReference ordering = null;
        public TwoEndsReference uniqueness = null;
        public TwoEndsReference readOnly = null;
        public TwoEndsReference union = null;
        public TwoEndsReference subsets = null;
        public TwoEndsReference redefines = null;
        public long ref = 0L;
    }

    public class Reference {
        public long ref = 0L;
    }

    public class TwoEndsReference {
        public Map<String, Reference> E0 = new HashMap<>();
        public Map<String, Reference> E1 = new HashMap<>();
    }
}
