/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.page;

import com.google.gson.Gson;

/**
 * 抽象页面模板数据类，其 toJsonString() 方法可将自身转换为 JSON 字符串格式
 *
 * @author Shijun Wang
 * @version 2016/2/2
 */
public abstract class AbstractPageData implements PageData {

    public String toJsonString() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
}
