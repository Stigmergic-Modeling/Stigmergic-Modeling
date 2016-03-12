/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain;

import net.stigmod.testpackage.C;
import net.stigmod.testpackage.D;
import net.stigmod.testpackage.F;
import org.junit.Test;

/**
 * @author Shijun Wang
 * @version 2016/3/4
 */
public class littleTests {

    @Test
    public void littleTest1() {

        // this package
        A a = new A();
        B b = new B();  // extends A
        E e = new E();  // extends C

        // other package
        C c = new C();
        D d = new D();  // extends C
        F f = new F();  // extends A

        // public
        a.publicProperty = 1;
        b.publicProperty = 1;
        e.publicProperty = 1;
        c.publicProperty = 1;
        d.publicProperty = 1;
        f.publicProperty = 1;

        // protected
        a.protectedProperty = 1;
        b.protectedProperty = 1;
//      e.protectedProperty = 1;  // Error:(47, 10) java: protectedProperty可以在net.stigmod.testpackage.C中访问protected
//      c.protectedProperty = 1;  // Error:(49, 10) java: protectedProperty可以在net.stigmod.testpackage.C中访问protected
//      d.protectedProperty = 1;  // Error:(50, 10) java: protectedProperty可以在net.stigmod.testpackage.C中访问protected
        f.protectedProperty = 1;

        // package
        a.packageProperty = 1;
        b.packageProperty = 1;
//      e.packageProperty = 1;  // Error:(56, 10) java: packageProperty在net.stigmod.testpackage.C中不是公共的; 无法从外部程序包中对其进行访问
//      c.packageProperty = 1;  // Error:(58, 10) java: packageProperty在net.stigmod.testpackage.C中不是公共的; 无法从外部程序包中对其进行访问
//      d.packageProperty = 1;  // Error:(59, 10) java: packageProperty在net.stigmod.testpackage.C中不是公共的; 无法从外部程序包中对其进行访问
//      f.packageProperty = 1;  // Error:(60, 10) java: packageProperty在net.stigmod.domain.A中不是公共的; 无法从外部程序包中对其进行访问

        // private
//      a.privateProperty = 1;  // Error:(63, 10) java: privateProperty可以在net.stigmod.domain.A中访问private
//      b.privateProperty = 1;  // Error:(64, 10) java: privateProperty可以在net.stigmod.domain.A中访问private
//      e.privateProperty = 1;  // Error:(65, 10) java: privateProperty可以在net.stigmod.testpackage.C中访问private
//      c.privateProperty = 1;  // Error:(67, 10) java: privateProperty可以在net.stigmod.testpackage.C中访问private
//      d.privateProperty = 1;  // Error:(68, 10) java: privateProperty可以在net.stigmod.testpackage.C中访问private
//      f.privateProperty = 1;  // Error:(69, 10) java: privateProperty可以在net.stigmod.domain.A中访问private

    }
}
