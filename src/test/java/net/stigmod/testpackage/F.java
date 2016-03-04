/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.testpackage;

import net.stigmod.domain.A;

/**
 * @author Shijun Wang
 * @version 2016/3/4
 */
public class F extends A {
    public void testMethod() {
        this.publicProperty = 1;
        this.protectedProperty = 1;
//      this.packageProperty = 1;  // Error:(22, 13) java: packageProperty在net.stigmod.domain.A中不是公共的; 无法从外部程序包中对其进行访问
//      this.privateProperty = 1;  // Error:(23, 13) java: privateProperty可以在net.stigmod.domain.A中访问private
    }
}
