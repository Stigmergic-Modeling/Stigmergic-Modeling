/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.conceptualmodel;

import org.neo4j.ogm.annotation.*;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * @author Kai Fu
 * @author Shijun Wang
 * @version 2015/11/10
 */
@RelationshipEntity(type="PROPERTY")
public class ClassToValueEdge extends AbstractEdge {

    @GraphId
    private Long id;

    @StartNode
    private ClassNode starter;

    @EndNode
    private ValueNode ender;

    @Property(name="icm_list")
    private Set<String> icmSet = new HashSet<>();

    private Long ccmId;
    private Set<Long> icmSetPreCopy = new HashSet<>();
    private boolean isChanged=false;

    public ClassToValueEdge() {
        this.port="";
    }

    public ClassToValueEdge(ClassToValueEdge ctvEdge) {
        this.id=ctvEdge.getId();
        this.starter=new ClassNode(ctvEdge.getStarter());
        this.ender=new ValueNode(ctvEdge.getEnder());
        this.port=ctvEdge.port;
        this.name =ctvEdge.getName();
        this.setIcmSet(ctvEdge.getIcmSet());
        this.ccmId =ctvEdge.getCcmId();
        this.updateDisplayName();
    }

    public ClassToValueEdge(String name, ClassNode starter, ValueNode ender) {
        this.port="";
        this.name = name;
        this.starter=starter;
        this.ender=ender;
        this.updateDisplayName();
    }

    public ClassToValueEdge(String port, String name, ClassNode starter, ValueNode ender) {
        this.starter = starter;
        this.ender = ender;
        this.name = name;
        this.port = port;
        this.updateDisplayName();
    }

    public ClassToValueEdge(Long ccmId, Long icmId, String name, ClassNode starter, ValueNode ender) {
        this.ccmId = ccmId;
        this.icmSet.add(icmId.toString());
        this.port = "";
        this.name = name;
        this.starter = starter;
        this.ender = ender;
        this.updateDisplayName();
    }

    public void UpdateClassToVEdge(ClassToValueEdge classToValueEdge) {
        this.setIcmSet(classToValueEdge.getIcmSet());//其他的要保持不变
    }

    public void removeIcmSetFromSet(Set<Long> otherIcmSet) {
        Iterator<Long> iter = otherIcmSet.iterator();
        while(iter.hasNext()) {
            Long curIcm = iter.next();
            this.icmSet.remove(curIcm.toString());
        }
    }

    public void addIcmSetFromSet(Set<Long> otherIcmSet) {
        Iterator<Long> iter = otherIcmSet.iterator();
        while(iter.hasNext()) {
            Long curIcm = iter.next();
            this.icmSet.add(curIcm.toString());
        }
    }

    // 添加 icm id
    public void addIcmId(Long icmId) {
        this.icmSet.add(icmId.toString());
    }

    public void removeIcmId(Long icmId) {
        this.icmSet.remove(icmId.toString());
    }

    public Long getId() {
        return id;
    }

    public ClassNode getStarter() {
        return starter;
    }

    public void setStarter(ClassNode starter) {
        this.starter = starter;
    }

    public ValueNode getEnder() {
        return ender;
    }

    public void setEnder(ValueNode ender) {
        this.ender = ender;
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

    public Long getCcmId() {
        return ccmId;
    }

    public void setCcmId(Long ccmId) {
        this.ccmId = ccmId;
    }

    public Set<Long> getIcmSetPreCopy() {
        return icmSetPreCopy;
    }

    public void setIcmSetPreCopy(Set<Long> icmSetPreCopy) {
        this.icmSetPreCopy = icmSetPreCopy;
    }

    public boolean isChanged() {
        return isChanged;
    }

    public void setIsChanged(boolean isChanged) {
        this.isChanged = isChanged;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
