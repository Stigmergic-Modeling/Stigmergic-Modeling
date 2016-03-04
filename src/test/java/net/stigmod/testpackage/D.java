/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.testpackage;

/**
 * @author Shijun Wang
 * @version 2016/3/4
 */
public class D extends C {
    public void testMethod() {
        this.publicProperty = 1;
        this.protectedProperty = 1;
        this.packageProperty = 1;
//      this.privateProperty = 1;  // Error:(21, 13) java: privateProperty可以在net.stigmod.testpackage.C中访问private
    }
}
