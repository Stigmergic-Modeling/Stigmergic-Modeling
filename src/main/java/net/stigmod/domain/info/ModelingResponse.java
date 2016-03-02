/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.info;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Shijun Wang
 * @version 2016/3/1
 */
public class ModelingResponse {
    public Map<String, Long> idMappings = new HashMap<>();
    public List<String> messages = new ArrayList<>();

    public void addIdMapping(String tmpFrontId, Long Neo4jId) {
        this.idMappings.put(tmpFrontId, Neo4jId);
    }

    public void addMessage(String msg) {
        messages.add(msg);
    }

    @Override
    public String toString() {
        String str = "\nMESSAGES: \n";
        if (!this.messages.isEmpty()) {
            for (String msg : this.messages) {
                str += (msg + "\n");
            }
        }
        str += "\nID MAPPINGS: \n";
        if (!this.idMappings.isEmpty()) {
            for (Map.Entry<String, Long> entry : this.idMappings.entrySet()) {
                str += (" | " + entry.getKey() + " : " + entry.getValue());
            }
        }
        return str;
    }
}
